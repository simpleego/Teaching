# YOLO 학습 마스터하기: 10단계 과정 - 2단계

## 2단계: 커스텀 데이터셋 준비 및 라벨링

이 단계에서는 직접 데이터를 수집하고, 라벨링하는 방법을 배웁니다. 예제로 **"과일 탐지"** 프로젝트를 진행하겠습니다.

## 2.1 데이터 수집

### 웹캠으로 이미지 수집하기

```python
import cv2
import os
from datetime import datetime

def collect_dataset():
    # 저장 디렉토리 생성
    save_dir = 'fruit_dataset'
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)
    
    # 웹캠 초기화
    cap = cv2.VideoCapture(0)
    
    img_count = 0
    print("데이터 수집 시작...")
    print("스페이스바: 사진 촬영, ESC: 종료")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # 촬영 가이드 표시
        cv2.putText(frame, f"Images: {img_count}", (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(frame, "SPACE: Capture, ESC: Exit", (10, 60),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        
        cv2.imshow('Data Collection', frame)
        
        key = cv2.waitKey(1) & 0xFF
        
        if key == 32:  # 스페이스바
            # 타임스탬프로 파일명 생성
            filename = f"{save_dir}/fruit_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{img_count}.jpg"
            cv2.imwrite(filename, frame)
            print(f"저장됨: {filename}")
            img_count += 1
            
        elif key == 27:  # ESC
            break
    
    cap.release()
    cv2.destroyAllWindows()
    print(f"총 {img_count}장의 이미지가 저장되었습니다.")

# 실행
# collect_dataset()
```

### 다양한 각도와 조건에서 촬영하기

```python
def collect_dataset_advanced():
    """다양한 조건에서 데이터 수집"""
    save_dir = 'fruit_dataset_advanced'
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)
    
    cap = cv2.VideoCapture(0)
    img_count = 0
    
    print("=== 데이터 수집 가이드 ===")
    print("1. 다양한 각도에서 촬영")
    print("2. 다양한 조명 조건에서 촬영")
    print("3. 물체를 여러 위치에 배치")
    print("4. 배경 변경해보기")
    print("5. 여러 물체 동시에 촬영")
    print("-" * 30)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # 촬영 가이드 표시
        h, w = frame.shape[:2]
        cv2.putText(frame, f"Count: {img_count}", (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        # 그리드 표시 (구도 가이드)
        cv2.line(frame, (w//3, 0), (w//3, h), (255, 0, 0), 1)
        cv2.line(frame, (2*w//3, 0), (2*w//3, h), (255, 0, 0), 1)
        cv2.line(frame, (0, h//3), (w, h//3), (255, 0, 0), 1)
        cv2.line(frame, (0, 2*h//3), (w, 2*h//3), (255, 0, 0), 1)
        
        cv2.imshow('Data Collection', frame)
        
        key = cv2.waitKey(1) & 0xFF
        
        if key == ord('1'):  # 사과
            filename = f"{save_dir}/apple_{img_count:04d}.jpg"
            cv2.imwrite(filename, frame)
            print(f"사과 저장: {filename}")
            img_count += 1
        elif key == ord('2'):  # 바나나
            filename = f"{save_dir}/banana_{img_count:04d}.jpg"
            cv2.imwrite(filename, frame)
            print(f"바나나 저장: {filename}")
            img_count += 1
        elif key == ord('3'):  # 오렌지
            filename = f"{save_dir}/orange_{img_count:04d}.jpg"
            cv2.imwrite(filename, frame)
            print(f"오렌지 저장: {filename}")
            img_count += 1
        elif key == 27:  # ESC
            break
    
    cap.release()
    cv2.destroyAllWindows()
```

## 2.2 이미지 전처리 및 증강

