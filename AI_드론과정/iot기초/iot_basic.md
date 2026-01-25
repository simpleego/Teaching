
# IOT 기초 프로그래밍
>  🎓 파이썬으로 IoT 강의를 진행할 때 학생들이 단계별로 배워야 할 핵심 내용을 **코드 중심으로**
> IoT는 "센서 → 데이터 수집 → 전송 → 처리 → 시각화" 흐름을 이해하는 것이 중요합니다. 아래는 단계별 학습 코드

---

## 📌 1단계: 기본 파이썬 문법 복습
IoT를 하기 전에 파이썬 기초가 필요합니다.
```python
# 변수와 출력
temperature = 25
print("현재 온도:", temperature)

# 조건문
if temperature > 30:
    print("에어컨을 켜세요")
else:
    print("괜찮습니다")

# 반복문
for i in range(5):
    print("센서 데이터:", i)
```

---

## 📌 2단계: 가상 센서 데이터 생성
실제 센서가 없을 때는 랜덤 데이터를 사용해 시뮬레이션합니다.
```python
import random
import time

for i in range(10):
    temperature = random.uniform(20, 35)  # 20~35도 사이 랜덤 값
    humidity = random.uniform(40, 70)     # 40~70% 사이 랜덤 값
    print(f"온도: {temperature:.2f}°C, 습도: {humidity:.2f}%")
    time.sleep(1)  # 1초 간격으로 데이터 출력
```

---

## 📌 3단계: 센서 데이터 저장 (CSV 파일)
IoT 데이터는 저장 및 분석이 필요합니다.
```python
import csv
import random

with open("sensor_data.csv", "w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["Temperature", "Humidity"])  # 헤더 작성
    
    for i in range(10):
        temperature = random.uniform(20, 35)
        humidity = random.uniform(40, 70)
        writer.writerow([temperature, humidity])

print("데이터 저장 완료!")
```

---

## 📌 4단계: 네트워크 전송 (MQTT 예제)
IoT에서 가장 많이 쓰이는 프로토콜은 **MQTT**입니다.
```python
import paho.mqtt.client as mqtt
import random
import time

broker = "test.mosquitto.org"
topic = "iot/classroom/data"

client = mqtt.Client()
client.connect(broker, 1883, 60)

for i in range(5):
    temperature = random.uniform(20, 35)
    message = f"Temperature: {temperature:.2f}"
    client.publish(topic, message)
    print("전송:", message)
    time.sleep(2)

client.disconnect()
```

---

## 📌 5단계: 데이터 시각화
수집한 데이터를 그래프로 표현합니다.
```python
import matplotlib.pyplot as plt
import csv

temperatures = []
humidities = []

with open("sensor_data.csv", "r") as file:
    reader = csv.DictReader(file)
    for row in reader:
        temperatures.append(float(row["Temperature"]))
        humidities.append(float(row["Humidity"]))

plt.plot(temperatures, label="Temperature (°C)")
plt.plot(humidities, label="Humidity (%)")
plt.legend()
plt.xlabel("Sample")
plt.ylabel("Value")
plt.title("IoT Sensor Data")
plt.show()
```

---

## 📌 6단계: 실제 IoT 확장
- **라즈베리파이**에서 GPIO 제어 (LED, 모터, 센서)
- **클라우드 연동** (AWS IoT, Azure IoT Hub, Google Cloud IoT Core)
- **AI 적용** (수집된 데이터로 예측 모델 학습)

---

👉 이렇게 단계별로 진행하면 학생들이 **기초 → 데이터 생성 → 저장 → 전송 → 시각화 → 확장** 흐름을 자연스럽게 이해할 수 있습니다.  

혹시 강의 대상이 **중학생/고등학생**인지, 아니면 **대학/직장인**인지 알려주시면 난이도를 맞춰서 더 구체적인 예제를 짜드릴까요?
