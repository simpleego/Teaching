# face-api.js 모델 로드 코드 상세 설명

## 코드 개요
```javascript
await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
    faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
    faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
    faceapi.nets.faceExpressionNet.loadFromUri(modelPath)
]);
```

이 코드는 face-api.js 라이브러리에서 필요한 4가지 딥러닝 모델을 비동기적으로 병렬 로드하는 부분입니다.

## 각 모델의 상세 기능

### 1. TinyFaceDetector 모델
```javascript
faceapi.nets.tinyFaceDetector.loadFromUri(modelPath)
```

**역할**: 이미지/비디오에서 얼굴 위치를 감지

**특징**:
- 경량화된 얼굴 감지 모델
- 실시간 처리에 최적화
- 높은 성능과 적은 리소스 사용
- 여러 얼굴을 동시에 감지 가능

**출력 결과**:
```javascript
{
    detection: {
        score: 0.98,  // 신뢰도 (0~1)
        box: {
            x: 100,   // 얼굴의 x 좌표
            y: 150,   // 얼굴의 y 좌표
            width: 200,  // 얼굴 너비
            height: 250  // 얼굴 높이
        }
    }
}
```

### 2. FaceLandmark68Net 모델
```javascript
faceapi.nets.faceLandmark68Net.loadFromUri(modelPath)
```

**역할**: 얼굴에서 68개의 특징점(랜드마크)을 추출

**랜드마크 포인트 분포**:
- **눈썹**: 10 points (좌우 각 5개)
- **눈**: 12 points (좌우 각 6개)
- **코**: 9 points
- **입술**: 20 points (외곽 12개, 내부 8개)
- **얼굴 외곽**: 17 points

**출력 결과**:
```javascript
{
    landmarks: {
        positions: [
            {x: 120, y: 130},  // 0번: 턱 끝
            {x: 125, y: 135},  // 1번
            // ... 68개의 포인트
        ]
    }
}
```

**활용 예시**:
- 얼굴 방향(포즈) 추정
- 눈 깜빡임 감지
- 입술 움직임 추적
- 얼굴 정렬(alignment)

### 3. FaceRecognitionNet 모델
```javascript
faceapi.nets.faceRecognitionNet.loadFromUri(modelPath)
```

**역할**: 얼굴을 고유한 숫자 벡터(디스크립터)로 변환

**작동 원리**:
- 얼굴 이미지를 128차원(또는 512차원)의 숫자 벡터로 매핑
- 유사한 얼굴은 유사한 벡터 값을 가짐
- 다른 얼굴은 다른 벡터 값을 가짐

**출력 결과**:
```javascript
{
    descriptor: Float32Array[
        0.123, -0.456, 0.789, ... // 128개의 실수값
    ]
}
```

**활용 방법**:
```javascript
// 두 얼굴 간 유사도 계산
const distance = faceapi.euclideanDistance(descriptor1, descriptor2);

// 거리가 가까울수록 같은 사람 (일반적으로 0.6 이하면 같은 사람)
if (distance < 0.6) {
    console.log("같은 사람입니다!");
}
```

### 4. FaceExpressionNet 모델
```javascript
faceapi.nets.faceExpressionNet.loadFromUri(modelPath)
```

**역할**: 얼굴 표정을 분석하여 감정을 인식

**인식 가능한 감정**:
- `neutral` (중립)
- `happy` (행복)
- `sad` (슬픔)
- `angry` (화남)
- `fearful` (두려움)
- `disgusted` (혐오)
- `surprised` (놀람)

**출력 결과**:
```javascript
{
    expressions: {
        neutral: 0.2,
        happy: 0.7,
        sad: 0.1,
        angry: 0.05,
        fearful: 0.02,
        disgusted: 0.01,
        surprised: 0.02
    }
}
```

## 모델 간 협력 관계

```javascript
// 전체 얼굴 처리 파이프라인
const result = await faceapi
    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())  // 1. 얼굴 감지
    .withFaceLandmarks()                                           // 2. 랜드마크 추출
    .withFaceDescriptors()                                         // 3. 얼굴 인코딩
    .withFaceExpressions();                                        // 4. 감정 인식
```

## 모델 로드 최적화

### 병렬 로드
```javascript
// Promise.all을 사용하여 모든 모델을 병렬 로드
await Promise.all([model1, model2, model3, model4]);
// 순차 로드보다 약 4배 빠름
```

### 모델 경로 설정
```javascript
const modelPath = 'https://justadudewhohacks.github.io/face-api.js/models';
// CDN에서 모델 파일 자동 다운로드
```

## 실제 사용 예시

```javascript
// 얼굴 감지 및 분석 전체 과정
async function analyzeFace() {
    // 1. 얼굴 감지
    const detection = await faceapi.detectSingleFace(
        video, 
        new faceapi.TinyFaceDetectorOptions()
    );
    
    if (!detection) return null;
    
    // 2. 랜드마크 추출
    const landmarks = await faceapi.detectFaceLandmarks(video);
    
    // 3. 얼굴 디스크립터 생성
    const descriptor = await faceapi.computeFaceDescriptor(video);
    
    // 4. 감정 분석
    const expressions = await faceapi.detectFaceExpressions(video);
    
    return {
        detection,
        landmarks,
        descriptor,
        expressions
    };
}
```

이렇게 로드된 4가지 모델은 함께 작동하여 완전한 얼굴 인식 및 분석 시스템을 구성합니다.
