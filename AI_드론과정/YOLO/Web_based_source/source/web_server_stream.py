import asyncio
import time
import threading
from typing import Dict, Any, List, Optional, Set

import cv2
import numpy as np
import requests
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse

from ultralytics import YOLO


# =========================
# 설정
# =========================
CAM_SERVER_MJPEG = "http://localhost:9001/mjpeg"

MODEL_PATH = "yolov8n.pt"
CONF_THRES = 0.25
IOU_THRES = 0.45

# 실시간 추론 주기/부하 제어
INFER_FPS = 5.0              # 추론은 5fps만 (CPU/GPU 상황에 맞게 조절)
MAX_FRAME_AGE_SEC = 2.0      # 최신 프레임이 너무 오래되면 추론 중지/에러 처리
RECONNECT_DELAY_SEC = 1.0
MJPEG_READ_TIMEOUT = 10

# 프론트에 보낼 결과 포맷
SEND_ONLY_BOXES = True       # True면 bbox/cls/conf만 보냄(대역폭 최소)


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO(MODEL_PATH)

# =========================
# 최신 프레임 캐시
# =========================
_lock = threading.Lock()
_latest_bgr: Optional[np.ndarray] = None
_latest_jpeg: Optional[bytes] = None
_latest_ts: float = 0.0

# =========================
# 결과 fan-out (WebSocket 클라이언트 집합)
# =========================
_ws_clients: Set[WebSocket] = set()
_ws_lock = asyncio.Lock()

# inference loop 제어
_infer_task: Optional[asyncio.Task] = None


# =========================
# MJPEG -> JPEG 프레임 추출
# =========================
def iter_jpeg_frames_from_mjpeg(url: str):
    with requests.get(url, stream=True, timeout=MJPEG_READ_TIMEOUT) as r:
        r.raise_for_status()
        buf = bytearray()
        for chunk in r.iter_content(chunk_size=4096):
            if not chunk:
                continue
            buf.extend(chunk)

            while True:
                soi = buf.find(b"\xff\xd8")
                if soi == -1:
                    if len(buf) > 2_000_000:
                        buf.clear()
                    break
                eoi = buf.find(b"\xff\xd9", soi + 2)
                if eoi == -1:
                    break
                jpg = bytes(buf[soi:eoi + 2])
                del buf[:eoi + 2]
                yield jpg


# =========================
# 백그라운드: 프레임 캐시 유지(자동 재연결)
# =========================
def frame_cache_worker():
    global _latest_bgr, _latest_jpeg, _latest_ts
    while True:
        try:
            for jpg in iter_jpeg_frames_from_mjpeg(CAM_SERVER_MJPEG):
                arr = np.frombuffer(jpg, dtype=np.uint8)
                bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
                if bgr is None:
                    continue
                with _lock:
                    _latest_bgr = bgr
                    _latest_jpeg = jpg
                    _latest_ts = time.time()
        except Exception as e:
            print(f"[ingest] stream error: {e} -> reconnecting in {RECONNECT_DELAY_SEC}s")
            time.sleep(RECONNECT_DELAY_SEC)


def get_latest_frame(max_age_sec: float = MAX_FRAME_AGE_SEC) -> np.ndarray:
    with _lock:
        bgr = None if _latest_bgr is None else _latest_bgr.copy()
        ts = _latest_ts
    if bgr is None:
        raise HTTPException(status_code=503, detail="No frame available yet.")
    if (time.time() - ts) > max_age_sec:
        raise HTTPException(status_code=503, detail="Frame too old. Stream may be down.")
    return bgr


@app.on_event("startup")
def startup():
    th = threading.Thread(target=frame_cache_worker, daemon=True)
    th.start()

    # asyncio inference loop는 startup에서 create_task
    loop = asyncio.get_event_loop()
    global _infer_task
    _infer_task = loop.create_task(inference_loop())


