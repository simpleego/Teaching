좋습니다. **1단계 목표(브라우저에서 실시간 영상 보기)**는 그대로 두고, **프론트엔드를 Svelte로 분리**해서 구성하겠습니다.

아래는 **Step1 완성형( FastAPI = 백엔드 / Svelte = 프론트 )** 입니다.
(영상 전송은 가장 단순하고 호환성 좋은 **MJPEG(/video)** 방식으로 유지)

---

## 1단계 구성(FASTAPI + Svelte)

### 구조

```
step1_stream_svelte/
  backend/
    main.py
    requirements.txt
  frontend/
    package.json
    vite.config.js
    src/
      main.js
      App.svelte
    index.html
```

---

# Backend (FastAPI)

## backend/requirements.txt

```txt
fastapi==0.115.0
uvicorn[standard]==0.30.6
opencv-python==4.10.0.84
numpy==2.0.1
```

## backend/main.py

```python
import os
import time
import threading
from typing import Optional, Generator

import cv2
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

VIDEO_SOURCE = os.getenv("VIDEO_SOURCE", "0")   # "0" or "rtsp://..."
TARGET_FPS = float(os.getenv("TARGET_FPS", "20"))
JPEG_QUALITY = int(os.getenv("JPEG_QUALITY", "80"))

app = FastAPI(title="Step1 Backend - MJPEG Stream")

# Svelte dev server(5173)에서 접근할 수 있도록 CORS 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FrameGrabber:
    def __init__(self, source: str):
        self.source_raw = source
        self.source = int(source) if source.isdigit() else source

        self.cap: Optional[cv2.VideoCapture] = None
        self.lock = threading.Lock()
        self.frame = None
        self.running = False
        self.last_read_ts = 0.0

        self._open_capture()

    def _open_capture(self):
        if self.cap is not None:
            try:
                self.cap.release()
            except Exception:
                pass

        self.cap = cv2.VideoCapture(self.source)
        try:
            self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        except Exception:
            pass

    def start(self):
        if self.running:
            return
        self.running = True
        threading.Thread(target=self._loop, daemon=True).start()

    def stop(self):
        self.running = False
        if self.cap is not None:
            self.cap.release()

    def _loop(self):
        frame_interval = 1.0 / max(TARGET_FPS, 1.0)
        next_ts = time.time()

        while self.running:
            if self.cap is None or not self.cap.isOpened():
                self._open_capture()
                time.sleep(0.5)
                continue

            ok, frame = self.cap.read()
            now = time.time()

            if not ok or frame is None:
                time.sleep(0.2)
                continue

            self.last_read_ts = now
            with self.lock:
                self.frame = frame

            next_ts += frame_interval
            sleep_for = next_ts - time.time()
            if sleep_for > 0:
                time.sleep(sleep_for)
            else:
                next_ts = time.time()

    def get_jpeg(self) -> Optional[bytes]:
        with self.lock:
            frame = None if self.frame is None else self.frame.copy()
            last_ts = self.last_read_ts

        if frame is None:
            return None

        age_ms = int((time.time() - last_ts) * 1000)
        cv2.putText(
            frame,
            f"source={self.source_raw} age={age_ms}ms",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 255, 0),
            2,
            cv2.LINE_AA,
        )

        ok, jpg = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), JPEG_QUALITY])
        if not ok:
            return None
        return jpg.tobytes()

grabber = FrameGrabber(VIDEO_SOURCE)

@app.on_event("startup")
def on_startup():
    grabber.start()

@app.on_event("shutdown")
def on_shutdown():
    grabber.stop()

def mjpeg_generator() -> Generator[bytes, None, None]:
    boundary = b"--frame"
    while True:
        jpg = grabber.get_jpeg()
        if jpg is None:
            time.sleep(0.05)
            continue

        yield boundary + b"\r\n"
        yield b"Content-Type: image/jpeg\r\n"
        yield f"Content-Length: {len(jpg)}\r\n\r\n".encode("utf-8")
        yield jpg + b"\r\n"

@app.get("/video")
def video_feed():
    return StreamingResponse(
        mjpeg_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )

@app.get("/health")
def health():
    return {"ok": True, "source": VIDEO_SOURCE, "target_fps": TARGET_FPS}
```

