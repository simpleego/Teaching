# FASTAPI 
> **웹캠에서 검출된 얼굴/객체 정보를 FastAPI 서버로 전송하는 구조**
> IoT·AIOT 프로젝트에서 정말 많이 쓰는 패턴

---

# 🟦 전체 구성 개요

1) **FastAPI 서버 코드**  
   - `/log` 엔드포인트로 검출 로그를 받음  
   - JSON 형태로 얼굴/객체 정보 저장  

2) **클라이언트(OpenCV 검출 코드)**  
   - 얼굴/객체 검출  
   - 검출된 좌표/크기/타임스탬프를 FastAPI 서버로 POST 전송  

---

# 🟩 1. FastAPI 서버 코드 (server.py)

```python
from fastapi import FastAPI
from pydantic import BaseModel
import datetime

app = FastAPI()

class DetectionLog(BaseModel):
    timestamp: str
    obj_type: str
    x: int
    y: int
    w: int
    h: int
    area: float

@app.post("/log")
async def receive_log(log: DetectionLog):
    print(f"[LOG RECEIVED] {log}")
    return {"status": "ok", "received_at": datetime.datetime.now().isoformat()}
```

### ✔ 서버 실행

```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

서버가 켜지면:

```
http://localhost:8000/log
```

여기로 POST 요청을 받게 돼.

---

# 🟦 2. 클라이언트(OpenCV + DNN)에서 FastAPI로 전송

아래는 **얼굴 검출 후 FastAPI로 로그 전송**하는 코드야.

```python
import cv2
import numpy as np
import datetime
import requests

API_URL = "http://localhost:8000/log"

def send_log(obj_type, x, y, w, h, area):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    data = {
        "timestamp": timestamp,
        "obj_type": obj_type,
        "x": x,
        "y": y,
        "w": w,
        "h": h,
        "area": area
    }

    try:
        requests.post(API_URL, json=data)
    except Exception as e:
        print("API 전송 오류:", e)

def main():
    cap = cv2.VideoCapture(0)

    modelFile = "res10_300x300_ssd_iter_140000.caffemodel"
    configFile = "deploy.prototxt"
    net = cv2.dnn.readNetFromCaffe(configFile, modelFile)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        h, w = frame.shape[:2]

        blob = cv2.dnn.blobFromImage(
            cv2.resize(frame, (300, 300)),
            1.0,
            (300, 300),
            (104.0, 177.0, 123.0)
        )

        net.setInput(blob)
        detections = net.forward()

        for i in range(detections.shape[2]):
            confidence = detections[0, 0, i, 2]

            if confidence > 0.5:
                box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                x1, y1, x2, y2 = box.astype(int)

                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

                area = (x2 - x1) * (y2 - y1)

                # ============================
                # FastAPI 서버로 로그 전송
                # ============================
                send_log("face", x1, y1, x2 - x1, y2 - y1, area)

        cv2.imshow("Face Detection (press x to exit)", frame)

        if cv2.waitKey(1) & 0xFF == ord('x'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
```

---

# 🟧 FastAPI로 전송되는 JSON 예시

```json
{
  "timestamp": "2026-02-03 22:15:32",
  "obj_type": "face",
  "x": 120,
  "y": 80,
  "w": 60,
  "h": 90,
  "area": 5400
}
```

---

# 🎯 jong을 위한 요약

이제 전체 흐름은 이렇게 돼:

1. 웹캠에서 얼굴/객체 검출  
2. 검출된 좌표/크기/타임스탬프 생성  
3. FastAPI 서버로 JSON POST 전송  
4. 서버에서 로그 수신 및 저장/처리  

이 구조는 AIOT 프로젝트에서  
- CCTV 분석  
- 공장 안전 모니터링  
- 출입자 감지  
- 스마트홈 감시  

같은 데서 그대로 사용 가능해.

---

가능한 다음 과정:

- FastAPI 서버에서 **DB(MySQL, SQLite)에 자동 저장**  
- FastAPI 서버에서 **이미지 파일까지 업로드 받기**  
- MQTT + FastAPI 혼합 구조  
- React/Vue 대시보드에서 실시간 로그 표시  
