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
test_confidence_thresholds('sample_image.jpg')