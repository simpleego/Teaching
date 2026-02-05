# 드론 관제 시스템에서 “UDP 기반 저지연 제어 채널 + TCP 기반 로그 채널”을 동시에 사용하는 이중 구조**

- **UDP → 빠른 제어 명령(저지연, 약간의 손실 허용)**
- **TCP → 로그·센서 데이터(신뢰성 중요)**

---

# 🟦 전체 구조 요약

### ✔ 드론 → 서버 (TCP)
- 센서 데이터(자이로, 고도, GPS 등)
- 신뢰성 중요 → TCP 사용

### ✔ 서버 → 드론 (UDP)
- 제어 명령(이륙, 착륙, 고도 유지 등)
- 빠른 응답 필요 → UDP 사용

---

# 🟩 1. 관제 서버 코드 (UDP + TCP 동시 운영)

`server_dual_channel.py`

```python
import socket
import threading
import json

# -----------------------------
# 전역 저장소: 드론 상태
# -----------------------------
drone_status = {}

# -----------------------------
# 1) TCP 로그 수신 서버 (드론 → 서버)
# -----------------------------
def tcp_log_server():
    HOST = "0.0.0.0"
    PORT = 7000

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, PORT))
        s.listen(1)
        print(f"[TCP] Log server listening on {HOST}:{PORT}")

        conn, addr = s.accept()
        print(f"[TCP] Drone connected from {addr}")

        with conn:
            while True:
                data = conn.recv(4096)
                if not data:
                    print("[TCP] Drone disconnected")
                    break

                try:
                    packet = json.loads(data.decode())
                    drone_status.update(packet)
                    print("[TCP] Received log:", packet)
                except:
                    print("[TCP] Invalid JSON received")


# -----------------------------
# 2) UDP 제어 명령 송신 서버 (서버 → 드론)
# -----------------------------
def udp_control_server():
    UDP_IP = "0.0.0.0"
    UDP_PORT = 7001

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind((UDP_IP, UDP_PORT))

    print(f"[UDP] Control server ready on {UDP_IP}:{UDP_PORT}")

    while True:
        # 드론이 UDP로 "ready" 메시지를 보내면 그 주소로 명령을 보냄
        data, addr = sock.recvfrom(1024)
        msg = data.decode().strip()
        print(f"[UDP] Received from drone {addr}: {msg}")

        # 예: 배터리가 20% 이하이면 귀환 명령
        cmd = {"cmd": "NONE"}

        if drone_status.get("battery", 100) < 20:
            cmd["cmd"] = "RETURN_HOME"
        elif drone_status.get("altitude", 0) > 50:
            cmd["cmd"] = "DESCEND"

        sock.sendto(json.dumps(cmd).encode(), addr)
        print(f"[UDP] Sent command to {addr}: {cmd}")


# -----------------------------
# 메인 실행
# -----------------------------
if __name__ == "__main__":
    t1 = threading.Thread(target=tcp_log_server, daemon=True)
    t2 = threading.Thread(target=udp_control_server, daemon=True)

    t1.start()
    t2.start()

    print("[SERVER] Dual-channel control system running...")

    t1.join()
    t2.join()
```

---

# 🟧 2. 드론 측 코드 (TCP 로그 전송 + UDP 제어 수신)

`drone_dual_channel.py`

```python
import socket
import json
import time
import random

SERVER_IP = "192.168.0.10"   # 관제 서버 IP
TCP_PORT = 7000
UDP_PORT = 7001

# -----------------------------
# 센서 데이터 시뮬레이터
# -----------------------------
def generate_sensor_data():
    return {
        "battery": round(random.uniform(10, 100), 1),
        "altitude": round(random.uniform(0, 80), 1),
        "gps": [37.1234, 127.5678],
        "gyro": [round(random.uniform(-1, 1), 3) for _ in range(3)],
        "accel": [round(random.uniform(-0.2, 0.2), 3) for _ in range(3)],
        "yaw": round(random.uniform(0, 360), 2),
        "pitch": round(random.uniform(-10, 10), 2),
        "roll": round(random.uniform(-10, 10), 2)
    }


# -----------------------------
# 1) TCP 로그 전송 (드론 → 서버)
# -----------------------------
def tcp_log_sender():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect((SERVER_IP, TCP_PORT))
        print("[DRONE] Connected to TCP log server")

        while True:
            packet = generate_sensor_data()
            s.sendall(json.dumps(packet).encode())
            print("[DRONE] Sent log:", packet)
            time.sleep(1)


# -----------------------------
# 2) UDP 제어 명령 수신 (서버 → 드론)
# -----------------------------
def udp_control_receiver():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    # 서버가 명령을 보낼 수 있도록 먼저 "ready" 신호를 보냄
    while True:
        sock.sendto("ready".encode(), (SERVER_IP, UDP_PORT))

        try:
            sock.settimeout(1.0)
            data, _ = sock.recvfrom(1024)
            cmd = json.loads(data.decode())
            print("[DRONE] Received command:", cmd)
        except socket.timeout:
            pass

        time.sleep(0.5)


# -----------------------------
# 메인 실행
# -----------------------------
if __name__ == "__main__":
    import threading

    t1 = threading.Thread(target=tcp_log_sender, daemon=True)
    t2 = threading.Thread(target=udp_control_receiver, daemon=True)

    t1.start()
    t2.start()

    print("[DRONE] Dual-channel communication running...")

    t1.join()
    t2.join()
```

---

# 🟦 3. 이 구조가 실제 드론에서 쓰이는 이유

| 채널 | 프로토콜 | 목적 | 이유 |
|------|----------|------|------|
| 제어 채널 | **UDP** | 이륙/착륙/고도 유지 등 | 빠르고 지연이 적어야 함. 약간의 패킷 손실 허용 |
| 로그 채널 | **TCP** | 센서 데이터, 상태 정보 | 데이터 손실이 없어야 함 |

실제 DJI, PX4, ArduPilot도 이런 구조를 사용해.

---

# 🎯 jong을 위한 요약

이제 완성된 구조는:

- **드론 → TCP → 서버**  
  센서 데이터, 로그, 상태 정보

- **서버 → UDP → 드론**  
  빠른 제어 명령

- 두 채널이 동시에 동작  
- 실전 드론 관제 시스템과 동일한 구조

---
