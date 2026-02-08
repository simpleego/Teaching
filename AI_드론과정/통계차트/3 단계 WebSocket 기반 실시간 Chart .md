# WebSocket 기반 실시간 Chart
> **WebSocket 기반 실시간 Chart.js 대시보드 (FastAPI + Svelte)** 완성 예제입니다.

기능:
✅ FastAPI WebSocket 실시간 데이터 송신
✅ Svelte WebSocket 수신
✅ Chart.js 실시간 Line Chart
✅ 다중 데이터 구조 예시(단일값 / 객체 / 누적)
✅ 자동 슬라이딩 윈도우(최근 N개 유지)

---

# 🏗 전체 구조

```
ws-chart-project/
 ├ backend/
 │   └ main.py
 └ frontend/
     └ src/App.svelte
```

---

# 📦 Backend (FastAPI WebSocket)

## 설치

```bash
pip install fastapi uvicorn
```

---

## backend/main.py

```python
from fastapi import FastAPI, WebSocket
import random, asyncio
from datetime import datetime

app = FastAPI()

@app.websocket("/ws/chart")
async def websocket_chart(ws: WebSocket):
    await ws.accept()
    print("Client connected")

    while True:
        data = {
            "time": datetime.now().strftime("%H:%M:%S"),
            "value": random.randint(0, 100),
            "cpu": random.randint(10, 90),
            "memory": random.randint(20, 80)
        }

        await ws.send_json(data)
        await asyncio.sleep(1)
```

실행:

```bash
uvicorn main:app --reload
```

---

# 📦 Frontend (Svelte + Chart.js + WebSocket)

## 설치

```bash
npm install chart.js
```

---

## frontend/src/App.svelte

```svelte
<script>
  import { onMount } from "svelte";
  import Chart from "chart.js/auto";

  let socket;
  let chart;

  let labels = [];
  let values = [];
  let cpuData = [];
  let memData = [];

  const MAX_POINTS = 15;

  onMount(() => {
    const ctx = document.getElementById("chart");

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Sensor Value",
            data: [],
            borderWidth: 2
          },
          {
            label: "CPU",
            data: [],
            borderWidth: 2
          },
          {
            label: "Memory",
            data: [],
            borderWidth: 2
          }
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

    socket = new WebSocket("ws://localhost:8000/ws/chart");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      labels.push(data.time);
      values.push(data.value);
      cpuData.push(data.cpu);
      memData.push(data.memory);

      if (labels.length > MAX_POINTS) {
        labels.shift();
        values.shift();
        cpuData.shift();
        memData.shift();
      }

      chart.data.labels = labels;
      chart.data.datasets[0].data = values;
      chart.data.datasets[1].data = cpuData;
      chart.data.datasets[2].data = memData;

      chart.update();
    };
  });
</script>

<h2>📊 WebSocket 실시간 Chart.js 대시보드</h2>

<canvas id="chart" width="600" height="300"></canvas>

<style>
canvas {
  max-width: 700px;
  margin-top: 20px;
}
</style>
```

---

# ▶ 실행 순서

### ① Backend 실행

```bash
cd backend
uvicorn main:app --reload
```

### ② Frontend 실행

```bash
cd frontend
npm run dev
```

접속:

```
http://localhost:5173
```

---

# 📊 전송 데이터 구조(JSON)

```json
{
  "time": "14:22:10",
  "value": 56,
  "cpu": 72,
  "memory": 43
}
```

---

# 🎯 학습 포인트

| 항목             | 학습 내용           |
| -------------- | --------------- |
| WebSocket      | 실시간 통신          |
| Chart.js       | 실시간 그래프         |
| 데이터 구조         | 단일값 + 다중 필드     |
| Sliding Window | 최근 데이터 유지       |
| UI 반응성         | animation:false |

---

# 🚀 확장 가능 기능

* MongoDB 저장 + 누적 통계
* 알람 Threshold 표시
* 버튼으로 데이터 타입 선택
* Radar / Bar 실시간 전환
* WebRTC 영상 + 차트 결합
* Docker Compose 배포

---

# 🧠 실무 응용 예

* IoT 센서 모니터링
* 서버 CPU/RAM 대시보드
* AI 객체 검출 통계
* 금융 실시간 가격 차트
* 공정 설비 상태 모니터링

---

원하시면 다음 단계도 바로 만들어드릴 수 있습니다:

**1️⃣ MongoDB 저장 + 누적 통계 Chart.js (WebSocket)**
**2️⃣ 알람 조건 설정 UI + 실시간 경고 표시**
**3️⃣ Docker Compose 배포 버전**
**4️⃣ 여러 차트 동기화 대시보드**

원하시면 번호로 선택해주세요:
👉 **1 / 2 / 3 / 4 / 전부 만들어주세요**
