# receiver.py
from ultralytics import YOLO 
import cv2
import socket
import struct
import numpy as np

# YOLO 모델 로드 
model = YOLO("yolov8n.pt") # 가벼운 모델

def main():
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
            # 먼저 4바이트 길이 정보 받기
            while len(data_buffer) < 4:
                packet = conn.recv(4096)
                if not packet:
                    print("[Receiver] Connection closed.")
                    return
                data_buffer += packet

            msg_len = struct.unpack(">I", data_buffer[:4])[0]
            data_buffer = data_buffer[4:]

            # 지정된 길이만큼 프레임 데이터 수신
            while len(data_buffer) < msg_len:
                packet = conn.recv(4096)
                if not packet:
                    print("[Receiver] Connection closed.")
                    return
                data_buffer += packet

            frame_data = data_buffer[:msg_len]
            data_buffer = data_buffer[msg_len:]

            # JPEG 디코딩
            nparr = np.frombuffer(frame_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is None:
                print("[Receiver] Failed to decode frame.")
                continue

            cv2.imshow("Receiver - Ground Station", frame)
            if cv2.waitKey(1) == 27:  # ESC
                break
    finally:
        conn.close()
        sock.close()
        cv2.destroyAllWindows()
        print("[Receiver] Closed.")

if __name__ == "__main__":
    main()
