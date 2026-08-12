학생 교육용 Loop Engineering 프로젝트는 **“AI에게 무엇을 만들라고 시키는가”보다 “AI가 자신의 결과를 무엇으로 검증하게 할 것인가”**가 더 중요합니다. 현재 Loop Engineering 논의에서도 핵심 구성요소를 목표, 실행, 검증, 종료조건, 필요하면 기억(memory)까지 포함한 반복 구조로 봅니다. ([arXiv][1])

비전공자 중심의 24시간 수업을 기준으로 보면, 저는 **커피 자판기 → Todo/예약 시스템 → 버그 수정 Agent** 순서로 난이도를 올리는 방식을 가장 추천합니다.

## 추천 프로젝트 비교

| 순위 | 프로젝트               |  난이도 | Loop가 잘 보이는 정도 | 교육 추천도 |
| -- | ------------------ | ---: | -------------: | -----: |
| 🥇 | **커피 자판기 웹앱**      |   ★★ |          ★★★★★ |  ★★★★★ |
| 🥈 | **Todo 업무관리 시스템**  |   ★★ |          ★★★★★ |  ★★★★★ |
| 🥉 | **버그 자동 수정 Agent** |  ★★★ |          ★★★★★ |  ★★★★★ |
| 4  | REST API CRUD 시스템  |  ★★★ |          ★★★★☆ |  ★★★★☆ |
| 5  | 학생 성적 분석 시스템       |   ★★ |          ★★★★☆ |  ★★★★☆ |
| 6  | 쇼핑몰 주문 시스템         |  ★★★ |          ★★★★☆ |  ★★★★☆ |
| 7  | 웹 UI 자동 검증·수정      | ★★★★ |          ★★★★★ |  ★★★★☆ |
| 8  | RAG 답변 품질 개선 Agent | ★★★★ |          ★★★★☆ |  ★★★☆☆ |

특히 최근 coding-agent 평가에서도 긴 작업을 **서로 테스트 가능한 작은 개발 단위로 나누고, 완료된 기능에 대해 회귀 테스트를 계속 유지하는 방식**이 중요하게 다뤄지고 있습니다. ([arXiv][2])

---

# 1. 가장 추천: 커피 자판기 웹앱

이전에 이야기한 커피 자판기가 Loop Engineering 입문 프로젝트로 상당히 좋습니다.

왜냐하면 **정답을 자동으로 검사하기 쉽기 때문**입니다.

예를 들어 요구사항을 이렇게 줍니다.

```text
목표

웹 기반 커피 자판기를 만들어라.

메뉴
- 아메리카노 2,000원
- 카페라떼 3,000원
- 카푸치노 3,500원

기능
- 돈 투입
- 메뉴 선택
- 잔액 확인
- 음료 구매
- 잔돈 반환
```

그다음 학생들에게 코드를 직접 하나하나 작성시키는 대신 **검증 조건부터 작성**하게 합니다.

```text
Acceptance Criteria

① 5,000원을 투입할 수 있다.
② 아메리카노 구매 후 잔액은 3,000원이다.
③ 잔액보다 비싼 음료는 구매할 수 없다.
④ 없는 메뉴를 주문하면 오류를 반환한다.
⑤ 잔돈 반환 후 잔액은 0원이다.
```

이것이 곧 Loop의 핵심이 됩니다.

```text
Goal
 ↓
AI 코드 작성
 ↓
pytest 실행
 ↓
테스트 성공?
 ├─ YES → 다음 요구사항
 │
 └─ NO
      ↓
   오류 로그 분석
      ↓
   코드 수정
      ↓
   다시 pytest
      ↑
      └────────
```

학생들은 여기에서 아주 중요한 사실을 배웁니다.

> **“AI에게 코드를 잘 작성하게 하는 것”보다
> “잘 작성했는지 판단할 장치를 만드는 것”이 중요하다.**

