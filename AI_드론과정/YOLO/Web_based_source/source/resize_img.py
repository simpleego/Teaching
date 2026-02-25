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
results = test_image_sizes('sample_image.jpg')