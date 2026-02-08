# 4 단계 MongoDB 저장
> **MongoDB에 실시간 데이터를 저장하고 → 통계 집계 → Chart.js로 시각화**하는 완전한 구조

구성:
✅ FastAPI + MongoDB(Motor)
✅ WebSocket 실시간 데이터 수신
✅ MongoDB 저장
✅ REST API 통계 조회
✅ Svelte + Chart.js 시각화
✅ 시간별 누적 통계 차트

---

# 🏗 프로젝트 구조

```
mongo-chart-project/
├ backend/
│   ├ main.py
│   └ database.py
└ frontend/
    └ src/App.svelte
```

---

# 📦 Backend 설치

```bash
pip install fastapi uvicorn motor pymongo
```

MongoDB 실행:

```bash
docker run -d -p 27017:27017 --name mongo mongo
```

---

# 🧠 MongoDB 구조 (documents)

```json
{
  "time": "2026-02-08 14:30:12",
  "value": 50,
  "cpu": 70,
  "memory": 30
}
```

---

# 📁 backend/database.py

```python
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_URL)

db = client.chartdb
collection = db.stats
```

---

# 📁 backend/main.py

```python
from fastapi import FastAPI, WebSocket
from database import collection
import random, asyncio
from datetime import datetime

app = FastAPI()

# WebSocket: 실시간 데이터 생성 + MongoDB 저장
@app.websocket("/ws/data")
async def websocket_data(ws: WebSocket):
    await ws.accept()
    while True:
        data = {
            "time": datetime.now(),
            "value": random.randint(0, 100),
            "cpu": random.randint(10, 90),
            "memory": random.randint(20, 80)
        }

        await collection.insert_one(data)
        await ws.send_json({
            "time": data["time"].strftime("%H:%M:%S"),
            "value": data["value"],
            "cpu": data["cpu"],
            "memory": data["memory"]
        })

        await asyncio.sleep(1)


# REST API: 시간별 통계 조회
@app.get("/stats")
async def get_stats():
    pipeline = [
        {
            "$group": {
                "_id": {
                    "hour": {"$hour": "$time"},
                    "minute": {"$minute": "$time"}
                },
                "avg_value": {"$avg": "$value"},
                "avg_cpu": {"$avg": "$cpu"},
                "avg_memory": {"$avg": "$memory"}
            }
        },
        {"$sort": {"_id.hour": 1, "_id.minute": 1}}
    ]

    results = []
    async for doc in collection.aggregate(pipeline):
        label = f"{doc['_id']['hour']}:{doc['_id']['minute']:02d}"
        results.append({
            "time": label,
            "value": round(doc["avg_value"], 2),
            "cpu": round(doc["avg_cpu"], 2),
            "memory": round(doc["avg_memory"], 2)
        })

    return results
```

실행:

```bash
uvicorn main:app --reload
```

---

# 📦 Frontend 설치

```bash
npm install chart.js
```

---

# 📁 frontend/src/App.svelte

```svelte
<script>
  import { onMount } from "svelte";
  import Chart from "chart.js/auto";

  let chart;
  let socket;

  let labels = [];
  let valueData = [];
  let cpuData = [];
  let memData = [];

  onMount(async () => {
    const ctx = document.getElementById("chart");

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          { label: "Value", data: [], borderWidth: 2 },
          { label: "CPU", data: [], borderWidth: 2 },
          { label: "Memory", data: [], borderWidth: 2 }
        ]
      },
      options: {
        animation: false,
        responsive: true,
        scales: {
          y: { min: 0, max: 100 }
        }
      }
    });

    // WebSocket 실시간 수신
    socket = new WebSocket("ws://localhost:8000/ws/data");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      labels.push(data.time);
      valueData.push(data.value);
      cpuData.push(data.cpu);
      memData.push(data.memory);

      if (labels.length > 20) {
        labels.shift();
        valueData.shift();
        cpuData.shift();
        memData.shift();
      }

      chart.data.labels = labels;
      chart.data.datasets[0].data = valueData;
      chart.data.datasets[1].data = cpuData;
      chart.data.datasets[2].data = memData;

      chart.update();
    };
  });

  // MongoDB 통계 불러오기
  async function loadStats() {
    const res = await fetch("http://localhost:8000/stats");
    const stats = await res.json();

    labels = stats.map(s => s.time);
    valueData = stats.map(s => s.value);
    cpuData = stats.map(s => s.cpu);
    memData = stats.map(s => s.memory);

    chart.data.labels = labels;
    chart.data.datasets[0].data = valueData;
    chart.data.datasets[1].data = cpuData;
    chart.data.datasets[2].data = memData;

    chart.update();
  }
</script>

<h2>📊 MongoDB 연동 통계 Chart.js</h2>

<button on:click={loadStats}>📈 누적 통계 불러오기</button>

<canvas id="chart" width="600" height="300"></canvas>

<style>
button {
  margin-bottom: 10px;
  padding: 8px 12px;
}
</style>
```

---

# ▶ 실행 순서

### 1️⃣ MongoDB 실행

```bash
docker run -d -p 27017:27017 mongo
```

### 2️⃣ Backend 실행

```bash
uvicorn main:app --reload
```

### 3️⃣ Frontend 실행

```bash
npm run dev
```

접속:

```
http://localhost:5173
```

---

# 🎯 핵심 학습 포인트

| 기능      | 기술                   |
| ------- | -------------------- |
| 실시간 데이터 | WebSocket            |
| 저장소     | MongoDB              |
| 통계      | Aggregation Pipeline |
| 시각화     | Chart.js             |
| 프론트엔드   | Svelte               |
| API 분리  | REST + WS            |

---

# 🚀 확장 가능

* ✅ 객체별 통계(person, car, dog)
* ✅ threshold 알람
* ✅ 날짜별 필터
* ✅ Bar / Pie 차트 전환
* ✅ Docker Compose 배포
* ✅ WebRTC 영상 통합

---

원하시면 다음 단계 코드도 바로 만들어 드릴 수 있습니다:

**1️⃣ 알람 Threshold UI + MongoDB 저장**
**2️⃣ Docker Compose 전체 배포 버전**
**3️⃣ WebRTC 영상 + 통계 통합 대시보드**
**4️⃣ 객체 감지(JSON) 기반 통계 구조 버전**
**5️⃣ 위 모든 기능 통합 풀 프로젝트**

원하시면 번호로 선택해주세요:
👉 **1 / 2 / 3 / 4 / 5 / 전부 만들어줘**
