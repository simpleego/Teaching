좋습니다. 이번에는 구조를 **명확히 분리**해서 구현하겠습니다.

---

## ✅ 시스템 구조

### 📤 영상 송신 서버 (Video Sender GUI)

* 영상 파일 선택
* 영상을 프레임 단위로 전송
* TCP Socket 사용
* GUI 제공 (시작 버튼)

### 📥 영상 수신 서버 (Video Receiver GUI)

* 송신 서버에 연결
* 실시간 영상 수신
* GUI 창에 영상 출력

---

## 📦 필요 라이브러리

```bash
pip install opencv-python pillow
```

---

# ✅ 1. 영상 송신 서버 (Video Sender GUI)

파일명: `video_sender.py`

```python
import socket
import tkinter as tk
from tkinter import filedialog
import threading
import cv2
import struct
import pickle

HOST = "0.0.0.0"
PORT = 5000

class VideoSenderGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("영상 송신 서버")

        self.video_path = None

        tk.Button(root, text="영상 파일 선택", command=self.select_video).pack(pady=5)
        tk.Button(root, text="전송 시작", command=self.start_server).pack(pady=5)

        self.status = tk.Label(root, text="대기 중...")
        self.status.pack(pady=5)

    def select_video(self):
        self.video_path = filedialog.askopenfilename(
            filetypes=[("Video Files", "*.mp4 *.avi *.mov")]
        )
        self.status.config(text=f"선택된 영상: {self.video_path}")

    def start_server(self):
        if not self.video_path:
            return

        threading.Thread(target=self.server_thread, daemon=True).start()
        self.status.config(text="서버 시작됨... 연결 대기")

    def server_thread(self):
        server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server.bind((HOST, PORT))
        server.listen(1)

        conn, addr = server.accept()
        self.status.config(text=f"클라이언트 연결됨: {addr}")

        cap = cv2.VideoCapture(self.video_path)

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            data = pickle.dumps(frame)
            size = struct.pack("Q", len(data))

            conn.sendall(size + data)
            cv2.waitKey(30)  # 프레임 속도 조절

        cap.release()
        conn.close()
        server.close()
        self.status.config(text="전송 완료")

if __name__ == "__main__":
    root = tk.Tk()
    app = VideoSenderGUI(root)
    root.mainloop()
```

---

# ✅ 2. 영상 수신 서버 (Video Receiver GUI)

파일명: `video_receiver.py`

```python
import socket
import tkinter as tk
from PIL import Image, ImageTk
import threading
import cv2
import struct
import pickle

SERVER_IP = "127.0.0.1"
PORT = 5000

class VideoReceiverGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("영상 수신 클라이언트")

        tk.Label(root, text="서버 IP").pack()
        self.ip_entry = tk.Entry(root)
        self.ip_entry.pack()
        self.ip_entry.insert(0, SERVER_IP)

        tk.Button(root, text="연결 시작", command=self.start_client).pack(pady=5)

        self.video_label = tk.Label(root)
        self.video_label.pack()

        self.running = False

    def start_client(self):
        threading.Thread(target=self.client_thread, daemon=True).start()

    def client_thread(self):
        client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client.connect((self.ip_entry.get(), PORT))

        data_buffer = b""
        payload_size = struct.calcsize("Q")

        self.running = True

        while self.running:
            while len(data_buffer) < payload_size:
                packet = client.recv(4096)
                if not packet:
                    return
                data_buffer += packet

            packed_size = data_buffer[:payload_size]
            data_buffer = data_buffer[payload_size:]
            frame_size = struct.unpack("Q", packed_size)[0]

            while len(data_buffer) < frame_size:
                data_buffer += client.recv(4096)

            frame_data = data_buffer[:frame_size]
            data_buffer = data_buffer[frame_size:]

            frame = pickle.loads(frame_data)
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            img = Image.fromarray(frame)
            img = img.resize((500, 400))
            imgtk = ImageTk.PhotoImage(image=img)

            self.video_label.imgtk = imgtk
            self.video_label.configure(image=imgtk)

        client.close()

if __name__ == "__main__":
    root = tk.Tk()
    app = VideoReceiverGUI(root)
    root.mainloop()
```

---

## ✅ 실행 방법

### 1️⃣ 송신 서버 실행

```bash
python video_sender.py
```

* 영상 파일 선택
* "전송 시작"

### 2️⃣ 수신 클라이언트 실행

```bash
python video_receiver.py
```

* 서버 IP 입력
* "연결 시작"

---

## 🎯 구현된 기능

* GUI 기반 영상 송신
* 실시간 프레임 스트리밍
* TCP 기반 안정 전송
* 영상 미리보기 GUI
* 파일 기반 영상 전송

---

## 🔧 확장 가능 기능 (원하시면 구현해 드립니다)

* ▶ 실시간 웹캠 스트리밍 버전
* ▶ 영상 저장 기능 추가
* ▶ 전송 진행률 ProgressBar
* ▶ Play / Pause 버튼
* ▶ UDP 기반 스트리밍
* ▶ 다중 클라이언트 지원
* ▶ 프레임 압축(JPEG)

---

원하시면 다음 단계로 발전시켜 드릴 수 있습니다:

**1️⃣ 웹캠 실시간 스트리밍 버전**
**2️⃣ 수신 영상 저장 기능 추가**
**3️⃣ Play / Pause 버튼 추가 GUI**
**4️⃣ UDP 기반 고속 스트리밍**
**5️⃣ 위 코드 통합 + 안정 프로토콜 개선 버전**

원하시는 번호를 알려주세요.
👉 `1 / 2 / 3 / 4 / 5`
