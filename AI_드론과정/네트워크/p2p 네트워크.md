아래는 **Python으로 구현한 간단한 P2P(피어 투 피어) 네트워크 프로그램 예제**입니다.
각 노드는 **서버 + 클라이언트 역할을 동시에 수행**하며, 서로 메시지를 주고받을 수 있습니다.

구성:
✅ TCP Socket 기반
✅ 여러 노드 연결 가능
✅ 메시지 브로드캐스트
✅ 콘솔 채팅 형태
✅ 순수 Python 표준 라이브러리 사용

---

# 🧠 구조 개념

```
Peer A  <---->  Peer B  <---->  Peer C
   (Server + Client 역할 모두 수행)
```

각 피어는:

* 자신의 포트에서 서버 실행
* 다른 피어에게 접속 가능
* 메시지를 모든 연결 피어에게 전송

---

# 📁 p2p_node.py (단일 파일 실행)

```python
import socket
import threading

HOST = "0.0.0.0"
PORT = int(input("내 포트 번호 입력: "))

peers = []  # 연결된 피어 소켓 목록


# 메시지 수신 처리
def handle_peer(conn, addr):
    print(f"[연결됨] {addr}")
    while True:
        try:
            data = conn.recv(1024).decode()
            if not data:
                break
            print(f"\n[{addr}] {data}")
        except:
            break
    print(f"[연결 종료] {addr}")
    peers.remove(conn)
    conn.close()


# 서버 실행 (다른 피어 접속 대기)
def start_server():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind((HOST, PORT))
    server.listen()

    print(f"[서버 시작] 포트 {PORT} 대기중...")

    while True:
        conn, addr = server.accept()
        peers.append(conn)
        threading.Thread(target=handle_peer, args=(conn, addr), daemon=True).start()


# 다른 피어에 접속
def connect_to_peer(ip, port):
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client.connect((ip, port))
    peers.append(client)
    threading.Thread(target=handle_peer, args=(client, (ip, port)), daemon=True).start()
    print(f"[피어 연결] {ip}:{port}")


# 메시지 전송
def send_message():
    while True:
        msg = input(">> ")
        for peer in peers:
            try:
                peer.send(msg.encode())
            except:
                pass


# 메인 실행
threading.Thread(target=start_server, daemon=True).start()

while True:
    cmd = input("명령어 (connect/send): ")

    if cmd == "connect":
        ip = input("상대 IP: ")
        port = int(input("상대 포트: "))
        connect_to_peer(ip, port)

    elif cmd == "send":
        send_message()
```

---

# ▶ 실행 방법 (2대 이상 PC 또는 여러 터미널)

### 1️⃣ 첫 번째 터미널

```bash
python p2p_node.py
내 포트 번호 입력: 5000
```

### 2️⃣ 두 번째 터미널

```bash
python p2p_node.py
내 포트 번호 입력: 5001
```

### 3️⃣ 연결

한쪽에서:

```
명령어 (connect/send): connect
상대 IP: 127.0.0.1
상대 포트: 5001
```

### 4️⃣ 메시지 전송

```
명령어 (connect/send): send
>> Hello P2P!
```

---

# 🧩 핵심 기술 설명

| 기능     | 기술                 |
| ------ | ------------------ |
| 네트워크   | socket             |
| 동시처리   | threading          |
| P2P 구조 | Server + Client 혼합 |
| 통신방식   | TCP                |
| 메시지    | UTF-8 텍스트          |

---

# 🚀 확장 아이디어

이 코드는 학습용 기본 P2P 구조입니다. 다음 기능으로 확장할 수 있습니다:

✅ 피어 목록 공유 (Peer Discovery)
✅ 파일 전송 기능
✅ 암호화 (TLS, AES)
✅ NAT Traversal (STUN/TURN)
✅ UDP 기반 P2P
✅ 블록체인 노드 구조
✅ 채팅 GUI (Tkinter / PyQt)
✅ JSON 메시지 프로토콜

---

# 📦 파일 전송 P2P 버전 (간단 예시)

원하시면 다음 단계로 이런 버전도 만들어드릴 수 있습니다:

```text
1️⃣ P2P 채팅 + 파일 전송 버전
2️⃣ P2P 노드 자동 발견 버전
3️⃣ FastAPI 기반 P2P 네트워크
4️⃣ Blockchain 스타일 P2P 노드
5️⃣ GUI 포함 P2P 프로그램
6️⃣ WebSocket 기반 P2P
```

원하시면 번호로 선택해주세요:
👉 **1 / 2 / 3 / 4 / 5 / 6 / 전부 만들어줘**
