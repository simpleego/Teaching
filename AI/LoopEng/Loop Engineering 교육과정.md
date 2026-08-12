# Loop Engineering 교육과정

> **비전공자 + 교육 후 현업 취업**이라는 조건이라면, Loop Engineering 교육을 단순한 “AI 코딩 교육”으로 구성하면 안 됩니다. 오히려 **AI가 만든 결과를 이해하고, 검증하고, 실제 시스템에 연결할 수 있는 주니어 AI 응용 엔지니어**를 만드는 방향이 적합합니다.
> 2026년 8월 현재 국내 AI Agent 관련 채용공고를 보면 직무명이 꼭 “Loop Engineer”인 것은 아닙니다. 실제로는 **AI Agent Engineer, AI/AX Engineer, 생성형 AI Engineer, AI Agent Platform Engineer** 등의 이름으로 모집하며, Python/FastAPI, REST API, Git, Docker, SQL/RDBMS, LLM·RAG, Agent, CI/CD 같은 역량을 함께 요구하는 경우가 많습니다. ([잡코리아][1])
> 따라서 **Loop Engineering 자체 100%**가 아니라, 취업 가능한 기본 소프트웨어 역량 위에 Loop Engineering을 올리는 커리큘럼이 좋습니다.

---

# 1. 가장 먼저 교육 목표를 이렇게 잡는 것이 좋습니다

비전공자 학생의 최종 수준을 다음처럼 잡겠습니다.

> **“요구사항을 받아 업무를 작은 Task로 분해하고, AI Agent와 기존 프로그램/API를 이용해 구현하며, 테스트·로그·평가 결과를 피드백으로 사용하여 목표를 달성할 때까지 반복 실행할 수 있는 개발자.”**

즉 학생이 다음 사이클을 직접 설계할 수 있어야 합니다.

```text
                 업무 요구사항
                      ↓
                 목표 정의
                      ↓
                Task 분해
                      ↓
              ┌─────────────┐
              │ AI / Agent  │
              └──────┬──────┘
                     ↓
                   실행
                     ↓
                 결과 관찰
                     ↓
                 자동 검증
                     ↓
              기준을 만족?
                ↙       ↘
              NO         YES
              ↓           ↓
          원인 분석      완료
              ↓
          수정 / 재계획
              │
              └────────────→ 반복
```

학생이 이 구조를 이해하면 특정 Agent 프레임워크가 바뀌어도 대응할 수 있습니다.

---

# 2. 가장 중요한 것은 코딩보다 먼저 "업무를 구조화하는 능력"입니다

비전공자에게 특히 강조하고 싶은 부분입니다.

예를 들어:

> "온라인 커피 자판기를 만들어라."

이것만 AI에게 입력하게 해서는 교육 효과가 떨어집니다.

학생이 먼저 이것을:

```text
Goal
 │
 ├── 사용자 메뉴 조회
 ├── 금액 투입
 ├── 음료 선택
 ├── 재고 확인
 ├── 결제
 ├── 잔액 계산
 └── 잔돈 반환
```

으로 나눌 수 있어야 합니다.

그리고 각각에 대해:

```text
Task
+
Input
+
Expected Output
+
Constraint
+
Test
+
Stop Condition
```

을 정의하게 해야 합니다.

이것이 취업 후에도 상당히 중요한 역량입니다. AI 시대의 소프트웨어 엔지니어에게 구현 자체뿐 아니라 **verification/validation 능력이 더 중요해지고 있다는 2026년 연구 결과**도 이 방향과 일치합니다. ([arXiv][2])

---

# 3. 추천 학습 비중

취업 목적의 비전공자라면 저는 다음 비율을 권합니다.

