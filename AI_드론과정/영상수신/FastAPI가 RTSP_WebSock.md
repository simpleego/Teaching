아래는 **FastAPI가 RTSP(OpenCV)로 받은 최신 프레임을 JPEG로 인코딩해서 WebSocket으로 “바이너리 프레임” 푸시**하는 구현입니다.
특징: **최신 프레임만 유지(지연 최소화)**, **끊김 시 자동 재연결**, **다중 클라이언트 지원**, **FPS 제한**.

---

## 1) 설치

```bash
pip install fastapi uvicorn opencv-python
```

---

## 2) FastAPI WebSocket 중계 서버 (ws_relay.py)

```python
import asyncio
import time
import threading
from typing import Optional, Set

import cv2
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, JSONResponse


class VideoRelay:
    """
    RTSP/HTTP 등 VideoCapture로 수신 -> 최신 프레임(JPEG bytes)만 보관
    끊기면 재연결
    """
    def __init__(self, src: str, reconnect_delay: float = 2.0, jpeg_quality: int = 80):
        self.src = src
        self.reconnect_delay = reconnect_delay
        self.jpeg_quality = jpeg_quality

        self._cap: Optional[cv2.VideoCapture] = None
        self._frame: Optional[bytes] = None
        self._lock = threading.Lock()

        self._running = False
        self._thread: Optional[threading.Thread] = None

        self._last_ok_ts = 0.0
        self._fail_count = 0

    def start(self):
        if self._running:
            return
        self._running = True
        self._thread = threading.Thread(target=self._worker, daemon=True)
        self._thread.start()

    def stop(self):
        self._running = False
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=2)
        self._release()

    def status(self):
        with self._lock:
            has_frame = self._frame is not None
        return {
            "src": self.src,
            "running": self._running,
            "has_frame": has_frame,
            "last_ok_ts": self._last_ok_ts,
            "fail_count": self._fail_count,
        }

    def get_jpeg(self) -> Optional[bytes]:
        with self._lock:
            return self._frame

    def _release(self):
        if self._cap is not None:
            try:
                self._cap.release()
            except Exception:
                pass
        self._cap = None

    def _connect(self) -> bool:
        self._release()
        cap = cv2.VideoCapture(self.src)
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # 백엔드에 따라 무시될 수 있음
        if not cap.isOpened():
            return False
        self._cap = cap
        return True

    def _worker(self):
        while self._running:
            if self._cap is None:
                if not self._connect():
                    self._fail_count += 1
                    time.sleep(self.reconnect_delay)
                    continue

            ret, frame = self._cap.read()
            if not ret or frame is None:
                self._fail_count += 1
                self._release()
                time.sleep(self.reconnect_delay)
                continue

            ok, buf = cv2.imencode(
                ".jpg",
                frame,
                [int(cv2.IMWRITE_JPEG_QUALITY), int(self.jpeg_quality)]
            )
            if ok:
                jpeg = buf.tobytes()
                with self._lock:
                    self._frame = jpeg
                self._last_ok_ts = time.time()

            time.sleep(0.001)


class WSManager:
    def __init__(self):
        self.clients: Set[WebSocket] = set()
        self.lock = asyncio.Lock()

    async def connect(self, ws: WebSocket):
        await ws.accept()
        async with self.lock:
            self.clients.add(ws)

    async def disconnect(self, ws: WebSocket):
        async with self.lock:
            if ws in self.clients:
                self.clients.remove(ws)

    async def broadcast_binary(self, data: bytes):
        # 느린 클라이언트가 있으면 제거
        dead = []
        async with self.lock:
            for ws in self.clients:
                try:
                    await ws.send_bytes(data)
                except Exception:
                    dead.append(ws)
            for ws in dead:
                self.clients.remove(ws)

    async def count(self) -> int:
        async with self.lock:
            return len(self.clients)


app = FastAPI()

# ✅ 드론/카메라 RTSP 주소로 교체
STREAM_URL = "rtsp://192.168.0.10:8554/stream"

relay = VideoRelay(STREAM_URL, reconnect_delay=2.0, jpeg_quality=80)
ws_manager = WSManager()

# 방송 루프 설정
BROADCAST_FPS = 15
BROADCAST_INTERVAL = 1.0 / BROADCAST_FPS


@app.on_event("startup")
async def on_startup():
    relay.start()
    # 백그라운드 브로드캐스터 태스크 시작
    asyncio.create_task(broadcast_loop())


@app.on_event("shutdown")
def on_shutdown():
    relay.stop()


async def broadcast_loop():
    """
    최신 프레임을 일정 FPS로 모든 WS 클라이언트에게 바이너리로 푸시
    """
    last_sent = None
    while True:
        frame = relay.get_jpeg()

        # 프레임이 없거나, 이전과 동일하면(선택) 스킵할 수 있음
        if frame is not None:
            # 동일 프레임 반복 전송 방지(원하면 주석 해제)
            # if frame != last_sent:
            await ws_manager.broadcast_binary(frame)
            last_sent = frame

        await asyncio.sleep(BROADCAST_INTERVAL)


@app.websocket("/ws/video")
async def ws_video(ws: WebSocket):
    await ws_manager.connect(ws)
    try:
        # 클라이언트가 보내는 메시지는 없어도 됨(keep-alive 용)
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        await ws_manager.disconnect(ws)


@app.get("/status")
async def status():
    s = relay.status()
    s["ws_clients"] = await ws_manager.count()
    s["broadcast_fps"] = BROADCAST_FPS
    return JSONResponse(s)


@app.get("/", response_class=HTMLResponse)
def index():
    # 간단 테스트 페이지(브라우저)
    return """
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>WS Video Relay</title>
  <style>
    body { font-family: Arial, sans-serif; }
    img { max-width: 100%; border: 1px solid #ccc; }
  </style>
</head>
<body>
  <h2>WebSocket JPEG Relay</h2>
  <p><a href="/status" target="_blank">/status</a></p>
  <img id="view" />
  <script>
    const img = document.getElementById("view");
    const ws = new WebSocket(`ws://${location.host}/ws/video`);
    ws.binaryType = "arraybuffer";

    ws.onopen = () => console.log("WS connected");
    ws.onclose = () => console.log("WS closed");
    ws.onerror = (e) => console.log("WS error", e);

    // 서버가 JPEG bytes를 보내므로, Blob으로 만들어 img에 표시
    ws.onmessage = (evt) => {
      if (!(evt.data instanceof ArrayBuffer)) return;
      const blob = new Blob([evt.data], { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);
      img.src = url;
      // 메모리 누수 방지: 다음 tick에 이전 URL 해제
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    // 서버 루프가 receive_text() 기다리므로 keep-alive를 주기적으로 전송
    setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send("ping");
    }, 5000);
  </script>
