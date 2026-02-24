좋다, 이제 진짜 “실전용”으로 가보자.  
아까 구조 그대로 두고, **FastAPI 서버 쪽에 YOLO 실시간 객체 감지**를 붙여서  
**박스 정보까지 WebSocket으로 보내는 버전**을 만들겠다.

전제:  
- YOLO는 `ultralytics` 패키지 사용 (`pip install ultralytics`)  
- YOLOv8n 모델 예시 (`from ultralytics import YOLO`)

---

### 1) FastAPI + WebSocket + YOLO 서버 코드

```python
# server_yolo.py
import cv2
import base64
import asyncio
import json
from fastapi import FastAPI, WebSocket
import uvicorn
from ultralytics import YOLO

app = FastAPI()
model = YOLO("yolov8n.pt")  # 처음 한 번만 다운로드됨

@app.websocket("/detect_stream")
async def detect_stream(websocket: WebSocket):
    await websocket.accept()

    cap = cv2.VideoCapture(0)  # 웹캠 (드론 RTSP로 교체 가능)

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        # YOLO 추론
        results = model(frame, verbose=False)[0]

        boxes_data = []
        for box in results.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = float(box.conf[0])
            cls = int(box.cls[0])
            boxes_data.append({
                "x1": x1,
                "y1": y1,
                "x2": x2,
                "y2": y2,
                "conf": conf,
                "cls": cls
            })

        # 박스 그려서 시각화용 프레임 생성
        for b in boxes_data:
            cv2.rectangle(
                frame,
                (int(b["x1"]), int(b["y1"])),
                (int(b["x2"]), int(b["y2"])),
                (0, 255, 0),
                2
            )

        # JPEG 인코딩 → base64
        _, buffer = cv2.imencode(".jpg", frame)
        jpg_as_text = base64.b64encode(buffer).decode("utf-8")

        # 이미지 + 박스 정보를 JSON으로 묶어서 전송
        payload = {
            "image": jpg_as_text,
            "boxes": boxes_data
        }

        await websocket.send_text(json.dumps(payload))
        await asyncio.sleep(0.03)  # 약 30fps

if __name__ == "__main__":
    uvicorn.run("server_yolo:app", host="0.0.0.0", port=8000)
```

- YOLO가 매 프레임마다 객체 감지  
- 박스 정보(`x1,y1,x2,y2, conf, cls`)를 JSON으로 함께 전송  
- 프레임에는 박스까지 그려서 시각화

---

### 2) Python WebSocket 클라이언트 (YOLO 박스까지 수신)

```python
# client_python_yolo.py
import cv2
import base64
import numpy as np
import asyncio
import websockets
import json

async def receive_stream():
    uri = "ws://localhost:8000/detect_stream"

    async with websockets.connect(uri) as websocket:
        while True:
            data = await websocket.recv()
            payload = json.loads(data)

            img_b64 = payload["image"]
            boxes = payload["boxes"]

            # base64 → 이미지 디코딩
            img_data = base64.b64decode(img_b64)
            np_arr = np.frombuffer(img_data, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            # 박스 정보 출력 (원하면 여기서 추가 처리 가능)
            for b in boxes:
                print(
                    f"cls={b['cls']}, conf={b['conf']:.2f}, "
                    f"box=({b['x1']:.1f},{b['y1']:.1f},{b['x2']:.1f},{b['y2']:.1f})"
                )

            cv2.imshow("YOLO WebSocket Stream", frame)
            if cv2.waitKey(1) == 27:
                break

asyncio.run(receive_stream())
```

- 서버에서 보낸 JSON 파싱  
- `image` → base64 디코딩 후 OpenCV로 표시  
- `boxes` → 콘솔 출력 또는 추가 로직에 활용 가능  

---

### 3) JavaScript WebSocket 클라이언트 (브라우저에서 박스 정보까지 사용)

```html
<!-- client_js_yolo.html -->
<!DOCTYPE html>
<html>
<body>
    <h2>YOLO WebSocket Video Stream</h2>
    <img id="video" width="640" />
    <pre id="info"></pre>

    <script>
        const ws = new WebSocket("ws://localhost:8000/detect_stream");
        const img = document.getElementById("video");
        const info = document.getElementById("info");

        ws.onmessage = (event) => {
            const payload = JSON.parse(event.data);

            // 이미지 표시
            img.src = "data:image/jpeg;base64," + payload.image;

            // 박스 정보 표시
            info.textContent = JSON.stringify(payload.boxes, null, 2);
        };
    </script>
</body>
</html>
```

- 브라우저에서 실시간 영상 표시  
- 아래 `pre` 영역에 YOLO 박스 정보(JSON) 그대로 출력  
- 원하면 `<canvas>`로 박스를 직접 그리는 것도 가능

---

### 흐름 정리

1. **FastAPI 서버**
   - 웹캠/드론 영상 → YOLO 추론 → 박스 + 프레임 생성  
   - `{"image": base64_jpeg, "boxes": [...]}` 형태로 WebSocket 전송  

2. **Python 클라이언트**
   - 같은 JSON 구조 수신  
   - 이미지 디코딩 + 박스 정보 활용  

3. **JS 클라이언트**
   - 브라우저에서 이미지 표시 + 박스 정보 활용  

---

원하면 다음 단계로  
- 클래스 이름까지 붙이기 (COCO names)  
- 특정 클래스만 필터링해서 보내기 (예: 사람, 자동차만)  
- 박스만 보내고 이미지는 RTSP/WebRTC로 따로 보내는 구조  
같은 것도 설계해볼 수 있다.

지금 이 구조에서 제일 먼저 해보고 싶은 건 뭐야?
