# YOLO 학습 2단계: 사전 학습된 YOLO 모델로 이미지 객체 검출

## 1. YOLO 모델 종류 이해하기

### 실습 1: 다양한 YOLO 모델 비교
```python
from ultralytics import YOLO
import time

def compare_yolo_models():
    """
    YOLOv8의 다양한 모델 크기 비교
    n(nano) < s(small) < m(medium) < l(large) < x(xlarge)
    """
    models_info = {
        'yolov8n.pt': 'Nano - 가장 빠르고 가벼움',
        'yolov8s.pt': 'Small - 속도와 정확도 균형',
        'yolov8m.pt': 'Medium - 중간 크기',
        'yolov8l.pt': 'Large - 높은 정확도',
        'yolov8x.pt': 'XLarge - 최고 정확도'
    }
    
    print("=" * 60)
    print("YOLOv8 모델 종류")
    print("=" * 60)
    
    for model_name, description in models_info.items():
        print(f"\n{model_name}")
        print(f"  설명: {description}")
        
        try:
            # 모델 로드 시간 측정
            start_time = time.time()
            model = YOLO(model_name)
            load_time = time.time() - start_time
            
            # 모델 정보
            print(f"  로딩 시간: {load_time:.2f}초")
            print(f"  파라미터 수: ~{model.model.parameters().__sizeof__() / 1e6:.1f}M")
            print(f"  지원 클래스: {len(model.names)}개")
            
        except Exception as e:
            print(f"  상태: 다운로드 필요 (첫 실행 시 자동 다운로드)")
    
    print("\n" + "=" * 60)
    print("권장: 학습용으로는 yolov8n.pt 또는 yolov8s.pt 사용")
    print("=" * 60)

# 실행
# compare_yolo_models()
```

## 2. 기본 이미지 객체 검출

### 실습 2: 단일 이미지 검출
```python
from ultralytics import YOLO
import cv2
import matplotlib.pyplot as plt
from PIL import Image
import requests
from io import BytesIO

def download_sample_image():
    """
    테스트용 샘플 이미지 다운로드
    """
    # 샘플 이미지 URL (무료 이미지)
    url = "https://ultralytics.com/images/bus.jpg"
    
    try:
        response = requests.get(url)
        img = Image.open(BytesIO(response.content))
        img.save('sample_image.jpg')
        print("✓ 샘플 이미지 다운로드 완료: sample_image.jpg")
        return 'sample_image.jpg'
    except:
        print("✗ 이미지 다운로드 실패")
        return None

def detect_objects_in_image(image_path, model_name='yolov8n.pt'):
    """
    이미지에서 객체 검출 수행
    
    Args:
        image_path: 이미지 파일 경로
        model_name: 사용할 YOLO 모델
    """
    print(f"\n{'='*60}")
    print(f"이미지 객체 검출 시작")
    print(f"{'='*60}")
    
    # 1. 모델 로드
    print(f"\n1. 모델 로딩: {model_name}")
    model = YOLO(model_name)
    
    # 2. 이미지 로드
    print(f"2. 이미지 로딩: {image_path}")
    img = cv2.imread(image_path)
    
    if img is None:
        print("✗ 이미지를 찾을 수 없습니다!")
        return
    
    print(f"   이미지 크기: {img.shape[1]}x{img.shape[0]}")
    
    # 3. 객체 검출
    print("3. 객체 검출 수행 중...")
    results = model(image_path)
    
    # 4. 결과 분석
    print("\n4. 검출 결과:")
    print("-" * 60)
    
    result = results[0]
    boxes = result.boxes
    
    detected_objects = {}
    
    for box in boxes:
        # 클래스 정보
        cls_id = int(box.cls[0])
        cls_name = model.names[cls_id]
        
        # 신뢰도
        confidence = float(box.conf[0])
        
        # 바운딩 박스 좌표 (xyxy 형식)
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        
        # 통계 집계
        if cls_name not in detected_objects:
            detected_objects[cls_name] = []
        detected_objects[cls_name].append(confidence)
        
        print(f"  [{cls_name}] 신뢰도: {confidence:.2f} | 위치: ({int(x1)}, {int(y1)}) ~ ({int(x2)}, {int(y2)})")
    
    # 5. 검출 통계
    print("\n5. 검출 통계:")
    print("-" * 60)
    for obj_name, confidences in detected_objects.items():
        print(f"  {obj_name}: {len(confidences)}개 (평균 신뢰도: {sum(confidences)/len(confidences):.2f})")
    
    # 6. 결과 시각화
    print("\n6. 결과 시각화")
    
    # 원본 이미지
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # 검출 결과가 그려진 이미지
    result_img = result.plot()
    result_img_rgb = cv2.cvtColor(result_img, cv2.COLOR_BGR2RGB)
    
    # 플롯
    fig, axes = plt.subplots(1, 2, figsize=(16, 8))
    
    axes[0].imshow(img_rgb)
    axes[0].set_title('원본 이미지', fontsize=14, pad=10)
    axes[0].axis('off')
    
    axes[1].imshow(result_img_rgb)
    axes[1].set_title(f'검출 결과 (총 {len(boxes)}개 객체)', fontsize=14, pad=10)
    axes[1].axis('off')
    
    plt.tight_layout()
    plt.savefig('detection_result.jpg', dpi=150, bbox_inches='tight')
    plt.show()
    
    print("✓ 결과 이미지 저장: detection_result.jpg")
    print(f"\n{'='*60}")
    
    return results

# 실행 예시
# image_path = download_sample_image()
# if image_path:
#     results = detect_objects_in_image(image_path)
```

