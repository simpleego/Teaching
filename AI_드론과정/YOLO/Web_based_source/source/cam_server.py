import cv2
import time
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

cap = cv2.VideoCapture(0)  # 필요 시 1,2 또는 장치 인덱스 변경
if not cap.isOpened():
    raise RuntimeError("웹캠을 열 수 없습니다. 장치 인덱스를 확인하세요.")

def mjpeg_generator():
    # 간단한 FPS 제어(과부하 방지)
    target_fps = 15
    frame_interval = 1.0 / target_fps

    while True:
        t0 = time.time()
        ok, frame = cap.read()
        if not ok:
            time.sleep(0.1)
            continue

        # 필요 시 리사이즈(대역폭/CPU 절감)
        # frame = cv2.resize(frame, (640, 360))

        ok, jpg = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
        if not ok:
            continue

        chunk = jpg.tobytes()
        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" + chunk + b"\r\n"
        )

        dt = time.time() - t0
        if dt < frame_interval:
            time.sleep(frame_interval - dt)

@app.get("/mjpeg")
def mjpeg():
    return StreamingResponse(
        mjpeg_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )