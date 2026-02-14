아래는 **드론 RTSP(또는 IP 카메라) 스트림을 OpenCV로 수신 → FastAPI에서 중계(MJPEG 스트리밍)** 하는 “실무형” 예제입니다.
특징: **자동 재연결**, **최신 프레임만 유지(지연 최소화)**, **다중 클라이언트 접속 가능**.

---

## 1) 설치

```bash
pip install fastapi uvicorn opencv-python
```

> Linux에서 RTSP/HEVC 등 코덱 문제 있으면 `opencv-python-headless` + FFmpeg/GStreamer 환경을 별도로 맞춰야 할 수 있습니다.

---

## 2) FastAPI 중계 서버 (mjpeg_relay.py)

```python
import cv2
import time
import threading
from typing import Optional

from fastapi import FastAPI
from fastapi.responses import StreamingResponse, HTMLResponse, JSONResponse

# =========================
# Stream Relay Core
# =========================
class VideoRelay:
    """
    - RTSP/HTTP 등 VideoCapture로 수신
    - 백그라운드 스레드에서 계속 frame 갱신 (최신 프레임만 보관)
    - 끊기면 재연결
    """
    def __init__(self, src: str, reconnect_delay: float = 2.0):
        self.src = src
        self.reconnect_delay = reconnect_delay

        self._cap: Optional[cv2.VideoCapture] = None
        self._frame: Optional[bytes] = None  # JPEG bytes
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
        cap = cv2.VideoCapture(self.src)  # 필요시 cv2.CAP_FFMPEG 명시 가능
        # 지연 줄이기(백엔드에 따라 무시될 수 있음)
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

        if not cap.isOpened():
            return False
        self._cap = cap
        return True

    def _worker(self):
        while self._running:
            # 연결 확인/재연결
            if self._cap is None:
                ok = self._connect()
                if not ok:
                    self._fail_count += 1
                    time.sleep(self.reconnect_delay)
                    continue

            ret, frame = self._cap.read()
            if not ret or frame is None:
                # 끊김 -> 재연결
                self._fail_count += 1
                self._release()
                time.sleep(self.reconnect_delay)
                continue

            # 필요시 리사이즈/오버레이 등 가능
            # frame = cv2.resize(frame, (1280, 720))

            # JPEG 인코딩
            ok, buf = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
            if not ok:
                continue

            jpeg = buf.tobytes()
            with self._lock:
                self._frame = jpeg
            self._last_ok_ts = time.time()

            # CPU 과점유 방지 (소스 FPS에 맞춰 조절)
            time.sleep(0.001)


# =========================
# FastAPI App
# =========================
app = FastAPI()

# ✅ 여기 URL만 바꿔서 사용
# 예: "rtsp://user:pass@192.168.0.10:8554/stream"
STREAM_URL = "rtsp://192.168.0.10:8554/stream"

relay = VideoRelay(STREAM_URL)

@app.on_event("startup")
def on_startup():
    relay.start()

@app.on_event("shutdown")
def on_shutdown():
    relay.stop()

def mjpeg_generator():
    """
    MJPEG multipart/x-mixed-replace
    """
    boundary = "frame"
    while True:
        frame = relay.get_jpeg()
        if frame is None:
            # 아직 프레임이 없으면 잠깐 대기
            time.sleep(0.1)
            continue

        yield (
            b"--" + boundary.encode() + b"\r\n"
            b"Content-Type: image/jpeg\r\n"
            b"Content-Length: " + str(len(frame)).encode() + b"\r\n\r\n" +
            frame + b"\r\n"
        )
        # 브라우저/클라이언트 부하 조절 (예: 15fps 정도)
        time.sleep(1/15)

@app.get("/video")
def video():
    return StreamingResponse(
        mjpeg_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@app.get("/status")
def status():
    return JSONResponse(relay.status())

@app.get("/", response_class=HTMLResponse)
def index():
    # 브라우저에서 바로 보기
    return """
    <!doctype html>
    <html>
    <head><meta charset="utf-8"><title>Drone Relay</title></head>
    <body>
      <h2>Drone Relay MJPEG</h2>
      <p><a href="/status" target="_blank">/status</a></p>
      <img src="/video" style="max-width: 100%; border:1px solid #ccc;" />
    </body>
    </html>
    """
```

---

## 3) 실행

```bash
uvicorn mjpeg_relay:app --host 0.0.0.0 --port 8000
```

* 브라우저에서: `http://localhost:8000/`
* 영상 스트림: `http://localhost:8000/video`
* 상태 확인: `http://localhost:8000/status`

---

## 4) “중계” 관점에서 꼭 알아야 할 점

* 이 방식은 **FastAPI가 RTSP를 직접 “재송출”** 한다기보다,
  **RTSP를 받아서 “JPEG 프레임”으로 변환 후 HTTP(MJPEG)로 제공**하는 형태입니다.
* 장점: 구현 쉽고 대부분의 브라우저에서 바로 재생됨
* 단점: 대역폭 큼(압축 효율이 낮음), 코덱 유지(H.264 그대로) 중계가 아님

---

## (선택) H.264 그대로 중계하고 싶다면?

그 경우는 보통:

* **RTSP → (FFmpeg) → HLS(m3u8)**
* **RTSP → WebRTC(SFU/aiortc)**
* **RTSP → RTMP(SRS/nginx-rtmp)**
  같은 파이프라인이 더 적합합니다.

---

원하시면 다음 중 하나로 확장해서 드릴게요(바로 코드로):

1. **여러 드론(멀티 스트림) + /video/{id} 라우팅**
2. **OpenCV 처리(객체탐지/오버레이) 후 중계**
3. **HLS(m3u8)로 변환해서 모바일/웹 최적화 중계**
4. **WebSocket으로 JPEG 프레임 push(프론트 Svelte 연동용)**

원하시는 번호만 찍어주세요.
