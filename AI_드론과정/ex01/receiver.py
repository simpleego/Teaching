import cv2
import socket
import struct
import numpy as np
from ultralytics import YOLO

def main():
    # YOLO 모델 로드
    model = YOLO("yolov8n.pt")  # 가벼운 모델, 실시간 분석에 적합

    host = "0.0.0.0"
    port = 5000

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind((host, port))
    sock.listen(1)
    print(f"[Receiver] Listening on {host}:{port}...")

    conn, addr = sock.accept()
    print(f"[Receiver] Connected by {addr}")

    data_buffer = b""

    try:
        while True:
            # 4바이트 길이 정보 수신
            while len(data_buffer) < 4:
                packet = conn.recv(4096)
                if not packet:
                    print("[Receiver] Connection closed.")
                    return
                data_buffer += packet

            msg_len = struct.unpack(">I", data_buffer[:4])[0]
            data_buffer = data_buffer[4:]

            # 프레임 데이터 수신
            while len(data_buffer) < msg_len:
                packet = conn.recv(4096)
                if not packet:
                    print("[Receiver] Connection closed.")
                    return
                data_buffer += packet

            frame_data = data_buffer[:msg_len]
            data_buffer = data_buffer[msg_len:]

            # JPEG → 이미지 디코딩
            nparr = np.frombuffer(frame_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is None:
                print("[Receiver] Failed to decode frame.")
                continue

            # -----------------------------
            # YOLO 객체 탐지
            # -----------------------------
            results = model(frame, imgsz=640, conf=0.5)

            # 탐지 결과 그리기
            for r in results:
                for box in r.boxes:
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    cls = int(box.cls[0].cpu().numpy())
                    conf = float(box.conf[0].cpu().numpy())
                    label = f"{model.names[cls]} {conf:.2f}"

                    cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)),
                                  (0, 255, 0), 2)
                    cv2.putText(frame, label, (int(x1), int(y1) - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

            # 화면 출력
            cv2.imshow("Receiver - YOLO Analysis", frame)
            if cv2.waitKey(1) == 27:  # ESC
                break

    finally:
        conn.close()
        sock.close()
        cv2.destroyAllWindows()
        print("[Receiver] Closed.")

if __name__ == "__main__":
    main()
