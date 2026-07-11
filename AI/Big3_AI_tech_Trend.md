## 핵심 판단

그림은 **LangGraph·AutoGen·CrewAI를 비교하는 입문 자료로는 유용**합니다. 다만 **2026년 현재 기준으로는 수정이 필요**합니다.

* 세 프레임워크 모두 RAG, 도구 호출, 메모리, Human-in-the-Loop, 멀티에이전트를 지원하므로 그림 중앙의 공통 영역은 대체로 타당합니다.
* LangGraph는 상태와 실행 흐름을 세밀하게 제어하는 **에이전트 오케스트레이션 런타임**에 가깝습니다.
* CrewAI는 역할 기반 에이전트 팀을 빠르게 구성하는 데서 출발했지만, 현재는 상태 관리·지속 실행·관측성·기업용 워크플로까지 확대되었습니다.
* AutoGen은 멀티에이전트 기술 확산에 중요한 역할을 했지만, 현재 공식 프로젝트는 **유지보수 모드**이며 신규 프로젝트에는 후속 기술인 **Microsoft Agent Framework**가 권장됩니다. ([Docs by LangChain][1])

따라서 취업 과정에서는 세 기술을 동일 비중으로 가르치기보다 **LangGraph 중심, CrewAI 비교 실습, AutoGen 역사와 Microsoft Agent Framework 전환 이해**의 순서가 적절합니다.

---

# 1. 기술이 등장한 역사적 배경

## 1단계: LLM이 외부 도구를 사용하기 시작한 시기

2022년 발표된 ReAct 연구는 LLM이 단순히 답변만 생성하는 것이 아니라, 추론과 행동을 번갈아 수행하면서 검색 시스템이나 외부 환경과 상호작용하는 구조를 제안했습니다. 현재 에이전트 프레임워크의 핵심인 `생각 → 도구 호출 → 결과 확인 → 다음 행동` 구조의 주요 이론적 기반입니다. ([arXiv][2])

```text
사용자 질문
    ↓
상황 분석
    ↓
필요한 도구 선택
    ↓
검색·DB·API 호출
    ↓
결과 검토
    ↓
답변 또는 추가 행동
```

## 2단계: 멀티에이전트 프레임워크 등장

### AutoGen — 2023년 9월

Microsoft Research는 2023년 9월 AutoGen을 공개했습니다. 여러 에이전트가 대화를 통해 협력하고, 사람과 도구를 대화 과정에 포함시키는 구조를 대중화했습니다. 초기에는 연구자, 코딩 에이전트, 검토 에이전트 등이 서로 대화하면서 문제를 해결하는 방식이 큰 관심을 받았습니다. ([Microsoft][3])

```text
사용자 에이전트
      ↕
개발 에이전트 ↔ 검토 에이전트
      ↕
코드 실행 도구
```

### CrewAI — 2023년 말

CrewAI는 2023년 말 공개 패키지로 등장했습니다. 회사의 조직처럼 에이전트에 `역할`, `목표`, `배경`, `작업`을 부여하고, 여러 에이전트를 하나의 Crew로 묶는 방식을 채택했습니다. 초기 공개 패키지인 0.1.x 버전은 2023년 12월에 배포되었습니다. ([CrewAI Docs][4])

```text
Researcher
    ↓
Analyst
    ↓
Writer
    ↓
Reviewer
```

이 구조는 비전공자도 “조사원·분석가·작성자·검토자”처럼 역할을 직관적으로 이해할 수 있다는 장점이 있습니다.

## 3단계: 그래프 기반 실행 제어

### LangGraph — 2024년 1월

LangChain은 2024년 1월 22일 LangGraph를 공개했습니다. 단순 체인이나 자유로운 에이전트 대화만으로는 반복, 조건 분기, 오류 복구, 중단 후 재실행, 사람 승인 같은 복잡한 업무 흐름을 안정적으로 관리하기 어려웠기 때문에, 상태와 실행 경로를 그래프로 명시하는 방식이 등장했습니다. ([Docs by LangChain][5])

```text
[질문 분석]
      ↓
[문서 검색]
      ↓
검색 결과 충분?
  ├─ 예 → [답변 생성]
  └─ 아니오 → [질문 재작성]
                    ↓
                [재검색]
```