| 영역                         |    권장 비율 |   중요도 |
| -------------------------- | -------: | ----: |
| ① IT·SW 기본기                |  **15%** | ★★★★★ |
| ② Python·Backend·DB·API    |  **20%** | ★★★★★ |
| ③ LLM·Agent·Tool 기본        |  **15%** | ★★★★☆ |
| ④ Loop Engineering 핵심      |  **20%** | ★★★★★ |
| ⑤ Test·Evaluation·Security |  **15%** | ★★★★★ |
| ⑥ Git·Docker·CI/CD·운영      |  **10%** | ★★★★☆ |
| ⑦ 포트폴리오·협업·발표              |   **5%** | ★★★★☆ |
| **합계**                     | **100%** |       |

그리고 전체 교육 방법은

> **이론 30% : 실습 70%**

정도로 가져가는 것이 적절하다고 봅니다.

---

# 4. ① IT·소프트웨어 기본기 — 15%

비전공자라고 이 부분을 AI로 건너뛰게 해서는 안 됩니다.

오히려 AI가 코드를 많이 작성하게 될수록 **학생이 AI 코드의 의미를 판단할 수 있는 최소한의 기반**이 필요합니다.

### 반드시 필요한 내용

```text
컴퓨터
 ├─ CPU / Memory / Storage
 │
OS
 ├─ Process
 ├─ File
 └─ Permission
 │
Network
 ├─ IP
 ├─ Port
 ├─ HTTP
 └─ Client / Server
 │
Software
 ├─ Frontend
 ├─ Backend
 ├─ Database
 └─ API
```

그리고 다음 용어 정도는 설명할 수 있어야 합니다.

```text
Client
Server
HTTP
REST API
JSON
Database
Process
Port
Environment Variable
Library
Framework
Container
```

WEF의 2025 Future of Jobs 보고서에서도 AI·Big Data뿐 아니라 네트워크·사이버보안과 technological literacy가 빠르게 중요해지는 역량으로 꼽혔습니다. ([세계경제포럼 보고서][3])

---

# 5. ② Python + Backend + DB + API — 20%

이 부분은 취업 관점에서는 절대로 줄이면 안 됩니다.

Loop Engineering 수업이라고

```text
Prompt
LangChain
LangGraph
Agent
```

만 가르치면 학생들의 취업 선택지가 지나치게 좁아집니다.

최소한 다음 정도는 다룰 필요가 있습니다.

### Python

```python
variable
if
for
function
list
dict
class
exception
file
module
```

하지만 알고리즘 문제 풀이를 깊게 할 필요까지는 없습니다.

### Backend

```text
FastAPI

GET
POST
PUT
DELETE

Request
Response
Status Code
```

### Database

```text
SQLite → PostgreSQL

SELECT
INSERT
UPDATE
DELETE

PK
FK
Transaction
```

2026년 국내 Agent/AI 채용에서도 실제로 Python, FastAPI, REST API, PostgreSQL/MySQL, Git, Docker 같은 전통적인 개발 역량이 반복해서 요구됩니다. ([원티드][4])

이것이 상당히 중요한 메시지입니다.

> **Agent가 발전했다고 Backend나 DB의 중요성이 사라지는 것이 아닙니다.**

---

# 6. ③ LLM / Agent 기초 — 15%

여기서는 너무 깊게 들어갈 필요가 없습니다.

비전공자 취업 교육이라면 Transformer 수학을 깊게 설명하기보다:

```text
LLM
 │
 ├─ Prompt
 ├─ Context
 ├─ Token
 ├─ Structured Output
 ├─ Tool Calling
 ├─ Memory
 └─ RAG
```

를 응용 관점에서 이해하게 합니다.

그리고:

```text
LLM
  ↓
Tool 선택
  ↓
API 호출
  ↓
Observation
  ↓
LLM 판단
```

정도를 구현할 수 있어야 합니다.

그 이후에

```text
Single Agent
→ Workflow
→ Loop
→ Multi-Agent
```

순서로 넘어갑니다.

---

# 7. ④ Loop Engineering — 20%

이 영역이 과정의 핵심입니다.

그런데 **Prompt Engineering이 핵심이 아닙니다.**

다음 7개 개념이 핵심이라고 가르치는 것을 추천합니다.