## 3. 검출 파라미터 조정

### 실습 3: Confidence Threshold 조정
```python
from ultralytics import YOLO
import cv2
import matplotlib.pyplot as plt

def test_confidence_thresholds(image_path):
    """
    다양한 confidence threshold 값으로 검출 결과 비교
    """
    model = YOLO('yolov8n.pt')
    
    # 테스트할 threshold 값들
    thresholds = [0.25, 0.50, 0.75]
    
    fig, axes = plt.subplots(1, len(thresholds), figsize=(18, 6))
    
    for idx, conf_threshold in enumerate(thresholds):
        # confidence threshold를 적용하여 검출
        results = model(image_path, conf=conf_threshold)
        
        # 결과 이미지 생성
        result_img = results[0].plot()
        result_img_rgb = cv2.cvtColor(result_img, cv2.COLOR_BGR2RGB)
        
        # 검출된 객체 수
        num_detections = len(results[0].boxes)
        
        # 시각화
        axes[idx].imshow(result_img_rgb)
        axes[idx].set_title(f'Confidence ≥ {conf_threshold}\n검출: {num_detections}개', 
                           fontsize=12)
        axes[idx].axis('off')
        
        print(f"Confidence Threshold {conf_threshold}: {num_detections}개 검출")
    
    plt.tight_layout()
    plt.savefig('confidence_comparison.jpg', dpi=150, bbox_inches='tight')
    plt.show()
    
    print("\n✓ 비교 결과 저장: confidence_comparison.jpg")
    print("\n분석:")
    print("  - Threshold가 낮을수록 더 많은 객체 검출 (False Positive 증가 가능)")
    print("  - Threshold가 높을수록 정확한 객체만 검출 (False Negative 증가 가능)")
    print("  - 기본값 0.25가 대부분의 경우 적절함")

# 실행
# test_confidence_thresholds('sample_image.jpg')
```