LangGraph는 이후 장시간 실행, 상태 저장, Human-in-the-Loop, 메모리, 스트리밍, 장애 후 재개 등을 중심으로 발전했고, 2025년 10월 LangGraph 1.0이 정식 공개되었습니다. ([GitHub][6])

---

# 2. 세 프레임워크의 현재 위치

| 기술                            | 출발점                            | 현재 핵심 성격                    | 적합한 상황                   |
| ----------------------------- | ------------------------------ | --------------------------- | ------------------------ |
| **LangGraph**                 | LangChain 에이전트 실행 제어           | 상태 기반 저수준 오케스트레이션 런타임       | 복잡한 분기, 반복, 장기 실행, 승인 과정 |
| **CrewAI**                    | 역할 기반 멀티에이전트 협업                | Crew와 Flow를 결합한 업무 자동화      | 빠른 프로토타입, 역할 중심 협업 시스템   |
| **AutoGen**                   | 에이전트 간 대화와 협력                  | 현재 유지보수 모드                  | 기존 시스템 분석, 멀티에이전트 개념 학습  |
| **Microsoft Agent Framework** | AutoGen과 Semantic Kernel 경험 통합 | Microsoft 계열 차세대 에이전트 프레임워크 | 신규 Microsoft 생태계 프로젝트    |

## LangGraph

LangGraph는 노드, 엣지, 상태를 명시적으로 설계하기 때문에 다음과 같은 복잡한 시스템에 적합합니다.

* 에이전틱 RAG
* 조건에 따른 검색 전략 변경
* 답변 품질 검토 후 재생성
* 작업 중단 후 이어서 실행
* 사용자 승인 후 외부 시스템 변경
* 여러 하위 에이전트를 관리하는 Supervisor 구조

공식 문서는 LangGraph의 주요 기능으로 지속 실행, Human-in-the-Loop, 단기·장기 메모리, 디버깅, 배포를 제시하고 있습니다. ([GitHub][6])

### 장점

* 실행 흐름이 명확합니다.
* 오류 지점을 추적하기 쉽습니다.
* 반복과 조건 분기를 세밀하게 제어할 수 있습니다.
* 장시간 실행되는 업무에 적합합니다.
* 실무형 백엔드 시스템과 연결하기 좋습니다.

### 단점

* State, Node, Edge, Reducer, Checkpoint 등의 개념을 이해해야 합니다.
* 단순 챗봇에는 구조가 과도할 수 있습니다.
* 비전공자가 처음 접하면 코드가 복잡하게 느껴질 수 있습니다.

---

## CrewAI

CrewAI는 다음처럼 역할 중심으로 시스템을 설계할 때 이해가 쉽습니다.

```text
시장 조사원 → 데이터 분석가 → 보고서 작성자 → 품질 검토자
```

현재 CrewAI는 단순한 역할 기반 Crew뿐 아니라 Flow를 통해 이벤트 기반 실행, 상태 저장, 장시간 실행 재개, Human-in-the-Loop, Guardrail, 관측성 등을 지원하고 있습니다. Gmail·Slack·Salesforce 같은 업무 시스템 연결과 기업용 배포 기능도 강조하고 있습니다. ([CrewAI Docs][7])

### 장점

* 역할과 작업 개념이 직관적입니다.
* 멀티에이전트 데모를 빠르게 만들 수 있습니다.
* YAML 기반 설정을 이용할 수 있습니다.
* 교육용, 아이디어 검증, 업무 자동화 실습에 적합합니다.
* Crew와 Flow를 조합해 간단한 구조에서 복잡한 구조로 확장할 수 있습니다.

### 단점

* 에이전트 수를 불필요하게 늘리기 쉽습니다.
* 여러 에이전트가 같은 내용을 반복해 비용과 시간이 증가할 수 있습니다.
* 에이전트 간 대화가 길어지면 오류 원인을 추적하기 어려워질 수 있습니다.
* 역할을 나눴다고 해서 반드시 결과 품질이 향상되는 것은 아닙니다.

---

## AutoGen

