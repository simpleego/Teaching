아래는 **Ultralytics YOLO(v5~v8 계열, 최신 CLI 기준)** 에서 실무에서 사용하는 **YOLO 명령어 종류를 목적별로 체계 정리**한 것입니다.
(주로 `yolo <task> <mode> ...` 형식)

---

# 📌 YOLO 명령어 전체 구조

```bash
yolo <task> <mode> [options]
```

* **task** : 무엇을 할 것인가
* **mode** : 어떻게 할 것인가
* **options** : 세부 설정

---

## 1️⃣ Task 종류 (무엇을 할 것인가)

| task       | 의미                               |
| ---------- | -------------------------------- |
| `detect`   | 객체 검출 (bounding box)             |
| `segment`  | 인스턴스 세그멘테이션                      |
| `classify` | 이미지 분류                           |
| `pose`     | 사람 포즈 추정                         |
| `obb`      | 회전 박스 검출 (Oriented Bounding Box) |

📌 가장 많이 쓰는 것은 **detect**

---

## 2️⃣ Mode 종류 (어떻게 할 것인가)

| mode        | 설명                       |
| ----------- | ------------------------ |
| `train`     | 모델 학습                    |
| `val`       | 검증 (mAP 계산)              |
| `predict`   | 추론 (이미지/영상/웹캠)           |
| `export`    | 모델 변환 (ONNX, TensorRT 등) |
| `benchmark` | 성능 벤치마크                  |
| `track`     | 객체 추적 (ByteTrack 등)      |

---

## 3️⃣ 핵심 명령어 정리 (실전 위주)

---

## 🔹 ① 학습 (train)

```bash
yolo detect train model=yolov8n.pt data=coco128.yaml epochs=100 imgsz=640
```

자주 쓰는 옵션

| 옵션        | 설명                  |
| --------- | ------------------- |
| `model`   | 초기 가중치              |
| `data`    | 데이터셋 YAML           |
| `epochs`  | 학습 반복               |
| `imgsz`   | 입력 이미지 크기           |
| `batch`   | 배치 크기               |
| `device`  | GPU 번호 (`0`, `cpu`) |
| `workers` | DataLoader 스레드 수    |

---

## 🔹 ② 검증 (val)

```bash
yolo detect val model=runs/detect/train/weights/best.pt data=coco128.yaml
```

출력

* mAP@0.5
* mAP@0.5:0.95
* Precision / Recall
* Confusion Matrix

---

## 🔹 ③ 추론 (predict)

### 이미지

```bash
yolo detect predict model=yolov8n.pt source=image.jpg
```

### 영상

```bash
yolo detect predict model=yolov8n.pt source=video.mp4
```

### 웹캠

```bash
yolo detect predict model=yolov8n.pt source=0
```

자주 쓰는 옵션

| 옵션        | 설명                   |
| --------- | -------------------- |
| `conf`    | confidence threshold |
| `iou`     | NMS IoU              |
| `save`    | 결과 저장                |
| `show`    | 화면 출력                |
| `classes` | 특정 클래스만 검출           |

---

## 🔹 ④ 모델 내보내기 (export)

```bash
yolo export model=best.pt format=onnx
```

지원 포맷

| format        | 용도       |
| ------------- | -------- |
| `onnx`        | 범용       |
| `engine`      | TensorRT |
| `openvino`    | Intel    |
| `torchscript` | PyTorch  |
| `tflite`      | 모바일      |

---

## 🔹 ⑤ 객체 추적 (track)

```bash
yolo detect track model=yolov8n.pt source=video.mp4
```

옵션

| 옵션                       | 설명        |
| ------------------------ | --------- |
| `tracker=bytetrack.yaml` | ByteTrack |
| `tracker=botsort.yaml`   | BoTSORT   |

---

## 🔹 ⑥ 분류 / 세그 / 포즈 예시

```bash
yolo classify train model=yolov8n-cls.pt data=data.yaml
yolo segment predict model=yolov8n-seg.pt source=image.jpg
yolo pose predict model=yolov8n-pose.pt source=0
```

---

## 4️⃣ 자주 쓰는 공통 옵션 요약

| 옵션           | 설명       |
| ------------ | -------- |
| `project`    | 결과 저장 경로 |
| `name`       | 실험 이름    |
| `exist_ok`   | 덮어쓰기     |
| `half`       | FP16     |
| `vid_stride` | 프레임 스킵   |
| `stream`     | 실시간 스트림  |

---

## 5️⃣ 한눈에 보는 명령어 치트시트

```bash
yolo detect train ...
yolo detect val ...
yolo detect predict ...
yolo detect track ...
yolo export ...
```

---

## 6️⃣ 실무 팁 (중요)

* **학습** → `train`
* **성능 확인(mAP)** → `val`
* **실서비스 테스트** → `predict`
* **배포** → `export`
* **CCTV/드론** → `track + stream`

---

원하시면 다음도 바로 이어서 정리해 드릴 수 있습니다:

* 🔧 YOLO **명령어 ↔ Python 코드 1:1 대응**
* 📁 `data.yaml`, `model.yaml` 구조 해설
* 🚀 실시간 관제용 **YOLO CLI + FastAPI 연동 구조**
* ⚠️ YOLO 명령어 실행 시 **자주 발생하는 오류 Top 10**

원하시는 방향을 말씀해 주세요.