### 실습 4: IoU Threshold 조정
```python
from ultralytics import YOLO
import cv2
import matplotlib.pyplot as plt

def test_iou_thresholds(image_path):
    """
    IoU threshold 조정 테스트 (NMS - Non-Maximum Suppression)
    """
    model = YOLO('yolov8n.pt')
    
    # 테스트할 IoU threshold 값들
    iou_thresholds = [0.3, 0.5, 0.7]
    
    fig, axes = plt.subplots(1, len(iou_thresholds), figsize=(18, 6))
    
    for idx, iou_threshold in enumerate(iou_thresholds):
        # IoU threshold를 적용하여 검출
        results = model(image_path, iou=iou_threshold)
        
        # 결과 이미지 생성
        result_img = results[0].plot()
        result_img_rgb = cv2.cvtColor(result_img, cv2.COLOR_BGR2RGB)
        
        # 검출된 객체 수
        num_detections = len(results[0].boxes)
        
        # 시각화
        axes[idx].imshow(result_img_rgb)
        axes[idx].set_title(f'IoU Threshold: {iou_threshold}\n검출: {num_detections}개', 
                           fontsize=12)
        axes[idx].axis('off')
        
        print(f"IoU Threshold {iou_threshold}: {num_detections}개 검출")
    
    plt.tight_layout()
    plt.savefig('iou_comparison.jpg', dpi=150, bbox_inches='tight')
    plt.show()
    
    print("\n✓ 비교 결과 저장: iou_comparison.jpg")
    print("\n분석:")
    print("  - IoU가 낮을수록 중복 박스 제거 기준이 엄격함")
    print("  - IoU가 높을수록 중복 박스를 더 많이 허용함")
    print("  - 기본값 0.45가 대부분의 경우 적절함")

# 실행
# test_iou_thresholds('sample_image.jpg')
```

### 실습 5: 이미지 크기 조정
```python
from ultralytics import YOLO
import cv2
import matplotlib.pyplot as plt
import time

def test_image_sizes(image_path):
    """
    다양한 이미지 크기로 검출 속도와 정확도 비교
    """
    model = YOLO('yolov8n.pt')
    
    # 테스트할 이미지 크기 (픽셀)
    image_sizes = [320, 640, 1280]
    
    results_data = []
    
    print("\n이미지 크기별 검출 성능 비교")
    print("=" * 70)
    
    for img_size in image_sizes:
        # 검출 수행 및 시간 측정
        start_time = time.time()
        results = model(image_path, imgsz=img_size)
        inference_time = time.time() - start_time
        
        num_detections = len(results[0].boxes)
        
        results_data.append({
            'size': img_size,
            'time': inference_time,
            'detections': num_detections
        })
        
        print(f"크기: {img_size}x{img_size} | "
              f"시간: {inference_time:.3f}초 | "
              f"검출: {num_detections}개")
    
    print("=" * 70)
    print("\n분석:")
    print("  - 작은 이미지: 빠르지만 작은 객체 놓칠 수 있음")
    print("  - 큰 이미지: 느리지만 작은 객체도 잘 검출")
    print("  - 기본값 640이 속도와 정확도의 좋은 균형점")
    
    return results_data

# 실행
# results = test_image_sizes('sample_image.jpg')
```

## 4. 특정 클래스만 검출하기

### 실습 6: 클래스 필터링
```python
from ultralytics import YOLO
import cv2
import matplotlib.pyplot as plt

def detect_specific_classes(image_path, target_classes):
    """
    특정 클래스만 검출
    
    Args:
        image_path: 이미지 경로
        target_classes: 검출할 클래스 리스트 (예: ['person', 'car', 'dog'])
    """
    model = YOLO('yolov8n.pt')
    
    # COCO 데이터셋 클래스 이름 확인
    print("사용 가능한 클래스:")
    print(model.names)
    
    # 클래스 이름을 ID로 변환
    class_ids = []
    for cls_name in target_classes:
        for idx, name in model.names.items():
            if name == cls_name:
                class_ids.append(idx)
                break
    
    print(f"\n검출할 클래스: {target_classes}")
    print(f"클래스 ID: {class_ids}")
    
    # 특정 클래스만 검출
    results = model(image_path, classes=class_ids)
    
    # 결과 시각화
    result_img = results[0].plot()
    result_img_rgb = cv2.cvtColor(result_img, cv2.COLOR_BGR2RGB)
    
    plt.figure(figsize=(12, 8))
    plt.imshow(result_img_rgb)
    plt.title(f'검출 클래스: {", ".join(target_classes)}', fontsize=14)
    plt.axis('off')
    plt.tight_layout()
    plt.savefig('class_filtered_result.jpg', dpi=150, bbox_inches='tight')
    plt.show()
    
    # 검출 결과 출력
    print(f"\n검출된 객체:")
    for box in results[0].boxes:
        cls_id = int(box.cls[0])
        cls_name = model.names[cls_id]
        confidence = float(box.conf[0])
        print(f"  - {cls_name}: {confidence:.2f}")
    
    return results

# 실행 예시
# detect_specific_classes('sample_image.jpg', ['person', 'car', 'bus'])
```

