# DNN 검출 결과 파일 저장
>  **검출된 얼굴/객체 이미지를 자동으로 파일로 저장하는 기능**
> **DNN 얼굴 검출(SSD + ResNet)** 버전
---

# 📸 **검출된 얼굴을 자동 저장하는 코드 조각**

아래 코드를 **얼굴을 검출한 후 사각형을 그리는 부분 바로 아래**에 넣으면 돼.

```python
# 얼굴 이미지 자동 저장
face_img = frame[y1:y2, x1:x2]
timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S_%f")
cv2.imwrite(f"faces/face_{timestamp}.jpg", face_img)
```

---

# 📦 **전체 동작을 위한 준비**

### ✔ 1) 저장 폴더 생성  
코드 실행 전에 프로젝트 폴더에 `faces` 폴더를 만들어줘.

```
project/
 ├─ dnn_face_detection.py
 ├─ deploy.prototxt
 ├─ res10_300x300_ssd_iter_140000.caffemodel
 └─ faces/   ← 여기에 저장됨
```

---

# 🟦 **자동 저장 기능이 포함된 DNN 얼굴 검출 전체 코드**

```python
import cv2
import numpy as np
import datetime
import os

def main():
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("웹캠을 열 수 없습니다.")
        return

    # 저장 폴더 생성
    if not os.path.exists("faces"):
        os.makedirs("faces")

    # DNN 모델 로드
    modelFile = "res10_300x300_ssd_iter_140000.caffemodel"
    configFile = "deploy.prototxt"

    net = cv2.dnn.readNetFromCaffe(configFile, modelFile)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        h, w = frame.shape[:2]

        # DNN 입력 블롭 생성
        blob = cv2.dnn.blobFromImage(
            cv2.resize(frame, (300, 300)),
            1.0,
            (300, 300),
            (104.0, 177.0, 123.0)
        )

        net.setInput(blob)
        detections = net.forward()

        # 검출 결과 반복
        for i in range(0, detections.shape[2]):
            confidence = detections[0, 0, i, 2]

            if confidence > 0.5:
                box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                x1, y1, x2, y2 = box.astype("int")

                # 얼굴 표시
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

                # ============================
                # 📸 얼굴 이미지 자동 저장
                # ============================
                face_img = frame[y1:y2, x1:x2]

                if face_img.size > 0:  # 빈 이미지 방지
                    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S_%f")
                    filename = f"faces/face_{timestamp}.jpg"
                    cv2.imwrite(filename, face_img)
                    print(f"Saved: {filename}")

        cv2.imshow("DNN Face Detection (press x to exit)", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('x'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
```

---

# 🎯 이 코드가 하는 일

- 얼굴을 검출하면  
  → 해당 영역을 잘라서  
  → `faces/` 폴더에 자동 저장  
- 파일명은 날짜+시간 기반으로 중복 없이 저장  
- 저장될 때마다 콘솔에 파일명 출력  

---

 다음도 단계 :

- **빨간색 물체 이미지 자동 저장 기능 추가**  
- **움직임 검출된 영역 자동 저장**  
- **저장된 이미지에 타임스탬프 워터마크 추가**  
- **FastAPI 서버로 이미지 업로드 기능**  
