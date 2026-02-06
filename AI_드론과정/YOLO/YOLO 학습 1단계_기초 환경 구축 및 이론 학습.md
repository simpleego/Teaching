# YOLO 학습 1단계: 기초 환경 구축 및 이론 학습

## 1. 개발 환경 설정

### 1-1. Python 설치 확인
```python
# 터미널에서 실행
python --version  # Python 3.8 이상 권장
```

### 1-2. 가상환경 생성 (권장)
```bash
# 가상환경 생성
python -m venv yolo_env

# 가상환경 활성화
# Windows:
yolo_env\Scripts\activate
# Mac/Linux:
source yolo_env/bin/activate
```

### 1-3. 필수 라이브러리 설치
```bash
# 기본 라이브러리 설치
pip install opencv-python
pip install numpy
pip install matplotlib
pip install pillow

# YOLO 라이브러리 (Ultralytics)
pip install ultralytics
```

## 2. OpenCV 기초 실습

### 실습 1: 이미지 읽기와 표시
```python
import cv2
import numpy as np
import matplotlib.pyplot as plt

# 이미지 읽기
def load_and_display_image(image_path):
    """
    이미지를 읽고 화면에 표시하는 함수
    """
    # 이미지 읽기 (BGR 형식)
    img = cv2.imread(image_path)
    
    if img is None:
        print("이미지를 찾을 수 없습니다!")
        return None
    
    # BGR을 RGB로 변환 (Matplotlib용)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # 이미지 정보 출력
    print(f"이미지 크기: {img.shape}")
    print(f"높이: {img.shape[0]}, 너비: {img.shape[1]}, 채널: {img.shape[2]}")
    
    # 이미지 표시
    plt.figure(figsize=(10, 6))
    plt.imshow(img_rgb)
    plt.title('Original Image')
    plt.axis('off')
    plt.show()
    
    return img

# 사용 예시
# img = load_and_display_image('test_image.jpg')
```

### 실습 2: 웹캠 테스트
```python
import cv2

def test_webcam():
    """
    웹캠이 정상 작동하는지 테스트
    'q' 키를 누르면 종료
    """
    # 웹캠 열기 (0은 기본 카메라)
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("웹캠을 열 수 없습니다!")
        return
    
    print("웹캠 테스트 시작 (q를 누르면 종료)")
    
    while True:
        # 프레임 읽기
        ret, frame = cap.read()
        
        if not ret:
            print("프레임을 읽을 수 없습니다!")
            break
        
        # 프레임에 텍스트 추가
        cv2.putText(frame, 'Press Q to Quit', (10, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        # 프레임 표시
        cv2.imshow('Webcam Test', frame)
        
        # 'q' 키를 누르면 종료
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    # 리소스 해제
    cap.release()
    cv2.destroyAllWindows()

# 실행
# test_webcam()
```

### 실습 3: Bounding Box 그리기 연습
```python
import cv2
import numpy as np

def draw_bounding_boxes():
    """
    객체 검출의 기본인 Bounding Box를 그리는 연습
    """
    # 빈 이미지 생성 (흰색 배경)
    img = np.ones((600, 800, 3), dtype=np.uint8) * 255
    
    # Bounding Box 정보 (x, y, width, height)
    boxes = [
        {'bbox': (100, 100, 200, 150), 'label': 'Person', 'confidence': 0.95},
        {'bbox': (400, 200, 150, 180), 'label': 'Car', 'confidence': 0.87},
        {'bbox': (200, 350, 180, 120), 'label': 'Dog', 'confidence': 0.92}
    ]
    
    # 각 박스 그리기
    for obj in boxes:
        x, y, w, h = obj['bbox']
        label = obj['label']
        conf = obj['confidence']
        
        # 박스 그리기 (녹색)
        cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 2)
        
        # 라벨 텍스트
        text = f"{label}: {conf:.2f}"
        
        # 텍스트 배경 박스
        (text_width, text_height), _ = cv2.getTextSize(
            text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        cv2.rectangle(img, (x, y-text_height-10), 
                     (x+text_width, y), (0, 255, 0), -1)
        
        # 텍스트 추가 (검은색)
        cv2.putText(img, text, (x, y-5), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
    
    # 이미지 표시
    cv2.imshow('Bounding Box Example', img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    
    return img

# 실행
# draw_bounding_boxes()
```