실제 coding agent도 코드 변경 후 테스트를 실행하고, 그 결과를 토대로 반복 수정하는 형태가 핵심 사용 패턴입니다. OpenAI의 Codex와 GitHub Copilot coding agent 역시 코드 변경과 테스트 및 인간 검토를 결합하는 방향으로 제공되고 있습니다. ([OpenAI][3])

---

# 2. Todo 업무관리 시스템

두 번째 프로젝트로 매우 좋습니다.

기능은 단순합니다.

```text
Task

제목
내용
상태
마감일
우선순위
```

기능을 작은 Task로 나눕니다.

```text
Task 01
Todo 등록

Task 02
Todo 조회

Task 03
Todo 수정

Task 04
Todo 삭제

Task 05
완료 처리

Task 06
마감일 검색

Task 07
우선순위 정렬
```

그리고 각 Task마다 검증 조건을 둡니다.

예:

```text
Task 01 목표

Todo 등록 API 구현

완료조건

POST /todos

입력
{
  "title": "Loop Engineering 공부"
}

기대 결과

HTTP 201

{
  "id": 1,
  "title": "Loop Engineering 공부"
}
```

Loop는 다음과 같습니다.

```text
요구사항
   ↓
구현
   ↓
API 호출
   ↓
응답 검증
   ↓
테스트
   ↓
실패
   ↓
AI 수정
   ↓
재실행
```

여기에서는 학생들에게 **“작업 분해(Task Decomposition)”**까지 가르칠 수 있다는 것이 장점입니다.

---

# 3. 버그 자동 수정 Agent

Loop Engineering이라는 개념을 가장 직관적으로 보여주는 프로젝트입니다.

학생에게 일부러 문제가 있는 프로그램을 줍니다.

예:

```python
def calculate_average(scores):
    return sum(scores) / len(scores)
```

문제가 있습니다.

```python
calculate_average([])
```

이면 오류가 발생합니다.

테스트:

```python
def test_empty_scores():
    assert calculate_average([]) == 0
```

AI Agent에게 다음 목표를 줍니다.

```text
모든 pytest 테스트가 통과하도록
프로그램을 수정하라.

조건

- 기존 정상 기능을 변경하면 안 된다.
- 테스트 코드는 수정하지 않는다.
- 최대 반복 횟수는 5회이다.
```

그러면:

```text
코드
 ↓
pytest
 ↓
FAIL

ZeroDivisionError
 ↓
AI 분석
 ↓
코드 수정
 ↓
pytest
 ↓
PASS
 ↓
종료
```

이것만으로도 아주 좋은 Loop Engineering 실습입니다.

```text
          ┌───────────────┐
          │ Source Code   │
          └───────┬───────┘
                  ↓
          ┌───────────────┐
          │ AI Coding     │
          │ Agent         │
          └───────┬───────┘
                  ↓
          ┌───────────────┐
          │ pytest        │
          └───────┬───────┘
                  ↓
              PASS ?
             ↙      ↘
           NO        YES
           ↓          ↓
      Error Log     종료
           ↓
       AI 분석
           ↓
       코드 수정
           │
           └──────────→
```

이 프로젝트는 **Generator와 Verifier의 역할을 분리해서 설명하기도 좋습니다.**

---

# 4. 학생 성적 분석 프로그램

비전공자에게는 이것도 좋습니다.

CSV:

```text
name,python,ai,project

김학생,80,90,85
이학생,70,65,80
박학생,95,90,100
```

목표:

```text
학생별 평균 계산

과목별 평균 계산

1등 학생 찾기

60점 미만 학생 찾기

HTML 보고서 생성
```

검증 조건:

```text
학생 수 == CSV 학생 수

0 <= 점수 <= 100

평균 계산 정확성 확인

1등 학생 계산 정확성 확인
```

Loop:

```text
CSV
 ↓
AI 프로그램 작성
 ↓
실행
 ↓
결과 JSON
 ↓
검증 프로그램
 ↓
오류?
 ↓
AI 수정
```