```python
import os
import cv2
import numpy as np
from glob import glob

class DataPreprocessor:
    def __init__(self, input_dir, output_dir):
        self.input_dir = input_dir
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
    
    def resize_images(self, size=(640, 640)):
        """이미지 크기 통일"""
        images = glob(f"{self.input_dir}/*.jpg")
        
        for img_path in images:
            img = cv2.imread(img_path)
            if img is None:
                continue
            
            # 리사이즈
            resized = cv2.resize(img, size)
            
            # 저장
            filename = os.path.basename(img_path)
            save_path = f"{self.output_dir}/resized_{filename}"
            cv2.imwrite(save_path, resized)
            print(f"리사이즈 완료: {filename}")
    
    def augment_image(self, image):
        """이미지 증강"""
        augmented = []
        
        # 원본
        augmented.append(image)
        
        # 좌우 반전
        flipped = cv2.flip(image, 1)
        augmented.append(flipped)
        
        # 밝기 조절
        bright = cv2.convertScaleAbs(image, alpha=1.2, beta=30)
        augmented.append(bright)
        
        # 대비 조절
        contrast = cv2.convertScaleAbs(image, alpha=1.5, beta=0)
        augmented.append(contrast)
        
        # 회전 (작은 각도)
        h, w = image.shape[:2]
        center = (w//2, h//2)
        matrix = cv2.getRotationMatrix2D(center, 5, 1.0)
        rotated = cv2.warpAffine(image, matrix, (w, h))
        augmented.append(rotated)
        
        return augmented
    
    def create_augmented_dataset(self):
        """증강 데이터셋 생성"""
        images = glob(f"{self.input_dir}/*.jpg")
        
        for img_path in images:
            img = cv2.imread(img_path)
            if img is None:
                continue
            
            # 증강
            augmented_images = self.augment_image(img)
            
            # 저장
            base_name = os.path.splitext(os.path.basename(img_path))[0]
            for i, aug_img in enumerate(augmented_images):
                save_path = f"{self.output_dir}/{base_name}_aug{i}.jpg"
                cv2.imwrite(save_path, aug_img)
            
            print(f"증강 완료: {base_name} -> {len(augmented_images)}장")

# 사용 예시
# preprocessor = DataPreprocessor('fruit_dataset', 'fruit_dataset_augmented')
# preprocessor.resize_images()
# preprocessor.create_augmented_dataset()
```

## 2.3 데이터 라벨링 (LabelImg 사용)

### LabelImg 설치 및 실행

```python
def install_labelimg():
    """LabelImg 설치 가이드"""
    print("=== LabelImg 설치 방법 ===")
    print("방법 1: pip로 설치")
    print("pip install labelImg")
    print()
    print("방법 2: 소스에서 설치")
    print("git clone https://github.com/tzutalin/labelImg.git")
    print("cd labelImg")
    print("pip install -r requirements/requirements-linux-python3.txt")
    print("make qt5py3")
    print()
    print("실행 방법:")
    print("labelImg  # 또는 python labelImg.py")
```

### LabelImg 사용법

```python
def labelimg_usage_guide():
    """LabelImg 사용법 가이드"""
    guide = """
    ===== LabelImg 사용법 =====
    
    1. 기본 단축키
    - w: 바운딩 박스 그리기
    - a: 이전 이미지
    - d: 다음 이미지
    - Ctrl + s: 저장
    - Ctrl + u: 이미지 디렉토리 불러오기
    - space: 현재 이미지 라벨링 완료 표시
    
    2. 라벨링 순서
    a) 'Open Dir'로 이미지 폴더 선택
    b) 'Change Save Dir'로 저장 폴더 선택
    c) 'Create RectBox' 또는 'w' 키로 박스 그리기
    d) 클래스 이름 입력
    e) 저장 (YOLO 포맷 선택)
    
    3. YOLO 포맷 설정
    - 메뉴에서 'YOLO' 선택
    - 저장 시 .txt 파일 생성됨
    """
    print(guide)
```

## 2.4 자동 라벨링 (사전 학습 모델 활용)