AutoGen은 멀티에이전트가 서로 대화하며 협력하는 구조를 널리 알린 대표적인 프레임워크입니다. `AssistantAgent`, `UserProxyAgent`, 그룹 대화, 코드 실행, 에이전트 간 메시지 교환 등의 개념은 이후 에이전트 개발 방식에 큰 영향을 주었습니다. ([arXiv][8])

다만 2026년 현재 AutoGen 공식 저장소는 유지보수 모드이며, 새로운 기능은 추가되지 않고 버그 수정·보안 패치·문서 개선 중심으로 관리됩니다. Microsoft는 신규 사용자가 Microsoft Agent Framework를 사용하고 기존 AutoGen 사용자는 마이그레이션할 것을 권장하고 있습니다. ([GitHub][9])

따라서 취업 과정에서 AutoGen을 완전히 제외할 필요는 없지만, 다음 정도로 다루는 것이 적절합니다.

* AutoGen이 멀티에이전트 분야에 미친 영향
* 에이전트 간 메시지 교환 구조
* Group Chat, Supervisor, Critic 패턴
* AutoGen 0.2와 0.4의 구조 변화
* Microsoft Agent Framework로의 전환

AutoGen API 자체를 장기간 깊게 학습하는 것은 현재 시점에서는 우선순위가 낮습니다.

---

# 3. 그림의 비교를 현재 기준으로 수정하면

## 그림에서 타당한 부분

### LangGraph: Complex Workflows

매우 적절한 설명입니다. LangGraph는 조건 분기, 반복, 상태 저장, 중단·재개와 같은 복잡한 실행 구조를 명시적으로 표현하는 데 강점이 있습니다. ([Docs by LangChain][10])

### CrewAI: Rapid Prototyping

대체로 타당합니다. 역할과 작업을 정의하는 방식이 직관적이어서 멀티에이전트 프로토타입을 빠르게 구성할 수 있습니다. 다만 현재 CrewAI는 프로토타이핑에만 머물지 않고 Flow, Guardrail, 관측성, 기업용 배포 기능으로 확장되었습니다. ([CrewAI Docs][7])

### AutoGen: Enterprise Teams

역사적으로는 멀티에이전트 연구와 팀 협업 모델을 설명하는 데 적절했지만, 현재 신규 기업 시스템의 기준으로 AutoGen 자체를 선택하는 것은 권장하기 어렵습니다. 기업용 신규 개발은 Microsoft Agent Framework 쪽이 더 적절합니다. ([GitHub][9])

## 그림에서 보완해야 할 부분

`Advanced Error Handling`, `Workflow Management`, `Easy to Use`는 특정 프레임워크만의 독점 기능이라기보다 **설계 철학과 추상화 수준의 차이**로 이해하는 것이 정확합니다.

| 비교 기준        | LangGraph | CrewAI | AutoGen |
| ------------ | --------: | -----: | ------: |
| 빠른 첫 구현      |        중간 |     높음 |      중간 |
| 실행 흐름 세밀한 통제 |     매우 높음 |  중간~높음 |      중간 |
| 역할 기반 모델링    |        중간 |  매우 높음 |      높음 |
| 조건·반복·상태 관리  |     매우 높음 |     높음 |      중간 |
| 대화형 멀티에이전트   |        높음 |     높음 |   매우 높음 |
| 신규 프로젝트 권장도  |     매우 높음 |     높음 |      낮음 |
| 장기적인 학습 가치   |     매우 높음 |     높음 |   개념 중심 |

---

# 4. 향후 발전 방향

## 4.1 자유로운 에이전트보다 통제 가능한 워크플로

초기 에이전트 시스템은 LLM이 계획과 실행을 자유롭게 결정하도록 구성하는 경우가 많았습니다. 하지만 실제 업무에서는 무한 반복, 잘못된 도구 선택, 높은 API 비용, 예측하기 어려운 결과가 문제가 됩니다.

따라서 앞으로는 다음과 같은 혼합 구조가 중심이 될 가능성이 높습니다.

```text
확정적 업무 흐름
    +
필요한 구간에서만 에이전트 판단
```

예를 들어 결제, 문서 삭제, 이메일 발송은 명시적인 워크플로로 관리하고, 문서 요약이나 검색어 작성만 LLM에 맡기는 방식입니다. LangGraph와 CrewAI Flow 모두 이러한 통제 가능한 실행 구조를 강화하고 있습니다. ([Docs by LangChain][10])

