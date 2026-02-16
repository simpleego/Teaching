# 2단계 **2단계(설치 → 모델 로딩 → 단일 프레임 추론 → 결과 파싱)**
> **FastAPI 백엔드 + Svelte 프론트**로 구성한 실습 세트입니다.
> 핵심은 “실시간 스트리밍”이 아니라 **한 프레임을 캡처해서 YOLO 추론을 수행하고**,
> **JSON(박스/클래스/신뢰도) 결과**와 **오버레이 이미지**를 브라우저에서 확인

---

## 2단계 학습 목표

1. Ultralytics YOLO 설치 및 모델 파일 자동 다운로드 이해
2. 서버 시작 시 모델 1회 로딩(Cold start 최소화)
3. `results[0].boxes`에서 **xyxy / conf / cls** 파싱
4. **(A) JSON만 반환** / **(B) 박스 오버레이 이미지 반환** 두 가지 API 제공
5. Svelte에서 버튼 클릭으로 추론 수행 + 결과 테이블 표시

---

# Backend (FastAPI + YOLO)

## backend/requirements.txt (2단계용)

기존 requirements에 ultralytics 추가합니다.

```txt
fastapi==0.115.0
uvicorn[standard]==0.30.6
opencv-python==4.10.0.84
numpy==2.0.1
ultralytics==8.3.0
```

> GPU(CUDA) 사용은 이 단계에선 필수 아님. CPU로도 동작합니다.
> Windows에서 torch 설치가 환경에 따라 달라질 수 있는데, ultralytics 설치 시 torch가 자동으로 잡히지 않으면 PyTorch 공식 가이드대로 별도 설치가 필요합니다.

---

## backend/main.py (2단계 완성본)

* `/frame` : 현재 프레임 JPEG(원본)
* `/infer/json` : 단일 프레임 YOLO 추론 결과(JSON)
* `/infer/image` : 박스 오버레이된 JPEG 반환
* `/health` : 서버/모델 상태