```text
① Goal
      ↓
② Task Decomposition
      ↓
③ Plan
      ↓
④ Action
      ↓
⑤ Observation
      ↓
⑥ Verification
      ↓
⑦ Feedback / Retry / Stop
```

학생들에게 Loop 하나를 다음 공식처럼 익숙하게 만들어야 합니다.

```text
Loop
 =
Goal
+ Action
+ Observation
+ Evaluation
+ Feedback
+ Stop Condition
```

예를 들어:

```text
Goal
모든 테스트를 통과시켜라.

        ↓

Agent
코드 수정

        ↓

pytest 실행

        ↓

3 failed / 7 passed

        ↓

로그 분석

        ↓

코드 수정

        ↓

pytest

        ↓

10 passed

        ↓

STOP
```

이것을 학생들이 직접 구현하면 Loop Engineering을 이해했다고 볼 수 있습니다.

---

# 8. ⑤ Testing과 Evaluation을 15%나 배정한 이유

이 부분을 저는 **Prompt Engineering보다 더 중요하게** 두겠습니다.

왜냐하면 AI Agent를 사용하는 시대에는:

> **코드를 만드는 능력보다 AI가 만든 결과가 맞는지 판단하는 능력**

이 중요해지기 때문입니다.

2026년 실제 agent-authored GitHub PR 연구에서도 CI/CD 검증을 통과하지 못하거나 변경 범위가 커지는 경우 병합 실패와 관련되는 패턴이 관찰됐습니다. ([arXiv][5])

학생들에게 최소한 다음을 가르쳐야 합니다.

### Unit Test

```python
def test_add():
    assert add(2, 3) == 5
```

### API Test

```text
POST /users

Expected

HTTP 201
```

### Integration Test

```text
Frontend
 ↓
API
 ↓
DB
```

### AI Evaluation

```text
Input
 ↓
LLM
 ↓
Output
 ↓
Evaluator
 ↓
Score
```

그리고 반드시:

```text
PASS
FAIL
Retry
Max Retry
Timeout
Fallback
Human Approval
```

개념을 포함해야 합니다.

OpenAI의 현재 Agent 가이드에서도 guardrail과 human review를 통해 실행을 계속할지, 중단할지, 승인 단계로 넘길지를 제어하는 구조를 설명하고 있습니다. ([OpenAI Developers][6])

---

# 9. ⑥ Git + Docker + CI/CD + 운영 — 10%

취업 교육에서는 이 부분도 매우 중요합니다.

학생이 프로젝트를

> "제 노트북에서는 실행됩니다."

수준으로 끝내면 안 됩니다.

최종적으로:

```text
GitHub
   ↓
Git Push
   ↓
CI
   ↓
Test
   ↓
Docker Build
   ↓
Deploy
   ↓
Monitoring
```

까지 경험하게 해야 합니다.

기본 도구는:

```text
Git
GitHub
Docker
GitHub Actions
Linux
.env
logging
```

정도면 충분합니다.

Kubernetes는 비전공자 입문 과정에서는 **개념 설명 정도**로 시작해도 됩니다. 현재 국내 Agent Platform 채용에서는 Docker·CI/CD뿐 아니라 Kubernetes까지 요구하는 포지션도 있지만, 신입 학생에게 모두 숙련시키는 것은 우선순위가 떨어집니다. ([원티드][4])

---

# 10. 반대로 비중을 줄여야 할 부분

이것도 상당히 중요합니다.

### Prompt Engineering

과거라면:

```text
Prompt Engineering 30%
```

이었다면 지금은:

> **5~8% 정도면 충분**

하다고 봅니다.

프롬프트는 중요하지만 Loop 전체 중 한 요소입니다.

---

### Multi-Agent

처음부터:

```text
Planner Agent
Research Agent
Coder Agent
Tester Agent
Reviewer Agent
Manager Agent
```

를 만들 필요 없습니다.

초보 학생에게는 오히려 복잡성을 증가시킵니다.

