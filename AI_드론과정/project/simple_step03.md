아래는 요청하신 **“관제용 3단계 표준버전”**입니다.

* **캡처 스레드**: 최신 프레임만 계속 갱신 (지연 누적 방지)
* **추론 스레드**: 최신 프레임을 가져와 YOLO 추론 후 “최신 오버레이 JPEG”만 저장
* **스트리밍(`/video`, `/video_yolo`)**: 저장된 최신 JPEG를 계속 내보냄
  → **클라이언트가 1명이든 10명이든 추론은 1번만 돌아서 안정적**

추가로:

* frame-skip (`INFER_EVERY_N_FRAMES`)
* 추론 FPS 상한 (`MAX_INFER_FPS`)
* resize (`IMGSZ`)
* 끊김 시 재연결 시도

---

# 3단계 표준버전 (FastAPI 단일 파일)

## backend/requirements.txt

```txt
fastapi==0.115.0
uvicorn[standard]==0.30.6
opencv-python==4.10.0.84
numpy==2.0.1
ultralytics==8.3.0
```

## backend/main.py (표준버전)

```python
import os
import time
import threading
from typing import Optional, Generator, Tuple

import cv2
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse

from ultralytics import YOLO

# ---------------------------
# Config (관제용 기본값)
# ---------------------------
VIDEO_SOURCE = os.getenv("VIDEO_SOURCE", "0")  # "0" or rtsp://...
TARGET_CAPTURE_FPS = float(os.getenv("TARGET_CAPTURE_FPS", "20"))
JPEG_QUALITY = int(os.getenv("JPEG_QUALITY", "80"))

YOLO_MODEL = os.getenv("YOLO_MODEL", "yolov8n.pt")
CONF_THRES = float(os.getenv("CONF_THRES", "0.25"))
IOU_THRES = float(os.getenv("IOU_THRES", "0.45"))
IMGSZ = int(os.getenv("IMGSZ", "640"))

INFER_EVERY_N_FRAMES = int(os.getenv("INFER_EVERY_N_FRAMES", "2"))  # 2~5 권장
MAX_INFER_FPS = float(os.getenv("MAX_INFER_FPS", "10"))            # 5~15 권장

# 스트리밍 송출 FPS (클라이언트마다 독립적이므로 너무 높일 필요 없음)
STREAM_FPS = float(os.getenv("STREAM_FPS", "15"))

app = FastAPI(title="Step3 Standard - Surveillance Pipeline")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Utility
# ---------------------------
def encode_jpeg(bgr: np.ndarray, quality: int = JPEG_QUALITY) -> bytes:
    ok, jpg = cv2.imencode(".jpg", bgr, [int(cv2.IMWRITE_JPEG_QUALITY), quality])
    if not ok:
        raise RuntimeError("JPEG encode failed")
    return jpg.tobytes()

# ---------------------------
# 1) Capture Thread (latest-frame only)
# ---------------------------
class CaptureWorker:
    def __init__(self, source: str):
        self.source_raw = source
        self.source = int(source) if source.isdigit() else source

        self.cap: Optional[cv2.VideoCapture] = None
        self.lock = threading.Lock()

        self.latest_frame: Optional[np.ndarray] = None
        self.frame_id: int = 0
        self.last_ts: float = 0.0

        self.running = False

    def _open(self):
        if self.cap is not None:
            try:
                self.cap.release()
            except Exception:
                pass

        self.cap = cv2.VideoCapture(self.source)
        # 네트워크 스트림 지연 감소(드라이버에 따라 무시될 수 있음)
        try:
            self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        except Exception:
            pass

    def start(self):
        if self.running:
            return
        self._open()
        self.running = True
        threading.Thread(target=self._loop, daemon=True).start()

    def stop(self):
        self.running = False
        if self.cap is not None:
            self.cap.release()

    def _loop(self):
        interval = 1.0 / max(TARGET_CAPTURE_FPS, 1.0)
        next_ts = time.time()

        while self.running:
            if self.cap is None or not self.cap.isOpened():
                self._open()
                time.sleep(0.5)
                continue

            ok, frame = self.cap.read()
            now = time.time()

            if not ok or frame is None:
                time.sleep(0.2)
                continue

            with self.lock:
                self.latest_frame = frame
                self.frame_id += 1
                self.last_ts = now

            next_ts += interval
            sleep_for = next_ts - time.time()
            if sleep_for > 0:
                time.sleep(sleep_for)
            else:
                next_ts = time.time()

    def get_latest(self) -> Tuple[Optional[np.ndarray], int, float]:
        with self.lock:
            if self.latest_frame is None:
                return None, 0, 0.0
            return self.latest_frame.copy(), self.frame_id, self.last_ts

capture = CaptureWorker(VIDEO_SOURCE)

# ---------------------------
# 2) YOLO Inference Thread (latest-frame only)
# ---------------------------
class InferWorker:
    def __init__(self):
        self.model: Optional[YOLO] = None
        self.running = False
        self.lock = threading.Lock()

        self.last_annotated_jpg: Optional[bytes] = None
        self.last_infer_ms: int = 0
        self.last_det_count: int = 0
        self.last_processed_frame_id: int = 0
        self.last_infer_ts: float = 0.0

        # perf metrics
        self._infer_fps = 0.0
        self._fps_counter = 0
        self._fps_last_ts = time.time()

    def load(self):
        self.model = YOLO(YOLO_MODEL)

    def start(self):
        if self.running:
            return
        if self.model is None:
            self.load()
        self.running = True
        threading.Thread(target=self._loop, daemon=True).start()

    def stop(self):
        self.running = False

    def _loop(self):
        min_interval = 1.0 / max(MAX_INFER_FPS, 1.0)
        next_ts = time.time()

        while self.running:
            frame, fid, cap_ts = capture.get_latest()
            if frame is None:
                time.sleep(0.05)
                continue

            # frame-skip: fid 기준 N프레임마다 1번 처리
            if INFER_EVERY_N_FRAMES > 1 and (fid % INFER_EVERY_N_FRAMES != 0):
                time.sleep(0.001)
                continue

            # 중복 처리 방지
            if fid == self.last_processed_frame_id:
                time.sleep(0.002)
                continue

            t0 = time.time()

            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.model.predict(
                source=rgb,
                conf=CONF_THRES,
                iou=IOU_THRES,
                imgsz=IMGSZ,
                verbose=False
            )
            r0 = results[0]

            det_count = 0 if r0.boxes is None else len(r0.boxes)

            # overlay (plot() -> RGB)
            plotted_rgb = r0.plot()
            plotted_bgr = cv2.cvtColor(plotted_rgb, cv2.COLOR_RGB2BGR)

            infer_ms = int((time.time() - t0) * 1000)
            age_ms = int((time.time() - cap_ts) * 1000)

            # 관제용 HUD
            hud1 = f"det={det_count} infer={infer_ms}ms age={age_ms}ms"
            hud2 = f"imgsz={IMGSZ} skipN={INFER_EVERY_N_FRAMES} maxInferFps={MAX_INFER_FPS} inferFps={self._infer_fps:.1f}"
            cv2.putText(plotted_bgr, hud1, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2, cv2.LINE_AA)
            cv2.putText(plotted_bgr, hud2, (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2, cv2.LINE_AA)

            jpg = encode_jpeg(plotted_bgr)

            with self.lock:
                self.last_annotated_jpg = jpg
                self.last_infer_ms = infer_ms
                self.last_det_count = det_count
                self.last_processed_frame_id = fid
                self.last_infer_ts = time.time()

            # infer fps 계산
            self._fps_counter += 1
            now = time.time()
            if now - self._fps_last_ts >= 1.0:
                self._infer_fps = self._fps_counter / (now - self._fps_last_ts)
                self._fps_counter = 0
                self._fps_last_ts = now

            # 추론 상한 FPS 유지
            next_ts += min_interval
            sleep_for = next_ts - time.time()
            if sleep_for > 0:
                time.sleep(sleep_for)
            else:
                next_ts = time.time()

    def get_latest_jpg(self) -> Optional[bytes]:
        with self.lock:
            return self.last_annotated_jpg

    def stats(self):
        with self.lock:
            return {
                "model": YOLO_MODEL,
                "conf": CONF_THRES,
                "iou": IOU_THRES,
                "imgsz": IMGSZ,
                "infer_every_n_frames": INFER_EVERY_N_FRAMES,
                "max_infer_fps": MAX_INFER_FPS,
                "det_count": self.last_det_count,
                "infer_ms": self.last_infer_ms,
                "processed_frame_id": self.last_processed_frame_id,
                "infer_ts": self.last_infer_ts,
            }

infer = InferWorker()

# ---------------------------
# 3) MJPEG Stream Generators
# ---------------------------
def mjpeg_stream_from_getter(get_jpg_func, fps: float) -> Generator[bytes, None, None]:
    boundary = b"--frame"
    interval = 1.0 / max(fps, 1.0)
    next_ts = time.time()

    while True:
        jpg = get_jpg_func()
        if jpg is None:
            time.sleep(0.05)
            continue

        yield boundary + b"\r\n"
        yield b"Content-Type: image/jpeg\r\n"
        yield f"Content-Length: {len(jpg)}\r\n\r\n".encode("utf-8")
        yield jpg + b"\r\n"

        next_ts += interval
        sleep_for = next_ts - time.time()
        if sleep_for > 0:
            time.sleep(sleep_for)
        else:
            next_ts = time.time()

def get_raw_jpg() -> Optional[bytes]:
    frame, fid, ts = capture.get_latest()
    if frame is None:
        return None
    age_ms = int((time.time() - ts) * 1000)
    cv2.putText(frame, f"RAW fid={fid} age={age_ms}ms", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2, cv2.LINE_AA)
    return encode_jpeg(frame)

def get_yolo_jpg() -> Optional[bytes]:
    return infer.get_latest_jpg()

# ---------------------------
# Lifecycle
# ---------------------------
@app.on_event("startup")
def startup():
    capture.start()
    infer.start()

@app.on_event("shutdown")
def shutdown():
    infer.stop()
    capture.stop()

# ---------------------------
# Endpoints
# ---------------------------
@app.get("/health")
def health():
    return {
        "ok": True,
        "source": VIDEO_SOURCE,
        "capture_fps_target": TARGET_CAPTURE_FPS,
        "stream_fps": STREAM_FPS
    }

@app.get("/yolo/stats")
def yolo_stats():
    return {"ok": True, **infer.stats()}

@app.get("/video")
def video_raw():
    return StreamingResponse(
        mjpeg_stream_from_getter(get_raw_jpg, STREAM_FPS),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )

@app.get("/video_yolo")
def video_yolo():
    return StreamingResponse(
        mjpeg_stream_from_getter(get_yolo_jpg, STREAM_FPS),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )
```