```python
from ultralytics import YOLO

class AutoLabeling:
    def __init__(self, model_path='yolov8n.pt'):
        self.model = YOLO(model_path)
        
    def auto_label_images(self, image_dir, output_dir, conf_threshold=0.5):
        """사전 학습 모델로 자동 라벨링"""
        import os
        from glob import glob
        
        os.makedirs(output_dir, exist_ok=True)
        
        images = glob(f"{image_dir}/*.jpg") + glob(f"{image_dir}/*.png")
        
        for img_path in images:
            # 이미지 로드
            img = cv2.imread(img_path)
            if img is None:
                continue
            
            # 객체 탐지
            results = self.model(img, conf=conf_threshold)[0]
            
            # 라벨 파일 생성
            txt_filename = os.path.basename(img_path).replace('.jpg', '.txt').replace('.png', '.txt')
            txt_path = os.path.join(output_dir, txt_filename)
            
            h, w = img.shape[:2]
            
            with open(txt_path, 'w') as f:
                for box in results.boxes:
                    # YOLO 포맷으로 변환
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    class_id = int(box.cls[0])
                    
                    # 정규화된 좌표로 변환
                    x_center = (x1 + x2) / 2 / w
                    y_center = (y1 + y2) / 2 / h
                    width = (x2 - x1) / w
                    height = (y2 - y1) / h
                    
                    f.write(f"{class_id} {x_center:.6f} {y_center:.6f} {width:.6f} {height:.6f}\n")
            
            print(f"라벨링 완료: {txt_filename}")
    
    def verify_labels(self, image_dir, label_dir):
        """라벨링 결과 시각화 검증"""
        images = glob(f"{image_dir}/*.jpg")
        
        for img_path in images:
            img = cv2.imread(img_path)
            if img is None:
                continue
            
            # 라벨 파일 읽기
            txt_path = img_path.replace('.jpg', '.txt').replace(image_dir, label_dir)
            if not os.path.exists(txt_path):
                continue
            
            h, w = img.shape[:2]
            
            # 바운딩 박스 그리기
            with open(txt_path, 'r') as f:
                for line in f:
                    class_id, xc, yc, bw, bh = map(float, line.strip().split())
                    
                    # 절대 좌표로 변환
                    x1 = int((xc - bw/2) * w)
                    y1 = int((yc - bh/2) * h)
                    x2 = int((xc + bw/2) * w)
                    y2 = int((yc + bh/2) * h)
                    
                    cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(img, f"class_{int(class_id)}", (x1, y1-10),
                               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            
            cv2.imshow('Verification', img)
            if cv2.waitKey(0) & 0xFF == ord('q'):
                break
        
        cv2.destroyAllWindows()

# 사용 예시
# labeler = AutoLabeling()
# labeler.auto_label_images('unlabeled_images', 'auto_labels')
# labeler.verify_labels('unlabeled_images', 'auto_labels')
```

## 2.5 데이터셋 분할