### 실습 7: COCO 데이터셋 클래스 탐색
```python
from ultralytics import YOLO

def explore_coco_classes():
    """
    COCO 데이터셋의 80개 클래스 탐색
    """
    model = YOLO('yolov8n.pt')
    
    print("\n" + "=" * 60)
    print("COCO 데이터셋 클래스 목록 (총 80개)")
    print("=" * 60)
    
    # 카테고리별로 분류
    categories = {
        '사람': [0],
        '차량': [1, 2, 3, 4, 5, 6, 7, 8],
        '동물': [14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        '가구': [56, 57, 58, 59, 60, 61],
        '전자기기': [62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73],
        '음식': [46, 47, 48, 49, 50, 51, 52, 53],
        '스포츠': [32, 33, 34, 35, 36, 37, 38, 39, 40, 41]
    }
    
    for category, class_ids in categories.items():
        print(f"\n[{category}]")
        for cls_id in class_ids:
            if cls_id in model.names:
                print(f"  {cls_id:2d}: {model.names[cls_id]}")
    
    print("\n" + "=" * 60)
    print("전체 클래스 목록:")
    for idx, name in sorted(model.names.items()):
        print(f"  {idx:2d}: {name}")
    
    return model.names

# 실행
# explore_coco_classes()
```

## 5. 배치 처리

### 실습 8: 여러 이미지 한번에 처리
```python
from ultralytics import YOLO
import cv2
import matplotlib.pyplot as plt
import os
from pathlib import Path

def batch_detection(image_folder, output_folder='output'):
    """
    폴더 내 모든 이미지에 대해 객체 검출 수행
    
    Args:
        image_folder: 이미지가 있는 폴더 경로
        output_folder: 결과를 저장할 폴더 경로
    """
    # 출력 폴더 생성
    Path(output_folder).mkdir(exist_ok=True)
    
    model = YOLO('yolov8n.pt')
    
    # 지원하는 이미지 확장자
    image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.webp']
    
    # 폴더 내 이미지 파일 찾기
    image_files = []
    for ext in image_extensions:
        image_files.extend(Path(image_folder).glob(f'*{ext}'))
    
    print(f"\n총 {len(image_files)}개 이미지 발견")
    print("=" * 60)
    
    results_summary = []
    
    for idx, image_path in enumerate(image_files, 1):
        print(f"\n[{idx}/{len(image_files)}] 처리 중: {image_path.name}")
        
        # 검출 수행
        results = model(str(image_path))
        
        # 검출된 객체 수
        num_detections = len(results[0].boxes)
        
        # 결과 이미지 저장
        result_img = results[0].plot()
        output_path = os.path.join(output_folder, f'result_{image_path.name}')
        cv2.imwrite(output_path, result_img)
        
        # 통계 수집
        detected_classes = {}
        for box in results[0].boxes:
            cls_name = model.names[int(box.cls[0])]
            detected_classes[cls_name] = detected_classes.get(cls_name, 0) + 1
        
        results_summary.append({
            'file': image_path.name,
            'total': num_detections,
            'classes': detected_classes
        })
        
        print(f"  검출: {num_detections}개 - {detected_classes}")
    
    # 전체 요약
    print("\n" + "=" * 60)
    print("배치 처리 완료")
    print("=" * 60)
    
    for item in results_summary:
        print(f"\n{item['file']}: {item['total']}개")
        for cls_name, count in item['classes'].items():
            print(f"  - {cls_name}: {count}개")
    
    print(f"\n✓ 모든 결과가 '{output_folder}' 폴더에 저장되었습니다.")
    
    return results_summary

# 실행 예시
# batch_detection('images', 'detection_results')
```

## 6. 검출 결과 저장 및 활용

