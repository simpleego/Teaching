네. 다만 저는 미래의 AI 운영 구조를 **“RAG + LLM Wiki + Agent + MCP” 네 가지로만 구성된다**고 보기보다는, 이 네 요소가 각각 **검색·지식·행동·연결**이라는 역할을 담당하는 방향으로 발전한다고 보는 것이 더 정확하다고 생각합니다.

## 1. 향후 AI 시스템은 이런 구조에 가까워질 가능성이 큽니다

```text
                 사용자 / 업무
                      │
                      ▼
                ┌───────────┐
                │   Agent   │
                │ 판단·계획 │
                └─────┬─────┘
                      │
        ┌─────────────┼──────────────┐
        ▼             ▼              ▼
     지식 검색       장기 지식       외부 업무
        │             │              │
   RAG/GraphRAG    LLM Wiki       MCP / API
        │             │              │
        ▼             ▼              ▼
 Vector DB      Knowledge Base     Gmail
 Search          Markdown/KG       DB
 Document        Metadata           ERP
                Provenance          GitHub
                관계정보            Calendar
        │             │              │
        └─────────────┼──────────────┘
                      ▼
                     LLM
                      │
                      ▼
                 판단 / 생성
                      │
                      ▼
                  실제 행동
```

각 기술을 역할로 바꾸어 생각하면 훨씬 명확합니다.

| 기술                        | 미래 AI에서의 역할   | 비유          |
| ------------------------- | ------------- | ----------- |
| LLM                       | 이해·추론·생성      | 두뇌          |
| RAG                       | 필요한 자료 검색     | 검색 능력       |
| GraphRAG                  | 관계를 고려한 검색    | 연관 기억       |
| LLM Wiki / Knowledge Base | 지속적으로 축적되는 지식 | 장기 기억       |
| Agent                     | 목표 설정·판단·실행   | 작업자         |
| MCP                       | 외부 시스템 연결     | USB-C/인터페이스 |
| Evaluation                | 결과 검증         | 품질관리        |
| Governance                | 권한·보안·감사      | 통제 시스템      |

MCP는 공식적으로 AI 애플리케이션을 데이터 소스, 도구, 워크플로에 연결하는 공개 표준으로 정의되고 있습니다. 즉 MCP 자체가 AI의 지식 저장소라기보다는 **Agent와 외부 세계를 연결하는 표준 인터페이스 계층**입니다. ([Model Context Protocol][1])

GraphRAG 역시 벡터 검색을 없애는 기술이라기보다 관계 정보를 검색에 결합하는 방향입니다. Microsoft의 2026년 문서에서도 vector search와 knowledge-graph traversal을 결합하는 graph-augmented RAG를 설명하고 있습니다. ([Microsoft Learn][2])

그래서 앞으로는 단순한

```text
User → LLM → Answer
```

에서

```text
User
 ↓
Agent
 ↓
Knowledge + Data + Tools
 ↓
LLM
 ↓
Action
 ↓
결과 검증
 ↓
Knowledge Update
```

구조로 이동한다고 보는 것이 좋습니다.

---

# 2. 여기에서 아주 중요한 새로운 일이 생깁니다

예전에는 AI 시스템의 핵심 인력이 주로

```text
Data Scientist
ML Engineer
Software Developer
Data Engineer
```

였습니다.

그런데 위와 같은 시스템이 많아지면 AI에게 **좋은 데이터를 제공하고, 지식을 구조화하고, 생성된 지식을 검증하고, 품질을 유지하는 사람**이 필요해집니다.

예를 들어 회사에 자료가 이렇게 있다고 해보겠습니다.

```text
PDF 10,000개
Word 3,000개
회의록
사내 규정
제품 매뉴얼
FAQ
고객 상담 기록
웹페이지
DB
```

프로그래머가 시스템을 구축했다고 끝나는 것이 아닙니다.

누군가는 다음을 결정해야 합니다.