```python
import os
import random
import shutil
from glob import glob

class DatasetSplitter:
    def __init__(self, image_dir, label_dir, output_dir):
        self.image_dir = image_dir
        self.label_dir = label_dir
        self.output_dir = output_dir
        
        # 디렉토리 생성
        for split in ['train', 'val', 'test']:
            os.makedirs(f"{output_dir}/{split}/images", exist_ok=True)
            os.makedirs(f"{output_dir}/{split}/labels", exist_ok=True)
    
    def split_dataset(self, train_ratio=0.7, val_ratio=0.2, test_ratio=0.1):
        """데이터셋을 train/val/test로 분할"""
        # 모든 이미지 파일 가져오기
        images = glob(f"{self.image_dir}/*.jpg")
        
        # 랜덤 셔플
        random.shuffle(images)
        
        # 분할 인덱스 계산
        total = len(images)
        train_idx = int(total * train_ratio)
        val_idx = int(total * (train_ratio + val_ratio))
        
        # 분할
        train_images = images[:train_idx]
        val_images = images[train_idx:val_idx]
        test_images = images[val_idx:]
        
        # 파일 복사
        self._copy_files(train_images, 'train')
        self._copy_files(val_images, 'val')
        self._copy_files(test_images, 'test')
        
        # 분할 정보 출력
        print(f"전체 이미지: {total}장")
        print(f"Train: {len(train_images)}장 ({train_ratio*100:.0f}%)")
        print(f"Val: {len(val_images)}장 ({val_ratio*100:.0f}%)")
        print(f"Test: {len(test_images)}장 ({test_ratio*100:.0f}%)")
        
        return {
            'train': len(train_images),
            'val': len(val_images),
            'test': len(test_images)
        }
    
    def _copy_files(self, images, split):
        """이미지와 라벨 파일을 해당 split 디렉토리로 복사"""
        for img_path in images:
            # 이미지 복사
            img_name = os.path.basename(img_path)
            dest_img = f"{self.output_dir}/{split}/images/{img_name}"
            shutil.copy2(img_path, dest_img)
            
            # 라벨 파일 복사 (있는 경우)
            label_name = img_name.replace('.jpg', '.txt')
            label_path = f"{self.label_dir}/{label_name}"
            if os.path.exists(label_path):
                dest_label = f"{self.output_dir}/{split}/labels/{label_name}"
                shutil.copy2(label_path, dest_label)
    
    def create_data_yaml(self, class_names):
        """data.yaml 파일 생성"""
        yaml_content = f"""
# 데이터셋 경로
path: {self.output_dir}  # 데이터셋 루트 디렉토리
train: train/images  # 학습 이미지
val: val/images      # 검증 이미지
test: test/images    # 테스트 이미지 (선택사항)

# 클래스 정보
nc: {len(class_names)}  # 클래스 수
names: {class_names}    # 클래스 이름
"""
        yaml_path = f"{self.output_dir}/data.yaml"
        with open(yaml_path, 'w', encoding='utf-8') as f:
            f.write(yaml_content)
        
        print(f"data.yaml 생성 완료: {yaml_path}")
        return yaml_path

# 사용 예시
# splitter = DatasetSplitter(
#     image_dir='fruit_dataset/images',
#     label_dir='fruit_dataset/labels',
#     output_dir='fruit_yolo_dataset'
# )
# split_stats = splitter.split_dataset()
# class_names = ['apple', 'banana', 'orange']
# yaml_path = splitter.create_data_yaml(class_names)
```

## 2.6 데이터셋 통계 및 시각화

```python
import matplotlib.pyplot as plt
from collections import Counter

class DatasetAnalyzer:
    def __init__(self, dataset_dir):
        self.dataset_dir = dataset_dir
        self.stats = {}
    
    def analyze_dataset(self):
        """데이터셋 통계 분석"""
        for split in ['train', 'val', 'test']:
            label_dir = f"{self.dataset_dir}/{split}/labels"
            if not os.path.exists(label_dir):
                continue
            
            labels = glob(f"{label_dir}/*.txt")
            class_counts = Counter()
            box_counts = []
            
            for label_file in labels:
                with open(label_file, 'r') as f:
                    boxes = f.readlines()
                    box_counts.append(len(boxes))
                    
                    for box in boxes:
                        class_id = int(box.strip().split()[0])
                        class_counts[class_id] += 1
            
            self.stats[split] = {
                'images': len(labels),
                'boxes_per_image': np.mean(box_counts) if box_counts else 0,
                'class_counts': class_counts
            }
        
        return self.stats
    
    def plot_statistics(self):
        """통계 시각화"""
        fig, axes = plt.subplots(2, 2, figsize=(12, 10))
        
        # 이미지 수
        splits = list(self.stats.keys())
        img_counts = [self.stats[s]['images'] for s in splits]
        
        axes[0,0].bar(splits, img_counts)
        axes[0,0].set_title('Split별 이미지 수')
        axes[0,0].set_ylabel('이미지 수')
        
        # 클래스 분포 (train 기준)
        if 'train' in self.stats:
            class_counts = self.stats['train']['class_counts']
            classes = list(class_counts.keys())
            counts = list(class_counts.values())
            
            axes[0,1].bar(classes, counts)
            axes[0,1].set_title('클래스별 객체 수 (Train)')
            axes[0,1].set_xlabel('클래스 ID')
            axes[0,1].set_ylabel('객체 수')
        
        # 이미지당 평균 박스 수
        avg_boxes = [self.stats[s]['boxes_per_image'] for s in splits]
        
        axes[1,0].bar(splits, avg_boxes)
        axes[1,0].set_title('Split별 이미지당 평균 박스 수')
        axes[1,0].set_ylabel('평균 박스 수')
        
        plt.tight_layout()
        plt.show()
    
    def print_summary(self):
        """요약 정보 출력"""
        print("="*50)
        print("데이터셋 통계 요약")
        print("="*50)
        
        total_images = 0
        for split, stats in self.stats.items():
            print(f"\n{split.upper()} 세트:")
            print(f"  이미지 수: {stats['images']}")
            print(f"  이미지당 평균 박스: {stats['boxes_per_image']:.2f}")
            
            if stats['class_counts']:
                print("  클래스 분포:")
                for class_id, count in stats['class_counts'].items():
                    print(f"    클래스 {class_id}: {count}개")
            
            total_images += stats['images']
        
        print(f"\n총 이미지 수: {total_images}")
        print("="*50)

# 사용 예시
# analyzer = DatasetAnalyzer('fruit_yolo_dataset')
# analyzer.analyze_dataset()
# analyzer.print_summary()
# analyzer.plot_statistics()
```

