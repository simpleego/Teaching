아래는 **“초간단 5단계”의 2단계**를 **최소 코드**로 구현한 버전입니다.

* 버튼 클릭 → 서버에 요청
* 서버는 **현재 프레임 1장**을 읽어서

  * `/infer/json` : **JSON(박스/클래스/신뢰도)**
  * `/infer/image` : **박스가 그려진 JPEG** 반환
* 프론트(Svelte)는 JSON을 표로 보여주고, 오버레이 이미지를 `<img>`로 표시

---

# 2단계 폴더 구조

(1단계 프로젝트를 그대로 사용하고 백엔드/프론트 파일만 교체/추가)

```
step_simple/
  backend/
    main.py
    requirements.txt
  frontend/
    src/App.svelte
```

---

# Backend (FastAPI + YOLO) — 최소 코드

## backend/requirements.txt

1단계에 **ultralytics**만 추가합니다.

```txt
fastapi==0.115.0
uvicorn[standard]==0.30.6
opencv-python==4.10.0.84
ultralytics==8.3.0
```

## backend/main.py

> “최소”를 위해 **캡처 스레드 분리 없이** 요청 시점에 `cap.read()`로 한 프레임만 읽습니다.
> (3단계에서 비동기/스레드 구조로 개선)

```python
import time
import cv2
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, Response

from ultralytics import YOLO

app = FastAPI(title="Step2 Simple - YOLO Single Frame")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Camera ---
cap = cv2.VideoCapture(0)

# --- YOLO (load once) ---
model = YOLO("yolov8n.pt")   # 최초 1회 자동 다운로드 가능
names = model.names

def encode_jpg(frame_bgr):
    ok, jpg = cv2.imencode(".jpg", frame_bgr)
    if not ok:
        raise RuntimeError("JPEG encode failed")
    return jpg.tobytes()

@app.get("/video")
def video():
    def gen():
        boundary = b"--frame"
        while True:
            ok, frame = cap.read()
            if not ok:
                time.sleep(0.05)
                continue
            data = encode_jpg(frame)
            yield boundary + b"\r\n"
            yield b"Content-Type: image/jpeg\r\n"
            yield f"Content-Length: {len(data)}\r\n\r\n".encode()
            yield data + b"\r\n"
    return StreamingResponse(gen(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.post("/infer/json")
def infer_json():
    ok, frame = cap.read()
    if not ok:
        return JSONResponse({"ok": False, "error": "camera read failed"}, status_code=503)

    t0 = time.time()
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    results = model.predict(rgb, conf=0.25, iou=0.45, imgsz=640, verbose=False)
    r0 = results[0]
    boxes = r0.boxes

    dets = []
    if boxes is not None and len(boxes) > 0:
        xyxy = boxes.xyxy.cpu().numpy()
        conf = boxes.conf.cpu().numpy()
        cls = boxes.cls.cpu().numpy()
        for i in range(len(xyxy)):
            x1, y1, x2, y2 = map(float, xyxy[i])
            cid = int(cls[i])
            dets.append({
                "class_id": cid,
                "class_name": names.get(cid, str(cid)),
                "confidence": float(conf[i]),
                "box_xyxy": [x1, y1, x2, y2],
            })

    return {
        "ok": True,
        "inference_ms": int((time.time() - t0) * 1000),
        "count": len(dets),
        "detections": dets
    }

@app.post("/infer/image")
def infer_image():
    ok, frame = cap.read()
    if not ok:
        return JSONResponse({"ok": False, "error": "camera read failed"}, status_code=503)

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = model.predict(rgb, conf=0.25, iou=0.45, imgsz=640, verbose=False)
    r0 = results[0]

    # plot()은 RGB 반환
    plotted_rgb = r0.plot()
    plotted_bgr = cv2.cvtColor(plotted_rgb, cv2.COLOR_RGB2BGR)
    return Response(content=encode_jpg(plotted_bgr), media_type="image/jpeg")
```

### 백엔드 실행

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

# Frontend (Svelte) — 버튼 클릭 UI (최소)

## frontend/src/App.svelte