---

# 프론트(Svelte) — 다중 클라이언트 안전 스트림 보기(최소)

기존 1~2단계 프론트에서 아래처럼만 쓰면 됩니다.

## frontend/src/App.svelte

```svelte
<script>
  const API = "http://localhost:8000";
  let stats = null;

  async function loadStats() {
    const r = await fetch(`${API}/yolo/stats`);
    stats = await r.json();
  }
  loadStats();
  setInterval(loadStats, 1000);
</script>

<main style="font-family: Arial; padding: 16px; max-width: 1200px; margin: 0 auto;">
  <h2>Step3 표준버전: 스레드 분리 + 최신 프레임만 추론</h2>

  {#if stats?.ok}
    <div style="margin:10px 0; color:#0a7a2f;">
      det={stats.det_count} | infer={stats.infer_ms}ms | imgsz={stats.imgsz} |
      skipN={stats.infer_every_n_frames} | maxInferFps={stats.max_infer_fps} |
      fid={stats.processed_frame_id}
    </div>
  {/if}

  <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
    <section style="border:1px solid #ddd; border-radius:12px; padding:10px;">
      <h3>RAW (/video)</h3>
      <img src={`${API}/video`} alt="raw" style="width:100%; border-radius:10px; border:1px solid #eee;" />
    </section>

    <section style="border:1px solid #ddd; border-radius:12px; padding:10px;">
      <h3>YOLO (/video_yolo)</h3>
      <img src={`${API}/video_yolo`} alt="yolo" style="width:100%; border-radius:10px; border:1px solid #eee;" />
    </section>
  </div>
</main>
```

---

# 실행

## 백엔드

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 프론트

```bash
cd frontend
npm install
npm run dev
```

브라우저:

* `http://localhost:5173`

---

# 관제용 튜닝 가이드(필드에서 가장 많이 건드리는 3개)

1. **IMGSZ**: 640 → 480 → 320 (속도↑, 작은 객체 성능↓)
2. **INFER_EVERY_N_FRAMES**: 2~5 (지연↓/FPS↑, “프레임마다 탐지”는 포기)
3. **MAX_INFER_FPS**: 5~15 (CPU/GPU에 맞게 상한)

예: CPU 환경에서 더 부드럽게

```bash
# PowerShell
$env:IMGSZ="480"
$env:INFER_EVERY_N_FRAMES="3"
$env:MAX_INFER_FPS="8"
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

원하시면 다음 단계로, 관제에 더 가까운 **4단계(탐지 결과 JSON을 WebSocket으로 분리 + Svelte Canvas 오버레이 + 이벤트 트리거)**를 “표준 구조”로 이어서 제공하겠습니다.