이 프로젝트는 **프로그램 결과 자체를 다른 프로그램이 검증한다**는 개념을 배우기에 좋습니다.

---

# 5. 쇼핑몰 주문 시스템

조금 더 발전된 프로젝트입니다.

```text
상품
 ↓
장바구니
 ↓
주문
 ↓
결제
 ↓
재고 감소
```

검증 조건을 만들 수 있습니다.

예:

```text
재고 = 10

3개 주문

Expected

재고 = 7
```

그리고:

```text
재고 = 2

5개 주문

Expected

주문 실패
```

따라서 AI가 기능을 추가할 때마다

```text
Implement
 ↓
Unit Test
 ↓
API Test
 ↓
Regression Test
```

를 반복하게 만들 수 있습니다.

여기서 **Regression Loop**까지 자연스럽게 설명할 수 있습니다. LoopBench 역시 이미 완료된 개발 단위를 이후 작업에서도 회귀 검증 대상으로 유지하는 방식을 사용합니다. ([arXiv][2])

---

# 6. REST API 자동 개발 프로젝트

이 단계에서는 FastAPI가 좋습니다.

목표:

```text
학생 관리 REST API

POST   /students
GET    /students
GET    /students/{id}
PUT    /students/{id}
DELETE /students/{id}
```

AI에게:

```text
REST API를 구현하고

모든 API 테스트가 통과할 때까지
코드를 수정하라.
```

라고 합니다.

검증:

```text
pytest

+

FastAPI TestClient
```

Loop는:

```text
API Specification

       ↓

AI Implementation

       ↓

Server

       ↓

API Test

       ↓

 ┌──── PASS ────→ 완료
 │
 FAIL
 │
 ↓
HTTP Status
Response
Exception
 │
 ↓
AI Debug
 │
 └────────→ Implementation
```

이쯤부터 학생들이 Loop Engineering과 기존 개발의 차이를 확실하게 느끼기 시작합니다.

---

# 7. 웹 UI 자동 개선 프로젝트

조금 더 재미있는 프로젝트입니다.

목표:

> 로그인 페이지를 만들어라.

조건:

```text
이메일 입력창 존재
비밀번호 입력창 존재
로그인 버튼 존재
잘못된 이메일 Validation
모바일 화면 지원
```

AI가 페이지를 생성합니다.

그다음:

```text
Playwright
```

같은 도구가 자동으로 브라우저를 실행합니다.

```text
AI
 ↓
HTML/CSS 작성
 ↓
브라우저 실행
 ↓
Playwright
 ↓
UI Test
 ↓
FAIL
 ↓
Screenshot
 ↓
AI 분석
 ↓
CSS 수정
```

여기서는 학생들에게 아주 중요한 개념을 설명할 수 있습니다.

> **Agent에게 “눈과 귀”를 만들어 주어야 한다.**

CLI 출력, 테스트 결과, 브라우저, 로그, 스크린샷 등이 Agent가 자신의 작업 결과를 관찰할 수 있게 만드는 **feedback channel**이 됩니다. 실제 Loop Engineering 논의에서도 Agent가 실제 동작을 관찰할 수 있는 도구와 검증 환경이 신뢰성의 핵심으로 강조됩니다. ([Daniel Demmel][4])

---

# 8. 마지막 프로젝트로 좋은 것: AI 개발자 Agent

최종적으로는 학생에게 이것을 만들게 하면 좋습니다.

```text
                  사용자

       "Todo 기능을 추가해줘"

                    │
                    ▼
              ┌──────────┐
              │ Planner  │
              └────┬─────┘
                   ↓
              요구사항 분석
                   ↓
              Task 분해
                   ↓
              ┌──────────┐
              │ Coding   │
              │ Agent    │
              └────┬─────┘
                   ↓
                코드 작성
                   ↓
              ┌──────────┐
              │ Tester   │
              └────┬─────┘
                   ↓
                 pytest
                   ↓
             ┌─────┴─────┐
             │           │
           FAIL         PASS
             │           │
             ↓           ↓
          Debugger      Review
             │           │
             └─────←─────┘
                   ↓
                  완료
```

