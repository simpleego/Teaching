좋습니다.
이번 버전은 **YOLO 실제 객체 검출 모델(Ultralytics YOLOv8)** 을 FastAPI 서버에 연동하고,
검출 결과를 **WebSocket으로 실시간 전송 → Svelte + Chart.js UI에 시각화**하는 완전한 실전형 구조입니다.

> 📌 핵심

* OpenCV 카메라 입력
* YOLOv8 실시간 객체 검출
* WebSocket으로 JSON + 영상 프레임 전송
* MongoDB 저장
* 객체 통계 차트
* Threshold 알람
* 테이블 표시

---

# ✅ 기술 스택

| 영역       | 기술                   |
| -------- | -------------------- |
| 객체 검출    | YOLOv8 (Ultralytics) |
| Backend  | FastAPI + WebSocket  |
| DB       | MongoDB              |
| 영상 처리    | OpenCV               |
| Frontend | Svelte + Chart.js    |
| 배포       | Docker Compose       |

---

# 🏗 프로젝트 구조

```
yolo-project/
├ docker-compose.yml
├ backend/
│   ├ Dockerfile
│   ├ requirements.txt
│   ├ main.py
│   └ database.py
└ frontend/
    ├ Dockerfile
    └ src/App.svelte
```

---

# 🐳 docker-compose.yml

```yaml
version: "3.9"

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - mongo

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"

  mongo:
    image: mongo
    ports:
      - "27017:27017"
```

---

# 📦 backend/requirements.txt

```
fastapi
uvicorn
ultralytics
opencv-python
motor
numpy
```

---

# 📁 backend/database.py

```python
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient("mongodb://mongo:27017")
db = client.yolo
collection = db.detections
```

---

# 📁 backend/main.py (YOLO 연동 핵심)

```python
from fastapi import FastAPI, WebSocket
from ultralytics import YOLO
import cv2, asyncio, base64
from datetime import datetime
from database import collection

app = FastAPI()
model = YOLO("yolov8n.pt")
cap = cv2.VideoCapture(0)

thresholds = {"person": 3, "car": 2}

@app.websocket("/ws/yolo")
async def yolo_ws(ws: WebSocket):
    await ws.accept()

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        results = model(frame)[0]
        detections = []

        for box in results.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            label = model.names[cls_id]

            x1,y1,x2,y2 = map(int, box.xyxy[0])

            detections.append({
                "object": label,
                "confidence": round(conf,2),
                "box": [x1,y1,x2,y2]
            })

            cv2.rectangle(frame,(x1,y1),(x2,y2),(0,255,0),2)
            cv2.putText(frame,f"{label}:{conf:.2f}",(x1,y1-5),
                        cv2.FONT_HERSHEY_SIMPLEX,0.5,(0,255,0),2)

            await collection.insert_one({
                "time": datetime.now(),
                "object": label,
                "confidence": conf
            })

        _, buffer = cv2.imencode(".jpg", frame)
        frame_base64 = base64.b64encode(buffer).decode("utf-8")

        alarm=False
        for d in detections:
            count = await collection.count_documents({"object": d["object"]})
            if d["object"] in thresholds and count >= thresholds[d["object"]]:
                alarm=True

        await ws.send_json({
            "image": frame_base64,
            "detections": detections,
            "alarm": alarm,
            "time": datetime.now().strftime("%H:%M:%S")
        })

        await asyncio.sleep(0.05)


@app.get("/stats")
async def stats():
    pipeline = [
        {"$group":{"_id":"$object","count":{"$sum":1}}}
    ]
    result=[]
    async for doc in collection.aggregate(pipeline):
        result.append({"object":doc["_id"],"count":doc["count"]})
    return result


@app.post("/threshold/{obj}/{value}")
async def set_threshold(obj:str,value:int):
    thresholds[obj]=value
    return thresholds
```

---

# 📁 backend/Dockerfile

```dockerfile
FROM python:3.10
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn","main:app","--host","0.0.0.0","--port","8000"]
```

---

# 📁 frontend/src/App.svelte

```svelte
<script>
  import { onMount } from "svelte";
  import Chart from "chart.js/auto";

  let socket;
  let imageSrc="";
  let table=[];
  let alarmMsg="";

  let chart;
  let labels=[];
  let counts=[];

  let selectedObj="person";
  let threshold=3;

  onMount(()=>{
    const ctx=document.getElementById("chart");
    chart=new Chart(ctx,{
      type:"bar",
      data:{labels:[],datasets:[{label:"Count",data:[]}]}
    });

    socket=new WebSocket("ws://localhost:8000/ws/yolo");

    socket.onmessage=(e)=>{
      const data=JSON.parse(e.data);
      imageSrc="data:image/jpeg;base64,"+data.image;

      data.detections.forEach(d=>{
        table.unshift({...d,time:data.time});
      });
      if(table.length>10) table.pop();

      if(data.alarm){
        alarmMsg="🚨 Threshold exceeded!";
      }

      loadStats();
    }
  });

  async function loadStats(){
    const res=await fetch("http://localhost:8000/stats");
    const stats=await res.json();

    labels=stats.map(s=>s.object);
    counts=stats.map(s=>s.count);

    chart.data.labels=labels;
    chart.data.datasets[0].data=counts;
    chart.update();
  }

  async function setThreshold(){
    await fetch(`http://localhost:8000/threshold/${selectedObj}/${threshold}`,{method:"POST"});
    alert("Threshold set");
  }
</script>

<h2>🎯 YOLO 실시간 객체 검출</h2>

<img src={imageSrc} width="500"/>

<h3 style="color:red">{alarmMsg}</h3>

<div>
<select bind:value={selectedObj}>
<option>person</option>
<option>car</option>
</select>
<input type="number" bind:value={threshold}/>
<button on:click={setThreshold}>알람 설정</button>
</div>

<canvas id="chart" width="500" height="300"></canvas>

<h3>검출 결과</h3>
<table border="1">
<tr><th>Time</th><th>Object</th><th>Confidence</th></tr>
{#each table as row}
<tr>
<td>{row.time}</td>
<td>{row.object}</td>
<td>{row.confidence}</td>
</tr>
{/each}
</table>
```

---

# 📁 frontend/Dockerfile

```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm","run","dev","--","--host"]
```

---

# ▶ 실행 방법

```bash
docker-compose up --build
```

접속:

```
http://localhost:5173
```

---

# 🎯 구현된 기능 요약

✅ YOLOv8 실제 객체 검출
✅ OpenCV 카메라 입력
✅ WebSocket 실시간 영상 + JSON
✅ MongoDB 저장
✅ 객체 통계 차트
✅ Threshold 알람
✅ 테이블 UI
✅ Docker 배포

---

# 🚀 확장 가능

* WebRTC 영상 스트리밍
* GPU CUDA 사용
* YOLOv8m/l/x 모델 교체
* 다중 카메라
* 사용자 로그인
* 알람 소리 + SMS
* Grafana 연동
* Cloud 배포(AWS/GCP)

---

원하시면 다음 단계도 만들어 드릴 수 있습니다:

**1️⃣ WebRTC 초저지연 영상 스트리밍 버전**
**2️⃣ GPU(CUDA) 최적화 YOLO 서버 버전**
**3️⃣ 전체 프로젝트 GitHub 배포용 정리 버전**
**4️⃣ AI 서버 + Dashboard 서버 분리 아키텍처**
**5️⃣ PDF 설계 문서 + 다이어그램**

원하시면 번호로 선택해주세요:
👉 **1 / 2 / 3 / 4 / 5 / 전부**