### 실습 9: 검출 결과를 JSON으로 저장
```python
from ultralytics import YOLO
import json
import cv2

def save_detection_to_json(image_path, output_json='detection_result.json'):
    """
    검출 결과를 JSON 파일로 저장
    """
    model = YOLO('yolov8n.pt')
    
    # 검출 수행
    results = model(image_path)
    result = results[0]
    
    # 이미지 정보
    img = cv2.imread(image_path)
    img_height, img_width = img.shape[:2]
    
    # JSON 구조 생성
    detection_data = {
        'image': {
            'path': image_path,
            'width': img_width,
            'height': img_height
        },
        'detections': []
    }
    
    # 각 검출 객체 정보 저장
    for box in result.boxes:
        # 클래스 정보
        cls_id = int(box.cls[0])
        cls_name = model.names[cls_id]
        
        # 신뢰도
        confidence = float(box.conf[0])
        
        # 바운딩 박스 (xyxy 형식)
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        
        # 중심점과 크기 계산
        center_x = (x1 + x2) / 2
        center_y = (y1 + y2) / 2
        width = x2 - x1
        height = y2 - y1
        
        detection_data['detections'].append({
            'class_id': cls_id,
            'class_name': cls_name,
            'confidence': round(confidence, 4),
            'bbox': {
                'x1': round(x1, 2),
                'y1': round(y1, 2),
                'x2': round(x2, 2),
                'y2': round(y2, 2),
                'center_x': round(center_x, 2),
                'center_y': round(center_y, 2),
                'width': round(width, 2),
                'height': round(height, 2)
            }
        })
    
    # JSON 파일로 저장
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(detection_data, f, indent=2, ensure_ascii=False)
    
    print(f"✓ 검출 결과 저장: {output_json}")
    print(f"  총 {len(detection_data['detections'])}개 객체 검출")
    
    # 결과 미리보기
    print("\nJSON 내용 미리보기:")
    print(json.dumps(detection_data, indent=2, ensure_ascii=False)[:500] + "...")
    
    return detection_data

# 실행
# detection_data = save_detection_to_json('sample_image.jpg')
```

### 실습 10: 검출 결과를 CSV로 저장
```python
from ultralytics import YOLO
import csv
import cv2

def save_detection_to_csv(image_path, output_csv='detection_result.csv'):
    """
    검출 결과를 CSV 파일로 저장
    """
    model = YOLO('yolov8n.pt')
    
    # 검출 수행
    results = model(image_path)
    result = results[0]
    
    # CSV 파일 작성
    with open(output_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        
        # 헤더
        writer.writerow([
            'Image', 'Class_ID', 'Class_Name', 'Confidence',
            'X1', 'Y1', 'X2', 'Y2', 'Width', 'Height'
        ])
        
        # 각 검출 결과
        for box in result.boxes:
            cls_id = int(box.cls[0])
            cls_name = model.names[cls_id]
            confidence = float(box.conf[0])
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            width = x2 - x1
            height = y2 - y1
            
            writer.writerow([
                image_path, cls_id, cls_name, f'{confidence:.4f}',
                f'{x1:.2f}', f'{y1:.2f}', f'{x2:.2f}', f'{y2:.2f}',
                f'{width:.2f}', f'{height:.2f}'
            ])
    
    print(f"✓ 검출 결과 CSV 저장: {output_csv}")
    
    # CSV 내용 미리보기
    print("\nCSV 내용:")
    with open(output_csv, 'r', encoding='utf-8') as f:
        for i, line in enumerate(f):
            print(line.strip())
            if i >= 5:  # 처음 6줄만 출력
                print("...")
                break

# 실행
# save_detection_to_csv('sample_image.jpg')
```

## 7. 커스텀 시각화