## 4.2 Agentic RAG 확대

기존 RAG는 한 번 검색하고 답변하는 구조였습니다.

```text
질문 → 검색 → 답변
```

향후 Agentic RAG는 검색 결과를 평가하고, 필요하면 질문을 다시 작성하거나 다른 검색 도구를 선택합니다.

```text
질문 분석
   ↓
검색 도구 선택
   ↓
문서 검색
   ↓
관련성 평가
   ↓
부족하면 재검색
   ↓
답변 작성
   ↓
근거 검증
```

이러한 구조에서는 상태, 반복, 조건 분기가 중요하므로 LangGraph 같은 오케스트레이션 기술의 가치가 커집니다.

## 4.3 Human-in-the-Loop 강화

에이전트가 이메일 전송, DB 변경, 계약서 작성, 결제 처리처럼 실제 행동을 수행하게 되면 사람의 승인이 필수적입니다. LangGraph와 CrewAI 모두 실행을 중단하고 사람의 검토나 승인을 받은 뒤 다시 시작하는 기능을 핵심 기능으로 제공하고 있습니다. ([Docs by LangChain][1])

## 4.4 지속 실행과 메모리

앞으로의 에이전트는 한 번 질문에 답하고 종료되는 챗봇보다 몇 시간 또는 며칠 동안 업무 상태를 유지하는 형태로 발전할 가능성이 큽니다.

* 작업 중간 상태 저장
* 실패 지점부터 재개
* 사용자별 장기 기억
* 이전 수행 결과 재사용
* 일정 시간이 지난 뒤 작업 계속 수행

LangGraph는 Durable Execution과 Checkpoint를 중심으로, CrewAI는 Flow State와 통합 메모리 구조를 중심으로 이 방향을 발전시키고 있습니다. ([GitHub][6])

## 4.5 관측성과 평가

에이전트 시스템은 최종 답변만 보고는 오류 원인을 알기 어렵습니다. 앞으로는 다음 항목을 추적하는 능력이 필수가 됩니다.

* 어떤 도구를 호출했는가
* 어떤 문서를 검색했는가
* 어느 노드에서 실패했는가
* 얼마나 많은 토큰과 비용이 사용됐는가
* 작업 성공률은 얼마인가
* 사람이 수정한 지점은 어디인가

LangGraph 생태계는 LangSmith를 통한 추적·평가·배포를 제공하고, CrewAI 역시 Crews와 Flows에 대한 통합 추적 기능을 제공하고 있습니다. ([Docs by LangChain][1])

## 4.6 표준 프로토콜과 프레임워크 간 연동

에이전트가 외부 도구와 연결되는 방식도 개별 프레임워크 전용 코드에서 표준 프로토콜 중심으로 바뀌고 있습니다. CrewAI는 MCP 서버를 에이전트 도구로 연결할 수 있으며, Microsoft Agent Framework는 MCP와 A2A 기반 상호운용성을 강조합니다. ([CrewAI Docs][11])

따라서 앞으로는 특정 프레임워크의 API를 암기하는 것보다 다음 개념을 이해하는 것이 중요합니다.

* Tool Calling
* MCP
* 에이전트 간 메시지 전달
* 상태와 이벤트
* 구조화된 출력
* 인증과 권한 관리
* 도구 실행 보안

---

# 5. AI 취업을 위한 학습과정으로 적당한가

## 결론: 적당하지만 고급 단계에 배치해야 합니다

LangGraph, CrewAI, 멀티에이전트 기술은 AI 애플리케이션 개발자, LLM 엔지니어, RAG 개발자, AI 백엔드 개발자에게 유용합니다.

그러나 이 세 프레임워크만 학습해서는 취업 경쟁력이 충분하지 않습니다.

```text
프레임워크 사용법
       ≠
AI 시스템 개발 역량
```

기업은 단순히 에이전트를 생성하는 코드보다 다음 능력을 더 중요하게 평가할 가능성이 높습니다.

