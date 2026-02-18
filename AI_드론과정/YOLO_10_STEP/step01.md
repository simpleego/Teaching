# YOLO 학습 마스터하기: 10단계 과정 - 1단계

## 1단계: 개발 환경 구축 및 YOLO 이해하기

### 1.1 개발 환경 설정

```bash
# 가상환경 생성 (선택사항)
python -m venv yolo_env

# 가상환경 활성화
# Windows
yolo_env\Scripts\activate
# Mac/Linux
source yolo_env/bin/activate

# 필수 패키지 설치
pip install ultralytics
pip install torch torchvision torchaudio
pip install opencv-python
pip install matplotlib
pip install numpy
pip install pandas
pip install jupyter
```

### 1.2 설치 확인 및 기본 테스트

```python
# 설치 확인 코드
import ultralytics
import torch
import cv2

print(f"Ultralytics YOLO 버전: {ultralytics.__version__}")
print(f"PyTorch 버전: {torch.__version__}")
print(f"OpenCV 버전: {cv2.__version__}")
print(f"CUDA 사용 가능: {torch.cuda.is_available()}")

# GPU 정보 확인
if torch.cuda.is_available():
    print(f"GPU 모델: {torch.cuda.get_device_name(0)}")
    print(f"GPU 메모리: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")
```

### 1.3 사전 학습된 YOLO 모델 테스트

```python
from ultralytics import YOLO

# YOLOv8n 모델 로드 (가장 가벼운 버전)
model = YOLO('yolov8n.pt')

# 이미지로 테스트
results = model('https://ultralytics.com/images/bus.jpg')

# 결과 시각화
results[0].show()

# 결과 저장
results[0].save('result.jpg')

# 기본 정보 출력
print(f"감지된 객체 수: {len(results[0].boxes)}")
for box in results[0].boxes:
    class_id = int(box.cls[0])
    confidence = float(box.conf[0])
    class_name = results[0].names[class_id]
    print(f"클래스: {class_name}, 신뢰도: {confidence:.2f}")
```

### 1.4 YOLO 기본 개념 이해하기

```python
# YOLO 아키텍처 기본 이해를 위한 개념 코드
class YOLOBasics:
    def __init__(self):
        self.num_classes = 80  # COCO 데이터셋 기준
        self.grid_size = 7      # S x S 그리드
        self.boxes_per_cell = 2 # 각 셀당 Bounding Box 수
        
    def explain_concept(self):
        print("=== YOLO의 핵심 개념 ===")
        print("1. 객체 감지를 회귀 문제로 해결")
        print("2. 이미지를 S x S 그리드로 분할")
        print("3. 각 그리드 셀에서 B 개의 바운딩 박스 예측")
        print("4. 각 바운딩 박스는 (x, y, w, h, confidence) 예측")
        print("5. 동시에 C개의 클래스 확률 예측")
        print(f"\n출력 텐서 형태: {self.grid_size} x {self.grid_size} x ({self.boxes_per_cell * 5 + self.num_classes})")

# 개념 설명 실행
basics = YOLOBasics()
basics.explain_concept()
```

### 1.5 간단한 실시간 객체 탐지 테스트

```python
import cv2
from ultralytics import YOLO

def webcam_object_detection():
    # 모델 로드
    model = YOLO('yolov8n.pt')
    
    # 웹캠 열기
    cap = cv2.VideoCapture(0)
    
    print("웹캠 객체 탐지 시작 (종료: 'q' 키)")
    
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break
        
        # 객체 탐지 수행
        results = model(frame, stream=True)
        
        # 결과 시각화
        annotated_frame = results[0].plot()
        
        # 화면에 표시
        cv2.imshow('YOLO Object Detection', annotated_frame)
        
        # 'q' 키로 종료
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()

# 주석 해제하여 실행
# webcam_object_detection()
```

### 1.6 학습 내용 정리 체크리스트

```python
checklist = {
    "개발 환경": [
        "Python 가상환경 생성",
        "Ultralytics 패키지 설치",
        "PyTorch 설치",
        "OpenCV 설치"
    ],
    "기본 개념": [
        "YOLO의 객체 탐지 원리 이해",
        "사전 학습된 모델 사용법 이해",
        "GPU/CPU 환경 확인",
        "기본 추론(inference) 실행"
    ],
    "실습 완료": [
        "사전 학습 모델로 이미지 테스트",
        "결과 시각화 및 저장",
        "웹캠 실시간 탐지 시도"
    ]
}

print("=== 1단계 학습 체크리스트 ===")
for category, items in checklist.items():
    print(f"\n{category}:")
    for item in items:
        completed = input(f"  ✓ {item} 완료하셨나요? (y/n): ").lower() == 'y'
        print(f"    {'✅' if completed else '❌'} {item}")
```

### 1.7 문제 해결 가이드

```python
troubleshooting = {
    "CUDA 관련 오류": [
        "pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118",
        "CUDA 버전 확인: nvidia-smi",
        "PyTorch CUDA 호환성 확인"
    ],
    "패키지 설치 오류": [
        "pip install --upgrade pip",
        "pip install ultralytics --no-cache-dir",
        "가상환경 재생성"
    ],
    "메모리 부족": [
        "더 작은 모델 사용 (yolov8n.pt)",
        "배치 크기 줄이기",
        "이미지 리사이즈"
    ]
}

print("\n=== 문제 해결 가이드 ===")
for issue, solutions in troubleshooting.items():
    print(f"\n{issue}:")
    for solution in solutions:
        print(f"  • {solution}")
```

### 이 단계의 목표:
✅ Python 개발 환경 구축 완료  
✅ YOLO 기본 개념 이해  
✅ 사전 학습된 모델로 객체 탐지 테스트  
✅ 문제 발생 시 해결 방법 숙지  

---

**다음 단계 예고: 2단계 - 커스텀 데이터셋 준비 및 라벨링**  
다음 단계에서는 직접 데이터를 수집하고 라벨링하는 방법을 배웁니다.