### 실습 11: 나만의 검출 결과 그리기
```python
from ultralytics import YOLO
import cv2
import numpy as np

def custom_visualization(image_path):
    """
    커스텀 스타일로 검출 결과 시각화
    """
    model = YOLO('yolov8n.pt')
    
    # 이미지 로드 및 검출
    img = cv2.imread(image_path)
    results = model(image_path)
    result = results[0]
    
    # 복사본 생성 (원본 보존)
    img_draw = img.copy()
    
    # 색상 팔레트 (BGR 형식)
    colors = [
        (255, 0, 0),    # 파랑
        (0, 255, 0),    # 초록
        (0, 0, 255),    # 빨강
        (255, 255, 0),  # 시안
        (255, 0, 255),  # 마젠타
        (0, 255, 255),  # 노랑
    ]
    
    # 각 객체 그리기
    for idx, box in enumerate(result.boxes):
        # 정보 추출
        cls_id = int(box.cls[0])
        cls_name = model.names[cls_id]
        confidence = float(box.conf[0])
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
        
        # 색상 선택
        color = colors[cls_id % len(colors)]
        
        # 바운딩 박스 그리기 (두꺼운 선)
        cv2.rectangle(img_draw, (x1, y1), (x2, y2), color, 3)
        
        # 코너 강조 (작은 사각형)
        corner_size = 15
        cv2.rectangle(img_draw, (x1, y1), (x1+corner_size, y1+corner_size), color, -1)
        cv2.rectangle(img_draw, (x2-corner_size, y1), (x2, y1+corner_size), color, -1)
        cv2.rectangle(img_draw, (x1, y2-corner_size), (x1+corner_size, y2), color, -1)
        cv2.rectangle(img_draw, (x2-corner_size, y2-corner_size), (x2, y2), color, -1)
        
        # 라벨 텍스트
        label = f'{cls_name} {confidence:.2f}'
        
        # 텍스트 크기 측정
        font = cv2.FONT_HERSHEY_DUPLEX
        font_scale = 0.7
        thickness = 2
        (text_width, text_height), baseline = cv2.getTextSize(
            label, font, font_scale, thickness
        )
        
        # 텍스트 배경 (둥근 사각형)
        cv2.rectangle(
            img_draw,
            (x1, y1 - text_height - 15),
            (x1 + text_width + 10, y1),
            color,
            -1
        )
        
        # 텍스트 추가
        cv2.putText(
            img_draw,
            label,
            (x1 + 5, y1 - 8),
            font,
            font_scale,
            (255, 255, 255),  # 흰색
            thickness,
            cv2.LINE_AA
        )
        
        # 중심점 표시
        center_x = (x1 + x2) // 2
        center_y = (y1 + y2) // 2
        cv2.circle(img_draw, (center_x, center_y), 5, color, -1)
    
    # 정보 패널 추가
    panel_height = 60
    panel = np.zeros((panel_height, img_draw.shape[1], 3), dtype=np.uint8)
    panel[:] = (50, 50, 50)  # 어두운 회색
    
    info_text = f'Total Detections: {len(result.boxes)} | Model: YOLOv8n'
    cv2.putText(panel, info_text, (20, 35), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
    
    # 패널을 이미지 상단에 추가
    img_with_panel = np.vstack([panel, img_draw])
    
    # 결과 표시
    cv2.imwrite('custom_detection.jpg', img_with_panel)
    
    # matplotlib으로 표시
    import matplotlib.pyplot as plt
    img_rgb = cv2.cvtColor(img_with_panel, cv2.COLOR_BGR2RGB)
    plt.figure(figsize=(14, 10))
    plt.imshow(img_rgb)
    plt.title('Custom Detection Visualization', fontsize=16, pad=15)
    plt.axis('off')
    plt.tight_layout()
    plt.show()
    
    print("✓ 커스텀 시각화 완료: custom_detection.jpg")

# 실행
# custom_visualization('sample_image.jpg')
```

## 8. 종합 실습 프로젝트

