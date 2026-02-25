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
detect_specific_classes('sample_image.jpg', ['traffic sign', 'car', 'bus'])