먼저:

```text
Single Agent
+
Tool
+
Test
+
Loop
```

를 완전히 이해시키는 것이 중요합니다.

---

### 딥러닝 수학

Loop Engineering 취업 과정이라면:

```text
Gradient Descent
Backpropagation
Attention 수식
Transformer 수학
```

을 깊게 다룰 필요는 없습니다.

AI 모델 **연구원**을 양성하는 과정과 AI **응용 엔지니어**를 양성하는 과정은 구분해야 합니다.

---

# 11. 제가 120시간으로 편성한다면

예를 들어 8시간 × 15일 과정이라면 이렇게 구성하겠습니다.

| 영역                     |       시간 |
| ---------------------- | -------: |
| IT·SW 기본               |      16h |
| Python·Git 기초          |      16h |
| FastAPI·SQL·REST API   |      16h |
| LLM·Tool Calling·Agent |      16h |
| Loop Engineering       |      20h |
| Test·Evaluation        |      12h |
| Docker·CI/CD·운영        |       8h |
| 종합 프로젝트                |      16h |
| **합계**                 | **120h** |

하지만 실제 수업은 영역별로 완전히 끊지 않는 것이 좋습니다.

예를 들어:

```text
Python
  ↓
간단한 프로그램
  ↓
pytest
  ↓
AI 코드 수정
  ↓
Loop
```

처럼 처음부터 모든 수업을 Loop와 연결합니다.

---

# 12. 프로젝트도 단계적으로 난도를 높여야 합니다

### Level 1 — 함수

```text
AI 코드 작성
 ↓
pytest
 ↓
오류
 ↓
AI 수정
```

2~4시간.

---

### Level 2 — 커피 자판기

```text
Requirement
 ↓
Task
 ↓
Code
 ↓
Test
 ↓
Fix
```

1일.

---

### Level 3 — Todo API

```text
REST API
+
DB
+
Test
+
Loop
```

2일.

---

### Level 4 — AI 업무자동화 Agent

예:

```text
메일
 ↓
분류
 ↓
정보 추출
 ↓
DB 저장
 ↓
업무 처리
 ↓
결과 검증
 ↓
보고
```

2~3일.

---

### Level 5 — 최종 팀 프로젝트

여기서는 학생이 직접 문제를 정의합니다.

예를 들어:

```text
회사 업무 요구사항
       ↓
Problem Definition
       ↓
Acceptance Criteria
       ↓
Workflow 설계
       ↓
Agent / Automation
       ↓
Tools
       ↓
Test / Evaluation
       ↓
Guardrail
       ↓
Deployment
       ↓
Monitoring
```

이 프로젝트가 취업 포트폴리오가 됩니다.

---

# 13. 평가 방식도 바꾸는 것이 좋습니다

기존 프로그래밍 교육은:

```text
프로그램 동작 여부
          80%

발표
          20%
```

같은 형태가 많습니다.

Loop Engineering은 이렇게 평가하는 것이 좋습니다.

| 평가                 |      비중 |
| ------------------ | ------: |
| 문제·목표 정의           |     15% |
| Task 분해            |     10% |
| 시스템 아키텍처           |     10% |
| 구현                 |     20% |
| 테스트·평가             | **20%** |
| Loop/Retry/Stop 설계 | **15%** |
| Git·문서·협업          |      5% |
| 발표                 |      5% |

여기에서 중요한 특징이 있습니다.

> **코드 구현 자체는 20%밖에 되지 않습니다.**

AI가 코드를 상당 부분 생성할 수 있는 환경에서 학생의 능력을 코드량으로 평가하는 것은 의미가 빠르게 줄어듭니다.

---

# 14. 최종적으로 학생이 면접에서 설명할 수 있어야 하는 것

좋은 포트폴리오 면접 답변은:

> "LangGraph를 사용할 줄 압니다."

가 아닙니다.

오히려:

