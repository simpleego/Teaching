이 오류는 `stream=True` 옵션을 사용할 때 발생하는 문제입니다. `stream=True`는 **generator**를 반환하는데, 인덱스(`[0]`)로 접근할 수 없기 때문입니다 .

## 🔍 문제 코드

```python
# 문제가 있는 부분
results = model(frame, stream=True)  # generator 반환
annotated_frame = results[0].plot()  # ❌ generator는 인덱싱 불가
```

## ✅ 해결 방법

### 방법 1: `stream=True` 제거 (간단한 해결)

```python
import cv2
from ultralytics import YOLO

def webcam_object_detection():
    # 모델 로드
    model = YOLO('yolov8n.pt')
    
    # 웹캠 열기
    cap = cv2.VideoCapture(0)
    
    print("웹캠 객체 탐지 시작 (종료: 'q' 키)")
    
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break
        
        # stream=True 제거
        results = model(frame)  # ✅ 직접 결과 반환
        
        # 결과 시각화
        annotated_frame = results[0].plot()  # ✅ 정상 작동
        
        # 화면에 표시
        cv2.imshow('YOLO Object Detection', annotated_frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()

webcam_object_detection()
```

### 방법 2: generator를 올바르게 처리

```python
import cv2
from ultralytics import YOLO

def webcam_object_detection():
    model = YOLO('yolov8n.pt')
    cap = cv2.VideoCapture(0)
    
    print("웹캠 객체 탐지 시작 (종료: 'q' 키)")
    
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break
        
        # stream=True 사용 시 generator 처리
        results_generator = model(frame, stream=True)
        
        # generator에서 결과 가져오기
        for result in results_generator:  # ✅ for 루프로 처리
            annotated_frame = result.plot()
            cv2.imshow('YOLO Object Detection', annotated_frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()

webcam_object_detection()
```

### 방법 3: 성능 최적화 버전

```python
import cv2
from ultralytics import YOLO

def webcam_object_detection():
    # 모델 로드
    model = YOLO('yolov8n.pt')
    
    # 웹캠 설정
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    print("웹캠 객체 탐지 시작 (종료: 'q' 키)")
    
    # FPS 측정용
    import time
    prev_time = time.time()
    
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break
        
        # 객체 탐지 (stream=False가 단일 이미지 처리에 더 간단)
        results = model(frame, verbose=False)  # verbose=False로 로그 출력 줄임
        
        # 결과 시각화
        annotated_frame = results[0].plot()
        
        # FPS 계산 및 표시
        curr_time = time.time()
        fps = 1 / (curr_time - prev_time)
        prev_time = curr_time
        cv2.putText(annotated_frame, f"FPS: {fps:.1f}", (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        # 화면에 표시
        cv2.imshow('YOLO Object Detection', annotated_frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    webcam_object_detection()
```

## 📚 `stream=True`의 의미

| 옵션 | 반환값 | 사용 상황 |
|------|--------|----------|
| `stream=False` (기본값) | 결과 리스트 | 단일 이미지/배치 처리 |
| `stream=True` | generator | 비디오 스트림, 메모리 효율적 처리 |

**간단한 해결책**: 웹캠 테스트에서는 **방법 1**처럼 `stream=True`를 제거하는 것이 가장 쉽습니다!
