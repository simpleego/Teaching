# *둘 다 SQLAlchemy ORM을 사용하지만, 역할과 추상화 레벨이 다릅니다.**
하나는 **“연결 테이블(association table)” 정의**, 다른 하나는 **“엔티티(모델) 클래스” 정의**입니다.

아래에서 정확히 구분해 설명하겠습니다.

---

## 1️⃣ `question_voter = Table(...)`

### ✔️ **순수한 테이블 정의 (Association Table)**

```python
question_voter = Table(
    'question_voter',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('user.id'), primary_key=True),
    Column('question_id', Integer, ForeignKey('question.id'), primary_key=True)
)
```

### 🔹 특징

* **클래스가 없음**
* SQLAlchemy의 **Core 레벨 Table 객체**
* **다대다(Many-to-Many)** 관계를 위한 **중간 테이블**
* 추가적인 컬럼이 없는 “순수 연결용 테이블”

### 🔹 사용 목적

> **User ↔ Question 사이의 투표 관계**를 표현

즉,

* 어떤 사용자가
* 어떤 질문에
* 투표했는가

만 저장하는 테이블입니다.

### 🔹 ORM에서의 역할

* 직접 CRUD 대상으로 사용 ❌
* `relationship(secondary=...)`에서 **조인용 테이블**로만 사용

---

## 2️⃣ `class Question(Base):`

### ✔️ **ORM 엔티티(모델) 클래스**

```python
class Question(Base):
    __tablename__ = "question"

    id = Column(Integer, primary_key=True)
    subject = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    create_date = Column(DateTime, nullable=False)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    user = relationship("User", backref="question_users")
    modify_date = Column(DateTime, nullable=True)
    voter = relationship(
        'User',
        secondary=question_voter,
        backref='question_voters'
    )
```

### 🔹 특징

* **Python 클래스 = DB 테이블**
* ORM의 핵심 개념인 **엔티티(Entity)**
* 객체 단위로 CRUD 가능

```python
q = Question(subject="질문", content="내용")
session.add(q)
session.commit()
```

### 🔹 ORM에서의 역할

* 실제 **비즈니스 모델**
* 도메인 로직이 붙는 대상
* API 응답, 서비스 로직의 중심

---

## 3️⃣ `relationship(..., secondary=question_voter)`의 의미

```python
voter = relationship(
    'User',
    secondary=question_voter,
    backref='question_voters'
)
```

이 한 줄이 **두 정의를 연결**합니다.

### 내부적으로 일어나는 일

```sql
SELECT user.*
FROM user
JOIN question_voter ON user.id = question_voter.user_id
WHERE question_voter.question_id = :qid
```

### Python에서는 이렇게 사용 가능

```python
question.voter.append(user)
```

→ SQLAlchemy가 자동으로
`question_voter` 테이블에 `(user_id, question_id)` 레코드를 추가

---

## 4️⃣ 핵심 차이 요약 (정리 표)

| 구분      | `Table(...)`    | `class Question(Base)` |
| ------- | --------------- | ---------------------- |
| 레벨      | SQLAlchemy Core | SQLAlchemy ORM         |
| 형태      | 테이블 객체          | Python 클래스             |
| 목적      | 관계(조인) 표현       | 엔티티(도메인 모델)            |
| CRUD 대상 | ❌ 직접 사용 안 함     | ⭕ 직접 사용                |
| 다대다     | ⭕ 필수            | ⭕ 관계의 한쪽               |
| 비즈니스 로직 | ❌               | ⭕                      |

---

## 5️⃣ 언제 클래스로 중간 테이블을 만들어야 할까?

지금은 **Table로 정의한 것이 최선**입니다.
하지만 아래 상황이면 **중간 테이블도 클래스로 바꿔야 합니다.**

### ❗ 이런 경우

```text
- 투표 시간 저장
- 투표 타입 (찬성/반대)
- 중복 투표 여부
- soft delete
```

### 이때의 구조

```python
class QuestionVote(Base):
    __tablename__ = "question_voter"
    user_id = Column(Integer, ForeignKey("user.id"), primary_key=True)
    question_id = Column(Integer, ForeignKey("question.id"), primary_key=True)
    vote_date = Column(DateTime)
```

→ **Association Object Pattern**

---

## 🔚 한 문장 요약

> `Table(...)`은 **관계를 위한 도구**,
> `class Question(Base)`는 **데이터와 로직을 담는 객체**입니다.

원하시면
✔️ 중간 테이블을 클래스로 바꾸는 예제
✔️ ERD 그림으로 구조 설명
✔️ FastAPI + Pydantic 연동 시 주의점

중에서 이어서 설명해 드릴 수 있습니다.