## 2.7 데이터셋 품질 검사

```python
class DatasetQualityChecker:
    def __init__(self, dataset_dir):
        self.dataset_dir = dataset_dir
        
    def check_issues(self):
        """데이터셋 문제점 검사"""
        issues = []
        
        for split in ['train', 'val', 'test']:
            img_dir = f"{self.dataset_dir}/{split}/images"
            label_dir = f"{self.dataset_dir}/{split}/labels"
            
            if not os.path.exists(img_dir):
                continue
            
            # 이미지-라벨 짝 확인
            images = set([f.replace('.jpg', '') for f in os.listdir(img_dir) if f.endswith('.jpg')])
            labels = set([f.replace('.txt', '') for f in os.listdir(label_dir) if f.endswith('.txt')])
            
            # 라벨이 없는 이미지
            missing_labels = images - labels
            if missing_labels:
                issues.append(f"{split}: 라벨이 없는 이미지 {len(missing_labels)}개")
            
            # 이미지가 없는 라벨
            missing_images = labels - images
            if missing_images:
                issues.append(f"{split}: 이미지가 없는 라벨 {len(missing_images)}개")
            
            # 라벨 파일 내용 검사
            for label_file in os.listdir(label_dir):
                if not label_file.endswith('.txt'):
                    continue
                
                label_path = f"{label_dir}/{label_file}"
                with open(label_path, 'r') as f:
                    for line_num, line in enumerate(f, 1):
                        parts = line.strip().split()
                        
                        # 형식 검사
                        if len(parts) != 5:
                            issues.append(f"{split}/{label_file}: 라인 {line_num} - 잘못된 형식")
                            continue
                        
                        # 값 범위 검사
                        try:
                            class_id, x, y, w, h = map(float, parts)
                            if not (0 <= x <= 1 and 0 <= y <= 1 and 0 <= w <= 1 and 0 <= h <= 1):
                                issues.append(f"{split}/{label_file}: 라인 {line_num} - 좌표 범위 오류")
                        except ValueError:
                            issues.append(f"{split}/{label_file}: 라인 {line_num} - 숫자 변환 오류")
        
        return issues
    
    def visualize_samples(self, num_samples=5):
        """샘플 이미지 시각화"""
        for split in ['train', 'val', 'test']:
            img_dir = f"{self.dataset_dir}/{split}/images"
            if not os.path.exists(img_dir):
                continue
            
            images = glob(f"{img_dir}/*.jpg")[:num_samples]
            
            if not images:
                continue
            
            fig, axes = plt.subplots(1, len(images), figsize=(15, 5))
            if len(images) == 1:
                axes = [axes]
            
            for idx, img_path in enumerate(images):
                img = cv2.imread(img_path)
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                
                # 라벨 파일 로드
                label_path = img_path.replace('images', 'labels').replace('.jpg', '.txt')
                if os.path.exists(label_path):
                    h, w = img.shape[:2]
                    with open(label_path, 'r') as f:
                        for line in f:
                            class_id, xc, yc, bw, bh = map(float, line.strip().split())
                            
                            # 바운딩 박스 그리기
                            x1 = int((xc - bw/2) * w)
                            y1 = int((yc - bh/2) * h)
                            x2 = int((xc + bw/2) * w)
                            y2 = int((yc + bh/2) * h)
                            
                            cv2.rectangle(img, (x1, y1), (x2, y2), (255, 0, 0), 2)
                
                axes[idx].imshow(img)
                axes[idx].set_title(f'{split} {idx+1}')
                axes[idx].axis('off')
            
            plt.tight_layout()
            plt.show()

# 사용 예시
# checker = DatasetQualityChecker('fruit_yolo_dataset')
# issues = checker.check_issues()
# if issues:
#     print("발견된 문제점:")
#     for issue in issues:
#         print(f"  - {issue}")
# else:
#     print("✅ 모든 검사 통과!")
# checker.visualize_samples()
```

