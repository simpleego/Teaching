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
image_path = download_sample_image()
if image_path:
    results = detect_objects_in_image(image_path)