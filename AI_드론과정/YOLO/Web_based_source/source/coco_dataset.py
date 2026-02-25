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
explore_coco_classes()