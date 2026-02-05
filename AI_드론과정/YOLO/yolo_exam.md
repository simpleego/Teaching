YOLO(You Only Look Once)는 실시간 객체 탐지(Object Detection) 분야에서 가장 대중적인 모델입니다. 이를 제대로 학습하기 위해 필요한 **사전 지식**과 **4시간 집중 커리큘럼**을 정리해 드립니다.

---

## 1. YOLO 학습을 위한 사전 필수 지식

YOLO 코드를 짜기 전에 아래 개념들을 머릿속에 넣어두면 훨씬 이해가 빠릅니다.

* **객체 탐지(Object Detection)의 기본**:
* **Classification**: 이 사진이 '개'인가?
* **Localization**: '개'가 사진 어디(Bounding Box)에 있는가?
* **Detection**: 사진 속 여러 개의 객체를 찾고 분류하는 것.


* **IOU (Intersection over Union)**: 모델이 예측한 박스와 실제 박스가 얼마나 겹치는지를 나타내는 지표 (에서  사이).
* **NMS (Non-Maximum Suppression)**: 중복된 예측 박스들 중 가장 확률이 높은 것만 남기고 나머지를 제거하는 기술.
* **Confidence Score**: 특정 박스 안에 물체가 있을 확률과 그 물체가 무엇인지에 대한 확신도.

---

## 2. 4시간 집중 학습 커리큘럼 (Python & Ultralytics)

가장 최신이자 사용이 쉬운 **YOLOv8/v11 (Ultralytics)** 라이브러리를 기준으로 구성했습니다.

### [1교시] 환경 설정 및 추론 체험 (60분)

* **목표**: YOLO 라이브러리 설치 및 이미 학습된 모델로 사진 속 물체 맞히기.
* **내용**:
1. `pip install ultralytics` 설치.
2. 기본 제공되는 `yolov8n.pt`(Nano 모델) 로드.
3. 웹캠이나 이미지 파일을 입력으로 넣어 결과 확인.



### [2교시] 데이터셋의 구조 이해 (60분)

* **목표**: YOLO가 학습하기 위해 필요한 데이터 형식을 이해하기.
* **내용**:
1. **YAML 파일**: 클래스 이름과 데이터 경로 설정.
2. **Label 형식**: `class_id x_center y_center width height` (모두 0~1 사이로 정규화된 값).
3. Roboflow 같은 도구에서 공개 데이터셋(예: 주스 병, 교통 표지판) 다운로드.



### [3교시] 커스텀 데이터로 학습하기 (60분)

* **목표**: 내 데이터를 사용해 모델을 직접 훈련시키기.
* **내용**: `model.train()` 함수 사용법 익히기.
* **핵심 파라미터**: `epochs`(반복 횟수), `imgsz`(이미지 크기), `batch`(한 번에 학습할 양).

### [4교시] 결과 분석 및 실전 응용 (60분)

* **목표**: 학습 결과(`runs/` 폴더) 해석 및 실시간 영상 적용.
* **내용**:
1. `results.png`, `confusion_matrix.png` 보는 법.
2. OpenCV와 연동하여 실시간 화면에 박스 그리기.



---

## 3. 파이썬 실습 예제 코드

이 코드는 **Google Colab**이나 로컬 환경에서 바로 실행 가능합니다.

```python
# 1. 라이브러리 설치
# !pip install ultralytics

from ultralytics import YOLO
import cv2

# 2. 모델 로드 (학습된 모델 사용)
# 'n'은 Nano 버전으로 속도가 매우 빠릅니다.
model = YOLO('yolov8n.pt') 

# 3. 이미지 추론 (Prediction)
results = model.predict(source='https://ultralytics.com/images/bus.jpg', save=True)

# 4. 학습 예제 (간략화)
"""
# 실제 학습 시에는 아래 주석을 해제하고 data.yaml 경로를 지정하세요.
model.train(data='coco8.yaml', epochs=3, imgsz=640)
"""

# 5. 실시간 웹캠 검출 (로컬 환경용)
# 0번 카메라는 기본 웹캠입니다.
cap = cv2.VideoCapture(0)

while cap.isOpened():
    success, frame = cap.read()
    if success:
        # 모델 추론
        results = model(frame)
        
        # 결과 시각화
        annotated_frame = results[0].plot()
        
        cv2.imshow("YOLO Real-time Detection", annotated_frame)
        
        # 'q' 누르면 종료
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    else:
        break

cap.release()
cv2.destroyAllWindows()

```

---

### 💡 다음 단계로 무엇을 도와드릴까요?

* 특정 주제(예: 자동차 번호판 인식)에 맞는 **데이터셋 구하는 법**을 알려드릴까요?
* 아니면 **YOLO의 아키텍처(Backbone, Neck, Head)**에 대해 더 깊이 설명해 드릴까요?
