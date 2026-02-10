좋습니다.
**“API로부터 데이터를 받아 JS Chart를 그리는 과정”을 난이도별 5단계로 구성**하여 예제 코드를 제공합니다.
차트 라이브러리는 가장 많이 쓰이는 **Chart.js** 기준으로 하겠습니다.

구성 흐름:

> Step1: 정적 데이터 차트
> Step2: fetch로 API 데이터 수신
> Step3: 비동기 처리 + 에러 처리
> Step4: 주기적 갱신 (실시간)
> Step5: 백엔드 API 연동(FastAPI) + 프론트 차트

---

# ✅ Step 1. 정적 데이터로 차트 그리기 (기본)

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
<canvas id="myChart"></canvas>

<script>
const ctx = document.getElementById('myChart');

new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Mon','Tue','Wed','Thu','Fri'],
    datasets: [{
      label: 'Sales',
      data: [10,20,15,30,25],
      borderWidth: 2
    }]
  }
});
</script>
</body>
</html>
```

---

# ✅ Step 2. API에서 데이터 받아 차트 그리기 (fetch)

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
<canvas id="myChart"></canvas>

<script>
async function loadData() {
  const res = await fetch("http://localhost:8000/data");
  const json = await res.json();

  const labels = json.map(item => item.time);
  const values = json.map(item => item.value);

  new Chart(document.getElementById('myChart'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'API Data',
        data: values
      }]
    }
  });
}

loadData();
</script>
</body>
</html>
```

API 응답 예:

```json
[
  {"time":"10:00","value":20},
  {"time":"11:00","value":35},
  {"time":"12:00","value":40}
]
```

---

# ✅ Step 3. 에러 처리 + 로딩 처리

```html
<canvas id="myChart"></canvas>
<p id="status">Loading...</p>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
async function loadData() {
  try {
    const res = await fetch("http://localhost:8000/data");
    if(!res.ok) throw new Error("API Error");

    const json = await res.json();
    document.getElementById("status").innerText = "Loaded";

    const labels = json.map(d => d.time);
    const values = json.map(d => d.value);

    new Chart(myChart, {
      type: 'line',
      data: {
        labels,
        datasets: [{ label: "Value", data: values }]
      }
    });

  } catch(err) {
    document.getElementById("status").innerText = "Failed to load data";
    console.error(err);
  }
}

loadData();
</script>
```

---

# ✅ Step 4. 실시간 주기적 업데이트 (setInterval)

```html
<canvas id="myChart"></canvas>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
let chart;

async function fetchData() {
  const res = await fetch("http://localhost:8000/data");
  return await res.json();
}

async function updateChart() {
  const data = await fetchData();

  chart.data.labels = data.map(d => d.time);
  chart.data.datasets[0].data = data.map(d => d.value);
  chart.update();
}

async function initChart() {
  const data = await fetchData();

  chart = new Chart(myChart, {
    type: 'line',
    data: {
      labels: data.map(d => d.time),
      datasets: [{ label: "Realtime Data", data: data.map(d => d.value) }]
    }
  });

  setInterval(updateChart, 3000); // 3초마다 갱신
}

initChart();
</script>
```

---

# ✅ Step 5. FastAPI + Chart.js 통합 예제 (완전형)

## 🔹 FastAPI 서버

```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random, datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/data")
def get_data():
    now = datetime.datetime.now().strftime("%H:%M:%S")
    return [
        {"time": now, "value": random.randint(10,100)}
        for _ in range(5)
    ]
```

실행:

```bash
uvicorn main:app --reload
```

---

## 🔹 Frontend (chart.html)

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
<h2>API Chart</h2>
<canvas id="myChart"></canvas>

<script>
let chart;

async function fetchData() {
  const res = await fetch("http://localhost:8000/data");
  return await res.json();
}

async function init() {
  const data = await fetchData();

  chart = new Chart(myChart, {
    type: 'line',
    data: {
      labels: data.map(d => d.time),
      datasets: [{
        label: "Server Data",
        data: data.map(d => d.value),
        borderWidth: 2
      }]
    }
  });

  setInterval(async () => {
    const newData = await fetchData();
    chart.data.labels = newData.map(d => d.time);
    chart.data.datasets[0].data = newData.map(d => d.value);
    chart.update();
  }, 2000);
}

init();
</script>
</body>
</html>
```

---

# 🎯 정리 (5단계 개념)

| 단계  | 핵심 기능          |
| --- | -------------- |
| 1단계 | 정적 데이터 차트      |
| 2단계 | API fetch 연동   |
| 3단계 | 예외 처리          |
| 4단계 | 실시간 업데이트       |
| 5단계 | FastAPI 백엔드 연동 |

---

원하시면 다음 버전도 만들어드릴 수 있습니다:

✅ Svelte + Chart.js 5단계 버전
✅ WebSocket 실시간 차트 5단계
✅ MongoDB 통계 차트 버전
✅ FastAPI + Svelte 통합 프로젝트 버전

원하시는 다음 단계는 어떤 버전인가요?
**1) Svelte 버전 / 2) WebSocket 실시간 / 3) 통합 프로젝트 / 4) 모두 제공** 중에서 선택해 주세요.
