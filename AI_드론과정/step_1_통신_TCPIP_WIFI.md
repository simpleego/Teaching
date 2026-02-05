# TCP/IP + WiFi 기반 드론 관제 데이터 송수신
---

## 1단계: 가장 기본적인 TCP 서버·클라이언트 구조 이해

### 1-1. 관제 서버 기본 코드 (server_basic.py)

```python
# server_basic.py
import socket

HOST = "0.0.0.0"   # 모든 인터페이스에서 수신
PORT = 5000        # 관제 포트

def main():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, PORT))
        s.listen(1)
        print(f"[SERVER] Listening on {HOST}:{PORT}")

        conn, addr = s.accept()
        with conn:
            print(f"[SERVER] Connected by {addr}")
            while True:
                data = conn.recv(1024)
                if not data:
                    break
                print("[SERVER] Received:", data.decode().strip())
                # 받은 데이터를 그대로 다시 보내기 (echo)
                conn.sendall(data)

if __name__ == "__main__":
    main()
```

### 1-2. 드론(클라이언트) 기본 코드 (client_basic.py)

```python
# client_basic.py
import socket
import time

SERVER_IP = "192.168.0.10"  # 관제 서버 IP (WiFi 같은 네트워크 상)
SERVER_PORT = 5000

def main():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect((SERVER_IP, SERVER_PORT))
        print("[DRONE] Connected to server")

        for i in range(5):
            msg = f"hello {i}\n"
            s.sendall(msg.encode())
            print("[DRONE] Sent:", msg.strip())

            data = s.recv(1024)
            print("[DRONE] Echo from server:", data.decode().strip())
            time.sleep(1)

if __name__ == "__main__":
    main()
```

> 이 단계의 목표: **TCP 연결 흐름 이해 (bind → listen → accept / connect → send → recv)**

---

## 2단계: 드론 관제에 맞는 “명령/텔레메트리” 프로토콜 만들기

이제 문자열이 아니라 **구조화된 데이터(JSON)**로 명령과 상태를 주고받게 만들어보자.

### 2-1. 관제 서버: 드론 상태 수신 + 명령 전송 (server_control.py)

```python
# server_control.py
import socket
import json

HOST = "0.0.0.0"
PORT = 5001

def main():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, PORT))
        s.listen(1)
        print(f"[SERVER] Listening on {HOST}:{PORT}")

        conn, addr = s.accept()
        with conn:
            print(f"[SERVER] Drone connected from {addr}")
            while True:
                data = conn.recv(1024)
                if not data:
                    print("[SERVER] Drone disconnected")
                    break

                try:
                    msg = json.loads(data.decode())
                except json.JSONDecodeError:
                    print("[SERVER] Invalid JSON:", data)
                    continue

                print(f"[SERVER] Drone status: {msg}")

                # 예: 배터리가 30% 이하이면 귀환 명령
                command = {"cmd": "NONE"}
                if msg.get("battery", 100) < 30:
                    command["cmd"] = "RETURN_HOME"
                elif msg.get("altitude", 0) > 50:
                    command["cmd"] = "DESCEND"

                conn.sendall(json.dumps(command).encode())

if __name__ == "__main__":
    main()
```

### 2-2. 드론 측: 상태 전송 + 명령 수신 (client_control.py)

```python
# client_control.py
import socket
import json
import time
import random

SERVER_IP = "192.168.0.10"  # 관제 서버 IP
SERVER_PORT = 5001

def main():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect((SERVER_IP, SERVER_PORT))
        print("[DRONE] Connected to control server")

        battery = 100
        altitude = 0

        while True:
            # 드론 상태 값 예시
            battery -= random.uniform(0.5, 1.5)
            altitude += random.uniform(-1, 3)
            battery = max(battery, 0)

            status = {
                "battery": round(battery, 1),
                "altitude": round(altitude, 1),
                "gps": [37.1234, 127.5678]
            }

            s.sendall(json.dumps(status).encode())
            print("[DRONE] Sent status:", status)

            data = s.recv(1024)
            if not data:
                print("[DRONE] Server disconnected")
                break

            cmd = json.loads(data.decode())
            print("[DRONE] Received command:", cmd)

            # 명령에 따른 행동 예시
            if cmd.get("cmd") == "RETURN_HOME":
                print("[DRONE] Returning home...")
                altitude = 0
            elif cmd.get("cmd") == "DESCEND":
                print("[DRONE] Descending...")
                altitude -= 5

            time.sleep(1)

if __name__ == "__main__":
    main()
```

> 이 단계의 목표: **“드론 상태 → 서버” + “서버 명령 → 드론” 양방향 통신 패턴 학습**

---

## 3단계: 여러 드론을 동시에 관리하는 관제 서버

### 3-1. 멀티 드론 관제 서버 (server_multi.py)

```python
# server_multi.py
import socket
import threading
import json

HOST = "0.0.0.0"
PORT = 5002

def handle_drone(conn, addr, drone_id):
    print(f"[SERVER] Drone {drone_id} connected from {addr}")
    with conn:
        while True:
            data = conn.recv(1024)
            if not data:
                print(f"[SERVER] Drone {drone_id} disconnected")
                break

            try:
                status = json.loads(data.decode())
            except json.JSONDecodeError:
                print(f"[SERVER] Drone {drone_id} invalid JSON")
                continue

            print(f"[SERVER] Drone {drone_id} status:", status)

            command = {"cmd": "NONE"}
            if status.get("battery", 100) < 20:
                command["cmd"] = "RETURN_HOME"

            conn.sendall(json.dumps(command).encode())

def main():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, PORT))
        s.listen()
        print(f"[SERVER] Listening on {HOST}:{PORT}")

        drone_id = 0
        while True:
            conn, addr = s.accept()
            drone_id += 1
            t = threading.Thread(target=handle_drone, args=(conn, addr, drone_id), daemon=True)
            t.start()

if __name__ == "__main__":
    main()
```

> 이 단계의 목표: **멀티 드론 관제 개념 + 스레드 기반 연결 처리 이해**

---

## 4단계: WiFi 환경에서 실제로 돌려보기

WiFi 통신이라고 해서 코드가 달라지는 건 아니고, **같은 공유기/라우터에 연결된 상태에서 IP만 맞추면 된다**는 걸 학생들에게 체험시키면 좋아.

1. 관제 서버 PC와 드론(또는 드론 역할 라즈베리파이/노트북)을 **같은 WiFi에 연결**
2. 서버 PC에서 `ipconfig`(Windows) 또는 `ifconfig`/`ip a`(Linux, macOS)로 **내 IP 확인**
3. 클라이언트 코드의 `SERVER_IP`를 그 IP로 설정
4. 서버 코드 실행 → 클라이언트 코드 실행 → 실제로 패킷이 WiFi로 오가는 걸 체험

---

## 5단계: 수업 설계 팁

- **1단계**: TCP 기본 구조 + echo 실습  
- **2단계**: JSON 기반 관제 프로토콜 설계  
- **3단계**: 드론 상태/명령 시뮬레이션 값 넣어서 재미 주기  
- **4단계**: 실제 WiFi 두 대로 통신 테스트  
- **5단계**: 팀별로 “관제 UI”까지 붙여보게 해도 좋음 (예: Tkinter, 웹 대시보드)

---

다음 단계:
- 관제 서버에 **웹 대시보드(Flask + Chart.js)** 붙이기  
- 드론 측에서 **센서 데이터(자이로, 고도계)까지 포함한 패킷 설계**  
- **UDP 기반 저지연 제어 채널 + TCP 기반 로그 채널** 이중 구조 설계  
