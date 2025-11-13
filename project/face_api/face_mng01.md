# 얼굴 인식 웹 애플리케이션

Face-api.js를 사용하여 웹캠으로 얼굴을 등록하고 인식하는 프로그램

## HTML 및 JavaScript 코드

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>얼굴 인식 프로그램</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .video-container {
            position: relative;
            width: 100%;
        }
        #video {
            width: 100%;
            max-width: 640px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .canvas-overlay {
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
        }
        .controls {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        button {
            padding: 10px 15px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s;
        }
        button:hover {
            background-color: #45a049;
        }
        button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
        .status {
            padding: 10px;
            border-radius: 4px;
            background-color: #e9f7fe;
            border-left: 4px solid #2196F3;
        }
        .face-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 10px;
            margin-top: 20px;
        }
        .face-item {
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 10px;
            text-align: center;
            background-color: white;
        }
        .face-item img {
            max-width: 100%;
            border-radius: 4px;
        }
        .recognition-result {
            margin-top: 10px;
            font-weight: bold;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>얼굴 인식 프로그램</h1>
        
        <div class="video-container">
            <video id="video" autoplay muted playsinline></video>
            <canvas id="overlay" class="canvas-overlay"></canvas>
        </div>
        
        <div class="controls">
            <button id="startBtn">카메라 시작</button>
            <button id="registerBtn" disabled>얼굴 등록</button>
            <button id="recognizeBtn" disabled>얼굴 인식 시작</button>
            <button id="stopBtn" disabled>인식 중지</button>
            <input type="text" id="faceName" placeholder="등록할 얼굴 이름" disabled>
        </div>
        
        <div class="status" id="status">카메라를 시작해주세요.</div>
        
        <div>
            <h2>등록된 얼굴 목록</h2>
            <div class="face-list" id="faceList"></div>
        </div>
    </div>

    <!-- face-api.js 라이브러리 -->
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.18.0/dist/tf.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"></script>
    
    <script>
        // 전역 변수
        let videoStream = null;
        let isRecognizing = false;
        let faceMatcher = null;
        let labeledFaceDescriptors = [];
        let recognitionInterval = null;

        // DOM 요소
        const video = document.getElementById('video');
        const overlay = document.getElementById('overlay');
        const startBtn = document.getElementById('startBtn');
        const registerBtn = document.getElementById('registerBtn');
        const recognizeBtn = document.getElementById('recognizeBtn');
        const stopBtn = document.getElementById('stopBtn');
        const faceNameInput = document.getElementById('faceName');
        const statusDiv = document.getElementById('status');
        const faceListDiv = document.getElementById('faceList');

        // 모델 로드
        async function loadModels() {
            statusDiv.textContent = '얼굴 인식 모델 로드 중...';
            
            const modelPath = 'https://justadudewhohacks.github.io/face-api.js/models';
            
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
                    faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
                    faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
                    faceapi.nets.faceExpressionNet.loadFromUri(modelPath)
                ]);
                
                statusDiv.textContent = '모델 로드 완료! 카메라를 시작해주세요.';
                console.log('모델 로드 완료');
            } catch (error) {
                console.error('모델 로드 실패:', error);
                statusDiv.textContent = '모델 로드 실패. 콘솔을 확인해주세요.';
            }
        }

        // 카메라 시작
        async function startCamera() {
            try {
                videoStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 640, height: 480 } 
                });
                video.srcObject = videoStream;
                
                // 비디오가 로드될 때까지 기다림
                await new Promise(resolve => {
                    video.onloadedmetadata = () => {
                        resolve();
                    };
                });
                
                // 오버레이 캔버스 크기 설정
                overlay.width = video.videoWidth;
                overlay.height = video.videoHeight;
                
                startBtn.disabled = true;
                registerBtn.disabled = false;
                recognizeBtn.disabled = false;
                faceNameInput.disabled = false;
                stopBtn.disabled = true;
                
                statusDiv.textContent = '카메라가 시작되었습니다. 얼굴을 등록하거나 인식을 시작하세요.';
            } catch (error) {
                console.error('카메라 시작 실패:', error);
                statusDiv.textContent = '카메라 시작 실패. 권한을 확인해주세요.';
            }
        }

        // 얼굴 등록
        async function registerFace() {
            const name = faceNameInput.value.trim();
            if (!name) {
                alert('얼굴 이름을 입력해주세요.');
                return;
            }
            
            statusDiv.textContent = '얼굴 등록 중...';
            
            try {
                // 얼굴 감지
                const detection = await faceapi
                    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceDescriptor();
                
                if (!detection) {
                    statusDiv.textContent = '얼굴을 찾을 수 없습니다. 카메라 앞으로 이동해주세요.';
                    return;
                }
                
                // 얼굴 디스크립터 저장
                const faceDescriptor = detection.descriptor;
                
                // 이미 등록된 이름인지 확인
                const existingIndex = labeledFaceDescriptors.findIndex(item => item.label === name);
                
                if (existingIndex !== -1) {
                    // 기존 항목 업데이트
                    labeledFaceDescriptors[existingIndex].descriptors.push(faceDescriptor);
                } else {
                    // 새 항목 추가
                    labeledFaceDescriptors.push({
                        label: name,
                        descriptors: [faceDescriptor]
                    });
                }
                
                // FaceMatcher 업데이트
                updateFaceMatcher();
                
                // 등록된 얼굴 목록 업데이트
                updateFaceList();
                
                statusDiv.textContent = `"${name}" 얼굴이 등록되었습니다.`;
                faceNameInput.value = '';
                
                // 등록된 얼굴 이미지 캡처
                captureFaceImage(name, detection);
                
            } catch (error) {
                console.error('얼굴 등록 실패:', error);
                statusDiv.textContent = '얼굴 등록 실패. 다시 시도해주세요.';
            }
        }

        // 얼굴 이미지 캡처
        function captureFaceImage(name, detection) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 얼굴 영역 계산 (약간 확대)
            const box = detection.detection.box;
            const width = box.width * 1.5;
            const height = box.height * 1.5;
            const x = Math.max(0, box.x - (width - box.width) / 2);
            const y = Math.max(0, box.y - (height - box.height) / 2);
            
            canvas.width = width;
            canvas.height = height;
            
            // 비디오에서 얼굴 영역 그리기
            ctx.drawImage(
                video, 
                x, y, width, height,
                0, 0, width, height
            );
            
            // 데이터 URL로 변환하여 저장
            const imageDataUrl = canvas.toDataURL('image/jpeg');
            
            // 로컬 스토리지에 저장
            saveFaceImage(name, imageDataUrl);
        }

        // 얼굴 이미지 저장
        function saveFaceImage(name, imageDataUrl) {
            const existingImages = JSON.parse(localStorage.getItem('faceImages') || '{}');
            existingImages[name] = imageDataUrl;
            localStorage.setItem('faceImages', JSON.stringify(existingImages));
        }

        // 등록된 얼굴 목록 업데이트
        function updateFaceList() {
            faceListDiv.innerHTML = '';
            
            const faceImages = JSON.parse(localStorage.getItem('faceImages') || '{}');
            
            labeledFaceDescriptors.forEach(item => {
                const faceItem = document.createElement('div');
                faceItem.className = 'face-item';
                
                const name = document.createElement('div');
                name.textContent = item.label;
                
                const img = document.createElement('img');
                img.src = faceImages[item.label] || '';
                img.alt = item.label;
                
                const count = document.createElement('div');
                count.textContent = `등록: ${item.descriptors.length}개`;
                count.style.fontSize = '12px';
                count.style.color = '#666';
                
                faceItem.appendChild(name);
                faceItem.appendChild(img);
                faceItem.appendChild(count);
                
                faceListDiv.appendChild(faceItem);
            });
        }

        // FaceMatcher 업데이트
        function updateFaceMatcher() {
            const labeledDescriptors = labeledFaceDescriptors.map(item => 
                new faceapi.LabeledFaceDescriptors(
                    item.label, 
                    item.descriptors.map(desc => new Float32Array(desc))
                )
            );
            
            faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
        }

        // 얼굴 인식 시작
        function startRecognition() {
            if (labeledFaceDescriptors.length === 0) {
                alert('먼저 얼굴을 등록해주세요.');
                return;
            }
            
            isRecognizing = true;
            recognizeBtn.disabled = true;
            stopBtn.disabled = false;
            registerBtn.disabled = true;
            faceNameInput.disabled = true;
            
            statusDiv.textContent = '얼굴 인식 중...';
            
            // 주기적으로 얼굴 인식 실행
            recognitionInterval = setInterval(async () => {
                if (!isRecognizing) return;
                
                try {
                    const detections = await faceapi
                        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                        .withFaceLandmarks()
                        .withFaceDescriptors()
                        .withFaceExpressions();
                    
                    // 오버레이 지우기
                    const ctx = overlay.getContext('2d');
                    ctx.clearRect(0, 0, overlay.width, overlay.height);
                    
                    // 얼굴 박스와 정보 그리기
                    const resizedDetections = faceapi.resizeResults(detections, {
                        width: video.videoWidth,
                        height: video.videoHeight
                    });
                    
                    resizedDetections.forEach(detection => {
                        const box = detection.detection.box;
                        const drawBox = new faceapi.draw.DrawBox(box, {
                            label: faceMatcher
                                ? faceMatcher.findBestMatch(detection.descriptor).toString()
                                : '알 수 없음',
                            boxColor: detection.detection._score > 0.8 ? 'green' : 'orange'
                        });
                        drawBox.draw(overlay);
                        
                        // 얼굴 표정 표시
                        const expressions = detection.expressions;
                        const dominantExpression = expressions
                            ? Object.keys(expressions).reduce((a, b) => 
                                expressions[a] > expressions[b] ? a : b)
                            : '표정 없음';
                        
                        ctx.fillStyle = 'white';
                        ctx.font = '12px Arial';
                        ctx.fillText(
                            `표정: ${dominantExpression}`, 
                            box.x, 
                            box.y + box.height + 20
                        );
                    });
                    
                } catch (error) {
                    console.error('얼굴 인식 오류:', error);
                }
            }, 500); // 0.5초마다 실행
        }

        // 얼굴 인식 중지
        function stopRecognition() {
            isRecognizing = false;
            clearInterval(recognitionInterval);
            
            recognizeBtn.disabled = false;
            stopBtn.disabled = true;
            registerBtn.disabled = false;
            faceNameInput.disabled = false;
            
            statusDiv.textContent = '얼굴 인식이 중지되었습니다.';
            
            // 오버레이 지우기
            const ctx = overlay.getContext('2d');
            ctx.clearRect(0, 0, overlay.width, overlay.height);
        }

        // 저장된 데이터 로드
        function loadSavedData() {
            const savedData = localStorage.getItem('faceDescriptors');
            if (savedData) {
                labeledFaceDescriptors = JSON.parse(savedData);
                updateFaceMatcher();
                updateFaceList();
            }
        }

        // 데이터 저장
        function saveData() {
            localStorage.setItem('faceDescriptors', JSON.stringify(labeledFaceDescriptors));
        }

        // 이벤트 리스너 등록
        startBtn.addEventListener('click', startCamera);
        registerBtn.addEventListener('click', registerFace);
        recognizeBtn.addEventListener('click', startRecognition);
        stopBtn.addEventListener('click', stopRecognition);

        // 앱 초기화
        async function init() {
            await loadModels();
            loadSavedData();
            
            // 페이지 언로드 시 데이터 저장
            window.addEventListener('beforeunload', saveData);
        }

        // 앱 시작
        init();
    </script>
