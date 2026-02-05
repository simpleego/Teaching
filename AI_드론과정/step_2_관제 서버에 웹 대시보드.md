#  **관제 서버에 웹 대시보드(Flask + Chart.js)

- 1) Flask 서버가 드론 데이터를 TCP로 받음  
- 2) Flask 웹 대시보드에서 Chart.js로 실시간 그래프 표시  
- 3) AJAX(또는 Fetch)로 최신 드론 상태를 주기적으로 요청  

---

# 🟦 1단계: Flask 관제 서버 기본 구조 만들기

드론에서 보내는 데이터를 저장할 **전역 상태 저장소**를 하나 두고,  
웹 대시보드에서 이 값을 읽어가는 방식이야.

### 📌 server_dashboard.py

```python
from flask import Flask, render_template, jsonify
import threading
import socket
import json

app = Flask(__name__)

# 드론 상태 저장 변수
drone_status = {
    "battery": 100,
    "altitude": 0,
    "gps": [0, 0]
}

# -----------------------------
# 1) 웹 대시보드 라우팅
# -----------------------------
@app.route("/")
def index():
    return render_template("dashboard.html")

# -----------------------------
# 2) 드론 상태를 웹으로 제공
# -----------------------------
@app.route("/status")
def status():
    return jsonify(drone_status)

# -----------------------------
# 3) TCP 서버 스레드 (드론 데이터 수신)
# -----------------------------
def drone_tcp_server():
    HOST = "0.0.0.0"
    PORT = 6000

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, PORT))
        s.listen(1)
        print(f"[TCP] Listening on {HOST}:{PORT}")

        conn, addr = s.accept()
        print(f"[TCP] Drone connected from {addr}")

        with conn:
            while True:
                data = conn.recv(1024)
                if not data:
                    print("[TCP] Drone disconnected")
                    break

                try:
                    msg = json.loads(data.decode())
                    drone_status.update(msg)
                except:
                    print("[TCP] Invalid JSON received")

# -----------------------------
# 메인 실행
# -----------------------------
if __name__ == "__main__":
    # TCP 서버를 별도 스레드로 실행
    t = threading.Thread(target=drone_tcp_server, daemon=True)
    t.start()

    # Flask 실행
    app.run(host="0.0.0.0", port=5000)
```

---

# 🟩 2단계: 웹 대시보드 HTML (Chart.js 그래프)

`templates/dashboard.html` 파일을 만들어줘.

### 📌 templates/dashboard.html

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>드론 관제 대시보드</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>

<body>
    <h1>드론 관제 대시보드</h1>

    <div style="width: 600px;">
        <canvas id="batteryChart"></canvas>
    </div>

    <div style="width: 600px; margin-top: 40px;">
        <canvas id="altitudeChart"></canvas>
    </div>

    <script>
        // -----------------------------
        // Chart.js 그래프 초기화
        // -----------------------------
        const batteryCtx = document.getElementById('batteryChart');
        const altitudeCtx = document.getElementById('altitudeChart');

        const batteryChart = new Chart(batteryCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '배터리 (%)',
                    data: [],
                    borderColor: 'red',
                    borderWidth: 2
                }]
            }
        });

        const altitudeChart = new Chart(altitudeCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '고도 (m)',
                    data: [],
                    borderColor: 'blue',
                    borderWidth: 2
                }]
            }
        });

        // -----------------------------
        // 주기적으로 서버에서 상태 가져오기
        // -----------------------------
        function updateCharts() {
            fetch("/status")
                .then(res => res.json())
                .then(data => {
                    const time = new Date().toLocaleTimeString();

                    batteryChart.data.labels.push(time);
                    batteryChart.data.datasets[0].data.push(data.battery);
                    batteryChart.update();

                    altitudeChart.data.labels.push(time);
                    altitudeChart.data.datasets[0].data.push(data.altitude);
                    altitudeChart.update();
                });
        }

        setInterval(updateCharts, 1000); // 1초마다 업데이트
    </script>
</body>
</html>
```

---

# 🟧 3단계: 드론 측 테스트 클라이언트 (데이터 전송)

### 📌 drone_client.py

```python
import socket
import json
import time
import random

SERVER_IP = "192.168.0.10"  # Flask 서버 IP
SERVER_PORT = 6000

def main():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect((SERVER_IP, SERVER_PORT))
        print("[DRONE] Connected to server")

        battery = 100
        altitude = 0

        while True:
            battery -= random.uniform(0.1, 0.5)
            altitude += random.uniform(-1, 2)

            status = {
                "battery": round(battery, 1),
                "altitude": round(altitude, 1),
                "gps": [37.12, 127.56]
            }

            s.sendall(json.dumps(status).encode())
            print("[DRONE] Sent:", status)

            time.sleep(1)

if __name__ == "__main__":
    main()
```

---

# 🟦 4단계: 실행 순서

1) Flask + TCP 서버 실행  
```
python server_dashboard.py
```

2) 웹 브라우저에서 접속  
```
http://localhost:5000
```

3) 드론 클라이언트 실행  
```
python drone_client.py
```

4) 대시보드에서 실시간 그래프 확인  

---

# 🎯 완성되는 기능

- 드론 → TCP → Flask 서버로 실시간 상태 전송  
- Flask → Chart.js로 실시간 그래프 표시  
- 배터리/고도/위치 등 원하는 항목 추가 가능  
- 여러 드론 확장도 가능  

---

**실제 관제 시스템의 기본 구조**

다음 단계 : 

- 여러 드론 동시 관제 대시보드  
- 지도(Mapbox/Leaflet) 기반 GPS 시각화  
- WebSocket 기반 초저지연 스트리밍  
- 드론 영상까지 웹에서 실시간 표시  
