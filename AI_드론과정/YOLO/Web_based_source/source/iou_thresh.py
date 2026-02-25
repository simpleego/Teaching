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
test_iou_thresholds('sample_image.jpg')