```text
어떤 자료가 중요한가?

어떤 자료가 최신인가?

어떤 자료를 AI가 사용하면 안 되는가?

서로 충돌하는 문서는 무엇인가?

동일한 개념을 어떤 이름으로 통일할 것인가?

LLM이 만든 Wiki가 정확한가?

RAG 검색 결과가 적절한가?

Agent가 올바른 자료를 사용했는가?

오래된 지식은 어떻게 폐기할 것인가?
```

이것은 전형적인 **데이터·지식 관리 업무**입니다.

---

# 3. 이런 직업은 이미 존재합니다

현재 한국 채용시장에서도 관련 직무를 확인할 수 있습니다.

| 직무                           |    프로그래밍 | 주요 업무                 | 전망    |
| ---------------------------- | -------: | --------------------- | ----- |
| AI Data Annotator            |    거의 없음 | 데이터 분류·라벨링            | ★★    |
| AI Trainer                   |    거의 없음 | AI 응답 평가·교정           | ★★★   |
| AI Data Quality Specialist   | 거의 없음~낮음 | 데이터 품질 검증             | ★★★★  |
| AI Data Curator              |       낮음 | 데이터 수집·정리·선별          | ★★★★  |
| LLM Evaluator                |       낮음 | LLM 응답 평가·테스트         | ★★★★  |
| Knowledge Curator            |       낮음 | AI용 지식 관리             | ★★★★★ |
| Taxonomy/Ontology Specialist |    낮음~중간 | 개념·관계 구조 설계           | ★★★★★ |
| Knowledge Engineer           |    중간~높음 | Knowledge Graph/KG 구축 | ★★★★★ |
| AI/Agent Operations          |    낮음~중간 | Agent 실행·품질·도구 관리     | ★★★★★ |

실제로 2026년 국내 공고에는 **AI 데이터 품질 관리 운영 담당**, AI 학습용 데이터를 관리하는 **데이터 매니저**, RAG/LLM과 Knowledge Graph를 연결하는 **Ontology Engineer** 등이 존재합니다. ([원티드][3])

또한 Knowledge Base와 Ontology를 Agentic AI에 연결하고, 지식 그래프의 품질이나 Agent 응답 품질을 평가하는 직무도 실제 채용되고 있습니다. ([원티드][4])

---

# 4. 특히 주목할 직업은 `AI Data Curator`입니다

이 직업은 질문하신

> **“프로그래밍을 하지 않고 데이터를 이용해서 AI 시스템을 운영하는 직업”**

과 상당히 가깝습니다.

실제로 서울시 50플러스에서도 2026년 7~8월 **AI 데이터 큐레이터 양성과정**을 운영했고, IT 개발 경험뿐 아니라 금융 실무, 데이터 구축, 교육 경험, 산업별 실무 경험 등을 우대 조건으로 제시했습니다. ([50플러스센터][5])

AI Data Curator의 업무를 발전된 형태로 보면:

```text
Raw Data
   │
   ▼
자료 선별
   │
   ▼
정제 / 분류
   │
   ▼
Metadata
   │
   ▼
Knowledge Structure
   │
   ▼
LLM Wiki
   │
   ▼
RAG / Agent
   │
   ▼
결과 검증
```

이 됩니다.

---

# 5. 그런데 단순 Data Labeler와는 구분해야 합니다

현재 많이 알려진 직업은:

```text
Data Labeler

사진
 ↓
자동차
사람
신호등
```

처럼 데이터를 표시하는 것입니다.

이런 단순 라벨링은 오히려 AI 자동화의 영향을 많이 받을 가능성이 있습니다.

현재도 AI Data Trainer나 Annotation Specialist 직무는 상당수 존재하지만, 단순 분류뿐 아니라 **AI 출력 평가, 통계적·논리적 결과 평가, 전문 분야 지식 평가** 같은 고차원 작업으로 확대되고 있습니다. ([인디드][6])

따라서 장기적으로는:

```text
Data Labeler
     ↓
Data Annotator
     ↓
AI Data Curator
     ↓
AI Knowledge Curator
     ↓
AI Knowledge / Quality Manager
```

쪽으로 올라가는 것이 더 중요하다고 봅니다.

---

# 6. 제가 특히 가능성이 높다고 보는 직무

