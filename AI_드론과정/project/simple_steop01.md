아래는 “**실시간 영상 전송 → 수신(웹) → YOLO 객체 처리**”를 **아주 단순하게** 학습시키는 5단계 로드맵입니다. 그리고 요청대로 **1단계(가장 간단한 내용)**를 바로 코드까지 제공합니다.

---

## 초간단 5단계 커리큘럼 (전송/수신/YOLO)

1. **실시간 영상 수신(웹에서 보기)**

   * OpenCV로 카메라 프레임 읽기
   * FastAPI로 MJPEG 스트리밍(`/video`)
   * 브라우저(Svelte)에서 `<img>`로 보기

2. **YOLO 단일 프레임 추론(버튼 클릭형)**

   * YOLO 모델 로딩
   * 현재 프레임 1장에 대해 추론 후 JSON(박스/클래스/신뢰도) 반환

3. **실시간 YOLO 오버레이 스트림**

   * `/video_yolo`로 박스가 그려진 MJPEG 제공
   * frame-skip, resize로 FPS 유지

4. **탐지 결과 JSON 분리(WebSocket)**

   * 영상은 MJPEG
   * 탐지 결과는 WebSocket으로 실시간 전송
   * 프론트에서 Canvas 오버레이

5. **관제형 미니 응용(이벤트/알림/저장)**

   * 특정 클래스(예: person) 탐지 시 이벤트 발생
   * 스냅샷 저장 + 이벤트 로그(파일/DB)
   * 간단 대시보드(카운트, 최근 이벤트)

---

# 1단계: “가장 간단하게” 실시간 영상 수신을 웹에서 보기

> 이 단계는 YOLO 없이도 반드시 먼저 깔아야 하는 기반입니다.
> **(카메라/스트림 캡처 → FastAPI MJPEG → Svelte 화면 표시)**

## 1단계 폴더 구조

```
step_simple/
  backend/
    main.py
    requirements.txt
  frontend/
    package.json
    vite.config.js
    index.html
    src/
      main.js
      App.svelte
```

---

## Backend (FastAPI) — 최소 코드

### backend/requirements.txt

```txt
fastapi==0.115.0
uvicorn[standard]==0.30.6
opencv-python==4.10.0.84
```

### backend/main.py (최소 구현)

* 웹캠 0번을 캡처해서 MJPEG로 내보냅니다.
* *가장 단순하게* “요청이 오면 프레임을 읽고 바로 전송” 형태입니다.

```python
import cv2
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

app = FastAPI(title="Step1 Simple - MJPEG Stream")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cap = cv2.VideoCapture(0)

def gen():
    boundary = b"--frame"
    while True:
        ok, frame = cap.read()
        if not ok:
            time.sleep(0.05)
            continue

        ok, jpg = cv2.imencode(".jpg", frame)
        if not ok:
            continue

        data = jpg.tobytes()
        yield boundary + b"\r\n"
        yield b"Content-Type: image/jpeg\r\n"
        yield f"Content-Length: {len(data)}\r\n\r\n".encode()
        yield data + b"\r\n"

@app.get("/video")
def video():
    return StreamingResponse(gen(), media_type="multipart/x-mixed-replace; boundary=frame")
```

### 백엔드 실행

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## Frontend (Svelte) — 최소 화면

### frontend/package.json

```json
{
  "name": "step1-simple-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite"
  },
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^3.0.0",
    "svelte": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

### frontend/vite.config.js

```js
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  server: { port: 5173 }
});
```

### frontend/index.html

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Step1 Simple</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

### frontend/src/main.js

```js
import App from "./App.svelte";

new App({
  target: document.getElementById("app"),
});
```

### frontend/src/App.svelte

```svelte
<script>
  const API = "http://localhost:8000";
</script>

<main style="font-family: Arial; padding: 16px; max-width: 1000px; margin: 0 auto;">
  <h2>Step1: 가장 단순한 실시간 영상 보기</h2>
  <p>FastAPI MJPEG: <code>/video</code></p>

  <!-- 핵심: MJPEG는 img로 바로 재생 -->
  <img
    src={`${API}/video`}
    alt="live"
    style="width:100%; border:1px solid #ddd; border-radius:12px;"
  />
</main>
```

### 프론트 실행

```bash
cd frontend
npm install
npm run dev
```

브라우저:

* `http://localhost:5173`

---

## 1단계 체크포인트(수강생 확인용)

* 백엔드 실행 후 `http://localhost:8000/video`를 직접 열어도 영상이 보여야 함
* Svelte 화면에서도 동일 영상이 나와야 함
* 이 단계가 성공하면 **2단계에서 YOLO 모델 로딩 + 단일 프레임 추론**만 추가하면 됨

---

원하시면 다음 답변에서 **2단계(버튼 클릭 → 현재 프레임 1장 YOLO 추론 → JSON 결과/오버레이 이미지)**를 **최소 코드로** 이어서 바로 제공하겠습니다.
