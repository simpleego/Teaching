# 6_단계 WebSocket 기반 실시간 영상 객체검출 JSON 전송 시스템
> **WebSocket 기반 실시간 영상 + 객체검출 JSON 전송 시스템**을 구현

기능:
✅ WebSocket 실시간 프레임 전송
✅ YOLO 객체 검출
✅ 검출 결과(JSON) 실시간 전송
✅ FPS 계산
✅ 알람 조건 감지
✅ Svelte UI 실시간 표시
✅ Chart.js 통계 가능 구조

---

# ✅ 전체 구조

```
Camera(Sender)
   ↓ (WebSocket)
FastAPI (YOLO Detect)
   ↓ JSON + JPEG(base64)
Svelte Frontend (실시간 UI)
```

---

# ✅ 기술 스택

## Backend

* FastAPI
* WebSocket
* OpenCV
* YOLOv8
* Base64 Encoding

## Frontend

* Svelte
* WebSocket API
* Canvas / img 태그
* Chart.js (확장 가능)

---

# 📁 프로젝트 구조

```
project/
 ├ backend/
 │   └ main.py
 ├ sender.py
 └ frontend/
     └ src/App.svelte
```

---

# ✅ 1️⃣ Backend (FastAPI WebSocket + YOLO)

## 📦 설치

```bash
pip install fastapi uvicorn ultralytics opencv-python numpy
```

---

## 📄 backend/main.py

```python
from fastapi import FastAPI, WebSocket
from ultralytics import YOLO
import cv2, base64, json, time
import numpy as np

app = FastAPI()
model = YOLO("yolov8n.pt")

alarm_config = {"class": "person", "threshold": 1}

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    print("Client Connected")

    while True:
        data = await ws.receive_bytes()

        start = time.time()

        frame = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)

        results = model(frame)[0]
        detections = []

        count_alarm_class = 0

        for box in results.boxes:
            cls = model.names[int(box.cls)]
            conf = float(box.conf)
            x1, y1, x2, y2 = map(int, box.xyxy[0])

            if cls == alarm_config["class"]:
                count_alarm_class += 1

            detections.append({
                "class": cls,
                "confidence": round(conf,2),
                "box": [x1,y1,x2,y2]
            })

        fps = round(1/(time.time()-start),2)

        alarm = count_alarm_class >= alarm_config["threshold"]

        annotated = results.plot()
        _, buffer = cv2.imencode(".jpg", annotated)
        jpg_base64 = base64.b64encode(buffer).decode("utf-8")

        response = {
            "fps": fps,
            "alarm": alarm,
            "detections": detections,
            "image": jpg_base64
        }

        await ws.send_text(json.dumps(response))
```

---

# ✅ 2️⃣ Sender (Camera → WebSocket)

## 📄 sender.py

```python
import cv2
import websocket
import time

ws = websocket.WebSocket()
ws.connect("ws://localhost:8000/ws")

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    _, buffer = cv2.imencode(".jpg", frame)
    ws.send(buffer.tobytes())

    cv2.imshow("Sender", frame)
    if cv2.waitKey(1) == 27:
        break

cap.release()
ws.close()
cv2.destroyAllWindows()
```

---

# ✅ 3️⃣ Frontend (Svelte WebSocket UI)

## 📦 설치

```bash
npm install chart.js
```

---

## 📄 src/App.svelte

```svelte
<script>
  import { onMount } from "svelte";

  let socket;
  let imageSrc = "";
  let fps = 0;
  let alarm = false;
  let detections = [];

  onMount(() => {
    socket = new WebSocket("ws://localhost:8000/ws");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      imageSrc = "data:image/jpeg;base64," + data.image;
      fps = data.fps;
      alarm = data.alarm;
      detections = data.detections;
    };
  });
</script>

<h2>🎥 WebSocket 실시간 객체 검출</h2>

<img src={imageSrc} width="640"/>

<h3>FPS: {fps}</h3>

{#if alarm}
<h2 style="color:red;">🚨 ALARM DETECTED</h2>
{/if}

<h3>📋 Detection Table</h3>
<table border="1">
<tr>
<th>Class</th><th>Confidence</th><th>Box</th>
</tr>
{#each detections as d}
<tr>
<td>{d.class}</td>
<td>{d.confidence}</td>
<td>{d.box.join(",")}</td>
</tr>
{/each}
</table>

<style>
img {
  border:2px solid #444;
  border-radius:8px;
}
table {
  margin-top:10px;
  border-collapse:collapse;
}
td,th {
  padding:6px;
}
</style>
```

---

# ✅ 실행 순서

### ① Backend 실행

```bash
uvicorn main:app --reload
```

### ② Sender 실행

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

# 🎯 데이터 전송 포맷(JSON)

```json
{
  "fps": 23.5,
  "alarm": true,
  "detections": [
    {"class":"person","confidence":0.91,"box":[100,200,300,400]}
  ],
  "image": "/9j/4AAQSkZJRgABAQAAAQ..."
}
```

---

# 🚀 확장 가능

| 기능      | 기술             |
| ------- | -------------- |
| 다중 카메라  | WebSocket room |
| 알람 저장   | MongoDB        |
| 통계 차트   | Chart.js       |
| 음성 알람   | Web Audio API  |
| 모바일     | PWA            |
| 배포      | Docker         |
| 실시간성 개선 | WebRTC         |

---

# 🔥 핵심 장점

✔ MJPEG보다 빠름
✔ JSON + 이미지 동시 전달
✔ 실시간 UI 반응
✔ 알람 / 통계 연동 가능
✔ 산업용 AIoT 구조

---

원하시면 다음 단계도 바로 만들어 드릴 수 있습니다:

**1️⃣ MongoDB 저장 + 통계 Chart.js 완전 통합(WebSocket 버전)**
**2️⃣ 알람 설정 UI + 서버 동적 적용(WebSocket)**
**3️⃣ Docker Compose 전체 시스템 배포**
**4️⃣ WebRTC 버전 (초저지연)**

원하시면 번호를 선택해주세요:
👉 **1 / 2 / 3 / 4 / 전부**
