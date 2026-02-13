학생 대상 **Redis 강의 커리큘럼**은 “개념 이해 → 실습 → 실전 활용” 흐름으로 구성하는 것이 가장 효과적입니다.
아래는 **입문자부터 실무 활용까지 단계별 강의 구성안**입니다.

---

## 1. Redis 개요 (이론 중심)

### ✅ Redis란 무엇인가

* **Redis** 개요
* In-Memory Data Store
* Key-Value 기반 NoSQL DB
* Cache, Message Broker, Session Store 역할

### ✅ Redis 특징

* 초고속 처리 (RAM 기반)
* 단순한 구조
* 다양한 자료구조 지원
* 싱글 스레드 + 이벤트 루프 구조
* 오픈소스

### ✅ Redis vs RDBMS vs MongoDB

| 구분 | Redis     | MySQL | MongoDB  |
| -- | --------- | ----- | -------- |
| 저장 | 메모리       | 디스크   | 디스크      |
| 속도 | 매우 빠름     | 보통    | 빠름       |
| 구조 | Key-Value | Table | Document |
| 용도 | 캐시, 세션    | 트랜잭션  | JSON 데이터 |

---

## 2. Redis 설치 및 기본 사용법 (실습)

### ✅ 설치

* Windows / Linux / Docker

```bash
docker run -d -p 6379:6379 redis
```

### ✅ Redis CLI 사용법

```bash
redis-cli
ping
set name hong
get name
del name
```

### ✅ Key 개념

* Key-Value 구조
* TTL(Time To Live)

```bash
set token abc123 EX 60
ttl token
```

---

## 3. Redis 자료구조 (핵심 파트)

### ✅ String

```bash
set score 100
incr score
```

### ✅ List (Queue, Stack)

```bash
lpush queue a
rpop queue
```

### ✅ Set (중복 제거)

```bash
sadd users tom
smembers users
```

### ✅ Hash (객체 저장)

```bash
hset user:1 name kim age 20
hgetall user:1
```

### ✅ Sorted Set (랭킹)

```bash
zadd rank 100 kim
zrange rank 0 -1 withscores
```

---

## 4. Redis 아키텍처 이해

### ✅ 메모리 구조

* RAM 기반 저장
* eviction 정책 (LRU, LFU)

### ✅ Persistence (영속성)

* RDB Snapshot
* AOF(Append Only File)

### ✅ Replication

* Master-Slave 구조

### ✅ Cluster

* 샤딩(분산 저장)

---

## 5. Redis 활용 사례 (실무 중심)

### ✅ 캐시(Cache)

* DB 조회 결과 저장
* API 응답 캐싱

### ✅ 세션 관리

* 로그인 세션 저장

### ✅ 메시지 큐

* Pub/Sub

```bash
subscribe chat
publish chat "hello"
```

### ✅ 랭킹 시스템

* 게임 점수
* 조회수 순위

### ✅ 실시간 데이터 처리

* 채팅
* 알림 시스템

---

## 6. 프로그래밍 연동 (Python/Java)

### ✅ Python 연동 (redis-py)

```python
import redis
r = redis.Redis(host='localhost', port=6379)

r.set("name", "hong")
print(r.get("name"))
```

### ✅ FastAPI + Redis 캐시 예제

* API 응답 캐싱 구조 설명

---

## 7. 보안 및 운영

### ✅ 보안

* password 설정
* bind 설정
* 외부접속 차단

### ✅ 운영 관리

* 메모리 모니터링
* redis.conf 이해
* 백업 전략

---

## 8. 실습 프로젝트 (권장)

### 📌 프로젝트 예시

1. **로그인 세션 관리 시스템**
2. **실시간 채팅 서버 (Pub/Sub)**
3. **조회수 랭킹 시스템**
4. **API 캐시 서버**
5. **타이머/카운터 앱**

---

## 9. 고급 주제 (심화 과정)

* Pipeline & Transaction
* Lua Script
* Redis Streams
* Redis Cluster 구성
* 장애 복구 전략
* Redis Sentinel

---

## 추천 강의 구성 (시간별)

### 🔹 1일 과정 (기초)

1. Redis 개요
2. 설치 및 CLI
3. 자료구조 실습
4. 캐시/세션 예제

### 🔹 2~3일 과정 (심화)

1. 아키텍처
2. Python 연동
3. 프로젝트
4. 운영 및 보안

---

## 학생 대상 강의 포인트

✔ 이론보다 **실습 중심**
✔ "왜 Redis를 쓰는가"를 사례로 설명
✔ MySQL과 비교
✔ 게임 랭킹 / 채팅 / 로그인 예제로 흥미 유발
✔ CLI → 코드 → 프로젝트 흐름 유지

---

원하시면 다음 단계로 다음 중 하나를 만들어 드릴 수 있습니다:

1️⃣ **Redis 강의용 PPT 목차(슬라이드 20~30장 구성안)**
2️⃣ **실습 코드 포함 1주일 커리큘럼 상세안**
3️⃣ **Redis 입문 실습 프로젝트 전체 코드 (FastAPI + Redis)**
4️⃣ **학생용 교안 형태 문서(이론+예제)**

어느 형태로 만들어 드릴까요?
👉 `1번 / 2번 / 3번 / 4번 중 원하는 번호`를 말씀해 주세요.
