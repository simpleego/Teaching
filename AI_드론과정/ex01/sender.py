# sender.py
import cv2
import socket
import struct

def main():
    # 0이면 웹캠, "video.mp4"면 동영상 파일
    source = "dog_people.mp4"
    # source = "sample01.mp4"
    cap = cv2.VideoCapture(source)

    # 송신할 서버(=수신 프로그램이 기다리는 곳)
    host = "127.0.0.1"
    port = 5000

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((host, port))
    print(f"[Sender] Connected to {host}:{port}")

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("[Sender] No more frames. Exiting.")
                break

            # JPEG로 압축
            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 80]
            result, encimg = cv2.imencode(".jpg", frame, encode_param)
            data = encimg.tobytes()

            # 먼저 길이(4바이트) 전송 후, 실제 데이터 전송
            sock.sendall(struct.pack(">I", len(data)) + data)

            # 송신 중인 화면 로컬에서도 확인
            cv2.imshow("Sender - Drone Camera", frame)
            if cv2.waitKey(1) == 27:  # ESC
                break
    finally:
        cap.release()
        sock.close()
        cv2.destroyAllWindows()
        print("[Sender] Closed.")

if __name__ == "__main__":
    main()