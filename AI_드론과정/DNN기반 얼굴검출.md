# DNN 기반 얼굴 검출(SSD + ResNet)
>  **DNN 기반 얼굴 검출(SSD + ResNet)** 버전
> Haar Cascade보다 훨씬 정확하고 안정적이며, 실시간 웹캠에서도 잘 동작하는 방식
> OpenCV에서 제공하는 **Caffe 기반 SSD 얼굴 검출 모델**

- 모델 구조: `deploy.prototxt`  
- 학습된 가중치: `res10_300x300_ssd_iter_140000.caffemodel`  

이 두 파일은 OpenCV 공식 예제 모델이라 자유롭게 사용할 수 있어.

---

# 📥 준비해야 할 파일 (2개)

아래 두 파일을 같은 폴더에 넣어줘:

1) **deploy.prototxt**  
2) **res10_300x300_ssd_iter_140000.caffemodel**

OpenCV GitHub에서 다운로드 가능해.

---

# 🟦 DNN 기반 얼굴 검출 (SSD + ResNet)

```python
import cv2
import numpy as np

def main():
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("웹캠을 열 수 없습니다.")
        return

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

            # 신뢰도 임계값
            if confidence > 0.5:
                box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                x1, y1, x2, y2 = box.astype("int")

                # 얼굴 영역 표시
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                text = f"{confidence*100:.1f}%"
                cv2.putText(frame, text, (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

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

# 🎯 이 코드의 특징

| 기능 | 설명 |
|------|------|
| DNN 기반 얼굴 검출 | Haar보다 정확하고 robust |
| SSD + ResNet | 빠르고 가벼운 모델 |
| 실시간 웹캠 지원 | 30fps 근처로 동작 |
| 신뢰도 표시 | 검출된 얼굴 위에 confidence 출력 |
| x 키 종료 | 편리한 종료 기능 |

---

# 📌 성능 팁

- GPU(OpenCV CUDA 빌드) 사용하면 속도 3~10배 증가  
- confidence threshold(0.5)를 0.7로 올리면 오탐 줄어듦  
- 640×480 해상도면 실시간 성능 좋음  

---

확장할 내용:

- **YOLOv8 얼굴 검출 버전**  
- **DNN + 빨간색 추적 + 움직임 검출 통합 버전**  
- **검출된 얼굴을 자동 저장하는 기능**  
- **FastAPI 서버로 얼굴 검출 결과 전송**  
