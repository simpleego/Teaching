좋습니다.
아래는 **Python + Tkinter GUI 기반 P2P 채팅 프로그램**입니다.

특징:
✅ GUI 창 (채팅 로그, 입력창, 버튼)
✅ 서버 + 클라이언트 역할 동시 수행
✅ 여러 피어 연결 가능
✅ 실시간 메시지 송수신
✅ threading 사용 (GUI 멈춤 방지)
✅ 표준 라이브러리만 사용

---

# 🏗 구조 개요

각 프로그램은 하나의 **P2P 노드**입니다.

```
[ Peer A ]  <---->  [ Peer B ]  <---->  [ Peer C ]
   (서버 + 클라이언트)
```

---

# 📁 p2p_gui.py (완전 실행 코드)

```python
import socket
import threading
import tkinter as tk
from tkinter import scrolledtext, messagebox

HOST = "0.0.0.0"

class P2PGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("P2P Chat Program")

        self.peers = []

        # ===== GUI Layout =====
        tk.Label(root, text="내 포트").grid(row=0, column=0)
        self.port_entry = tk.Entry(root)
        self.port_entry.grid(row=0, column=1)

        self.start_btn = tk.Button(root, text="서버 시작", command=self.start_server)
        self.start_btn.grid(row=0, column=2)

        tk.Label(root, text="상대 IP").grid(row=1, column=0)
        self.ip_entry = tk.Entry(root)
        self.ip_entry.grid(row=1, column=1)

        tk.Label(root, text="상대 포트").grid(row=1, column=2)
        self.peer_port_entry = tk.Entry(root)
        self.peer_port_entry.grid(row=1, column=3)

        self.connect_btn = tk.Button(root, text="피어 연결", command=self.connect_peer)
        self.connect_btn.grid(row=1, column=4)

        self.chat_area = scrolledtext.ScrolledText(root, width=60, height=20)
        self.chat_area.grid(row=2, column=0, columnspan=5)
        self.chat_area.config(state="disabled")

        self.msg_entry = tk.Entry(root, width=50)
        self.msg_entry.grid(row=3, column=0, columnspan=4)

        self.send_btn = tk.Button(root, text="전송", command=self.send_message)
        self.send_btn.grid(row=3, column=4)

    # ===== 서버 시작 =====
    def start_server(self):
        try:
            port = int(self.port_entry.get())
            threading.Thread(target=self.server_thread, args=(port,), daemon=True).start()
            self.log(f"[서버 시작] 포트 {port}")
        except:
            messagebox.showerror("Error", "포트 번호를 입력하세요")

    def server_thread(self, port):
        server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server.bind((HOST, port))
        server.listen()

        while True:
            conn, addr = server.accept()
            self.peers.append(conn)
            self.log(f"[연결됨] {addr}")
            threading.Thread(target=self.receive_message, args=(conn, addr), daemon=True).start()

    # ===== 피어 연결 =====
    def connect_peer(self):
        ip = self.ip_entry.get()
        port = int(self.peer_port_entry.get())

        try:
            client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            client.connect((ip, port))
            self.peers.append(client)
            self.log(f"[피어 연결] {ip}:{port}")
            threading.Thread(target=self.receive_message, args=(client, (ip, port)), daemon=True).start()
        except:
            messagebox.showerror("Error", "연결 실패")

    # ===== 메시지 수신 =====
    def receive_message(self, conn, addr):
        while True:
            try:
                data = conn.recv(1024).decode()
                if not data:
                    break
                self.log(f"[{addr}] {data}")
            except:
                break
        self.peers.remove(conn)
        conn.close()
        self.log(f"[연결 종료] {addr}")

    # ===== 메시지 전송 =====
    def send_message(self):
        msg = self.msg_entry.get()
        if msg == "":
            return

        self.log(f"[나] {msg}")

        for peer in self.peers:
            try:
                peer.send(msg.encode())
            except:
                pass

        self.msg_entry.delete(0, tk.END)

    # ===== 로그 출력 =====
    def log(self, message):
        self.chat_area.config(state="normal")
        self.chat_area.insert(tk.END, message + "\n")
        self.chat_area.config(state="disabled")
        self.chat_area.yview(tk.END)


# ===== 프로그램 실행 =====
if __name__ == "__main__":
    root = tk.Tk()
    app = P2PGUI(root)
    root.mainloop()
```

---

# ▶ 실행 방법

### 1️⃣ 첫 번째 PC(또는 터미널)

```bash
python p2p_gui.py
```

포트 입력:

```
5000
```

서버 시작 클릭

---

### 2️⃣ 두 번째 PC(또는 터미널)

```bash
python p2p_gui.py
```

포트:

```
5001
```

서버 시작 클릭

---

### 3️⃣ 피어 연결

한쪽에서:

```
상대 IP: 127.0.0.1
상대 포트: 5001
[피어 연결]
```

---

### 4️⃣ 채팅 시작

메시지 입력 → 전송

---

# 🧠 주요 기술 설명

| 기능   | 기술                  |
| ---- | ------------------- |
| GUI  | Tkinter             |
| 네트워크 | socket              |
| 동시성  | threading           |
| 통신방식 | TCP                 |
| 구조   | P2P                 |
| UI   | Entry, Button, Text |

---

# 🚀 확장 가능 기능

이 GUI P2P 프로그램은 다음으로 확장할 수 있습니다:

✅ 파일 전송 버튼
✅ 사용자 이름(Nickname)
✅ 접속 피어 리스트
✅ 암호화 채팅 (AES)
✅ NAT Traversal (STUN)
✅ 영상/음성 채팅
✅ SQLite 로그 저장
✅ PyQt5 고급 UI
✅ WebSocket 기반 GUI
✅ 블록체인 노드 UI

---

# 📌 다음 단계로 만들어볼 수 있는 버전

원하시면 다음 중 하나를 만들어 드릴 수 있습니다:

**1️⃣ P2P 채팅 + 파일 전송 GUI 버전**
**2️⃣ PyQt5 고급 GUI 대시보드 버전**
**3️⃣ 사용자 이름 + 접속자 리스트 버전**
**4️⃣ 암호화(E2E) P2P 채팅 버전**
**5️⃣ P2P 영상 스트리밍 GUI 버전**
**6️⃣ 위 기능 모두 통합 풀 버전**

원하시면 번호로 선택해주세요:
👉 **1 / 2 / 3 / 4 / 5 / 6 / 전부**