## 2.8 체크리스트 및 문제 해결

```python
class DatasetPreparationChecklist:
    def __init__(self):
        self.checklist = {
            "데이터 수집": [
                "최소 100장 이상의 이미지 수집",
                "다양한 각도에서 촬영",
                "다양한 조명 조건에서 촬영",
                "다양한 배경에서 촬영",
                "물체가 여러 개 있는 경우도 포함"
            ],
            "데이터 전처리": [
                "이미지 크기 통일 (640x640 권장)",
                "데이터 증강 적용",
                "이미지 포맷 통일 (JPG 권장)"
            ],
            "라벨링": [
                "모든 이미지 라벨링 완료",
                "바운딩 박스가 물체에 정확히 맞는지 확인",
                "클래스 이름 일관성 유지",
                "YOLO 포맷으로 저장"
            ],
            "데이터셋 구성": [
                "Train/Val/Test 분할 완료",
                "data.yaml 파일 생성",
                "각 split의 이미지-라벨 짝 확인",
                "이상치/오류 데이터 제거"
            ]
        }
    
    def run_checklist(self):
        print("="*60)
        print("데이터셋 준비 체크리스트")
        print("="*60)
        
        all_checked = True
        for category, items in self.checklist.items():
            print(f"\n[{category}]")
            for item in items:
                response = input(f"  ✓ {item} (y/n): ").strip().lower()
                if response == 'y':
                    print(f"    ✅ {item}")
                else:
                    print(f"    ❌ {item}")
                    all_checked = False
        
        if all_checked:
            print("\n🎉 모든 준비 완료! 다음 단계로 진행하세요!")
        else:
            print("\n⚠️  체크되지 않은 항목을 먼저 완료해주세요.")
        
        return all_checked

# 실행
# checklist = DatasetPreparationChecklist()
# checklist.run_checklist()
```

## 🎯 2단계 최종 정리

### 완료 목표:
✅ 데이터 수집 (최소 100장 이상)
✅ 데이터 전처리 및 증강
✅ 모든 이미지 라벨링 완료
✅ Train/Val/Test 분할
✅ data.yaml 파일 생성
✅ 데이터셋 품질 검사 완료

### 다음 단계 예고:
**3단계: 데이터셋 설정 및 YAML 파일 구성**
- data.yaml 파일 상세 설정
- 클래스 매핑
- 데이터 로더 테스트

---

**실습 과제**: 과일 데이터셋을 만들어보세요! (사과, 바나나, 오렌지 중 2-3개 클래스 선택)