> "사용자의 업무 목표를 7개의 Task로 분해했고, 각 Task에 acceptance criteria를 정의했습니다. Agent가 API와 DB를 Tool로 사용하도록 했고, 실행 결과는 pytest와 evaluator로 검증했습니다. 실패하면 최대 3번까지 수정하도록 하고, 개인정보 관련 작업은 human approval을 받도록 설계했습니다. GitHub Actions에서 자동 테스트하고 Docker로 배포했습니다."

이런 설명을 할 수 있어야 합니다.

**이 정도면 특정 프레임워크 사용자가 아니라 시스템을 이해하고 있는 주니어 엔지니어로 보입니다.**

---

# 15. 그래서 교육의 중심축을 하나 선정한다면

저라면 전체 교육과정을 아래 구조로 잡겠습니다.

```text
                 ┌─────────────────┐
                 │ Problem / Goal  │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ Task Decompose  │
                 └────────┬────────┘
                          ↓
        ┌─────────────────────────────────┐
        │          AI + Software          │
        │                                 │
        │ Python / API / DB / Agent       │
        └────────────────┬────────────────┘
                         ↓
                 ┌─────────────────┐
                 │ Execute / Tool  │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ Test / Evaluate │
                 └────────┬────────┘
                          ↓
                    성공했는가?
                      ↙       ↘
                   NO           YES
                   ↓              ↓
              Feedback          Deploy
                   ↓              ↓
              수정 / Retry      Monitor
                   │
                   └──────↗
```

그리고 교육 철학은 **세 문장**으로 정리할 수 있습니다.

> **첫째, AI가 코드를 작성해도 학생이 코드를 읽을 수 있어야 한다.**
> **둘째, AI가 작업해도 학생이 결과가 맞는지 검증할 수 있어야 한다.**
> **셋째, AI가 반복 작업해도 학생이 언제 계속하고 언제 멈춰야 하는지 설계할 수 있어야 한다.**

현재 채용시장에서도 Agent 자체만 아는 사람보다는 **Python + API + DB + Git/Docker라는 소프트웨어 기본기 위에 LLM/Agent/RAG를 결합할 수 있는 인력**을 요구하는 패턴이 분명히 보입니다. ([InterXLab][7])

따라서 비전공자 취업 과정이라면 저는 **“Loop Engineering 전문가 과정”이라고 너무 좁게 설계하기보다는 `AI Agent 기반 소프트웨어·업무자동화 엔지니어 양성과정`으로 구성하고, 그 핵심 개발 방법론을 Loop Engineering으로 가르치는 방식**을 가장 권합니다. 이렇게 해야 학생들이 향후 Loop라는 용어가 바뀌더라도 AI Agent Engineer, AI Application Engineer, Python Backend, AI Automation/AX 등의 직무로 지원할 수 있습니다.

[1]: https://www.jobkorea.co.kr/Recruit/GI_Read/49542312?Oem_Code=C1&listno=1107&logpath=1&stext=%EC%9E%90%EB%8F%99%ED%99%94&utm_source=chatgpt.com "지엠코퍼레이션 채용 - AI Engineer (LLM · RAG"
[2]: https://arxiv.org/abs/2606.21894?utm_source=chatgpt.com "Skills for the future software profession: beyond agentic AI!"
[3]: https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf?utm_source=chatgpt.com "Future of Jobs Report 2025"
[4]: https://recruit.wanted.co.kr/wd/310318?utm_source=chatgpt.com "[에이티씨아이] 백엔드 엔지니어 (Python + Go) 채용 공고"
[5]: https://arxiv.org/abs/2601.15195?utm_source=chatgpt.com "Where Do AI Coding Agents Fail? An Empirical Study of Failed Agentic Pull Requests in GitHub"
[6]: https://developers.openai.com/api/docs/guides/agents/guardrails-approvals?utm_source=chatgpt.com "Guardrails and human review | OpenAI API"
[7]: https://interxlab.career.greetinghr.com/ko/o/202648?utm_source=chatgpt.com "AI Agent Engineer"
