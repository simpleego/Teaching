# 얼굴 인식률 표시 및 출석 완료 기능 추가

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>얼굴 인식 출석 시스템</title>
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
            align-items: center;
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
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .face-item {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            background-color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .face-item img {
            max-width: 100%;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        .recognition-info {
            margin-top: 10px;
            padding: 8px;
            border-radius: 4px;
            font-size: 14px;
        }
        .confidence-high {
            background-color: #e8f5e8;
            color: #2e7d32;
            border: 1px solid #4caf50;
        }
        .confidence-medium {
            background-color: #fff3e0;
            color: #ef6c00;
            border: 1px solid #ff9800;
        }
        .confidence-low {
            background-color: #ffebee;
            color: #c62828;
            border: 1px solid #f44336;
        }
        .attendance-complete {
            background-color: #4caf50;
            color: white;
            padding: 5px 10px;
            border-radius: 20px;
            font-weight: bold;
            margin-top: 5px;
            display: inline-block;
        }
        .confidence-bar {
            width: 100%;
            height: 8px;
            background-color: #e0e0e0;
            border-radius: 4px;
            margin: 5px 0;
            overflow: hidden;
        }
        .confidence-fill {
            height: 100%;
            background-color: #4caf50;
            border-radius: 4px;
            transition: width 0.3s ease;
        }
        .recognition-result {
            margin-top: 15px;
            padding: 10px;
            border-radius: 8px;
            background-color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .result-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;
            margin: 5px 0;
            border-radius: 4px;
            background-color: #f8f9fa;
        }
        .result-name {
            font-weight: bold;
        }
        .result-confidence {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .progress-text {
            font-size: 14px;
            color: #666;
            min-width: 60px;
            text-align: right;
        }
        .attendance-list {
            margin-top: 20px;
        }
        .attendance-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            margin: 5px 0;
            background-color: white;
            border-radius: 4px;
            border-left: 4px solid #4caf50;
        }
        .error {
            background-color: #ffebee;
            border-left: 4px solid #f44336;
            color: #c62828;
        }
        .success {
            background-color: #e8f5e8;
            border-left: 4px solid #4caf50;
            color: #2e7d32;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>얼굴 인식 출석 시스템</h1>
        
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
            <div style="margin-left: auto;">
                <span>인식 임계값: </span>
                <select id="thresholdSelect">
                    <option value="0.5">50%</option>
                    <option value="0.6" selected>60%</option>
                    <option value="0.7">70%</option>
                    <option value="0.8">80%</option>
                    <option value="0.9">90%</option>
                </select>
            </div>
        </div>
        
        <div class="status" id="status">라이브러리 로드 중...</div>
        
        <!-- 실시간 인식 결과 -->
        <div class="recognition-result" id="recognitionResult" style="display: none;">
            <h3>실시간 인식 결과</h3>
            <div id="resultList"></div>
        </div>
        
        <!-- 출석 완료 목록 -->
        <div class="attendance-list" id="attendanceList" style="display: none;">
            <h3>출석 완료 목록</h3>
            <div id="attendanceItems"></div>
        </div>
        
        <div>
            <h2>등록된 얼굴 목록</h2>
            <div class="face-list" id="faceList"></div>
        </div>
    </div>

    <!-- TensorFlow.js -->
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.7.4/dist/tf.min.js"></script>
    <!-- face-api.js -->
    <script src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"></script>
    
    <script>
        // 전역 변수
        let videoStream = null;
        let isRecognizing = false;
        let faceMatcher = null;
        let labeledFaceDescriptors = [];
        let recognitionInterval = null;
        let modelsLoaded = false;
        let attendanceRecords = new Map(); // 출석 기록 저장
        let recognitionThreshold = 0.6; // 기본 임계값 60%

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
        const thresholdSelect = document.getElementById('thresholdSelect');
        const recognitionResult = document.getElementById('recognitionResult');
        const resultList = document.getElementById('resultList');
        const attendanceList = document.getElementById('attendanceList');
        const attendanceItems = document.getElementById('attendanceItems');

        // 임계값 변경 이벤트
        thresholdSelect.addEventListener('change', (e) => {
            recognitionThreshold = parseFloat(e.target.value);
            updateFaceMatcher();
            statusDiv.textContent = `인식 임계값이 ${Math.round(recognitionThreshold * 100)}%로 설정되었습니다.`;
        });

        // 모델 로드
        async function loadModels() {
            statusDiv.textContent = '얼굴 인식 모델 로드 중...';
            statusDiv.className = 'status';
            
            try {
                const modelPath = 'https://justadudewhohacks.github.io/face-api.js/models';
                
                await faceapi.nets.tinyFaceDetector.loadFromUri(modelPath);
                await faceapi.nets.faceLandmark68Net.loadFromUri(modelPath);
                await faceapi.nets.faceRecognitionNet.loadFromUri(modelPath);
                
                modelsLoaded = true;
                statusDiv.textContent = '모델 로드 완료! 카메라를 시작해주세요.';
                statusDiv.className = 'status success';
                
            } catch (error) {
                console.error('모델 로드 실패:', error);
                statusDiv.textContent = `모델 로드 실패: ${error.message}`;
                statusDiv.className = 'status error';
                modelsLoaded = false;
            }
        }

        // 카메라 시작
        async function startCamera() {
            if (!modelsLoaded) {
                statusDiv.textContent = '모델이 아직 로드되지 않았습니다.';
                statusDiv.className = 'status error';
                return;
            }
            
            try {
                if (videoStream) {
                    videoStream.getTracks().forEach(track => track.stop());
                }
                
                videoStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        width: { ideal: 640 }, 
                        height: { ideal: 480 },
                        facingMode: 'user' 
                    } 
                });
                
                video.srcObject = videoStream;
                
                await new Promise((resolve, reject) => {
                    video.onloadedmetadata = () => {
                        video.play().then(resolve).catch(reject);
                    };
                    video.onerror = reject;
                    setTimeout(() => reject(new Error('비디오 로드 타임아웃')), 5000);
                });
                
                overlay.width = video.videoWidth;
                overlay.height = video.videoHeight;
                
                startBtn.disabled = true;
                registerBtn.disabled = false;
                recognizeBtn.disabled = labeledFaceDescriptors.length === 0;
                faceNameInput.disabled = false;
                stopBtn.disabled = true;
                
                statusDiv.textContent = '카메라가 시작되었습니다. 얼굴을 등록하세요.';
                statusDiv.className = 'status success';
                
            } catch (error) {
                console.error('카메라 시작 실패:', error);
                statusDiv.textContent = `카메라 시작 실패: ${error.message}`;
                statusDiv.className = 'status error';
            }
        }

        // 얼굴 등록
        async function registerFace() {
            if (!modelsLoaded) {
                statusDiv.textContent = '모델이 로드되지 않았습니다.';
                return;
            }
            
            const name = faceNameInput.value.trim();
            if (!name) {
                alert('얼굴 이름을 입력해주세요.');
                return;
            }
            
            statusDiv.textContent = '얼굴 등록 중...';
            registerBtn.disabled = true;
            
            try {
                const detectionOptions = new faceapi.TinyFaceDetectorOptions({
                    inputSize: 160,
                    scoreThreshold: 0.3
                });
                
                const detection = await faceapi.detectSingleFace(video, detectionOptions);
                
                if (!detection) {
                    statusDiv.textContent = '얼굴을 찾을 수 없습니다. 카메라 앞으로 이동해주세요.';
                    registerBtn.disabled = false;
                    return;
                }
                
                const fullDetection = await faceapi
                    .detectSingleFace(video, detectionOptions)
                    .withFaceLandmarks()
                    .withFaceDescriptor();
                
                if (!fullDetection) {
                    statusDiv.textContent = '얼굴 분석에 실패했습니다. 다시 시도해주세요.';
                    registerBtn.disabled = false;
                    return;
                }
                
                const existingIndex = labeledFaceDescriptors.findIndex(item => item.label === name);
                
                if (existingIndex !== -1) {
                    labeledFaceDescriptors[existingIndex].descriptors.push(fullDetection.descriptor);
                } else {
                    labeledFaceDescriptors.push({
                        label: name,
                        descriptors: [fullDetection.descriptor]
                    });
                }
                
                updateFaceMatcher();
                updateFaceList();
                
                statusDiv.textContent = `"${name}" 얼굴이 등록되었습니다.`;
                faceNameInput.value = '';
                recognizeBtn.disabled = false;
                
                captureFaceImage(name, fullDetection);
                
            } catch (error) {
                console.error('얼굴 등록 실패:', error);
                statusDiv.textContent = `얼굴 등록 실패: ${error.message}`;
                statusDiv.className = 'status error';
            } finally {
                registerBtn.disabled = false;
            }
        }

        // 신뢰도에 따른 CSS 클래스 반환
        function getConfidenceClass(confidence) {
            if (confidence >= 0.9) return 'confidence-high';
            if (confidence >= 0.7) return 'confidence-medium';
            return 'confidence-low';
        }

        // 신뢰도 퍼센트 표시 형식
        function formatConfidence(confidence) {
            return Math.round(confidence * 100) + '%';
        }

        // 출석 처리
        function markAttendance(name, confidence) {
            const now = new Date();
            const timeString = now.toLocaleTimeString();
            const dateString = now.toLocaleDateString();
            
            if (!attendanceRecords.has(name)) {
                attendanceRecords.set(name, {
                    name: name,
                    confidence: confidence,
                    time: timeString,
                    date: dateString,
                    timestamp: now.getTime()
                });
                
                updateAttendanceList();
            } else {
                // 기존 기록 업데이트 (더 높은 신뢰도로)
                const existing = attendanceRecords.get(name);
                if (confidence > existing.confidence) {
                    attendanceRecords.set(name, {
                        ...existing,
                        confidence: confidence,
                        time: timeString,
                        date: dateString,
                        timestamp: now.getTime()
                    });
                    updateAttendanceList();
                }
            }
        }

        // 출석 목록 업데이트
        function updateAttendanceList() {
            attendanceItems.innerHTML = '';
            
            if (attendanceRecords.size === 0) {
                attendanceList.style.display = 'none';
                return;
            }
            
            attendanceList.style.display = 'block';
            
            const sortedRecords = Array.from(attendanceRecords.values())
                .sort((a, b) => b.timestamp - a.timestamp);
            
            sortedRecords.forEach(record => {
                const item = document.createElement('div');
                item.className = 'attendance-item';
                
                const confidencePercent = formatConfidence(record.confidence);
                const isAttendanceComplete = record.confidence >= 0.9;
                
                item.innerHTML = `
                    <div>
                        <strong>${record.name}</strong>
                        <div style="font-size: 12px; color: #666;">
                            ${record.date} ${record.time}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div>인식률: ${confidencePercent}</div>
                        ${isAttendanceComplete ? 
                            '<div class="attendance-complete">출석완료</div>' : 
                            '<div style="color: #ff9800; font-size: 12px;">인증대기</div>'
                        }
                    </div>
                `;
                
                attendanceItems.appendChild(item);
            });
        }

        // 얼굴 인식 시작
        function startRecognition() {
            if (!modelsLoaded || !faceMatcher) {
                statusDiv.textContent = '인식 준비가 안되었습니다. 얼굴을 먼저 등록해주세요.';
                return;
            }
            
            isRecognizing = true;
            recognizeBtn.disabled = true;
            stopBtn.disabled = false;
            registerBtn.disabled = true;
            faceNameInput.disabled = true;
            
            statusDiv.textContent = '얼굴 인식 중...';
            recognitionResult.style.display = 'block';
            
            recognitionInterval = setInterval(async () => {
                if (!isRecognizing) return;
                
                try {
                    const detectionOptions = new faceapi.TinyFaceDetectorOptions({
                        inputSize: 160,
                        scoreThreshold: 0.3
                    });
                    
                    const detections = await faceapi.detectAllFaces(video, detectionOptions);
                    
                    const ctx = overlay.getContext('2d');
                    ctx.clearRect(0, 0, overlay.width, overlay.height);
                    
                    resultList.innerHTML = '';
                    
                    if (detections.length > 0) {
                        const fullDetections = await faceapi
                            .detectAllFaces(video, detectionOptions)
                            .withFaceLandmarks()
                            .withFaceDescriptors();
                        
                        const resizedDetections = faceapi.resizeResults(fullDetections, {
                            width: video.videoWidth,
                            height: video.videoHeight
                        });
                        
                        resizedDetections.forEach((detection, index) => {
                            const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
                            const box = detection.detection.box;
                            const confidence = 1 - bestMatch.distance; // 거리를 신뢰도로 변환
                            
                            // 인식 결과 표시
                            const resultItem = document.createElement('div');
                            resultItem.className = 'result-item';
                            
                            const confidencePercent = formatConfidence(confidence);
                            const confidenceClass = getConfidenceClass(confidence);
                            const barWidth = Math.min(confidence * 100, 100);
                            
                            resultItem.innerHTML = `
                                <div class="result-name">${bestMatch.label}</div>
                                <div class="result-confidence">
                                    <div style="width: 120px;">
                                        <div class="confidence-bar">
                                            <div class="confidence-fill" style="width: ${barWidth}%"></div>
                                        </div>
                                    </div>
                                    <div class="progress-text ${confidenceClass}">
                                        ${confidencePercent}
                                        ${confidence >= 0.9 ? '✓' : ''}
                                    </div>
                                </div>
                            `;
                            
                            resultList.appendChild(resultItem);
                            
                            // 출석 처리 (임계값 이상일 때)
                            if (confidence >= recognitionThreshold) {
                                markAttendance(bestMatch.label, confidence);
                            }
                            
                            // 화면에 박스 그리기
                            const boxColor = confidence >= 0.9 ? 'green' : 
                                            confidence >= 0.7 ? 'orange' : 'red';
                            
                            const label = `${bestMatch.label} (${confidencePercent})`;
                            if (confidence >= 0.9) {
                                label += ' - 출석완료';
                            }
                            
                            const drawBox = new faceapi.draw.DrawBox(box, {
                                label: label,
                                boxColor: boxColor
                            });
                            drawBox.draw(overlay);
                        });
                    } else {
                        resultList.innerHTML = '<div style="text-align: center; color: #666;">인식된 얼굴이 없습니다</div>';
                    }
                    
                } catch (error) {
                    console.error('인식 오류:', error);
                }
            }, 1000);
        }

        function stopRecognition() {
            isRecognizing = false;
            if (recognitionInterval) {
                clearInterval(recognitionInterval);
            }
            
            recognizeBtn.disabled = false;
            stopBtn.disabled = true;
            registerBtn.disabled = false;
            faceNameInput.disabled = false;
            
            statusDiv.textContent = '얼굴 인식이 중지되었습니다.';
            
            const ctx = overlay.getContext('2d');
            ctx.clearRect(0, 0, overlay.width, overlay.height);
        }

        // 기존 함수들 유지
        function captureFaceImage(name, detection) {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                const box = detection.detection.box;
                const width = Math.min(box.width * 1.2, video.videoWidth);
                const height = Math.min(box.height * 1.2, video.videoHeight);
                const x = Math.max(0, box.x - (width - box.width) / 2);
                const y = Math.max(0, box.y - (height - box.height) / 2);
                
                canvas.width = width;
                canvas.height = height;
                
                ctx.drawImage(video, x, y, width, height, 0, 0, width, height);
                
                const imageDataUrl = canvas.toDataURL('image/jpeg');
                saveFaceImage(name, imageDataUrl);
            } catch (error) {
                console.error('이미지 캡처 실패:', error);
            }
        }

        function saveFaceImage(name, imageDataUrl) {
            try {
                const existingImages = JSON.parse(localStorage.getItem('faceImages') || '{}');
                existingImages[name] = imageDataUrl;
                localStorage.setItem('faceImages', JSON.stringify(existingImages));
            } catch (error) {
                console.error('이미지 저장 실패:', error);
            }
        }

        function updateFaceList() {
            faceListDiv.innerHTML = '';
            
            try {
                const faceImages = JSON.parse(localStorage.getItem('faceImages') || '{}');
                
                labeledFaceDescriptors.forEach(item => {
                    const faceItem = document.createElement('div');
                    faceItem.className = 'face-item';
                    
                    const nameDiv = document.createElement('div');
                    nameDiv.textContent = item.label;
                    nameDiv.style.fontWeight = 'bold';
                    nameDiv.style.marginBottom = '10px';
                    
                    const img = document.createElement('img');
                    img.src = faceImages[item.label] || '';
                    img.alt = item.label;
                    img.onerror = function() {
                        this.style.display = 'none';
                    };
                    
                    const countDiv = document.createElement('div');
                    countDiv.textContent = `등록: ${item.descriptors.length}개`;
                    countDiv.style.fontSize = '12px';
                    countDiv.style.color = '#666';
                    countDiv.style.marginTop = '5px';
                    
                    faceItem.appendChild(nameDiv);
                    faceItem.appendChild(img);
                    faceItem.appendChild(countDiv);
                    
                    faceListDiv.appendChild(faceItem);
                });
            } catch (error) {
                console.error('얼굴 목록 업데이트 실패:', error);
            }
        }

        function updateFaceMatcher() {
            if (labeledFaceDescriptors.length === 0) {
                faceMatcher = null;
                return;
            }
            
            try {
                const labeledDescriptors = labeledFaceDescriptors.map(item => 
                    new faceapi.LabeledFaceDescriptors(item.label, item.descriptors)
                );
                
                faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
            } catch (error) {
                console.error('FaceMatcher 업데이트 실패:', error);
                faceMatcher = null;
            }
        }

        function loadSavedData() {
            try {
                const savedData = localStorage.getItem('faceDescriptors');
                if (savedData) {
                    labeledFaceDescriptors = JSON.parse(savedData);
                    updateFaceMatcher();
                    updateFaceList();
                    recognizeBtn.disabled = labeledFaceDescriptors.length === 0;
                }
                
                // 출석 기록 로드
                const savedAttendance = localStorage.getItem('attendanceRecords');
                if (savedAttendance) {
                    const records = JSON.parse(savedAttendance);
                    attendanceRecords = new Map(records);
                    updateAttendanceList();
                }
            } catch (error) {
                console.error('저장된 데이터 로드 실패:', error);
            }
        }

        function saveData() {
            try {
                localStorage.setItem('faceDescriptors', JSON.stringify(labeledFaceDescriptors));
                localStorage.setItem('attendanceRecords', JSON.stringify(Array.from(attendanceRecords.entries())));
            } catch (error) {
                console.error('데이터 저장 실패:', error);
            }
        }

        // 이벤트 리스너
        startBtn.addEventListener('click', startCamera);
        registerBtn.addEventListener('click', registerFace);
        recognizeBtn.addEventListener('click', startRecognition);
        stopBtn.addEventListener('click', stopRecognition);

        // 앱 초기화
        async function init() {
            await loadModels();
            loadSavedData();
            window.addEventListener('beforeunload', saveData);
        }

        // 앱 시작
        init();
    </script>
</body>
</html>
```

## 주요 추가 기능

1. **인식률 퍼센트 표시**
   - 실시간으로 얼굴 인식 신뢰도를 퍼센트로 표시
   - 진행률 바를 통해 시각적으로 확인 가능

2. **출석 완료 시스템**
   - 90% 이상 인식률: "출석완료" 표시
   - 70-89%: "인증대기" 표시
   - 70% 미만: 낮은 신뢰도로 표시

3. **출석 기록 관리**
   - 출석한 사람들의 목록과 시간 기록
   - 가장 높은 인식률로 자동 업데이트
   - 로컬 스토리지에 저장

4. **시각적 피드백**
   - 색상으로 신뢰도 구분 (초록색: 높음, 주황색: 중간, 빨간색: 낮음)
   - 인식 박스 색상도 신뢰도에 따라 변경

5. **설정 가능한 임계값**
   - 50%~90%까지 임계값 조정 가능
   - 기본값은 60%로 설정

이제 얼굴 인식 시 인식률이 퍼센트로 표시되고, 90% 이상이면 "출석완료"로 자동 표시됩니다.
