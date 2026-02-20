전체 구조를 설명하고 코드를 작성할게요.

**전체 아키텍처:**
- 📱 **휴대폰 클라이언트** (Python) → 영상 스트리밍 전송
- 🖥️ **FastAPI 서버** → 영상 수신 + YOLO 객체 검출
- 🌐 **Svelte 프론트엔드** → 검출 결과 실시간 표시파일들을 순서대로 작성할게요.

---

## 📁 프로젝트 구조

```
yolo-stream/
├── server/
│   ├── main.py              # FastAPI 서버
│   ├── yolo_detector.py     # YOLO 검출 모듈
│   └── requirements.txt
├── mobile_client/
│   ├── stream_client.py     # 휴대폰 영상 전송 클라이언트
│   └── requirements.txt
└── frontend/                # Svelte 앱
    ├── src/
    │   ├── App.svelte
    │   └── main.js
    ├── package.json
    └── vite.config.js
```7개 파일이 완성됐습니다. 전체 구조를 정리하면:

---

## 📦 파일 구성

| 파일 | 역할 |
|------|------|
| `server/main.py` | FastAPI 서버 — WebSocket 수신, asyncio 큐, 브로드캐스트 |
| `server/yolo_detector.py` | YOLOv8 추론 모듈 (ultralytics 없으면 OpenCV DNN fallback) |
| `mobile_client/stream_client.py` | 카메라 캡처 → WebSocket/HTTP로 서버 전송 |
| `frontend/src/App.svelte` | 실시간 영상 + 감지 목록 + 통계 대시보드 |

---

## 🚀 실행 순서

```bash
# ① 서버
cd server && pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000

# ② 클라이언트 (카메라 PC 또는 스마트폰)
cd mobile_client && pip install -r requirements.txt
python stream_client.py --server ws://서버IP:8000 --camera 0

# ③ 프론트엔드
cd frontend && npm install && npm run dev
# → http://localhost:5173
```

---

## 🔑 핵심 설계 포인트

- **저지연 큐**: `asyncio.Queue(maxsize=5)` — 버퍼가 가득 차면 오래된 프레임을 버려 지연 누적 방지
- **비동기 추론**: YOLO 추론을 `run_in_executor`로 별도 스레드에서 실행해 이벤트 루프 블로킹 없음
- **이중 전송 방식**: WebSocket(기본, 저지연) + HTTP POST(방화벽 환경 대안)
- **다중 클라이언트**: 프론트엔드 여러 개를 동시에 연결해도 모두 브로드캐스트 수신
