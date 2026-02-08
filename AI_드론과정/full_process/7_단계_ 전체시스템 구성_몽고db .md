# WebSocket 기반 실시간 영상 + 객체검출 + MongoDB 저장 + Chart.js 통계 시각화
>  **WebSocket 기반 실시간 영상 + 객체검출 + MongoDB 저장 + Chart.js 통계 시각화**가 모두 통합된 완성 구조

구현 기능:
✅ WebSocket 실시간 영상 + JSON 전송
✅ YOLO 객체 검출
✅ MongoDB 자동 저장
✅ 객체 통계 집계 API
✅ Chart.js 실시간 통계 차트
✅ Detection Table UI
✅ FPS 표시

---

# 🏗 전체 아키텍처

```
Camera(Sender)
   ↓ WebSocket(binary)
FastAPI (YOLO + MongoDB)
   ├ detections 저장
   ├ 통계 집계 API
   ↓ WebSocket(JSON + base64 image)
Svelte UI
   ├ 영상 표시
   ├ 결과 테이블
   ├ 통계 Chart.js
```

---

# 📦 설치 라이브러리

## Backend

```bash
pip install fastapi uvicorn ultralytics opencv-python pymongo numpy
```

## Frontend

```bash
npm install chart.js
```

---

# 📁 프로젝트 구조

```
project/
 ├ backend/main.py
 ├ sender.py
 └ frontend/src/App.svelte
```

---

# ✅ 1️⃣ Backend (FastAPI + WebSocket + MongoDB + Stats)

## backend/main.py

```python
from fastapi import FastAPI, WebSocket
from ultralytics import YOLO
from pymongo import MongoClient
import cv2, base64, json, time
import numpy as np
from datetime import datetime

app = FastAPI()
model = YOLO("yolov8n.pt")

# MongoDB
client = MongoClient("mongodb://localhost:27017")
db = client["vision_db"]
collection = db["detections"]

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    print("WebSocket Connected")

    while True:
        data = await ws.receive_bytes()

        start = time.time()
        frame = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)

        results = model(frame)[0]
        detections = []

        for box in results.boxes:
            cls = model.names[int(box.cls)]
            conf = float(box.conf)
            x1, y1, x2, y2 = map(int, box.xyxy[0])

            det = {
                "class": cls,
                "confidence": round(conf,2),
                "box": [x1,y1,x2,y2],
                "time": datetime.now()
            }
            detections.append(det)

        fps = round(1/(time.time()-start),2)

        # MongoDB 저장
        if detections:
            collection.insert_many(detections)

        annotated = results.plot()
        _, buffer = cv2.imencode(".jpg", annotated)
        img_b64 = base64.b64encode(buffer).decode("utf-8")

        response = {
            "fps": fps,
            "detections": detections,
            "image": img_b64
        }

        await ws.send_text(json.dumps(response))


@app.get("/stats")
def get_stats():
    pipeline = [
        {
            "$group": {
                "_id": "$class",
                "count": {"$sum": 1}
            }
        }
    ]
    data = list(collection.aggregate(pipeline))
    return data
```

---

# ✅ 2️⃣ Sender (Camera → WebSocket)

## sender.py

```python
import cv2
import websocket

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

# ✅ 3️⃣ Frontend (Svelte + Chart.js 통합)

## src/App.svelte

```svelte
<script>
  import { onMount } from "svelte";
  import Chart from "chart.js/auto";

  let socket;
  let imageSrc = "";
  let fps = 0;
  let detections = [];

  let chart;

  async function loadStats() {
    const res = await fetch("http://localhost:8000/stats");
    const data = await res.json();

    const labels = data.map(d => d._id);
    const values = data.map(d => d.count);

    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update();
  }

  onMount(() => {
    socket = new WebSocket("ws://localhost:8000/ws");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      imageSrc = "data:image/jpeg;base64," + data.image;
      fps = data.fps;
      detections = data.detections;
    };

    const ctx = document.getElementById("chart");
    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [{
          label: "Detected Objects Count",
          data: []
        }]
      }
    });

    setInterval(loadStats, 5000);
  });
</script>

<h2>🎥 WebSocket 실시간 객체 검출</h2>

<img src={imageSrc} width="640" />

<h3>FPS: {fps}</h3>

<h3>📋 Detection Table</h3>
<table border="1">
<tr><th>Class</th><th>Confidence</th><th>Box</th></tr>
{#each detections as d}
<tr>
  <td>{d.class}</td>
  <td>{d.confidence}</td>
  <td>{d.box.join(",")}</td>
</tr>
{/each}
</table>

<h3>📊 누적 객체 통계</h3>
<canvas id="chart" width="400" height="200"></canvas>

<style>
img { border:2px solid #333; border-radius:8px; }
table { border-collapse:collapse; margin-top:10px; }
td,th { padding:6px; }
</style>
```

---

# ✅ MongoDB 저장 데이터 예시

```json
{
  "class": "person",
  "confidence": 0.93,
  "box": [120,200,340,410],
  "time": "2026-02-08T13:22:00"
}
```

---

# ▶ 실행 순서

### ① MongoDB 실행

```bash
mongod
```

### ② Backend

```bash
uvicorn main:app --reload
```

### ③ Sender

```bash
python sender.py
```

### ④ Frontend

```bash
npm run dev
```

접속:

```
http://localhost:5173
```

---

# 🎯 구현 완료 기능 요약

| 기능              | 구현 |
| --------------- | -- |
| WebSocket 영상 전송 | ✅  |
| YOLO 객체 검출      | ✅  |
| JSON 결과 전송      | ✅  |
| MongoDB 저장      | ✅  |
| 통계 API          | ✅  |
| Chart.js 시각화    | ✅  |
| FPS 표시          | ✅  |
| Detection Table | ✅  |

---

# 🚀 확장 아이디어

* 시간별 통계 API (`$hour`, `$day`)
* 알람 조건 UI + WebSocket push
* 다중 카메라 room 관리
* Docker Compose (FastAPI + MongoDB + Svelte)
* WebRTC 저지연 스트리밍

---

원하시면 다음 단계로 이어서 만들어드릴 수 있습니다:

**1️⃣ 시간별 누적 통계 차트 + 필터 UI**
**2️⃣ 알람 조건 설정 UI + 서버 동적 반영(WebSocket)**
**3️⃣ Docker Compose 전체 배포 버전**
**4️⃣ WebRTC 초저지연 버전**

원하시면 번호로 선택해주세요:
👉 **1 / 2 / 3 / 4 / 전부**