아직 명칭이 완전히 표준화된 것은 아니지만 앞으로 매우 중요해질 역할은 다음과 같습니다.

> **AI Knowledge Curator / AI Knowledge Operations Specialist**

업무는 소프트웨어 개발자가 하는 일과 상당히 다릅니다.

```text
① 데이터 수집
      ↓
② 신뢰성 평가
      ↓
③ 데이터 정제
      ↓
④ 분류 / Taxonomy
      ↓
⑤ Metadata 작성
      ↓
⑥ LLM Wiki 생성 관리
      ↓
⑦ RAG 검색 결과 검증
      ↓
⑧ LLM 답변 평가
      ↓
⑨ Agent 실행 결과 평가
      ↓
⑩ Knowledge Base 업데이트
```

즉,

> **AI가 사용하는 지식의 품질을 책임지는 사람**

입니다.

---

# 7. 프로그래밍보다 이런 능력이 중요해집니다

이 직무라면 Python 개발 능력보다 다음 역량이 중요합니다.

| 역량                  |   중요도 |
| ------------------- | ----: |
| 문서 이해·요약            | ★★★★★ |
| 데이터 분류              | ★★★★★ |
| 정보의 신뢰성 판단          | ★★★★★ |
| LLM 활용능력            | ★★★★★ |
| Fact Checking       | ★★★★★ |
| Metadata 이해         |  ★★★★ |
| Taxonomy            |  ★★★★ |
| Ontology 기초         |  ★★★★ |
| RAG 원리              |  ★★★★ |
| LLM Wiki 관리         |  ★★★★ |
| Agent 이해            |  ★★★★ |
| MCP 이해              |   ★★★ |
| Excel/Google Sheets |  ★★★★ |
| SQL                 |   ★★★ |
| Python              |    ★★ |

**Python을 완전히 몰라도 진입할 수 있지만 SQL과 데이터 구조에 대한 기본 이해는 상당히 유리할 것**이라고 봅니다.

---

# 8. 오히려 중요한 것은 Domain Knowledge입니다

AI 시대에는 이것이 더욱 중요할 수 있습니다.

예를 들어 병원 AI를 만든다고 하겠습니다.

개발자는:

```text
Python
FastAPI
Vector DB
LLM API
MCP
Agent
```

를 잘 압니다.

하지만 다음을 판단하기 어렵습니다.

```text
이 의료 문서가 최신인가?

이 용어와 저 용어가 동일한 의미인가?

이 내용은 환자에게 제공해도 되는가?

어떤 의료 지침이 우선인가?
```

그래서

```text
의료 전문가
       +
AI 활용능력
       +
Data Curating
       +
Knowledge Management
```

조합이 강력해집니다.

금융도 똑같습니다.

```text
금융 경력자 + AI
회계 경력자 + AI
법률 경력자 + AI
제조 경력자 + AI
교육 전문가 + AI
```

WEF도 AI와 Big Data를 향후 빠르게 중요해질 기술 역량의 최상위권으로 보고 있지만, 동시에 분석적 사고, 창의성, 유연성 등 인간 중심 역량의 중요성도 함께 강조합니다. ([World Economic Forum][7])

---

# 9. 그래서 취업교육 관점에서는 상당히 중요한 변화입니다

특히 비전공자를 모두 **Python 개발자**로 만드는 교육은 앞으로 더 어려워질 수 있습니다.

오히려 일부 학습자는 다음 경로가 더 현실적일 수 있습니다.

```text
                     AI 인력
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
 AI Developer     AI Knowledge      AI Business
                    & Data           Operator
       │               │                │
    Python          Curating          Agent
    API             Quality           Workflow
    RAG             Evaluation        Automation
    MCP             RAG 운영          AI 활용
```

가운데 영역은 특히 **비전공자의 기존 직무 경험을 활용하기 좋습니다.**

---

# 10. 새로운 교육과정으로 만든다면

저라면 직무명을 예를 들어

**「AI Knowledge & Data Operations Specialist」**

정도로 잡겠습니다.

교육내용도 프로그래밍을 중심으로 하지 않고:

