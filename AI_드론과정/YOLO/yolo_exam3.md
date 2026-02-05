드론 데이터셋(YOLO 형식)을 다운로드하면 이미지 파일(`.jpg`)과 라벨 파일(`.txt`)이 쌍을 이루고 있습니다. YOLO의 라벨은 모든 수치가 에서  사이로 정규화(Normalized)되어 있어 눈으로 바로 확인하기 어렵습니다.

이를 파이썬 **OpenCV**를 이용해 실제 이미지 위에 박스를 그려서 확인하는 실무 코드를 작성해 드립니다.

---

## 1. YOLO 라벨 시각화 스크립트

이 코드는 드론으로 촬영된 고해상도 이미지에서 아주 작게 표시된 번호판이나 차량 박스가 제대로 설정되었는지 확인하는 데 유용합니다.

```python
import cv2
import os

def draw_yolo_labels(image_path, label_path, class_names):
    # 1. 이미지 읽기
    image = cv2.imread(image_path)
    if image is None: return
    
    h, w, _ = image.shape
    
    # 2. 라벨 파일 읽기
    if not os.path.exists(label_path):
        print(f"라벨 파일을 찾을 수 없습니다: {label_path}")
        return

    with open(label_path, 'r') as f:
        lines = f.readlines()
        
    for line in lines:
        # YOLO 형식: class_id x_center y_center width height
        parts = line.strip().split()
        class_id = int(parts[0])
        x_c, y_c, bw, bh = map(float, parts[1:])
        
        # 3. 정규화된 좌표를 픽셀 좌표로 변환
        # 중심점 좌표 -> 좌상단(x1, y1), 우하단(x2, y2)
        x1 = int((x_c - bw/2) * w)
        y1 = int((y_c - bh/2) * h)
        x2 = int((x_c + bw/2) * w)
        y2 = int((y_c + bh/2) * h)
        
        # 4. 박스 그리기
        color = (0, 255, 0)  # 녹색 박스
        cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
        
        # 5. 클래스 이름 표시
        label_text = class_names[class_id] if class_id < len(class_names) else str(class_id)
        cv2.putText(image, label_text, (x1, y1 - 10), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

    # 결과 출력
    cv2.imshow("Drone Dataset Check", image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

# --- 설정 구간 ---
# 클래스 이름 리스트 (데이터셋의 data.yaml 참고)
classes = ["License_Plate", "Vehicle"] 
img_file = "dataset/train/images/drone_001.jpg"
lbl_file = "dataset/train/labels/drone_001.txt"

# 실행
# draw_yolo_labels(img_file, lbl_file, classes)

```

---

## 2. 코드 내 좌표 변환 공식 이해 (수학적 배경)

YOLO 라벨 파일 안의 값들은 이미지 크기에 상관없이 범용적으로 쓰기 위해 이미지의 전체 가로/세로 길이를 로 보고 계산된 값입니다. 이를 다시 이미지 위에 그리려면 다음 수식이 필요합니다.

* **실제 가로 길이 ()**: 
* **좌상단  좌표 ()**: 
* **좌상단  좌표 ()**: 

---

## 3. 드론 데이터 확인 시 주의사항

1. **Tiny Objects**: 드론 데이터는 번호판이 수 픽셀 정도로 작을 수 있습니다. `cv2.imshow`로 볼 때 이미지가 너무 크면 `cv2.namedWindow('...', cv2.WINDOW_NORMAL)`를 사용해 창 크기를 조절하며 확대해서 보세요.
2. **Rotation**: 드론은 위에서 찍기 때문에 차량이 회전되어 있는 경우가 많습니다. 일반적인 YOLO 박스(가로/세로 직사각형)가 차량의 방향과 잘 맞는지 확인해야 합니다. 만약 박스가 너무 많이 남는다면 **OBB(Oriented Bounding Box)** 모델 검토가 필요할 수 있습니다.

**이제 이 코드를 사용하여 실제 데이터를 확인해 보시겠어요? 혹시 특정 드론 데이터셋의 `.yaml` 파일 설정법이 추가로 필요하신가요?**
