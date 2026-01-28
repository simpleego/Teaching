좋습니다 👍 파이썬의 **스레드(Thread)** 개념을 기초부터 단계적으로 학습할 수 있도록 예제를 준비했습니다. 각 단계는 난이도가 조금씩 올라가며, 최소 5개 이상 예제를 제공합니다.  

---

# 🧵 파이썬 스레드 단계별 학습 예제

## 1️⃣ 기본 스레드 생성
```python
import threading

def worker():
    print("스레드가 실행 중입니다!")

# 스레드 객체 생성
t = threading.Thread(target=worker)

# 스레드 시작
t.start()

# 메인 스레드와 합류
t.join()
print("메인 스레드 종료")
```
👉 `Thread` 객체를 만들고 `start()`로 실행, `join()`으로 종료를 기다립니다.

---

## 2️⃣ 여러 개의 스레드 실행
```python
import threading

def worker(num):
    print(f"스레드 {num} 실행 중")

threads = []
for i in range(5):
    t = threading.Thread(target=worker, args=(i,))
    threads.append(t)
    t.start()

for t in threads:
    t.join()

print("모든 스레드 종료")
```
👉 여러 스레드를 동시에 실행하고 모두 종료될 때까지 기다립니다.

---

## 3️⃣ 스레드와 공유 자원 문제
```python
import threading

counter = 0

def increment():
    global counter
    for _ in range(100000):
        counter += 1

t1 = threading.Thread(target=increment)
t2 = threading.Thread(target=increment)

t1.start()
t2.start()
t1.join()
t2.join()

print("최종 counter 값:", counter)
```
👉 공유 변수 `counter`를 동시에 수정하면 **경쟁 조건(Race Condition)** 발생 → 값이 예상과 다를 수 있음.

---

## 4️⃣ Lock(잠금)으로 경쟁 조건 해결
```python
import threading

counter = 0
lock = threading.Lock()

def safe_increment():
    global counter
    for _ in range(100000):
        with lock:  # 잠금으로 보호
            counter += 1

t1 = threading.Thread(target=safe_increment)
t2 = threading.Thread(target=safe_increment)

t1.start()
t2.start()
t1.join()
t2.join()

print("최종 counter 값:", counter)
```
👉 `Lock`을 사용하면 공유 자원을 안전하게 보호할 수 있습니다.

---

## 5️⃣ 데몬 스레드 (백그라운드 실행)
```python
import threading
import time

def background_task():
    while True:
        print("백그라운드 작업 실행 중...")
        time.sleep(1)

t = threading.Thread(target=background_task, daemon=True)
t.start()

print("메인 스레드 종료 (데몬 스레드는 자동 종료됨)")
```
👉 `daemon=True` 옵션을 주면 메인 스레드가 끝날 때 자동으로 종료됩니다.

---

## 6️⃣ 스레드 풀(ThreadPoolExecutor) 활용
```python
from concurrent.futures import ThreadPoolExecutor

def task(n):
    return n * n

with ThreadPoolExecutor(max_workers=3) as executor:
    results = list(executor.map(task, range(5)))

print("결과:", results)
```
👉 `ThreadPoolExecutor`를 사용하면 스레드 관리가 훨씬 편리합니다.

---

# 📌 정리
- **기본 스레드 생성** → `Thread` 객체와 `start()`, `join()`
- **여러 스레드 실행** → 동시에 작업 수행
- **경쟁 조건** → 공유 자원 문제 발생
- **Lock 사용** → 안전하게 공유 자원 관리
- **데몬 스레드** → 백그라운드 작업
- **ThreadPoolExecutor** → 스레드 풀로 효율적 관리

---

혹시 이 예제를 **실습용 튜토리얼 노트북** 형식으로 정리해드릴까요? 그러면 직접 실행하면서 학습하기 더 편리할 거예요.



좋습니다 👍 파이썬 스레드 학습의 대표적인 예제로 **생산자-소비자 문제**를 추가해드릴게요. 이 문제는 멀티스레드 환경에서 자원을 안전하게 공유하는 방법을 배우기에 아주 적합합니다.  

---

# 🏭 생산자-소비자 문제 (Producer-Consumer Problem)

## 🔹 기본 구조
- **생산자(Producer)**: 데이터를 만들어서 큐에 넣음
- **소비자(Consumer)**: 큐에서 데이터를 꺼내서 처리
- **Queue**: 스레드 안전(thread-safe)한 자료구조 → `queue.Queue` 사용

---

## 📌 예제 코드
```python
import threading
import queue
import time
import random

# 공유 큐 (버퍼)
buffer = queue.Queue(maxsize=5)

def producer():
    for i in range(10):
        item = random.randint(1, 100)
        buffer.put(item)  # 큐에 아이템 추가
        print(f"생산자: {item} 생산")
        time.sleep(random.uniform(0.1, 0.5))  # 생산 속도 조절

def consumer():
    for i in range(10):
        item = buffer.get()  # 큐에서 아이템 꺼내기
        print(f"소비자: {item} 소비")
        buffer.task_done()
        time.sleep(random.uniform(0.2, 0.6))  # 소비 속도 조절

# 스레드 생성
producer_thread = threading.Thread(target=producer)
consumer_thread = threading.Thread(target=consumer)

# 실행
producer_thread.start()
consumer_thread.start()

# 종료 대기
producer_thread.join()
consumer_thread.join()

print("생산자-소비자 작업 완료")
```

---

## 🔎 실행 흐름
- 생산자는 랜덤한 숫자를 만들어 큐에 넣음
- 소비자는 큐에서 꺼내서 처리
- `queue.Queue`는 내부적으로 Lock을 사용하므로 안전하게 공유 가능
- `task_done()`은 소비자가 작업을 끝냈음을 알림

---

## 🚀 확장 아이디어
- 여러 생산자, 여러 소비자 스레드를 동시에 실행
- `maxsize`를 조절해 버퍼 크기 제한 실험
- 생산자와 소비자 속도를 다르게 해서 **큐가 비거나 꽉 차는 상황** 관찰

---

이제 전체 학습 흐름은 다음과 같이 정리됩니다:  
1. 기본 스레드 생성  
2. 여러 스레드 실행  
3. 공유 자원 문제 (Race Condition)  
4. Lock으로 해결  
5. 데몬 스레드  
6. ThreadPoolExecutor  
7. 생산자-소비자 문제 (실전 패턴)  

---

👉 이렇게 하면 파이썬 스레드의 기초부터 실전 패턴까지 단계적으로 학습할 수 있습니다.  

혹시 이 예제들을 **실습용 Jupyter Notebook** 형식으로 묶어서 드릴까요? 그러면 직접 실행하면서 학습하기 훨씬 편리할 거예요.
