# AI시대 개발자에 필요한 도메인 역량

> **“AI를 이용해 코드를 만드는 능력”**보다 **“특정 업무를 이해하고 그것을 소프트웨어 문제로 변환하는 능력”**이라고 보는 것이 적절합니다.
> 특히 비전공자 취업교육에서는 `Python 문법 → Spring/FastAPI → 프로젝트`처럼 기술을 순서대로 나열하는 방식보다, **도메인 이해 → 문제 정의 → 데이터 이해 → 시스템 설계 → Agent 구현 → 검증**의 흐름으로 교육과정을 재구성하는 것이 효과적입니다.

## 1. 먼저 ‘도메인 역량’의 의미를 명확히 할 필요가 있습니다

개발자에게 필요한 도메인 역량은 그 분야의 전문가가 되는 것과는 조금 다릅니다.

예를 들어 쇼핑몰 개발자라면 유통 전문가만큼 많이 알 필요는 없지만 최소한 다음 관계를 이해해야 합니다.

---

[개발자의_도메인역량](https://github.com/user-attachments/assets/9b2f2aa9-0cc6-4a0b-9dec-41b999395fc8)

---

이것이 바로 **Domain Knowledge + Software Engineering**의 접점입니다.

---

# 2. 학생에게 가장 먼저 가르쳐야 할 것: 업무 프로세스 이해

도메인 교육의 핵심은 용어를 암기하는 것이 아니라 **업무의 흐름을 이해하는 것**입니다.

예를 들어 취업교육용 도메인을 하나 선택했다면 학생이 가장 먼저 다음을 그릴 수 있어야 합니다.

### 쇼핑몰

```text
회원가입
  ↓
상품검색
  ↓
장바구니
  ↓
주문
  ↓
결제
  ↓
재고차감
  ↓
배송
  ↓
구매확정
```

### 병원

```text
환자등록
  ↓
예약
  ↓
접수
  ↓
진료
  ↓
검사
  ↓
처방
  ↓
수납
```

### 교육기관

```text
수강신청
  ↓
등록
  ↓
수업
  ↓
출결
  ↓
평가
  ↓
수료
  ↓
취업관리
```

학생이 코딩에 들어가기 전에

> **“이 서비스에서 실제로 어떤 일이 발생하는가?”**

부터 설명할 수 있도록 만드는 것이 중요합니다.

---

# 3. 두 번째는 도메인 용어와 개념입니다

도메인마다 고유한 언어가 있습니다.

예를 들어 쇼핑몰이라면:

| 일반적인 표현  | 도메인 개념        |
| -------- | ------------- |
| 물건       | 상품(Product)   |
| 남아 있는 물건 | 재고(Inventory) |
| 구매 신청    | 주문(Order)     |
| 돈 지불     | Payment       |
| 주문 취소    | Cancellation  |
| 돈 돌려주기   | Refund        |
| 배송 정보    | Fulfillment   |

개발자가 이러한 개념을 구분하지 못하면 DB 설계부터 잘못될 수 있습니다.

예를 들어 초보자는 흔히

```text
Product
 └── quantity
```

처럼 상품 테이블 하나에 재고를 넣으려고 합니다.

하지만 실제 서비스에서는

```text
Product
SKU
Warehouse
Inventory
InventoryTransaction
```

등으로 점점 분리됩니다.

따라서 학생에게

> **“도메인 용어 → 데이터 모델”**

의 연결을 지속적으로 경험시키는 것이 좋습니다.

---

# 4. 세 번째는 ‘업무 규칙’을 찾아내는 능력입니다

이것은 앞으로 Agent 시대에 특히 중요합니다.

AI에게

```text
환불 기능 만들어줘.
```

라고 하면 코드는 만들 수 있습니다.

하지만 실제 핵심은 다음입니다.

```text
구매 후 며칠까지 환불 가능한가?

배송 전인가?
배송 후인가?

부분 환불이 가능한가?

쿠폰을 사용했다면?

적립금은?

카드 결제 취소는?

재고는 언제 복구되는가?
```

이러한 것을 **Business Rule**이라고 합니다.

학생에게 다음 구조로 요구사항을 작성하게 하는 것이 좋습니다.

```text
Rule 01
배송 전 주문은 전액 취소할 수 있다.

Rule 02
배송 완료 후 7일 이내 반품을 신청할 수 있다.

Rule 03
반품 승인 후 재고를 복구한다.

Rule 04
카드 결제 취소 성공 후 환불 상태를 완료로 변경한다.
```

Agent에게 코드 작성을 맡기더라도 이 규칙을 만드는 것은 사람이 해야 합니다.

---

# 5. 네 번째는 ‘정상 흐름’보다 예외 상황을 찾는 훈련입니다

초보자가 가장 부족한 부분 중 하나입니다.

학생은 보통 다음만 생각합니다.

```text
로그인 → 성공
결제 → 성공
파일 업로드 → 성공
```

하지만 현업 개발자는 다음부터 생각합니다.

```text
로그인
 ├─ 정상
 ├─ 비밀번호 오류
 ├─ 존재하지 않는 사용자
 ├─ 휴면 계정
 ├─ 잠긴 계정
 └─ 서버 장애
```

결제라면 더 복잡합니다.

```text
결제 요청
 ├─ 성공
 ├─ 잔액 부족
 ├─ 카드 한도 초과
 ├─ PG 응답 지연
 ├─ 결제 성공 + DB 실패
 └─ 중복 결제
```

따라서 학생에게 끊임없이

> **“그런데 만약 ○○라면?”**

이라는 사고를 하도록 훈련시키는 것이 좋습니다.

이 능력이 테스트 설계 능력으로 연결됩니다.

---

# 6. 다섯 번째는 데이터를 읽는 능력입니다

Agent 시대에는 프로그래머와 데이터 직무의 경계도 상당히 가까워집니다.

개발자가 최소한 다음을 이해해야 합니다.

```text
Domain
   ↓
Entity
   ↓
Data
   ↓
Database
   ↓
API
   ↓
Application
   ↓
AI
```

예를 들어 쇼핑몰이라면

```text
Customer
Product
Order
OrderItem
Payment
Delivery
Review
```

를 찾아내고 관계를 이해해야 합니다.

```text
Customer
   │
   └── Order
         │
         ├── OrderItem ── Product
         │
         ├── Payment
         │
         └── Delivery
```

이러한 **Entity Relationship 사고**를 제대로 이해시키는 것이 SQL 문법 몇 개를 더 배우는 것보다 장기적으로 훨씬 중요할 수 있습니다.

---

# 7. KPI와 ‘업무 목적’을 이해하도록 해야 합니다

개발자가 기능만 보는 것도 앞으로는 부족합니다.

예를 들어 쇼핑몰에서:

```text
검색 기능
```

을 개발한다고 하더라도 기업의 관심은 단순히 검색 API가 동작하는 것이 아닙니다.

```text
검색 → 상품 클릭률
        ↓
     장바구니율
        ↓
      구매율
```

따라서 학생에게 최소한 다음 사고방식을 익히게 하는 것이 좋습니다.

```text
기능

"What does it do?"

        ↓

업무 목적

"Why does the business need it?"

        ↓

성과 지표

"How do we know it works?"
```

이것은 나중에 Product Engineer나 AI Service Engineer에게 특히 중요한 역량이 됩니다.

---

# 8. 도메인 지식을 바로 소프트웨어 설계로 연결해야 합니다

도메인 수업을 별도의 경영학 수업처럼 운영하면 효과가 떨어집니다.

항상 다음 연결을 만들어주는 것이 중요합니다.

| 도메인 개념   | 개발 결과                  |
| -------- | ---------------------- |
| 고객       | User Entity            |
| 상품       | Product Model          |
| 주문       | Order Model            |
| 재고       | Inventory              |
| 주문 프로세스  | API Workflow           |
| 업무 규칙    | Business Logic         |
| 예외 상황    | Exception Handling     |
| 업무 규칙 검증 | Test Case              |
| 업무 데이터   | Database               |
| 업무 성과    | Monitoring / Analytics |

즉,

```text
현실 세계
    ↓
Domain Model
    ↓
Data Model
    ↓
API
    ↓
Business Logic
    ↓
Test
```

를 하나의 과정으로 학습시켜야 합니다.

---

# 9. Agent 시대에는 ‘요구사항 명세 능력’을 별도 과목 수준으로 다루는 것이 좋습니다

앞으로 매우 중요한 역량이라고 봅니다.

예를 들어 학생에게 단순히

```text
회원가입 구현
```

이라는 과제를 주기보다 다음과 같이 만들게 합니다.

```text
Feature
회원가입

Input
- email
- password
- name

Business Rules
- 이메일은 중복될 수 없음
- 비밀번호는 8자 이상
- 이메일 인증 필요

Output
- user_id
- created_at

Exceptions
- DuplicateEmail
- InvalidPassword
- EmailVerificationFailed

Acceptance Criteria
- 정상 가입 성공
- 중복 이메일 차단
- 잘못된 이메일 형식 차단
- 비밀번호 정책 검증
```

그리고 이것을 Agent에게 전달합니다.

```text
Specification
       ↓
    Agent
       ↓
Implementation
       ↓
Test
       ↓
Human Review
```

학생은 자연스럽게 **Specification Engineering**을 배우게 됩니다.

---

# 10. 추가적으로 반드시 필요한 역량

도메인 역량만으로는 충분하지 않습니다. 앞으로의 개발자는 다음 역량을 함께 가져야 합니다.

| 역량                      | 학생이 배워야 할 핵심                             |
| ----------------------- | ---------------------------------------- |
| **CS 기초**               | OS, Network, Process, Memory, HTTP       |
| **프로그래밍 원리**            | 자료구조, 함수, 객체, 비동기, 예외처리                  |
| **데이터 역량**              | SQL, ERD, 데이터 품질, 데이터 흐름                 |
| **API 설계**              | REST, 인증, 상태코드, 오류 설계                    |
| **Architecture**        | Client/Server/DB/Cache/Queue 구조          |
| **Specification**       | 요구사항, Business Rule, Acceptance Criteria |
| **Testing**             | Unit/Integration/E2E, Edge Case          |
| **Agent 활용**            | Coding Agent, Task 분해, Context 제공        |
| **Context Engineering** | Agent가 필요한 정보를 정확히 공급                    |
| **Evaluation**          | AI·소프트웨어 결과를 어떻게 평가할 것인가                 |
| **Observability**       | Log, Metric, Trace                       |
| **Security**            | 인증, 권한, 개인정보, Injection                  |
| **DevOps**              | Git, CI/CD, Docker, Cloud                |
| **커뮤니케이션**              | 요구사항 질문, 문서화, 코드 리뷰                      |
| **Product 사고**          | 사용자 문제, KPI, 비용, 비즈니스 가치                 |

---

# 11. 특히 ‘Context Engineering’을 학생에게 가르칠 필요가 있습니다

앞으로 중요도가 크게 증가할 영역입니다.

Agent에게 단순히

```text
이 기능 만들어줘.
```

가 아니라

```text
프로젝트 구조
기존 코드
DB Schema
API Specification
Coding Convention
Business Rules
Test Requirement
관련 문서
```

를 제공해야 합니다.

즉 Agent 성능은 상당 부분

```text
Agent 능력
   ×
Context 품질
```

에 의해 결정됩니다.

RAG, LLM Wiki, MCP도 사실 이 관점에서 연결할 수 있습니다.

```text
Domain Knowledge
       ↓
Documentation
       ↓
LLM Wiki
       ↓
RAG
       ↓
MCP / Tools
       ↓
Agent
       ↓
Software Development
```

따라서 학생에게 **문서를 잘 만드는 것도 개발 역량**이라는 인식을 심어주는 것이 중요합니다.

---

# 12. 교육에서는 여러 도메인을 조금씩 배우는 것보다 하나를 깊게 경험하는 것이 좋습니다

예를 들어 5개의 프로젝트를

```text
쇼핑몰
병원
은행
교육
물류
```

각각 조금씩 경험하는 것보다,

하나의 쇼핑몰을 가지고

```text
1단계 회원

2단계 상품

3단계 주문

4단계 결제

5단계 재고

6단계 배송

7단계 고객상담

8단계 데이터 분석

9단계 추천 AI

10단계 Agent
```

까지 확장하는 방식이 훨씬 도움이 됩니다.

학생은 비로소

```text
Domain
→ Data
→ API
→ Architecture
→ AI
```

가 하나로 연결되는 경험을 하게 됩니다.

---

# 13. 비전공자 취업교육이라면 이런 비중을 권하고 싶습니다

기존 IT 교육이 다음과 같았다면

```text
Programming       40%
Framework         30%
DB                15%
Project           15%
```

앞으로는 오히려 다음에 가까운 구성이 적합하다고 봅니다.

| 영역                           |   권장 비중 |
| ---------------------------- | ------: |
| CS·프로그래밍 기초                  |     20% |
| Domain·업무 프로세스               | **15%** |
| 데이터·DB·API                   |     15% |
| Architecture                 |     10% |
| 요구사항·Specification           | **10%** |
| AI Agent·Context Engineering | **15%** |
| Test·Evaluation·Debugging    |     10% |
| DevOps·운영·보안                 |      5% |

여기에서 중요한 것은 **Domain을 15시간 이론으로 가르치라는 의미가 아닙니다.**

프로젝트 전체에서 계속 사용해야 합니다.

```text
Domain 이해
     ↓
요구사항
     ↓
데이터 모델
     ↓
API 설계
     ↓
Agent 구현
     ↓
테스트
     ↓
문제 발견
     ↓
Domain Rule 수정
     ↓
재구현
```

이 자체가 앞으로의 개발 실습이 되어야 합니다.

---

## 제가 강사 입장에서 가장 중요하게 볼 교육 목표는 이것입니다

학생에게 다음 세 질문을 계속 던지게 하는 것입니다.

> **① 왜 이 기능이 필요한가?**
> **② 실제 업무에서는 어떻게 동작하는가?**
> **③ AI가 만든 결과가 맞다는 것을 어떻게 증명할 것인가?**

이 세 가지에 답할 수 있다면 단순한 **AI 사용자나 코더**를 넘어 상당히 좋은 **Agent 시대의 Software Engineer**로 성장할 가능성이 높습니다.

따라서 앞으로 비전공자 대상 개발자 교육의 최종 모습은 저는 다음과 같이 보는 것이 가장 적절하다고 생각합니다.

```text
             Domain Knowledge
                    │
                    ▼
            Problem Definition
                    │
                    ▼
             Specification
                    │
                    ▼
          Data / Architecture
                    │
                    ▼
             AI Agent
          ┌─────────┴─────────┐
          ▼                   ▼
        Coding               Test
          │                   │
          └─────────┬─────────┘
                    ▼
             Human Review
                    │
                    ▼
        Deployment / Operation
                    │
                    ▼
             Domain Feedback
                    │
                    └──────→ 반복
```

결국 앞으로 강사의 역할도 **“코딩 방법을 알려주는 사람”에서 “학생이 현실의 문제를 소프트웨어 문제로 구조화하고, Agent를 활용하여 해결하고, 결과를 검증할 수 있도록 만드는 사람”**으로 이동한다고 볼 수 있습니다. 특히 비전공자 중심의 취업교육에서는 이 변화가 오히려 기회가 될 수 있습니다. 순수 코딩 경험의 격차를 Agent가 줄여주는 대신, **업무 이해·논리적 사고·문제 구조화·검증 능력**이 학생을 구분하는 새로운 기준이 되기 때문입니다.