* 데이터를 어떻게 검색하고 관리하는가
* 오류와 환각을 어떻게 줄이는가
* 결과를 어떻게 평가하는가
* 개인정보와 권한을 어떻게 보호하는가
* 서비스로 어떻게 배포하는가
* 비용과 응답 속도를 어떻게 최적화하는가

---

# 6. 권장 학습 순서

## 1단계: Python과 백엔드 기초

* Python 함수·클래스
* 타입 힌트와 Pydantic
* 예외 처리
* 비동기 프로그래밍
* REST API
* JSON
* Git·GitHub
* FastAPI

에이전트 프레임워크 내부에서는 상태 객체, 함수 호출, 비동기 실행, API 통신이 반복적으로 사용되므로 이 과정이 선행되어야 합니다.

## 2단계: LLM 애플리케이션 기초

* System·User·Assistant 메시지
* 프롬프트 설계
* Structured Output
* Function Calling
* Tool Calling
* 토큰과 컨텍스트 윈도
* Temperature
* API 비용과 Rate Limit

## 3단계: RAG

* Document Loader
* 문서 분할
* Embedding
* Vector DB
* Retriever
* Metadata Filter
* Hybrid Search
* Reranking
* 출처 표시
* RAG 평가

사용자가 진행 중인 PERSO AI 프로젝트에서도 이 단계가 핵심입니다. 페르소나는 답변 스타일을 담당하고, RAG는 사실과 지식을 공급하는 역할로 분리하는 것이 좋습니다.

## 4단계: 단일 에이전트

멀티에이전트보다 먼저 하나의 에이전트가 안정적으로 동작하도록 만들어야 합니다.

```text
LLM
 ├─ 검색 도구
 ├─ 계산 도구
 ├─ DB 조회
 └─ 파일 분석
```

학습 내용:

* ReAct 패턴
* 도구 선택
* 도구 결과 처리
* 반복 제한
* Timeout
* Retry
* Fallback
* 메모리
* Human-in-the-Loop

## 5단계: LangGraph

취업 과정에서는 가장 많은 시간을 배정하는 것이 좋습니다.

* State
* Node
* Edge
* Conditional Edge
* Reducer
* Checkpoint
* Interrupt
* Command
* Subgraph
* Supervisor
* Multi-Agent
* Agentic RAG
* 지속 실행
* 오류 복구

## 6단계: CrewAI

LangGraph와 비교하는 방식으로 학습하는 것이 효과적입니다.

* Agent
* Task
* Crew
* Sequential Process
* Hierarchical Process
* Flow
* State
* Guardrail
* Human Feedback
* Memory
* MCP

같은 프로젝트를 LangGraph와 CrewAI로 각각 구현하면 두 기술의 차이를 명확히 이해할 수 있습니다.

## 7단계: AutoGen과 Microsoft Agent Framework

AutoGen은 1~2일 정도 개념과 기존 코드를 이해하는 수준이 적당합니다.

* Conversable Agent
* Group Chat
* 코드 실행
* Critic Agent
* AutoGen의 역사적 의의
* 유지보수 모드 전환
* Microsoft Agent Framework 구조

## 8단계: 운영과 LLMOps

* FastAPI 서비스화
* PostgreSQL·Redis
* Docker
* 클라우드 배포
* 인증·권한
* 비밀키 관리
* 로그와 추적
* 평가 데이터셋
* 비용·지연시간 측정
* 프롬프트 인젝션 대응
* 도구 실행 권한 제한

---

# 7. 권장 교육 비중

| 영역                                | 권장 비중 |
| --------------------------------- | ----: |
| Python·API·Git·백엔드                |   15% |
| LLM·프롬프트·Tool Calling             |   15% |
| RAG와 검색 품질 개선                     |   20% |
| 에이전트 기본 원리                        |   10% |
| LangGraph                         |   20% |
| CrewAI 비교 실습                      |    8% |
| AutoGen·Microsoft Agent Framework |    4% |
| 배포·평가·보안·관측성                      |    8% |

프레임워크 세 개를 모두 동일하게 1/3씩 나누는 과정은 권장하지 않습니다. 기술 변화가 빠르기 때문에 **에이전트 설계 원리와 운영 능력 70%, 프레임워크 API 30%** 정도가 적절합니다.

---

# 8. 취업용 포트폴리오 구성