</body>
</html>
```

## 사용 방법

1. **카메라 시작**: "카메라 시작" 버튼을 클릭하여 웹캠을 활성화합니다.
2. **얼굴 등록**: 
   - 이름을 입력하고 "얼굴 등록" 버튼을 클릭합니다.
   - 카메라 앞에 등록할 얼굴을 위치시킵니다.
   - 여러 각도에서 여러 번 등록하면 인식 정확도가 향상됩니다.
3. **얼굴 인식**: "얼굴 인식 시작" 버튼을 클릭하여 실시간 얼굴 인식을 시작합니다.
4. **인식 중지**: "인식 중지" 버튼을 클릭하여 인식을 중지합니다.

## 주요 기능

- **얼굴 감지 및 등록**: 웹캠에서 얼굴을 감지하고 등록합니다.
- **실시간 인식**: 등록된 얼굴을 실시간으로 인식합니다.
- **얼굴 표정 인식**: 감정(기쁨, 슬픔, 화남 등)도 함께 인식합니다.
- **데이터 저장**: 로컬 스토리지에 등록된 얼굴 데이터를 저장합니다.
- **반응형 디자인**: 다양한 화면 크기에 적응합니다.

## 주의사항

1. HTTPS 환경에서만 웹캠 접근이 가능합니다.
2. 브라우저에서 카메라 접근 권한을 허용해야 합니다.
3. 처음 모델 로드 시 시간이 다소 소요될 수 있습니다.

이 코드는 face-api.js 라이브러리를 사용하여 구현되었으며, 웹캠을 통해 얼굴을 등록하고 인식하는 기본적인 기능을 제공합니다.