### 실습 12: 2단계 종합 프로젝트 - 이미지 분석 도구
```python
from ultralytics import YOLO
import cv2
import json
import matplotlib.pyplot as plt
from pathlib import Path
import time

class ImageObjectDetector:
    """
    이미지 객체 검출 종합 도구
    """
    
    def __init__(self, model_name='yolov8n.pt'):
        """
        Args:
            model_name: 사용할 YOLO 모델
        """
        print(f"모델 로딩: {model_name}")
        self.model = YOLO(model_name)
        self.model_name = model_name
        print("✓ 모델 로드 완료\n")
    
    def detect(self, image_path, conf=0.25, iou=0.45, classes=None):
        """
        객체 검출 수행
        
        Args:
            image_path: 이미지 경로
            conf: confidence threshold
            iou: IoU threshold
            classes: 검출할 클래스 리스트 (None이면 모든 클래스)
        
        Returns:
            검출 결과
        """
        print(f"이미지 검출 시작: {image_path}")
        print(f"  - Confidence Threshold: {conf}")
        print(f"  - IoU Threshold: {iou}")
        
        start_time = time.time()
        
        # 검출 수행
        if classes:
            results = self.model(image_path, conf=conf, iou=iou, classes=classes)
        else:
            results = self.model(image_path, conf=conf, iou=iou)
        
        inference_time = time.time() - start_time
        
        print(f"  - 추론 시간: {inference_time:.3f}초")
        print(f"  - 검출 객체: {len(results[0].boxes)}개\n")
        
        return results, inference_time
    
    def analyze(self, results):
        """
        검출 결과 분석
        
        Returns:
            분석 정보 딕셔너리
        """
        result = results[0]
        boxes = result.boxes
        
        analysis = {
            'total_objects': len(boxes),
            'classes': {},
            'confidence_stats': {
                'min': 1.0,
                'max': 0.0,
                'avg': 0.0
            },
            'bbox_sizes': []
        }
        
        confidences = []
        
        for box in boxes:
            # 클래스 정보
            cls_id = int(box.cls[0])
            cls_name = self.model.names[cls_id]
            
            if cls_name not in analysis['classes']:
                analysis['classes'][cls_name] = 0
            analysis['classes'][cls_name] += 1
            
            # 신뢰도 통계
            conf = float(box.conf[0])
            confidences.append(conf)
            
            # 바운딩 박스 크기
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            width = x2 - x1
            height = y2 - y1
            area = width * height
            analysis['bbox_sizes'].append({
                'width': width,
                'height': height,
                'area': area
            })
        
        # 신뢰도 통계 계산
        if confidences:
            analysis['confidence_stats']['min'] = min(confidences)
            analysis['confidence_stats']['max'] = max(confidences)
            analysis['confidence_stats']['avg'] = sum(confidences) / len(confidences)
        
        return analysis
    
    def visualize(self, image_path, results, save_path='result.jpg'):
        """
        검출 결과 시각화 및 저장
        """
        # 결과 이미지 생성
        result_img = results[0].plot()
        
        # 저장
        cv2.imwrite(save_path, result_img)
        
        # 표시
        result_img_rgb = cv2.cvtColor(result_img, cv2.COLOR_BGR2RGB)
        
        plt.figure(figsize=(14, 10))
        plt.imshow(result_img_rgb)
        plt.title('Detection Result', fontsize=16, pad=15)
        plt.axis('off')
        plt.tight_layout()
        plt.savefig(save_path.replace('.jpg', '_plot.jpg'), dpi=150, bbox_inches='tight')
        plt.show()
        
        print(f"✓ 결과 저장: {save_path}\n")
    
    def save_report(self, image_path, results, analysis, 
                   inference_time, output_path='report.json'):
        """
        검출 보고서를 JSON으로 저장
        """
        result = results[0]
        
        # 이미지 정보
        img = cv2.imread(image_path)
        img_height, img_width = img.shape[:2]
        
        report = {
            'metadata': {
                'image_path': image_path,
                'image_size': {
                    'width': img_width,
                    'height': img_height
                },
                'model': self.model_name,
                'inference_time': round(inference_time, 4)
            },
            'summary': {
                'total_objects': analysis['total_objects'],
                'classes_detected': analysis['classes'],
                'confidence': analysis['confidence_stats']
            },
            'detections': []
        }
        
        # 각 검출 객체 정보
        for idx, box in enumerate(result.boxes):
            cls_id = int(box.cls[0])
            cls_name = self.model.names[cls_id]
            confidence = float(box.conf[0])
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            
            report['detections'].append({
                'id': idx,
                'class_id': cls_id,
                'class_name': cls_name,
                'confidence': round(confidence, 4),
                'bbox': {
                    'x1': round(x1, 2),
                    'y1': round(y1, 2),
                    'x2': round(x2, 2),
                    'y2': round(y2, 2)
                }
            })
        
        # JSON 저장
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"✓ 보고서 저장: {output_path}\n")
        
        return report
    
    def print_analysis(self, analysis):
        """
        분석 결과 출력
        """
        print("=" * 60)
        print("검출 결과 분석")
        print("=" * 60)
        
        print(f"\n총 검출 객체: {analysis['total_objects']}개")
        
        print("\n클래스별 통계:")
        for cls_name, count in sorted(analysis['classes'].items(), 
                                      key=lambda x: x[1], reverse=True):
            print(f"  - {cls_name}: {count}개")
        
        conf_stats = analysis['confidence_stats']
        print(f"\n신뢰도 통계:")
        print(f"  - 최소: {conf_stats['min']:.4f}")
        print(f"  - 최대: {conf_stats['max']:.4f}")
        print(f"  - 평균: {conf_stats['avg']:.4f}")
        
        if analysis['bbox_sizes']:
            avg_area = sum(b['area'] for b in analysis['bbox_sizes']) / len(analysis['bbox_sizes'])
            print(f"\n바운딩 박스 통계:")
            print(f"  - 평균 면적: {avg_area:.2f} 픽셀²")
        
        print("=" * 60 + "\n")
    
    def run_complete_analysis(self, image_path, conf=0.25, iou=0.45, 
                            classes=None, output_dir='output'):
        """
        완전한 분석 실행 (검출 → 분석 → 시각화 → 보고서)
        """
        # 출력 디렉토리 생성
        Path(output_dir).mkdir(exist_ok=True)
        
        print("\n" + "=" * 60)
        print("이미지 객체 검출 종합 분석")
        print("=" * 60 + "\n")
        
        # 1. 검출
        results, inference_time = self.detect(image_path, conf, iou, classes)
        
        # 2. 분석
        analysis = self.analyze(results)
        self.print_analysis(analysis)
        
        # 3. 시각화
        vis_path = f"{output_dir}/detection_result.jpg"
        self.visualize(image_path, results, vis_path)
        
        # 4. 보고서 저장
        report_path = f"{output_dir}/detection_report.json"
        report = self.save_report(image_path, results, analysis, 
                                 inference_time, report_path)
        
        print("=" * 60)
        print("분석 완료!")
        print(f"결과 저장 위치: {output_dir}/")
        print("=" * 60 + "\n")
        
        return results, analysis, report


# 사용 예시
def main():
    """
    메인 실행 함수
    """
    # 검출기 생성
    detector = ImageObjectDetector('yolov8n.pt')
    
    # 샘플 이미지 다운로드 (또는 본인 이미지 사용)
    import requests
    from PIL import Image
    from io import BytesIO
    
    url = "https://ultralytics.com/images/bus.jpg"
    response = requests.get(url)
    img = Image.open(BytesIO(response.content))
    img.save('test_image.jpg')
    
    # 완전한 분석 실행
    results, analysis, report = detector.run_complete_analysis(
        'test_image.jpg',
        conf=0.25,
        iou=0.45,
        output_dir='detection_output'
    )
    
    # 특정 클래스만 검출하고 싶다면:
    # results, analysis, report = detector.run_complete_analysis(
    #     'test_image.jpg',
    #     classes=['person', 'car', 'bus'],
    #     output_dir='detection_output'
    # )

# 실행
# if __name__ == '__main__':
#     main()
```

## 9. 학습 체크리스트

2단계를 완료하기 위한 체크리스트:

- [ ] YOLOv8의 다양한 모델 크기 이해 (n, s, m, l, x)
- [ ] 단일 이미지에서 객체 검출 성공
- [ ] Confidence threshold 조정 및 효과 이해
- [ ] IoU threshold 조정 및 효과 이해
- [ ] 이미지 크기 변경에 따른 성능 차이 이해
- [ ] 특정 클래스만 필터링하여 검출 가능
- [ ] COCO 데이터셋 80개 클래스 파악
- [ ] 여러 이미지 배치 처리 성공
- [ ] 검출 결과를 JSON/CSV로 저장 가능
- [ ] 커스텀 시각화 구현 가능
- [ ] 종합 분석 도구 실행 성공

## 10. 다음 단계 준비

2단계를 완료했다면:

1. **테스트 이미지 수집**: 다양한 환경의 이미지 10-20장 준비
2. **성능 비교**: 다양한 파라미터로 실험하고 결과 비교
3. **웹캠 준비**: 3단계를 위한 웹캠 연결 확인
4. **학습 노트 작성**: 각 파라미터가 검출에 미치는 영향 정리