이 프로젝트까지 하면 학생은 단순한 **AI 코딩 도구 사용자**를 넘어서기 시작합니다.

---

# 9. 그런데 처음부터 Multi-Agent로 가르치지는 않는 것이 좋습니다

초보 학생에게 처음부터

```text
Planner Agent
Coder Agent
Tester Agent
Reviewer Agent
Manager Agent
```

를 만들게 하면 Loop Engineering보다 **LangGraph나 Agent 프레임워크 사용법**에 관심이 쏠릴 가능성이 높습니다.

첫 실습은 오히려:

```text
AI Agent 1개

+

pytest
```

면 충분합니다.

즉:

```text
┌─────────────┐
│     Goal    │
└──────┬──────┘
       ↓
┌─────────────┐
│    Agent    │
└──────┬──────┘
       ↓
┌─────────────┐
│    Code     │
└──────┬──────┘
       ↓
┌─────────────┐
│    Test     │
└──────┬──────┘
       ↓
     PASS?
     ↙   ↘
   NO    YES
   ↓      ↓
 Agent   STOP
   ↑
   └────────
```

이것이 **Loop Engineering의 최소 단위**라고 학생들에게 가르치는 것이 좋습니다.

---

# 10. 제가 24시간 강의라면 이렇게 구성하겠습니다

|     시간 | 프로젝트             | 핵심 학습               |
| -----: | ---------------- | ------------------- |
|   1~2h | 일반 AI 코딩         | Prompt 방식 체험        |
|   3~4h | 함수 버그 수정         | Test → Fix Loop     |
|   5~8h | 커피 자판기           | Goal / Task / Test  |
|  9~12h | Todo REST API    | Task Decomposition  |
| 13~16h | AI Bug Fix Agent | 자동 반복               |
| 17~20h | Todo Web 전체 개발   | Front + Back + Test |
| 21~22h | Loop 개선          | Stop / Retry / Log  |
| 23~24h | 팀별 발표            | Loop 설계 설명          |

제가 특히 권하고 싶은 **3단계 핵심 프로젝트**는 다음입니다.

1. **버그 있는 함수 수정**
   → `Code → pytest → Fix`

2. **커피 자판기 웹앱**
   → `Requirement → Implementation → Test → Fix`

3. **Todo 웹서비스**
   → `Goal → Task Decomposition → Implement → Test → Regression → Complete`

이렇게 하면 학생들이 Prompt Engineering과 Loop Engineering의 차이를 자연스럽게 체감합니다.

그리고 **학생 평가 기준도 “코드가 얼마나 멋진가”보다 `Goal / Verification / Feedback / Stop Condition`을 얼마나 잘 설계했는가로 바꾸는 것**이 좋습니다. AI coding agent가 코드를 작성하는 능력이 향상될수록 개발자의 가치가 구현 그 자체보다 **문제 정의와 검증 시스템 설계** 쪽으로 이동한다는 점을 함께 교육하기에 매우 좋은 프로젝트 구성입니다. ([OpenAI][5])

[1]: https://arxiv.org/abs/2607.00038?utm_source=chatgpt.com "Stop Hand-Holding Your Coding Agent: Engineering the Loops that Replace Step-by-Step Prompting"
[2]: https://arxiv.org/abs/2608.00267?utm_source=chatgpt.com "LoopsBench: From Harness Engineering to Loop Engineering in Coding Agent Evaluation"
[3]: https://openai.com/index/gartner-2026-agentic-coding-leader/?utm_source=chatgpt.com "OpenAI named a Leader in enterprise coding agents by ..."
[4]: https://www.danieldemmel.me/blog/feedback-loop-engineering?utm_source=chatgpt.com "Feedback loop engineering - Daniel Demmel"
[5]: https://openai.com/index/harness-engineering/?utm_source=chatgpt.com "Harness engineering: leveraging Codex in an agent-first ..."
