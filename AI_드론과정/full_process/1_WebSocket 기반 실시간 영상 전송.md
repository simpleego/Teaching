# 1_WebSocket 기반 실시간 영상 전송
> **1단계: WebSocket 기반 실시간 영상 전송 (FastAPI + Svelte + YOLO 객체검출)** 구조를 단계별

이 방식은 기존 HTTP 업로드 방식보다 **지연(latency)이 적고 실시간성**이 뛰어나며,
실무(드론, CCTV, AIoT)에서 가장 많이 사용하는 구조입니다.

---

# ✅ 전체 구조 (WebSocket 기반)

```
[Camera Client]
   │ (WebSocket 전송: JPEG Frame)
   ▼
[FastAPI Server + YOLO]
   │ (검출 후 JPEG 전송)
   ▼
[Svelte Frontend]
   (실시간 영상 출력)
```

---

# ✅ 사용 기술

## Backend

* FastAPI
* WebSocket
* OpenCV
* YOLOv8 (ultralytics)
* Uvicorn

## Frontend

* Svelte
* WebSocket API
* HTML <img> (base64 이미지)

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

# ✅ 1️⃣ FastAPI WebSocket 서버 (영상 수신 + 객체 검출)

📄 backend/main.py

```python
from fastapi import FastAPI, WebSocket
import cv2
import numpy as np
from ultralytics import YOLO
import base64

app = FastAPI()

model = YOLO("yolov8n.pt")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected")

    try:
        while True:
            data = await websocket.receive_bytes()

            # bytes → numpy image
            npimg = np.frombuffer(data, np.uint8)
            frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

            # YOLO 객체 검출
            results = model(frame)
            annotated = results[0].plot()

            # 다시 JPEG 인코딩
            _, buffer = cv2.imencode('.jpg', annotated)
            jpg_bytes = buffer.tobytes()

            # base64 인코딩 후 전송
            encoded = base64.b64encode(jpg_bytes).decode('utf-8')
            await websocket.send_text(encoded)

    except Exception as e:
        print("Disconnected:", e)
```

실행:

```bash
uvicorn main:app --reload
```

---

# ✅ 2️⃣ 영상 송신 Client (WebSocket)

📄 client/sender.py

```python
import cv2
import websocket
import base64

WS_URL = "ws://127.0.0.1:8000/ws"

ws = websocket.WebSocket()
ws.connect(WS_URL)

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # JPEG 인코딩
    _, buffer = cv2.imencode('.jpg', frame)
    ws.send(buffer.tobytes())

    # 서버에서 검출된 프레임 수신
    result = ws.recv()
    img_data = base64.b64decode(result)
    npimg = np.frombuffer(img_data, dtype=np.uint8)
    detected = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    cv2.imshow("Client View", detected)
    if cv2.waitKey(1) == 27:
        break

cap.release()
ws.close()
cv2.destroyAllWindows()
```

설치:

```bash
pip install websocket-client
```

---

# ✅ 3️⃣ Svelte 프론트엔드 (실시간 영상 출력)

📄 frontend/src/App.svelte

```svelte
<script>
  let socket;
  let imageSrc = "";

  socket = new WebSocket("ws://localhost:8000/ws");

  socket.onmessage = (event) => {
    imageSrc = "data:image/jpeg;base64," + event.data;
  };
</script>

<main>
  <h2>📡 Real-time Object Detection</h2>
  <img src={imageSrc} width="640" />
</main>

<style>
  main {
    text-align: center;
  }
  img {
    border: 2px solid #333;
    border-radius: 10px;
  }
</style>
```

---

# ✅ 4️⃣ 라이브러리 설치

## Backend

```bash
pip install fastapi uvicorn opencv-python ultralytics
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

### ① FastAPI 서버 실행

```bash
uvicorn main:app --reload
```

### ② 영상 송신 실행

```bash
python sender.py
```

### ③ Svelte 실행

```bash
npm run dev
```

### ④ 접속

```
http://localhost:5173
```

---

# ✅ 동작 흐름 요약

1. sender.py → WebSocket으로 영상 프레임 전송
2. FastAPI 서버 → YOLO 객체 검출
3. 검출된 프레임을 WebSocket으로 전송
4. Svelte에서 실시간 표시

---

# 🚀 장점

✔ HTTP보다 빠른 실시간 처리
✔ 서버 부하 감소
✔ 양방향 통신
✔ 확장 가능 (WebRTC, RTSP)
✔ 실무 구조와 유사

---

# 📌 다음 단계 확장 가능 항목

다음 단계로 추천:

**2단계**

* 검출 결과(JSON: 객체명, 좌표, confidence) 프론트엔드에 표시
* 박스 ON/OFF 버튼
* FPS 표시

**3단계**

* Docker 배포
* GPU(CUDA) 적용
* DB 저장

---