## 3. 객체 검출 핵심 개념 코드로 이해하기

### 실습 4: IoU (Intersection over Union) 계산
```python
def calculate_iou(box1, box2):
    """
    두 bounding box의 IoU를 계산
    box 형식: (x, y, width, height)
    """
    x1, y1, w1, h1 = box1
    x2, y2, w2, h2 = box2
    
    # 각 박스의 끝점 계산
    box1_x2 = x1 + w1
    box1_y2 = y1 + h1
    box2_x2 = x2 + w2
    box2_y2 = y2 + h2
    
    # 교집합 영역 계산
    inter_x1 = max(x1, x2)
    inter_y1 = max(y1, y2)
    inter_x2 = min(box1_x2, box2_x2)
    inter_y2 = min(box1_y2, box2_y2)
    
    # 교집합 면적
    inter_width = max(0, inter_x2 - inter_x1)
    inter_height = max(0, inter_y2 - inter_y1)
    intersection = inter_width * inter_height
    
    # 합집합 면적
    area1 = w1 * h1
    area2 = w2 * h2
    union = area1 + area2 - intersection
    
    # IoU 계산
    iou = intersection / union if union > 0 else 0
    
    print(f"Box1 면적: {area1}")
    print(f"Box2 면적: {area2}")
    print(f"교집합 면적: {intersection}")
    print(f"합집합 면적: {union}")
    print(f"IoU: {iou:.4f}")
    
    return iou

# 테스트
box1 = (100, 100, 200, 150)  # x, y, w, h
box2 = (150, 120, 200, 150)

iou = calculate_iou(box1, box2)
```

### 실습 5: Confidence Score 필터링
```python
def filter_by_confidence(detections, threshold=0.5):
    """
    Confidence Score가 임계값 이상인 검출 결과만 필터링
    """
    # 예시 검출 결과
    sample_detections = [
        {'class': 'person', 'confidence': 0.95, 'bbox': (100, 100, 50, 100)},
        {'class': 'car', 'confidence': 0.42, 'bbox': (200, 150, 80, 60)},
        {'class': 'dog', 'confidence': 0.88, 'bbox': (300, 200, 60, 70)},
        {'class': 'person', 'confidence': 0.35, 'bbox': (400, 250, 45, 95)},
    ]
    
    filtered = [d for d in sample_detections if d['confidence'] >= threshold]
    
    print(f"전체 검출 수: {len(sample_detections)}")
    print(f"임계값 {threshold} 이상 검출 수: {len(filtered)}")
    print("\n필터링된 결과:")
    for det in filtered:
        print(f"  - {det['class']}: {det['confidence']:.2f}")
    
    return filtered

# 테스트
filtered_results = filter_by_confidence([], threshold=0.5)
```

## 4. YOLO 기본 개념 실습

### 실습 6: YOLO 설치 확인 및 첫 실행
```python
from ultralytics import YOLO
import cv2

def test_yolo_installation():
    """
    YOLO가 정상적으로 설치되었는지 확인
    """
    try:
        # YOLOv8 nano 모델 로드 (가장 가벼운 모델)
        print("YOLO 모델 로딩 중...")
        model = YOLO('yolov8n.pt')
        
        print("✓ YOLO 설치 성공!")
        print(f"모델 정보: {model.model}")
        print(f"지원 클래스 수: {len(model.names)}")
        
        # 클래스 이름 일부 출력
        print("\n지원 클래스 예시 (처음 10개):")
        for i, name in list(model.names.items())[:10]:
            print(f"  {i}: {name}")
        
        return model
        
    except Exception as e:
        print(f"✗ 오류 발생: {e}")
        return None

# 실행
# model = test_yolo_installation()
```

