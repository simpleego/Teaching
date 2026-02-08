# FPS 박스 on/off, 검출결과 테이블  표시

✅ **추가 기능**

1. **FPS 표시**
2. **박스 ON / OFF 토글 버튼**
3. **검출 결과 테이블(JSON 목록) 표시**

---

# ✅ 전체 기능 구성

FastAPI (변경 거의 없음)
→ JSON 전송:

```json
{
  "image": "...base64...",
  "detections": [
    {"label":"person","confidence":0.91,"x1":100,"y1":50,"x2":200,"y2":300}
  ]
}
```

Svelte 프론트엔드:

* 영상 표시
* 박스 그리기
* FPS 계산
* 박스 표시 ON/OFF
* 검출 결과 테이블 출력

---

# ✅ 1️⃣ FastAPI 서버 (이전 코드 그대로 사용 가능)

📄 backend/main.py (변경 없음)

```python
from fastapi import FastAPI, WebSocket
import cv2, json, base64
import numpy as np
from ultralytics import YOLO

app = FastAPI()
model = YOLO("yolov8n.pt")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    while True:
        data = await websocket.receive_bytes()
        npimg = np.frombuffer(data, np.uint8)
        frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

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

        _, buffer = cv2.imencode('.jpg', frame)
        img_base64 = base64.b64encode(buffer).decode("utf-8")

        message = {
            "image": img_base64,
            "detections": detections
        }

        await websocket.send_text(json.dumps(message))
```

---

# ✅ 2️⃣ Svelte 프론트엔드 (FPS + 박스 토글 + 테이블 추가)

📄 frontend/src/App.svelte

```svelte
<script>
  let socket;
  let imageSrc = "";
  let detections = [];

  let showBoxes = true;   // 박스 ON/OFF
  let fps = 0;

  let lastTime = performance.now();

  socket = new WebSocket("ws://localhost:8000/ws");

  socket.onmessage = (event) => {
    const now = performance.now();
    fps = Math.round(1000 / (now - lastTime));
    lastTime = now;

    const data = JSON.parse(event.data);
    imageSrc = "data:image/jpeg;base64," + data.image;
    detections = data.detections;
  };
</script>

<main>
  <h2>📡 Object Detection Dashboard</h2>

  <!-- 컨트롤 패널 -->
  <div class="controls">
    <button on:click={() => showBoxes = !showBoxes}>
      {showBoxes ? "박스 OFF" : "박스 ON"}
    </button>
    <span>FPS: {fps}</span>
  </div>

  <!-- 영상 영역 -->
  <div class="video-container">
    <img src={imageSrc} width="640" height="480" />

    {#if showBoxes}
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
    {/if}
  </div>

  <!-- 검출 결과 테이블 -->
  <h3>📋 Detection Results</h3>
  <table>
    <thead>
      <tr>
        <th>No</th>
        <th>Label</th>
        <th>Confidence</th>
        <th>x1</th>
        <th>y1</th>
        <th>x2</th>
        <th>y2</th>
      </tr>
    </thead>
    <tbody>
      {#each detections as d, i}
        <tr>
          <td>{i+1}</td>
          <td>{d.label}</td>
          <td>{d.confidence}</td>
          <td>{d.x1}</td>
          <td>{d.y1}</td>
          <td>{d.x2}</td>
          <td>{d.y2}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</main>

<style>
main {
  text-align: center;
}

.controls {
  margin-bottom: 10px;
}

button {
  padding: 6px 12px;
  margin-right: 20px;
}

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
}

.box span {
  background: rgba(0,0,0,0.6);
  color: white;
  font-size: 12px;
  padding: 2px 4px;
}

table {
  margin: 20px auto;
  border-collapse: collapse;
  width: 80%;
}

th, td {
  border: 1px solid #aaa;
  padding: 6px;
}
th {
  background: #eee;
}
</style>
```

---

# ✅ 추가된 기능 요약

## ✔ FPS 표시

```js
fps = Math.round(1000 / (now - lastTime));
```

## ✔ 박스 ON / OFF 버튼

```svelte
<button on:click={() => showBoxes = !showBoxes}>
```

## ✔ 검출 결과 테이블(JSON)

* label
* confidence
* 좌표(x1,y1,x2,y2)

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

4️⃣ 접속

```
http://localhost:5173
```

---

# 🎯 최종 화면 구성

* 상단:
  ✅ FPS 표시
  ✅ 박스 ON/OFF 버튼

* 중앙:
  ✅ 실시간 영상
  ✅ 객체 박스 표시

* 하단:
  ✅ Detection Results 테이블(JSON 목록)

---

# 🚀 다음 단계 확장 가능

다음으로 구현하면 좋은 기능:

✅ 알람(특정 객체 감지 시 경고)
✅ DB 저장 (시간, 객체 기록)
✅ 차트(객체 통계)
✅ 다중 카메라 지원
✅ Docker 배포

---

원하시면 다음 단계로 이어갈 수 있습니다:

**3️⃣ 단계 추천**

1. 📊 객체 통계 차트(Chart.js + Svelte)
2. 🛑 특정 객체 감지 시 알람 기능
3. 🐳 Docker 배포 구조
4. 📡 RTSP 카메라 연동
5. ✅ 전부 구현

원하시면 다음처럼 말씀해주세요:
👉 **"3단계: 1번(차트 기능) 구현해줘"**