## 프로젝트 1: Agentic RAG 정책 상담사

사용자가 진행해 온 충청남도 임신·출산·육아 안내서와 잘 연결되는 프로젝트입니다.

```text
사용자 질문
   ↓
질문 분류
   ↓
정책 문서 검색
   ↓
검색 품질 평가
   ↓
필요 시 재검색
   ↓
답변 생성
   ↓
근거 문서·페이지 표시
```

필수 기능:

* PDF RAG
* 질문 재작성
* 문서 관련성 평가
* 답변 근거 표시
* LangGraph 상태 관리
* 사용자별 대화 메모리
* 관리자 승인 기능
* 평가 데이터셋

## 프로젝트 2: 멀티에이전트 보고서 작성 시스템

```text
Planner
   ↓
Researcher
   ↓
Analyst
   ↓
Writer
   ↓
Reviewer
```

단순히 에이전트 다섯 개가 대화하도록 하지 말고, 각 단계의 입출력을 Pydantic 모델로 정의하고 실패 시 재실행하도록 설계해야 합니다.

## 프로젝트 3: PERSO AI 통합 시스템

```text
음성 입력
   ↓
STT
   ↓
사용자 의도 분석
   ↓
LangGraph 에이전트
   ├─ RAG
   ├─ 날씨 API
   ├─ 일정·DB
   └─ 사용자 메모리
   ↓
페르소나 적용 답변
   ↓
TTS
```

이 프로젝트는 사용자의 기존 STT·TTS·페르소나·RAG 학습을 하나의 포트폴리오로 통합할 수 있다는 점에서 가장 가치가 높습니다.

---

# 최종 권장안

취업을 목표로 한다면 우선순위는 다음과 같습니다.

```text
1. Python·FastAPI·Git
2. LLM API와 Tool Calling
3. RAG와 검색 품질 평가
4. 단일 에이전트
5. LangGraph 심화
6. CrewAI 비교
7. AutoGen 개념과 Microsoft Agent Framework
8. Docker·DB·배포·평가·보안
```

**LangGraph는 깊게**, **CrewAI는 빠른 구현과 비교 중심으로**, **AutoGen은 역사와 설계 패턴 중심으로** 학습하는 것이 2026년 현재 가장 합리적입니다. 특히 취업 포트폴리오에서는 “에이전트가 대화한다”는 데모보다 **상태 저장, 실패 복구, 근거 검증, 사람 승인, 평가, 배포까지 포함한 실제 서비스**를 보여주는 것이 훨씬 중요합니다.

[1]: https://docs.langchain.com/oss/python/langgraph/overview?utm_source=chatgpt.com "LangGraph overview - Docs by LangChain"
[2]: https://arxiv.org/abs/2210.03629?utm_source=chatgpt.com "ReAct: Synergizing Reasoning and Acting in Language Models"
[3]: https://www.microsoft.com/en-us/research/blog/autogen-enabling-next-generation-large-language-model-applications/?utm_source=chatgpt.com "AutoGen: Enabling next-generation large language model ..."
[4]: https://docs.crewai.com/v1.14.7/en/changelog?utm_source=chatgpt.com "Changelog"
[5]: https://changelog.langchain.com/?categories=cat_5UBL6DD8PcXXL&date=2024-01-01&utm_source=chatgpt.com "January 2024"
[6]: https://github.com/langchain-ai/langgraph?utm_source=chatgpt.com "langchain-ai/langgraph: Build resilient agents."
[7]: https://docs.crewai.com/?utm_source=chatgpt.com "CrewAI Documentation - CrewAI"
[8]: https://arxiv.org/abs/2308.08155?utm_source=chatgpt.com "AutoGen: Enabling Next-Gen LLM Applications via Multi- ..."
[9]: https://github.com/microsoft/autogen?utm_source=chatgpt.com "microsoft/autogen: A programming framework for agentic AI"
[10]: https://docs.langchain.com/oss/python/langgraph/workflows-agents?utm_source=chatgpt.com "Workflows and agents - Docs by LangChain"
[11]: https://docs.crewai.com/v1.15.1/en/mcp/overview?utm_source=chatgpt.com "MCP Servers as Tools in CrewAI"
