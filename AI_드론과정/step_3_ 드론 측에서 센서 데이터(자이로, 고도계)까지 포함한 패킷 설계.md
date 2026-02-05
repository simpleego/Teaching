# 드론 측에서 자이로·고도계 등 센서 데이터를 포함한 패킷을 설계
>  **실제 드론(라즈베리파이, ESP32-Python, 노트북 시뮬레이터)**

---

# 🟦 1단계: 센서 데이터 패킷 설계

드론이 관제 서버로 보내야 하는 정보는 보통 다음과 같아:

### ✔ 기본 드론 상태
- `battery` : 배터리 잔량  
- `altitude` : 고도  
- `gps` : 위도/경도  

### ✔ 자이로/IMU 센서 데이터
- `gyro` : 각속도 (x, y, z)  
- `accel` : 가속도 (x, y, z)  
- `yaw`, `pitch`, `roll` : 자세 정보  

### ✔ 패킷 예시(JSON)
```json
{
  "battery": 87.5,
  "altitude": 12.3,
  "gps": [37.1234, 127.5678],
  "gyro": [0.12, -0.03, 0.98],
  "accel": [0.01, 0.02, 9.81],
  "yaw": 12.3,
  "pitch": -3.2,
  "roll": 1.1
}
```

---

# 🟩 2단계: 드론 측 센서 데이터 생성 코드 (시뮬레이션)

실제 드론에서는 MPU6050, BMP280 같은 센서를 읽겠지만  
여기서는 **시뮬레이션 값**으로 구조를 먼저 잡아볼게.

### 📌 sensor_simulator.py

```python
import random
import math
import time

class DroneSensor:
    def __init__(self):
        self.battery = 100.0
        self.altitude = 0.0
        self.angle = 0.0

    def read(self):
        # 배터리 감소
        self.battery -= random.uniform(0.05, 0.2)
        self.battery = max(self.battery, 0)

        # 고도 변화
        self.altitude += random.uniform(-0.5, 1.0)
        self.altitude = max(self.altitude, 0)

        # 자이로/가속도 시뮬레이션
        gyro = [
            random.uniform(-1, 1),
            random.uniform(-1, 1),
            random.uniform(-1, 1)
        ]

        accel = [
            random.uniform(-0.2, 0.2),
            random.uniform(-0.2, 0.2),
            9.8 + random.uniform(-0.1, 0.1)
        ]

        # 자세(yaw/pitch/roll)
        self.angle += random.uniform(-2, 2)
        yaw = self.angle % 360
        pitch = random.uniform(-10, 10)
        roll = random.uniform(-10, 10)

        # GPS (고정값)
        gps = [37.1234, 127.5678]

        return {
            "battery": round(self.battery, 1),
            "altitude": round(self.altitude, 2),
            "gps": gps,
            "gyro": [round(v, 3) for v in gyro],
            "accel": [round(v, 3) for v in accel],
            "yaw": round(yaw, 2),
            "pitch": round(pitch, 2),
            "roll": round(roll, 2)
        }
```

---

# 🟧 3단계: 드론 측에서 TCP로 패킷 전송

이제 위 센서 데이터를 **관제 서버로 전송하는 코드**를 만들자.

### 📌 drone_client.py

```python
import socket
import json
import time
from sensor_simulator import DroneSensor

SERVER_IP = "192.168.0.10"   # 관제 서버 IP
SERVER_PORT = 6000

def main():
    sensor = DroneSensor()

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect((SERVER_IP, SERVER_PORT))
        print("[DRONE] Connected to server")

        while True:
            data = sensor.read()
            packet = json.dumps(data).encode()

            s.sendall(packet)
            print("[DRONE] Sent:", data)

            time.sleep(0.5)  # 0.5초마다 전송

if __name__ == "__main__":
    main()
```

---

# 🟦 4단계: 관제 서버에서 패킷 수신

이제 서버에서 이 패킷을 받아서 처리하는 코드야.

### 📌 server_receive.py

```python
import socket
import json

HOST = "0.0.0.0"
PORT = 6000

def main():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, PORT))
        s.listen(1)
        print(f"[SERVER] Listening on {HOST}:{PORT}")

        conn, addr = s.accept()
        print(f"[SERVER] Drone connected from {addr}")

        with conn:
            while True:
                data = conn.recv(2048)
                if not data:
                    print("[SERVER] Drone disconnected")
                    break

                try:
                    packet = json.loads(data.decode())
                    print("[SERVER] Received packet:", packet)
                except:
                    print("[SERVER] Invalid JSON received")

if __name__ == "__main__":
    main()
```

---

# 🟩 5단계: 패킷 구조 확장 가능성

이 구조는 확장하기 매우 쉬워.

예를 들어 다음을 추가할 수 있어:

- `temperature`  
- `pressure`  
- `motor_rpm`  
- `flight_mode`  
- `signal_strength`  

그냥 JSON에 필드를 추가하면 끝이야.

---

# 🎯 jong을 위한 요약

이제 드론 측에서:

- 자이로  
- 가속도  
- 고도  
- GPS  
- 배터리  

같은 센서 데이터를 포함한 패킷을 만들고  
TCP/IP + WiFi로 관제 서버에 전송하는 **완전한 구조**가 완성됐어.

---

 다음 단계 :

- 이 데이터를 **Flask + Chart.js 대시보드에 실시간 표시**  
- **여러 드론 동시 접속** 구조  
- **UDP 기반 저지연 제어 채널** 추가  
- **실제 MPU6050/BMP280 센서 코드**로 교체  
