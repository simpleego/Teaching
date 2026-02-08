# 2_단계 객체 검출 결과(JSON)  UI 시각화
> 이제 **2️⃣ 단계: 객체 검출 결과(JSON) + UI 시각화 (FastAPI + Svelte)** 를 구현

목표:

* 서버에서 YOLO 객체 검출 수행
* **이미지 + 검출 결과(JSON)** 를 함께 전송
* 프론트엔드(Svelte)에서
  ✅ 영상 표시
  ✅ 박스 좌표
  ✅ 클래스명
  ✅ confidence(정확도)
  를 화면에 시각화

---

# ✅ 전체 구조

```
Camera(Client)
   │ WebSocket (frame)
   ▼
FastAPI + YOLO
   │ WebSocket (JSON: image + detections)
   ▼
Svelte UI (박스 + 라벨 표시)
```

---

# 📁 프로젝트 구조

```
project/
 ├─ backend/
 │   └─ main.py
 ├─ client/
 │   └─ sender.py
 └─ frontend/
     └─ src/App.svelte
```

---

# ✅ 1️⃣ FastAPI WebSocket 서버 (JSON + Detection 결과 전송)

📄 backend/main.py

```python
from fastapi import FastAPI, WebSocket
import cv2
import numpy as np
from ultralytics import YOLO
import base64
import json

app = FastAPI()
model = YOLO("yolov8n.pt")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected")

    try:
        while True:
            data = await websocket.receive_bytes()

            # bytes → image
            npimg = np.frombuffer(data, np.uint8)
            frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

            # YOLO inference
            results = model(frame)[0]

            detections = []
            for box in results.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                label = model.names[cls]

                detections.append({
                    "label": label,
                    "confidence": round(conf, 2),
                    "x1": int(x1),
                    "y1": int(y1),
                    "x2": int(x2),
                    "y2": int(y2)
                })

            # 이미지 인코딩
            _, buffer = cv2.imencode('.jpg', frame)
            img_base64 = base64.b64encode(buffer).decode("utf-8")

            message = {
                "image": img_base64,
                "detections": detections
            }

            await websocket.send_text(json.dumps(message))

    except Exception as e:
        print("Disconnected:", e)
```

실행:

```bash
uvicorn main:app --reload
```

---

# ✅ 2️⃣ 영상 송신 Client (변경 없음)

📄 client/sender.py

```python
import cv2
import websocket

WS_URL = "ws://127.0.0.1:8000/ws"

ws = websocket.WebSocket()
ws.connect(WS_URL)

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    _, buffer = cv2.imencode('.jpg', frame)
    ws.send(buffer.tobytes())

    ws.recv()  # 서버 응답 소비 (UI용)

    cv2.imshow("Camera", frame)
    if cv2.waitKey(1) == 27:
        break

cap.release()
ws.close()
cv2.destroyAllWindows()
```

---

# ✅ 3️⃣ Svelte 프론트엔드 (박스 + JSON 시각화)

📄 frontend/src/App.svelte

```svelte
<script>
  let socket;
  let imageSrc = "";
  let detections = [];

  const canvasWidth = 640;
  const canvasHeight = 480;

  socket = new WebSocket("ws://localhost:8000/ws");

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    imageSrc = "data:image/jpeg;base64," + data.image;
    detections = data.detections;
  };
</script>

<main>
  <h2>📦 Object Detection Dashboard</h2>

  <div class="video-container">
    <img src={imageSrc} width={canvasWidth} height={canvasHeight} />

    {#each detections as d}
      <div
        class="box"
        style="
          left:{d.x1}px;
          top:{d.y1}px;
          width:{d.x2 - d.x1}px;
          height:{d.y2 - d.y1}px;
        "
      >
        <span>{d.label} ({d.confidence})</span>
      </div>
    {/each}
  </div>
</main>

<style>
.video-container {
  position: relative;
  width: 640px;
  height: 480px;
  margin: auto;
}

img {
  position: absolute;
  top: 0;
  left: 0;
}

.box {
  position: absolute;
  border: 2px solid red;
  color: red;
  font-size: 12px;
}

.box span {
  background: rgba(0,0,0,0.6);
  color: white;
  padding: 2px 4px;
}
</style>
```

---

# ✅ 4️⃣ 설치 라이브러리

## Backend

```bash
pip install fastapi uvicorn ultralytics opencv-python
```

## Client

```bash
pip install websocket-client opencv-python
```

## Frontend

```bash
npm create vite@latest frontend -- --template svelte
cd frontend
npm install
npm run dev
```

---

# ✅ 실행 순서

1️⃣ FastAPI 실행

```bash
uvicorn main:app --reload
```

2️⃣ Client 실행

```bash
python sender.py
```

3️⃣ Svelte 실행

```bash
npm run dev
```

4️⃣ 브라우저 접속

```
http://localhost:5173
```

---

# ✅ 화면 결과

* 실시간 영상 표시
* 객체 박스 표시
* 라벨 표시 (person, car 등)
* confidence 표시 (0.85 등)

예:

```
person (0.91)
car (0.78)
```

---

# 🚀 확장 아이디어

다음 단계로 확장 가능:

| 기능           | 기술              |
| ------------ | --------------- |
| FPS 표시       | JS Timer        |
| 박스 ON/OFF 버튼 | Svelte 상태관리     |
| 검출결과 테이블     | JSON Table      |
| DB 저장        | MongoDB         |
| GPU          | CUDA            |
| 다중 카메라       | Multi WebSocket |

---

# 📌 핵심 정리

✔ YOLO 결과를 JSON으로 전송
✔ 프론트엔드에서 박스 직접 그림
✔ 이미지 + 메타데이터 분리
✔ 실무 AI 대시보드 구조

---

원하시면 다음 단계도 바로 이어서 만들어 드릴 수 있습니다:

**3️⃣ 단계 옵션**

1. FPS + 박스 ON/OFF UI 추가
2. 검출 결과 테이블(JSON 목록) 추가
3. Docker 배포 구조
4. RTSP 카메라 입력 버전
5. 전부 구현

원하시면 번호로 선택해주세요 👇
👉 **"3단계: 1번 진행"** 처럼 말씀해주시면 이어서 작성해 드리겠습니다.