</body>
</html>
"""
```

---

## 3) 실행

```bash
uvicorn ws_relay:app --host 0.0.0.0 --port 8000
```

* 테스트 페이지: `http://localhost:8000/`
* 상태: `http://localhost:8000/status`
* WS 엔드포인트: `ws://localhost:8000/ws/video`

---

## 4) Svelte 클라이언트 예제 (핵심 부분)

```svelte
<script>
  import { onMount, onDestroy } from "svelte";

  let imgSrc = "";
  let ws;

  function connect() {
    ws = new WebSocket(`ws://${location.host}/ws/video`);
    ws.binaryType = "arraybuffer";

    ws.onmessage = (event) => {
      const blob = new Blob([event.data], { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);
      imgSrc = url;
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    ws.onopen = () => console.log("ws open");
    ws.onclose = () => {
      console.log("ws close -> reconnect");
      setTimeout(connect, 1000);
    };
    ws.onerror = () => ws.close();

    // keep-alive
    const ping = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) ws.send("ping");
    }, 5000);

    onDestroy(() => clearInterval(ping));
  }

  onMount(connect);

  onDestroy(() => {
    if (ws && ws.readyState === WebSocket.OPEN) ws.close();
    if (imgSrc) URL.revokeObjectURL(imgSrc);
  });
</script>

<img {imgSrc} alt="Drone Stream" style="max-width:100%; border:1px solid #ccc;" />
```

---

## 운영 팁 (중요)

* **JPEG 푸시는 대역폭을 많이 씁니다.** (특히 다중 클라이언트)

  * `jpeg_quality`(예: 60~80), `BROADCAST_FPS`(예: 10~15), 프레임 리사이즈로 최적화하세요.
* 더 “진짜 스트리밍”처럼 하고 싶으면 **WebRTC(SFU)** 또는 **HLS**가 정석입니다.

---

원하면 바로 다음 확장도 같이 붙여드릴게요(실무에서 자주 필요):

* (A) **멀티 드론**: `/ws/video/{drone_id}` + 드론별 릴레이 인스턴스
* (B) **YOLO 객체탐지 오버레이 후 푸시**
* (C) **클라이언트별 FPS/해상도 요청(적응형 스트리밍 흉내)**

원하는 확장(A/B/C)만 말해줘요.
