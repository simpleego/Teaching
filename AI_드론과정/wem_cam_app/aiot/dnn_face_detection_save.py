import cv2
import numpy as np
import datetime
import os

def main():
    cap = cv2.VideoCapture(0)

    # 저장 폴더 생성
    save_dir = "detected_faces"
    os.makedirs(save_dir, exist_ok=True)

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

        # 검출 반복
        for i in range(detections.shape[2]):
            confidence = detections[0, 0, i, 2]

            if confidence > 0.5:
                box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                x1, y1, x2, y2 = box.astype(int)

                # 얼굴 표시
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

                # ============================
                # 📸 얼굴 이미지 자동 저장
                # ============================
                face_img = frame[y1:y2, x1:x2]

                if face_img.size > 0:
                    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S_%f")
                    filename = f"{save_dir}/face_{timestamp}.jpg"
                    cv2.imwrite(filename, face_img)
                    print(f"Saved: {filename}")

        cv2.imshow("Face Detection (press x to exit)", frame)

        if cv2.waitKey(1) & 0xFF == ord('x'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