### 실습 7: 간단한 이미지 검출
```python
from ultralytics import YOLO
import cv2
import matplotlib.pyplot as plt

def simple_image_detection(image_path):
    """
    이미지에서 객체 검출 수행
    """
    # 모델 로드
    model = YOLO('yolov8n.pt')
    
    # 이미지 읽기
    img = cv2.imread(image_path)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # 객체 검출
    results = model(image_path)
    
    # 결과 시각화
    result_img = results[0].plot()
    result_img_rgb = cv2.cvtColor(result_img, cv2.COLOR_BGR2RGB)
    
    # 원본과 결과 비교
    fig, axes = plt.subplots(1, 2, figsize=(15, 6))
    
    axes[0].imshow(img_rgb)
    axes[0].set_title('Original Image')
    axes[0].axis('off')
    
    axes[1].imshow(result_img_rgb)
    axes[1].set_title('Detection Result')
    axes[1].axis('off')
    
    plt.tight_layout()
    plt.show()
    
    # 검출된 객체 정보 출력
    print("\n검출된 객체:")
    for r in results:
        boxes = r.boxes
        for box in boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            print(f"  - {model.names[cls]}: {conf:.2f}")

# 사용 예시 (샘플 이미지 경로 필요)
# simple_image_detection('sample.jpg')
```

## 5. 종합 실습 프로젝트

### 실습 8: 1단계 종합 프로젝트
```python
"""
1단계 종합 실습: 기본 환경 설정 확인 프로그램
"""
import cv2
import numpy as np
from ultralytics import YOLO
import sys

class YOLOSetupChecker:
    """YOLO 학습 환경 설정을 확인하는 클래스"""
    
    def __init__(self):
        self.results = {}
    
    def check_opencv(self):
        """OpenCV 설치 확인"""
        try:
            version = cv2.__version__
            self.results['opencv'] = f"✓ OpenCV {version} 설치됨"
            return True
        except:
            self.results['opencv'] = "✗ OpenCV 설치 필요"
            return False
    
    def check_numpy(self):
        """NumPy 설치 확인"""
        try:
            version = np.__version__
            self.results['numpy'] = f"✓ NumPy {version} 설치됨"
            return True
        except:
            self.results['numpy'] = "✗ NumPy 설치 필요"
            return False
    
    def check_yolo(self):
        """YOLO 설치 및 모델 로드 확인"""
        try:
            model = YOLO('yolov8n.pt')
            self.results['yolo'] = "✓ YOLO 설치 및 모델 로드 성공"
            return True
        except Exception as e:
            self.results['yolo'] = f"✗ YOLO 오류: {str(e)}"
            return False
    
    def check_webcam(self):
        """웹캠 접근 확인"""
        try:
            cap = cv2.VideoCapture(0)
            if cap.isOpened():
                ret, frame = cap.read()
                cap.release()
                if ret:
                    self.results['webcam'] = "✓ 웹캠 정상 작동"
                    return True
            self.results['webcam'] = "✗ 웹캠 접근 불가"
            return False
        except:
            self.results['webcam'] = "✗ 웹캠 오류"
            return False
    
    def run_all_checks(self):
        """모든 체크 실행"""
        print("=" * 50)
        print("YOLO 학습 환경 설정 확인")
        print("=" * 50)
        
        self.check_opencv()
        self.check_numpy()
        self.check_yolo()
        self.check_webcam()
        
        print("\n결과:")
        for key, value in self.results.items():
            print(f"  {value}")
        
        # 전체 성공 여부
        all_passed = all('✓' in v for v in self.results.values())
        
        print("\n" + "=" * 50)
        if all_passed:
            print("축하합니다! 모든 환경 설정이 완료되었습니다.")
            print("2단계로 진행할 준비가 되었습니다!")
        else:
            print("일부 설정이 완료되지 않았습니다.")
            print("위의 ✗ 표시된 항목을 확인해주세요.")
        print("=" * 50)

# 실행
if __name__ == "__main__":
    checker = YOLOSetupChecker()
    checker.run_all_checks()
```

## 6. 학습 체크리스트

1단계를 완료하기 위한 체크리스트입니다:

- [ ] Python 가상환경 생성 완료
- [ ] 필수 라이브러리 설치 완료
- [ ] OpenCV로 이미지 읽기/표시 가능
- [ ] 웹캠 영상 읽기 성공
- [ ] Bounding Box 개념 이해 및 그리기 가능
- [ ] IoU 계산 원리 이해
- [ ] Confidence Score 개념 이해
- [ ] YOLO 라이브러리 설치 및 모델 로드 성공
- [ ] 간단한 이미지 검출 실행 성공
- [ ] 종합 환경 체크 프로그램 실행 성공

## 다음 단계 준비

1단계를 완료했다면, 다음을 준비하세요:
- 테스트용 이미지 몇 장 다운로드
- GPU 사용 환경이라면 CUDA 설치 고려
- GitHub 계정 생성 (코드 관리용)