```svelte
<script>
  const API = "http://localhost:8000";
  const videoUrl = `${API}/video`;

  let result = null;
  let overlayUrl = null;
  let err = null;

  async function inferJson() {
    err = null;
    try {
      const r = await fetch(`${API}/infer/json`, { method: "POST" });
      result = await r.json();
      if (!result.ok) err = result.error || "infer/json failed";
    } catch (e) {
      err = String(e);
    }
  }

  function inferImage() {
    // 이미지 응답은 img src로 바로 갱신 (캐시 방지 ts)
    overlayUrl = `${API}/infer/image?ts=${Date.now()}`;
  }
</script>

<main style="font-family: Arial; padding: 16px; max-width: 1100px; margin: 0 auto;">
  <h2>Step2: 버튼 클릭 → YOLO 단일 프레임 추론</h2>

  <div style="display:flex; gap:10px; flex-wrap:wrap; margin: 10px 0;">
    <button on:click={inferJson}>YOLO 추론(JSON)</button>
    <button on:click={inferImage}>YOLO 오버레이 이미지</button>
    {#if err}
      <span style="color:#b00020;">{err}</span>
    {/if}
  </div>

  <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
    <section style="border:1px solid #ddd; border-radius:12px; padding:10px;">
      <h3>실시간 영상 (/video)</h3>
      <img src={videoUrl} alt="live" style="width:100%; border-radius:10px; border:1px solid #eee;" />
    </section>

    <section style="border:1px solid #ddd; border-radius:12px; padding:10px;">
      <h3>YOLO 오버레이</h3>
      {#if overlayUrl}
        <img src={overlayUrl} alt="overlay" style="width:100%; border-radius:10px; border:1px solid #eee;" />
      {:else}
        <div style="color:#555;">버튼을 눌러 오버레이 이미지를 생성하세요.</div>
      {/if}
    </section>
  </div>

  <section style="margin-top:12px; border:1px solid #ddd; border-radius:12px; padding:10px;">
    <h3>탐지 결과(JSON)</h3>

    {#if result?.ok}
      <div style="margin-bottom:8px;">
        inference_ms: <b>{result.inference_ms}</b>,
        count: <b>{result.count}</b>
      </div>

      {#if result.count === 0}
        <div style="color:#555;">탐지된 객체가 없습니다.</div>
      {:else}
        <table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr style="background:#fafafa;">
              <th style="text-align:left; padding:6px; border-bottom:1px solid #eee;">#</th>
              <th style="text-align:left; padding:6px; border-bottom:1px solid #eee;">class</th>
              <th style="text-align:left; padding:6px; border-bottom:1px solid #eee;">conf</th>
              <th style="text-align:left; padding:6px; border-bottom:1px solid #eee;">box_xyxy</th>
            </tr>
          </thead>
          <tbody>
            {#each result.detections as d, i}
              <tr>
                <td style="padding:6px; border-bottom:1px solid #eee;">{i+1}</td>
                <td style="padding:6px; border-bottom:1px solid #eee;">
                  {d.class_name} ({d.class_id})
                </td>
                <td style="padding:6px; border-bottom:1px solid #eee;">
                  {d.confidence.toFixed(3)}
                </td>
                <td style="padding:6px; border-bottom:1px solid #eee;">
                  {JSON.stringify(d.box_xyxy.map(v => Number(v.toFixed(1))))}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    {:else}
      <div style="color:#555;">“YOLO 추론(JSON)” 버튼을 눌러 결과를 확인하세요.</div>
    {/if}
  </section>
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

## 수강생에게 강조할 “최소 핵심”

* **모델은 서버 시작 시 1회 로딩**(요청마다 로딩 X)
* 결과 파싱 핵심 3개:

  * `boxes.xyxy`, `boxes.conf`, `boxes.cls`
* 오버레이 이미지는 `results[0].plot()`으로 가장 쉽게 구현 가능
* 지금 구조는 “최소”라서, 다음 단계(3단계)에서:

  * 캡처/추론 분리(스레드)
  * frame-skip/resize
  * `/video_yolo` 실시간 스트림
    로 확장하면 “관제형”으로 이어짐

원하면 바로 **3단계 최소버전**(이 코드 기반으로 `/video_yolo` 추가 + frame-skip)도 이어서 제공하겠습니다.