### 백엔드 실행

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

RTSP로 바꿀 때(예: PowerShell):

```bash
$env:VIDEO_SOURCE="rtsp://id:pw@192.168.0.10:554/stream1"
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

# Frontend (Svelte + Vite)

## frontend/package.json

```json
{
  "name": "step1-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^3.0.0",
    "svelte": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

## frontend/vite.config.js

```js
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 5173
  }
});
```

## frontend/index.html

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Step1 - Live Stream</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

## frontend/src/main.js

```js
import App from "./App.svelte";

new App({
  target: document.getElementById("app"),
});
```

## frontend/src/App.svelte

```svelte
<script>
  const API_BASE = "http://localhost:8000";
  const videoUrl = `${API_BASE}/video`;
  const healthUrl = `${API_BASE}/health`;

  let health = null;
  let err = null;

  async function loadHealth() {
    err = null;
    try {
      const r = await fetch(healthUrl);
      health = await r.json();
    } catch (e) {
      err = String(e);
    }
  }

  loadHealth();
</script>

<main class="wrap">
  <header class="header">
    <h1>Step1: 실시간 영상 보기 (FastAPI + Svelte)</h1>
    <div class="meta">
      <button on:click={loadHealth}>상태 새로고침</button>
      {#if err}
        <span class="bad">백엔드 연결 실패: {err}</span>
      {:else if health}
        <span class="good">OK / source={health.source} / target_fps={health.target_fps}</span>
      {:else}
        <span>loading...</span>
      {/if}
    </div>
  </header>

  <section class="panel">
    <div class="hint">
      <b>MJPEG 스트림</b>은 단순/호환성이 좋아 1단계에 적합합니다.
      (다음 단계에서 YOLO 결과를 WebSocket(JSON)으로 분리 가능)
    </div>

    <!-- 핵심: MJPEG는 img 태그로 바로 표시 가능 -->
    <img class="stream" src={videoUrl} alt="Live Stream" />
  </section>
</main>

<style>
  .wrap { font-family: Arial, sans-serif; padding: 18px; max-width: 1100px; margin: 0 auto; }
  .header { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
  .meta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  button { padding: 8px 12px; border-radius: 10px; border: 1px solid #ddd; background: #fff; cursor: pointer; }
  button:hover { background: #f7f7f7; }
  .good { color: #0a7a2f; }
  .bad { color: #b00020; }
  .panel { border: 1px solid #e5e5e5; border-radius: 14px; padding: 12px; }
  .hint { margin-bottom: 10px; color: #333; }
  .stream { width: 100%; border-radius: 12px; border: 1px solid #ddd; display: block; }
</style>
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

## (중요) 왜 1단계에서 MJPEG를 쓰나?

* **구현이 단순**하고, 브라우저 호환성이 높고, 교육용으로 흐름 파악이 쉽습니다.
* 단점은 효율이 떨어질 수 있어, **4단계**에서 “영상(스트림) + 탐지결과(JSON)” 분리하고 필요하면 WebRTC로 확장합니다.

---

## 다음 단계 안내(당장 이어서 진행 가능)

* **2단계**: YOLO 설치/모델 로딩/단일 프레임 추론 + 결과 파싱(박스/클래스/신뢰도)
* **3단계**: 지금 MJPEG 파이프라인에 YOLO를 붙여서 **박스 오버레이된 영상**을 `/video_yolo`로 제공
* **4단계**: 영상은 그대로 `/video`, 탐지 결과는 **WebSocket(`/ws/detections`)**로 보내고 Svelte에서 Canvas 오버레이

원하시면 제가 **2단계 내용 + 코드**를 바로 이어서 작성하겠습니다(ultralytics 기반).
