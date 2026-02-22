사람 **나이(age)** 를 예측하는 기능은 기본 YOLO 모델(yolov8, yolov5 등)에 **기본 포함되어 있지 않아요.**  
따라서 나이 추정(age estimation)을 하려면 **나이 추정 모델을 따로 불러와서**, YOLO로 사람을 검출한 뒤 **검출된 얼굴 영역을 나이 모델에 넣어 예측**하는 방식으로 구현해야 합니다.

아래는 가장 많이 쓰이는 **YOLO + Age/Gender 모델(SSR-Net 기반)** 조합으로 웹캠에서 사람을 검출하고 나이를 예측하는 전체 코드입니다.

---

# 🎥 YOLO + Age Estimation(SSR-Net) 웹캠 실시간 나이 예측 코드

## 📌 필요한 모델 다운로드
아래 두 파일을 다운로드해야 합니다:

### ✔ 1) Age/Gender 모델 (OpenCV 제공)
- `age_deploy.prototxt`
- `age_net.caffemodel`

OpenCV 공식 모델 저장소:  
`https://github.com/opencv/opencv/tree/master/samples/dnn/face_detector` [(github.com in Bing)](https://www.bing.com/search?q="https%3A%2F%2Fgithub.com%2Fopencv%2Fopencv%2Ftree%2Fmaster%2Fsamples%2Fdnn%2Fface_detector")

Age 모델 직접 링크:
- `https://github.com/spmallick/learnopencv/tree/master/AgeGender` [(github.com in Bing)](https://www.bing.com/search?q="https%3A%2F%2Fgithub.com%2Fspmallick%2Flearnopencv%2Ftree%2Fmaster%2FAgeGender")

---

# 🧠 전체 코드

```python
import cv2
from ultralytics import YOLO
import numpy as np

# YOLO 모델 로드 (사람 검출용)
yolo = YOLO("yolov8n.pt")

# Age 모델 로드
age_proto = "age_deploy.prototxt"
age_model = "age_net.caffemodel"
age_net = cv2.dnn.readNet(age_model, age_proto)

AGE_BUCKETS = ['0-2', '4-6', '8-12', '15-20', '25-32', '38-43', '48-53', '60-100']

# 웹캠 열기
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # YOLO로 사람 검출
    results = yolo(frame, verbose=False)

    for box in results[0].boxes:
        cls = int(box.cls[0])
        if cls != 0:  # 0 = person
            continue

        x1, y1, x2, y2 = map(int, box.xyxy[0])

        # 얼굴 영역 추출 (상체 기준으로 얼굴 부분만 crop)
        face = frame[y1:y2, x1:x2]

        if face.size == 0:
            continue

        # Age 모델 입력 준비
        blob = cv2.dnn.blobFromImage(
            face,
            scalefactor=1.0,
            size=(227, 227),
            mean=(78.4263377603, 87.7689143744, 114.895847746),
            swapRB=False
        )
        age_net.setInput(blob)
        age_preds = age_net.forward()
        age = AGE_BUCKETS[age_preds[0].argmax()]

        # 박스 + 나이 표시
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(frame, f"Age: {age}", (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

    cv2.imshow("Age Estimation", frame)

    if cv2.waitKey(1) == 27:
        break

cap.release()
cv2.destroyAllWindows()
```

---

# 📌 코드 설명

### ✔ YOLO로 사람 검출
```python
results = yolo(frame)
```
- 사람(class 0)만 필터링

### ✔ 검출된 사람 영역에서 얼굴 부분 crop
YOLO는 사람 전체를 잡기 때문에, 간단히 **사람 박스 전체를 얼굴 후보로 사용**  
(정확도를 높이려면 별도의 face detector 추가 가능)

### ✔ Age 모델로 나이 예측
```python
age_preds = age_net.forward()
age = AGE_BUCKETS[age_preds[0].argmax()]
```

### ✔ 화면에 나이 표시
```python
cv2.putText(frame, f"Age: {age}", ...)
```

---

# 🚀 더 발전시키고 싶다면
원하면 아래 버전도 만들어줄 수 있어요:

- YOLO로 **얼굴만** 검출하는 버전 (YOLO-face 모델 사용)
- **정확도 높은 나이 추정 모델**(InsightFace, DEX 등)로 교체
- 두 개의 웹캠에서 동시에 나이 예측
- 멀티스레딩으로 FPS 향상

어떤 방향으로 확장하고 싶은지 알려줘 jong.
