아래는 **Ultralytics YOLO(현업에서 가장 많이 쓰는 YOLOv8/YOLO 계열 Python API)** 기준으로, 객체 탐지를 “기본기만” 확실히 잡을 수 있는 예제들입니다. (이미지 1장, 동영상 파일, 웹캠/RTSP 실시간)
`from ultralytics import YOLO` / `model.predict(...)` / 결과에서 `boxes` 뽑는 흐름이 핵심입니다. ([docs.ultralytics.com][1])

---

## 0) 설치 & 준비

```bash
pip install -U ultralytics opencv-python
```

* 최초 실행 시 `yolov8n.pt` 같은 **프리트레인 모델이 자동 다운로드**될 수 있습니다. ([docs.ultralytics.com][1])

---

## 1) (가장 기본) 이미지 1장 추론 + 박스/클래스/신뢰도 출력

```python
from ultralytics import YOLO

model = YOLO("yolov8n.pt")  # 경량 모델(빠름)
results = model.predict(source="test.jpg", conf=0.25, imgsz=640)

r = results[0]  # 첫 이미지 결과
names = model.names

for b in r.boxes:
    cls_id = int(b.cls[0])
    conf = float(b.conf[0])
    x1, y1, x2, y2 = map(float, b.xyxy[0])
    print(names[cls_id], conf, (x1, y1, x2, y2))

# 시각화 결과 이미지 저장(annotated)
annotated = r.plot()  # numpy 이미지
import cv2
cv2.imwrite("out.jpg", annotated)
```

* `model.predict(...)` 가 결과 리스트를 반환하고, 각 결과에서 `boxes`를 통해 bbox/클래스/신뢰도를 꺼내는 패턴이 기본입니다. ([docs.ultralytics.com][2])

---

## 2) 동영상 파일 추론 + 화면 표시(실시간 느낌)

```python
import cv2
from ultralytics import YOLO

model = YOLO("yolov8n.pt")

video_path = "input.mp4"
cap = cv2.VideoCapture(video_path)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    results = model.predict(source=frame, conf=0.25, imgsz=640, verbose=False)
    annotated = results[0].plot()

    cv2.imshow("YOLO Video", annotated)
    if cv2.waitKey(1) == 27:  # ESC
        break

cap.release()
cv2.destroyAllWindows()
```

---

## 3) (드론/관제 핵심) RTSP/웹캠 “실시간” 추론 + 특정 클래스만 필터링

예: 사람(person)만 보고 싶다

```python
import cv2
from ultralytics import YOLO

model = YOLO("yolov8n.pt")
names = model.names

# 0이면 웹캠, RTSP라면 "rtsp://..." 로 교체
src = 0
cap = cv2.VideoCapture(src)
cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

TARGET = {"person"}  # 관심 클래스

while True:
    ret, frame = cap.read()
    if not ret:
        print("프레임 수신 실패")
        break

    results = model.predict(frame, conf=0.3, imgsz=640, verbose=False)[0]

    # 필터링해서 원하는 것만 직접 그리기
    for b in results.boxes:
        cls_id = int(b.cls[0])
        label = names[cls_id]
        if label not in TARGET:
            continue

        conf = float(b.conf[0])
        x1, y1, x2, y2 = map(int, b.xyxy[0])

        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(frame, f"{label} {conf:.2f}", (x1, y1 - 5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    cv2.imshow("YOLO Live", frame)
    if cv2.waitKey(1) == 27:
        break

cap.release()
cv2.destroyAllWindows()
```

> 참고: `results[0].plot()`은 “모든 클래스”를 자동으로 그려주지만, 관제에서는 “필요 클래스만” 강조하는 경우가 많아서 위처럼 필터링 방식이 유용합니다.

---

## 4) (옵션) YOLO “track” 모드로 객체 ID 추적까지

관제/드론에서 “사람 1명 지속 추적” 같은 용도에 자주 씁니다.

```python
import cv2
from ultralytics import YOLO

model = YOLO("yolov8n.pt")
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # persist=True: 이전 프레임 트랙 유지(연속 프레임용)
    results = model.track(frame, persist=True, conf=0.25, imgsz=640, verbose=False)
    annotated = results[0].plot()

    cv2.imshow("YOLO Track", annotated)
    if cv2.waitKey(1) == 27:
        break

cap.release()
cv2.destroyAllWindows()
```

Ultralytics 문서에서도 OpenCV 프레임 루프 + `persist=True` 형태를 안내합니다. ([docs.ultralytics.com][3])

---

## 실무에서 자주 터지는 포인트 3개

1. **성능(FPS)**: `yolov8n.pt`(nano) → 빠름 / `yolov8s.pt` → 정확도↑, 속도↓
2. **입력 크기(imgsz)**: 640이 무난. 키우면 정확도↑, 속도↓
3. **conf 임계값**: 너무 낮으면 오탐 많음, 너무 높으면 누락 많음

---

원하면, 방금 만든 **FastAPI WebSocket 중계 서버**에 이 YOLO를 붙여서
“**탐지 박스 오버레이된 프레임을 WS로 전송**”하거나,
“**탐지 결과(클래스/좌표/신뢰도)를 JSON으로 같이 전송**”하는 버전으로 확장해줄게요.

원하는 형태만 골라주세요:

* A) 오버레이된 영상(JPEG)만 WS로 푸시
* B) 원본 영상 + 탐지 결과(JSON) 같이 푸시
* C) 탐지 결과만(JSON) 푸시(대역폭 최소)

[1]: https://docs.ultralytics.com/quickstart/?utm_source=chatgpt.com "Install Ultralytics"
[2]: https://docs.ultralytics.com/modes/predict/?utm_source=chatgpt.com "Model Prediction with Ultralytics YOLO"
[3]: https://docs.ultralytics.com/modes/track/?utm_source=chatgpt.com "Multi-Object Tracking with Ultralytics YOLO"