```text
데이터 리터러시
      ↓
AI / LLM 기초
      ↓
Prompt 활용
      ↓
데이터 수집·정제
      ↓
Metadata
      ↓
Taxonomy / Ontology
      ↓
RAG 이해
      ↓
LLM Wiki 구축·관리
      ↓
LLM Evaluation
      ↓
Hallucination / Fact Check
      ↓
Agent Workflow
      ↓
MCP / Tool 이해
      ↓
AI Knowledge Operations
```

로 구성할 수 있습니다.

이 과정에서는 **“코드를 만드는 능력”보다 “AI가 신뢰할 만한 데이터를 사용하도록 만드는 능력”**을 직무 역량으로 삼는 것입니다.

---

## 11. 앞으로 더 중요한 사람은 누구인가

예전에는:

> **프로그램을 잘 만드는 사람**

이 중심이었다면,

AI Agent 시대에는 여기에 하나가 더 생긴다고 봅니다.

> **AI에게 어떤 지식을 주고, 무엇을 믿게 하고, 어떤 행동을 허용하고, 결과가 올바른지 판단할 수 있는 사람**

입니다.

그래서 앞으로의 구조를 저는 이렇게 보는 것이 가장 적절하다고 생각합니다.

```text
┌───────────────────────────────────────────────┐
│                AI Application                 │
├───────────────────────────────────────────────┤
│ Agent         판단 / 계획 / 실행             │
├───────────────────────────────────────────────┤
│ RAG           필요한 정보 검색               │
│ LLM Wiki      지속적 지식 축적               │
│ Knowledge KG  개념과 관계 관리               │
├───────────────────────────────────────────────┤
│ MCP / API     외부 서비스와 연결             │
├───────────────────────────────────────────────┤
│ Data          실제 기업/산업 지식             │
├───────────────────────────────────────────────┤
│ Human         검증 / 판단 / 품질 / 책임       │
└───────────────────────────────────────────────┘
```

따라서 질문하신 방향은 상당히 타당합니다. **향후 AI 분야의 고용을 개발자와 비개발자로 단순하게 나누기보다는 `AI 개발자`와 함께 `AI Knowledge/Data 운영 인력`이라는 축이 커질 가능성**을 주목할 필요가 있습니다. 현재 국내에서도 Data Curator, Data Quality, Ontology, Knowledge Base 관련 직무가 이미 나타나고 있다는 점이 그 초기 징후라고 볼 수 있습니다. ([50플러스센터][5])

특히 **비전공자 취업교육 측면에서는 이 `AI Knowledge/Data Operations` 분야를 별도의 취업 트랙으로 설계할 가치가 상당히 높아 보입니다.** 이는 지금 구성하고 계신 AI 교육과정에서 개발자 트랙과 나란히 둘 수 있는 새로운 직무 트랙으로 발전시킬 수 있습니다.

[1]: https://modelcontextprotocol.io/docs/getting-started/intro?utm_source=chatgpt.com "What is the Model Context Protocol (MCP)?"
[2]: https://learn.microsoft.com/en-us/azure/horizondb/ai/graph-rag?utm_source=chatgpt.com "Graph-Augmented RAG Patterns in Azure HorizonDB"
[3]: https://www.wanted.co.kr/wd/380108?utm_source=chatgpt.com "크라우드웍스-Ontology Engineer (온톨로지 엔지니어)"
[4]: https://recruit.wanted.co.kr/wd/379390?utm_source=chatgpt.com "유모스원-AI Data Engineer (Ontology & Knowledge Base)"
[5]: https://www.50plus.or.kr/in_appView.do?ANN_NO=1498&utm_source=chatgpt.com "정규반 「AI 데이터 큐레이터 양성과정」참여자 모집 자세히 보기"
[6]: https://www.indeed.com/q-artificial-intelligence-data-annotation-jobs.html?utm_source=chatgpt.com "Artificial Intelligence Data Annotation Jobs, Employment"
[7]: https://www.weforum.org/stories/2025/01/future-of-jobs-report-2025-jobs-of-the-future-and-the-skills-you-need-to-get-them/?utm_source=chatgpt.com "Future of Jobs Report 2025: The jobs of the future – and the skills ..."