```python
import os
import time
import threading
from typing import Optional, Dict, Any, List

import cv2
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

from ultralytics import YOLO

# ---------- Config ----------
VIDEO_SOURCE = os.getenv("VIDEO_SOURCE", "0")  # "0" or RTSP URL
MODEL_NAME = os.getenv("YOLO_MODEL", "yolov8n.pt")  # nano 모델(가벼움)
CONF_THRES = float(os.getenv("CONF_THRES", "0.25"))
IOU_THRES = float(os.getenv("IOU_THRES", "0.45"))
IMGSZ = int(os.getenv("IMGSZ", "640"))

JPEG_QUALITY = int(os.getenv("JPEG_QUALITY", "85"))
TARGET_FPS = float(os.getenv("TARGET_FPS", "20"))

app = FastAPI(title="Step2 Backend - YOLO Single Frame Inference")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Frame Grabber ----------
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
        interval = 1.0 / max(TARGET_FPS, 1.0)
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

            with self.lock:
                self.frame = frame
                self.last_read_ts = now

            next_ts += interval
            sleep_for = next_ts - time.time()
            if sleep_for > 0:
                time.sleep(sleep_for)
            else:
                next_ts = time.time()

    def get_frame(self) -> Optional[np.ndarray]:
        with self.lock:
            if self.frame is None:
                return None
            return self.frame.copy()

grabber = FrameGrabber(VIDEO_SOURCE)

# ---------- YOLO Model (load once) ----------
model: Optional[YOLO] = None
model_names: Dict[int, str] = {}

def load_model():
    global model, model_names
    model = YOLO(MODEL_NAME)   # 필요 시 자동 다운로드
    # class id -> name dict
    model_names = model.names if hasattr(model, "names") else {}

@app.on_event("startup")
def on_startup():
    grabber.start()
    load_model()

@app.on_event("shutdown")
def on_shutdown():
    grabber.stop()

# ---------- Utilities ----------
def encode_jpeg(img_bgr: np.ndarray) -> bytes:
    ok, jpg = cv2.imencode(".jpg", img_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), JPEG_QUALITY])
    if not ok:
        raise RuntimeError("Failed to encode JPEG")
    return jpg.tobytes()

def parse_yolo_result(res) -> Dict[str, Any]:
    """
    Ultralytics Results 객체에서 boxes 파싱:
    - xyxy: [x1,y1,x2,y2]
    - conf: confidence
    - cls: class id
    """
    boxes = res.boxes
    out: List[Dict[str, Any]] = []

    if boxes is None or len(boxes) == 0:
        return {"count": 0, "detections": []}

    xyxy = boxes.xyxy.cpu().numpy()   # (N,4)
    conf = boxes.conf.cpu().numpy()   # (N,)
    cls = boxes.cls.cpu().numpy()     # (N,)

    for i in range(len(xyxy)):
        x1, y1, x2, y2 = xyxy[i].tolist()
        c = float(conf[i])
        cid = int(cls[i])
        name = model_names.get(cid, str(cid))
        out.append({
            "class_id": cid,
            "class_name": name,
            "confidence": round(c, 4),
            "box_xyxy": [round(x1, 2), round(y1, 2), round(x2, 2), round(y2, 2)]
        })

    return {"count": len(out), "detections": out}

# ---------- API ----------
@app.get("/health")
def health():
    return {
        "ok": True,
        "source": VIDEO_SOURCE,
        "model": MODEL_NAME,
        "conf_thres": CONF_THRES,
        "iou_thres": IOU_THRES,
        "imgsz": IMGSZ,
    }

@app.get("/frame")
def get_frame():
    frame = grabber.get_frame()
    if frame is None:
        return JSONResponse({"ok": False, "error": "No frame yet"}, status_code=503)
    return Response(content=encode_jpeg(frame), media_type="image/jpeg")

@app.post("/infer/json")
def infer_json():
    if model is None:
        return JSONResponse({"ok": False, "error": "Model not loaded"}, status_code=503)

    frame = grabber.get_frame()
    if frame is None:
        return JSONResponse({"ok": False, "error": "No frame yet"}, status_code=503)

    t0 = time.time()
    # BGR -> RGB
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    results = model.predict(
        source=rgb,
        conf=CONF_THRES,
        iou=IOU_THRES,
        imgsz=IMGSZ,
        verbose=False,
        device=None,  # 기본: 자동(CPU/GPU)
    )
    res0 = results[0]
    parsed = parse_yolo_result(res0)
    dt_ms = int((time.time() - t0) * 1000)

    return {
        "ok": True,
        "inference_ms": dt_ms,
        "count": parsed["count"],
        "detections": parsed["detections"],
    }

@app.post("/infer/image")
def infer_image():
    if model is None:
        return JSONResponse({"ok": False, "error": "Model not loaded"}, status_code=503)

    frame = grabber.get_frame()
    if frame is None:
        return JSONResponse({"ok": False, "error": "No frame yet"}, status_code=503)

    # YOLO 추론
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = model.predict(
        source=rgb,
        conf=CONF_THRES,
        iou=IOU_THRES,
        imgsz=IMGSZ,
        verbose=False,
    )
    res0 = results[0]

    # Ultralytics가 제공하는 plot()은 RGB 반환
    plotted_rgb = res0.plot()
    plotted_bgr = cv2.cvtColor(plotted_rgb, cv2.COLOR_RGB2BGR)

    return Response(content=encode_jpeg(plotted_bgr), media_type="image/jpeg")
```

### 백엔드 실행

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

# Frontend (Svelte) – 2단계 UI

## frontend/src/App.svelte (2단계용)

* “원본 프레임 보기”
* “YOLO 추론(JSON)” 버튼 → 테이블 표시
* “YOLO 오버레이 이미지” 버튼 → 이미지 갱신