# =========================
# (선택) 영상 미리보기: MJPEG 재포장
# =========================
@app.get("/video")
def video():
    def gen():
        boundary = b"frame"
        while True:
            with _lock:
                jpg = _latest_jpeg
            if jpg is None:
                time.sleep(0.05)
                continue
            yield b"--" + boundary + b"\r\n"
            yield b"Content-Type: image/jpeg\r\n\r\n"
            yield jpg
            yield b"\r\n"
            time.sleep(1/15)
    return StreamingResponse(gen(), media_type="multipart/x-mixed-replace; boundary=frame")


@app.get("/frame.jpg")
def frame_jpg():
    with _lock:
        jpg = _latest_jpeg
        ts = _latest_ts
    if jpg is None:
        raise HTTPException(status_code=503, detail="No frame available yet.")
    if (time.time() - ts) > MAX_FRAME_AGE_SEC:
        raise HTTPException(status_code=503, detail="Frame too old.")
    return Response(content=jpg, media_type="image/jpeg")


# =========================
# WebSocket: /detect_stream (결과 JSON만 push)
# =========================
@app.websocket("/detect_stream")
async def detect_stream(ws: WebSocket):
    await ws.accept()
    async with _ws_lock:
        _ws_clients.add(ws)

    try:
        # 연결 확인용 ping(선택)
        await ws.send_json({"type": "hello", "ts": time.time()})
        while True:
            # 클라이언트에서 메시지를 보낼 수도 있으니 대기 (안 보내면 timeout으로 처리)
            # 여기선 단순히 연결 유지용으로 receive를 돌려줌
            await asyncio.sleep(60)
    except WebSocketDisconnect:
        pass
    finally:
        async with _ws_lock:
            if ws in _ws_clients:
                _ws_clients.remove(ws)


async def broadcast(payload: Dict[str, Any]):
    # 연결 끊긴 소켓 정리
    dead: List[WebSocket] = []
    async with _ws_lock:
        clients = list(_ws_clients)

    for c in clients:
        try:
            await c.send_json(payload)
        except Exception:
            dead.append(c)

    if dead:
        async with _ws_lock:
            for d in dead:
                _ws_clients.discard(d)


# =========================
# 실시간 추론 루프: "최신 프레임만" 일정 FPS로 추론하고 결과 fan-out
# =========================
async def inference_loop():
    interval = 1.0 / max(INFER_FPS, 0.1)
    while True:
        t0 = time.time()

        # 클라이언트가 아무도 없으면 추론을 쉬어서 자원 절감(운영에서 중요)
        async with _ws_lock:
            has_clients = len(_ws_clients) > 0
        if not has_clients:
            await asyncio.sleep(0.2)
            continue

        # 최신 프레임 확보
        try:
            bgr = get_latest_frame()
        except HTTPException as e:
            await broadcast({"type": "status", "ok": False, "detail": e.detail, "ts": time.time()})
            await asyncio.sleep(0.5)
            continue

        # YOLO 추론 (sync 호출이므로 event loop 블로킹 최소화 위해 to_thread 사용)
        results = await asyncio.to_thread(
            model.predict,
            bgr,
            CONF_THRES,
            IOU_THRES,
            False
        )
        r = results[0]

        dets = []
        if r.boxes is not None and len(r.boxes) > 0:
            boxes = r.boxes.xyxy.cpu().numpy()
            confs = r.boxes.conf.cpu().numpy()
            clss = r.boxes.cls.cpu().numpy().astype(int)

            for (x1, y1, x2, y2), conf, cls_id in zip(boxes, confs, clss):
                dets.append({
                    "class_id": int(cls_id),
                    "class_name": model.names[int(cls_id)],
                    "confidence": float(conf),
                    "bbox_xyxy": [float(x1), float(y1), float(x2), float(y2)]
                })

        payload = {
            "type": "detections",
            "ts": time.time(),
            "image": {"width": int(bgr.shape[1]), "height": int(bgr.shape[0])},
            "detections": dets
        }
        await broadcast(payload)

        # fps 맞추기
        dt = time.time() - t0
        if dt < interval:
            await asyncio.sleep(interval - dt)