```svelte
<script>
  const API = "http://localhost:8000";

  let health = null;
  let err = null;

  let jsonResult = null;
  let overlayUrl = null;
  let rawUrl = null;

  async function loadHealth() {
    err = null;
    try {
      const r = await fetch(`${API}/health`);
      health = await r.json();
    } catch (e) {
      err = String(e);
    }
  }

  function refreshRawFrame() {
    // 캐시 방지용 ts
    rawUrl = `${API}/frame?ts=${Date.now()}`;
  }

  async function inferJson() {
    err = null;
    try {
      const r = await fetch(`${API}/infer/json`, { method: "POST" });
      jsonResult = await r.json();
      if (!jsonResult.ok) err = jsonResult.error || "infer/json failed";
    } catch (e) {
      err = String(e);
    }
  }

  async function inferOverlay() {
    err = null;
    try {
      // image endpoint는 binary라서 그냥 img src로 갱신
      overlayUrl = `${API}/infer/image?ts=${Date.now()}`;
    } catch (e) {
      err = String(e);
    }
  }

  loadHealth();
  refreshRawFrame();
</script>

<main class="wrap">
  <h1>Step2: YOLO 단일 프레임 추론 + 결과 파싱</h1>

  <section class="bar">
    <button on:click={loadHealth}>상태</button>
    <button on:click={refreshRawFrame}>원본 프레임 갱신</button>
    <button on:click={inferJson}>YOLO 추론(JSON)</button>
    <button on:click={inferOverlay}>YOLO 오버레이 이미지</button>

    {#if err}
      <span class="bad">{err}</span>
    {:else if health}
      <span class="good">
        model={health.model} / conf={health.conf_thres} / iou={health.iou_thres} / imgsz={health.imgsz}
      </span>
    {/if}
  </section>

  <div class="grid">
    <section class="card">
      <h2>원본 프레임</h2>
      <img class="img" src={rawUrl} alt="raw frame" />
    </section>

    <section class="card">
      <h2>YOLO 오버레이</h2>
      {#if overlayUrl}
        <img class="img" src={overlayUrl} alt="yolo overlay" />
      {:else}
        <div class="empty">오버레이 버튼을 누르세요</div>
      {/if}
    </section>
  </div>

  <section class="card">
    <h2>탐지 결과(JSON 파싱)</h2>

    {#if jsonResult?.ok}
      <div class="meta">
        inference_ms: <b>{jsonResult.inference_ms}</b>,
        count: <b>{jsonResult.count}</b>
      </div>

      {#if jsonResult.count === 0}
        <div class="empty">탐지된 객체가 없습니다.</div>
      {:else}
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>class_id</th>
              <th>class_name</th>
              <th>confidence</th>
              <th>box_xyxy [x1,y1,x2,y2]</th>
            </tr>
          </thead>
          <tbody>
            {#each jsonResult.detections as d, i}
              <tr>
                <td>{i+1}</td>
                <td>{d.class_id}</td>
                <td>{d.class_name}</td>
                <td>{d.confidence}</td>
                <td>{JSON.stringify(d.box_xyxy)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    {:else if jsonResult && !jsonResult.ok}
      <div class="bad">에러: {jsonResult.error}</div>
    {:else}
      <div class="empty">“YOLO 추론(JSON)” 버튼을 누르세요.</div>
    {/if}
  </section>
</main>

<style>
  .wrap { font-family: Arial, sans-serif; padding: 18px; max-width: 1200px; margin: 0 auto; }
  .bar { display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin: 10px 0 14px; }
  button { padding: 8px 12px; border-radius: 10px; border: 1px solid #ddd; background:#fff; cursor:pointer; }
  button:hover { background:#f7f7f7; }
  .good { color:#0a7a2f; }
  .bad { color:#b00020; }
  .grid { display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
  .card { border:1px solid #e5e5e5; border-radius: 14px; padding: 12px; }
  .img { width:100%; border-radius: 12px; border:1px solid #ddd; display:block; }
  .empty { color:#555; padding: 12px 0; }
  .meta { margin-bottom: 10px; }
  table { width:100%; border-collapse: collapse; }
  th, td { border-bottom: 1px solid #eee; text-align:left; padding: 8px; font-size: 14px; }
  th { background:#fafafa; }
  @media (max-width: 900px) {
    .grid { grid-template-columns: 1fr; }
  }
</style>
```

---

## 실행 순서

1. 백엔드

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

2. 프론트

```bash
cd frontend
npm install
npm run dev
```

3. 브라우저

* `http://localhost:5173`

---

## 수강생 포인트(설명용 핵심)

* **모델 로딩은 서버 시작 시 1회**: 요청마다 로딩하면 매우 느림
* 결과 파싱은 결국 이 3개가 핵심:

  * `boxes.xyxy` : 바운딩 박스 좌표
  * `boxes.conf` : 신뢰도(confidence)
  * `boxes.cls` : 클래스 id (→ `model.names`로 name 매핑)
* 이 단계가 되면 3단계에서는 **/video 스트림 생성 루프에 infer를 붙여 “실시간 오버레이 스트리밍”**으로 확장 가능

---

원하시면 바로 **3단계(실시간 스트림에 YOLO를 붙여서 `/video_yolo` MJPEG로 내보내기 + FPS 유지 전략: frame-skip/resize/비동기)**로 이어가겠습니다.
