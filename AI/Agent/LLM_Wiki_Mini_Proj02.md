# LLM Wiki Mini_Project 02

> 실험용으로는 **처음부터 RAG·Vector DB까지 넣지 말고, `PDF → LLM → 구조화된 Wiki Markdown → 검증`까지만 먼저 구현**하는 것이 가장 좋습니다. 이 단계만 성공해도 LLM Wiki의 핵심을 충분히 경험할 수 있습니다.
> 현재 OpenAI Responses API는 PDF를 `input_file`로 직접 전달할 수 있고, PDF의 텍스트와 페이지 이미지를 모델 컨텍스트로 처리할 수 있습니다. Python SDK에서는 Pydantic을 이용해 LLM 출력 형식을 구조화하는 것도 지원합니다. ([OpenAI 플랫폼][1])

## 1. 가장 단순한 전체 구조

우리가 만들 프로젝트는 다음 정도면 됩니다.

```text
사용자
  │
  │ PDF 업로드
  ▼
┌────────────────────┐
│ input/sample.pdf   │
└─────────┬──────────┘
          │
          ▼
    OpenAI Files API
          │
          ▼
       LLM 분석
          │
    ┌─────┼─────┐
    ▼     ▼     ▼
   요약   개념   관계
   추출   추출   추출
    │     │     │
    └─────┼─────┘
          ▼
   Structured Output
          │
          ▼
┌─────────────────────┐
│ WikiPage Objects    │
│                     │
│ title               │
│ summary             │
│ concepts            │
│ related             │
│ source              │
└─────────┬───────────┘
          │
          ▼
      Markdown 변환
          │
          ▼
wiki/
├── rag.md
├── embedding.md
├── vector-db.md
└── transformer.md
          │
          ▼
       자동 검증
          │
          ▼
       index.md 갱신
```

처음 실험에서는 **PDF 하나가 Wiki 파일 하나가 되는 구조가 아니라, PDF 하나에서 여러 개념 페이지가 만들어지도록 하는 것**이 중요합니다.

---

# 2. 프로젝트 구조

앞서 만든 프로젝트를 다음처럼 조금 확장하면 됩니다.

```text
llm_wiki_pdf/
│
├── input/
│   └── sample.pdf
│
├── raw/
│   └──
│
├── wiki/
│   ├── index.md
│   └──
│
├── scripts/
│   ├── ingest_pdf.py
│   ├── save_wiki.py
│   └── validate_wiki.py
│
├── .env
├── requirements.txt
└── README.md
```

핵심 프로그램은 사실상:

```text
ingest_pdf.py
```

하나입니다.

---

# 3. 필요한 라이브러리 설치

가상환경에서:

```bash
pip install openai pydantic python-dotenv
```

정도면 1차 실험이 가능합니다.

OpenAI Python SDK의 현재 기본 패턴은 `OpenAI()` 클라이언트를 만들고 Responses API를 호출하는 방식입니다. ([OpenAI 플랫폼][2])

API Key는 예를 들어 `.env`에:

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
```

처럼 저장합니다.

그리고 `.gitignore`에는 반드시:

```text
.env
```

를 넣어야 합니다.

---

# 4. PDF를 직접 LLM에 보내는 것이 가장 간단합니다

여기서 중요한 선택지가 있습니다.

### 방법 A — PDF를 직접 LLM에 전달

```text
PDF
 ↓
OpenAI
 ↓
텍스트 + 페이지 이미지 분석
 ↓
Wiki 생성
```

**실험용으로는 이 방법을 추천합니다.**

OpenAI 공식 문서에서도 PDF를 Files API에 `purpose="user_data"`로 업로드한 뒤, 반환된 `file_id`를 Responses API의 `input_file`로 전달하는 방식을 지원합니다. ([OpenAI 플랫폼][1])

---

### 방법 B — Python에서 PDF 텍스트 추출

```text
PDF
 ↓
pypdf
 ↓
Text
 ↓
LLM
```

이 방법은 나중에 비용·Chunk·페이지 단위 처리를 직접 제어하고 싶을 때 좋습니다.

하지만 스캔 PDF라면 pypdf 자체는 OCR을 수행하지 못합니다. ([pypdf][3])

따라서 첫 실험에서는 **방법 A**가 훨씬 편합니다.

---

# 5. 가장 중요한 부분: LLM에게 그냥 Markdown을 만들어 달라고 하지 않는다

다음처럼 하면 안 됩니다.

```python
prompt = """
이 PDF를 읽고 Wiki Markdown을 만들어줘.
"""
```

왜냐하면 출력이 매번 달라질 수 있기 때문입니다.

대신 먼저 **지식 구조를 정의**합니다.

예를 들어:

```python
class WikiPage(BaseModel):
    title: str
    slug: str
    summary: str
    concepts: list[str]
    related: list[str]
    source: str
    confidence: float
```

이런 구조입니다.

OpenAI Structured Outputs는 Python SDK에서 Pydantic 모델을 출력 스키마로 사용할 수 있습니다. ([OpenAI 플랫폼][4])

이것이 LLM Wiki 구축에서 상당히 중요합니다.

---

# 6. PDF 하나에서 여러 Wiki Page를 추출하도록 한다

예를 들어 업로드한 PDF가:

```text
RAG 기술 소개.pdf
```

이고 내용에 다음 개념이 있다고 하겠습니다.

```text
RAG
Embedding
Vector Database
Retriever
Chunking
```

LLM에게:

> PDF 요약 하나를 만들어라

가 아니라:

> 독립적으로 재사용할 가치가 있는 주요 개념을 식별하고 개념별 Wiki Page를 생성하라

라고 요청합니다.

그러면:

```text
RAG 기술 소개.pdf
        │
        ▼
       LLM
        │
 ┌──────┼──────────────┐
 ▼      ▼       ▼      ▼
RAG  Embedding VectorDB Retriever
 │      │       │      │
 ▼      ▼       ▼      ▼
rag.md
embedding.md
vector-db.md
retriever.md
```

가 되는 것이 목표입니다.

---

# 7. Structured Output 모델 정의

예를 들면 다음 정도가 적당합니다.

```python
from pydantic import BaseModel, Field


class WikiPage(BaseModel):
    title: str
    slug: str

    definition: str
    summary: str

    key_points: list[str]

    related: list[str]

    source: str

    confidence: float = Field(
        ge=0.0,
        le=1.0
    )


class WikiBundle(BaseModel):
    document_title: str

    pages: list[WikiPage]
```

이렇게 해두면 LLM은 자유로운 Markdown을 바로 반환하는 대신:

```json
{
  "document_title": "RAG 기술 소개",
  "pages": [
    {
      "title": "Retrieval-Augmented Generation",
      "slug": "rag",
      "definition": "...",
      "summary": "...",
      "key_points": [
        "...",
        "..."
      ],
      "related": [
        "embedding",
        "retriever"
      ],
      "source": "sample.pdf",
      "confidence": 0.95
    }
  ]
}
```

형태의 데이터를 반환하게 됩니다.

---

# 8. PDF 업로드 + LLM 분석

핵심 코드는 대략 다음 구조입니다.

```python
import os

from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field


load_dotenv()

client = OpenAI()


class WikiPage(BaseModel):
    title: str
    slug: str
    definition: str
    summary: str
    key_points: list[str]
    related: list[str]
    source: str
    confidence: float = Field(ge=0, le=1)


class WikiBundle(BaseModel):
    document_title: str
    pages: list[WikiPage]


pdf_path = "input/sample.pdf"


# 1. PDF 업로드
with open(pdf_path, "rb") as f:

    uploaded_file = client.files.create(
        file=f,
        purpose="user_data"
    )


# 2. PDF 분석
response = client.responses.parse(

    model="gpt-5.6",

    input=[
        {
            "role": "system",
            "content": """
당신은 LLM Wiki Knowledge Builder입니다.

입력 PDF를 분석하여 재사용 가능한 지식 단위로 분해하십시오.

규칙:

1. PDF 전체를 단순 요약하지 마십시오.
2. 독립적인 주요 개념별로 Wiki Page를 생성하십시오.
3. 한 페이지는 하나의 핵심 개념을 담당합니다.
4. 관련 개념은 related에 기록합니다.
5. PDF에 없는 사실을 임의로 추가하지 마십시오.
6. source에는 원본 PDF 파일명을 기록합니다.
7. confidence는 0~1 사이 값으로 작성합니다.
8. 너무 세부적인 개념은 별도 페이지로 만들지 마십시오.
"""
        },

        {
            "role": "user",
            "content": [

                {
                    "type": "input_file",
                    "file_id": uploaded_file.id
                },

                {
                    "type": "input_text",
                    "text": """
이 PDF를 분석하여
LLM Wiki에 저장할 핵심 Knowledge Page를 생성하십시오.
"""
                }
            ]
        }
    ],

    text_format=WikiBundle
)


wiki_data = response.output_parsed
```

OpenAI 공식 문서에는 Files API로 PDF를 올린 후 반환된 `file.id`를 `input_file`로 전달하는 Python 예제가 있으며, Responses API의 구조화 출력에는 `responses.parse()`와 Pydantic 모델을 사용할 수 있습니다. ([OpenAI 플랫폼][1])

---

# 9. 이제 LLM의 결과를 Markdown으로 변환

여기가 재미있는 부분입니다.

```python
from pathlib import Path


wiki_dir = Path("wiki")

wiki_dir.mkdir(
    exist_ok=True
)


for page in wiki_data.pages:

    related = "\n".join(
        f"- [[{item}]]"
        for item in page.related
    )

    key_points = "\n".join(
        f"- {item}"
        for item in page.key_points
    )

    markdown = f"""---
title: {page.title}
source: {page.source}
status: draft
confidence: {page.confidence}
---

# {page.title}

## 정의

{page.definition}

## 요약

{page.summary}

## 핵심 내용

{key_points}

## 관련 개념

{related}

## 출처

- {page.source}
"""

    file_path = wiki_dir / f"{page.slug}.md"

    file_path.write_text(
        markdown,
        encoding="utf-8"
    )

    print(
        "생성:",
        file_path
    )
```

---

# 10. 실제 실행 결과는 이런 모습이 됩니다

예를 들어 PDF가 RAG 강의자료라면:

```text
wiki/

├── rag.md
├── embedding.md
├── vector-database.md
├── retriever.md
├── chunking.md
└── semantic-search.md
```

가 자동으로 만들어질 수 있습니다.

`rag.md`를 열면:

```markdown
---
title: Retrieval-Augmented Generation
source: sample.pdf
status: draft
confidence: 0.95
---

# Retrieval-Augmented Generation

## 정의

RAG는 외부 지식 저장소에서 관련 정보를
검색하여 LLM 생성 과정에 제공하는 방식이다.

## 요약

RAG는 모델 자체의 파라미터를 변경하지 않고
외부 지식을 활용할 수 있도록 한다.

## 핵심 내용

- Retrieval 단계와 Generation 단계로 구성된다.
- 외부 Knowledge Base를 사용할 수 있다.
- 최신 데이터를 활용할 수 있다.

## 관련 개념

- [[embedding]]
- [[retriever]]
- [[vector-database]]

## 출처

- sample.pdf
```

처럼 됩니다.

이 순간부터 단순한 PDF가 **Persistent Knowledge**로 바뀐 것입니다.

---

# 11. 그런데 여기까지는 아직 진정한 `Compounding`이 아닙니다

첫 번째 PDF:

```text
PDF #1

RAG
Embedding
Vector DB
```

를 넣어서:

```text
wiki/
├── rag.md
├── embedding.md
└── vector-db.md
```

가 생겼다고 하겠습니다.

다음날 새로운 PDF:

```text
PDF #2

GraphRAG
Knowledge Graph
Entity
Relationship
```

를 넣었습니다.

단순 시스템이라면:

```text
wiki/
├── rag.md
├── embedding.md
├── vector-db.md
├── graphrag.md
├── entity.md
└── knowledge-graph.md
```

만 생깁니다.

이것은 **Building + Persistent** 정도입니다.

---

# 12. Compounding을 만들려면 기존 Wiki를 LLM에게 보여줘야 합니다

두 번째 PDF가 들어왔을 때:

```text
기존 Wiki Index

rag
embedding
vector-database
```

를 같이 LLM에게 제공합니다.

```text
              새로운 PDF
                   │
                   ▼
                  LLM
                   ▲
                   │
            기존 Wiki Index
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
       rag     embedding   vector-db
```

LLM이:

```text
새 개념 GraphRAG는
기존 RAG와 관계가 있다.
```

라고 판단하도록 합니다.

그러면:

```text
RAG
 │
 ├── Vector DB
 │
 └── GraphRAG
        │
        └── Knowledge Graph
```

관계가 만들어집니다.

---

# 13. 기존 페이지도 업데이트해야 합니다

이 부분이 일반 RAG와 결정적으로 달라집니다.

예를 들어 기존:

```markdown
# RAG

## 관련 개념

- [[embedding]]
- [[vector-database]]
```

였는데 GraphRAG PDF가 새로 들어오면:

```markdown
# RAG

## 관련 개념

- [[embedding]]
- [[vector-database]]
- [[graphrag]]
```

가 됩니다.

즉:

```text
새 문서
 ↓
새 Wiki 생성
 ↓
기존 Wiki 탐색
 ↓
관련 페이지 발견
 ↓
기존 페이지 업데이트
```

가 필요합니다.

이 단계부터 **Compounding Knowledge Base**라는 느낌이 나타납니다.

---

# 14. 따라서 실제 LLM Wiki Ingest는 2번의 LLM 작업으로 나누는 것이 좋습니다

처음부터 한 번에 전부 시키기보다:

### Pass 1 — Knowledge Extraction

```text
PDF
 ↓
LLM
 ↓
Concept 추출
 ↓
Wiki Page 생성
```

### Pass 2 — Knowledge Linking

```text
New Wiki
       +
Existing Wiki Index
       ↓
      LLM
       ↓
중복 탐색
관계 탐색
기존 페이지 연결
       ↓
Wiki Update
```

로 구성하는 것을 추천합니다.

전체적으로:

```text
PDF
 │
 ▼
LLM #1
Knowledge Extraction
 │
 ├─ RAG
 ├─ Embedding
 └─ Vector DB
 │
 ▼
Temporary Wiki
 │
 ▼
LLM #2
Knowledge Integration
 │
 ├─ 신규인가?
 ├─ 기존 페이지인가?
 ├─ 중복인가?
 └─ 어떤 페이지와 관계가 있는가?
 │
 ▼
Persistent Wiki
```

가 됩니다.

---

# 15. 그리고 세 번째 단계에서 검증합니다

앞서 만든:

```text
validate_wiki.py
```

를 그대로 사용할 수 있습니다.

```bash
python scripts/validate_wiki.py
```

검증 대상:

```text
Front Matter
      ↓
title 존재?
source 존재?
confidence 존재?
      ↓
Wiki Link
      ↓
실제 파일 존재?
      ↓
Source
      ↓
원본 PDF 존재?
```

여기에 나중에는:

```text
Claim
 ↓
Source PDF
 ↓
LLM Evaluator
 ↓
Supported?
```

까지 추가할 수 있습니다.

---

# 16. 첫 실험에서는 Vector DB를 넣지 않는 것을 권합니다

이것이 상당히 중요합니다.

처음부터:

```text
PDF
 ↓
Chunk
 ↓
Embedding
 ↓
Chroma
 ↓
Vector Search
 ↓
Graph
 ↓
Agent
```

까지 넣으면 결국 다시 **RAG 실습처럼 보이게 됩니다.**

먼저:

```text
PDF

 ↓

LLM Knowledge Extraction

 ↓

Markdown

 ↓

Wiki Link

 ↓

Knowledge Update
```

만 경험해야 합니다.

그래야

> **“아, LLM Wiki는 검색 기술이 아니라 지식을 생성하고 유지하는 시스템이구나.”**

라는 차이가 명확하게 보입니다.

---

# 17. 그다음 단계에서 RAG를 붙입니다

Wiki가 예를 들어 100개 생기면:

```text
wiki/
├── rag.md
├── embedding.md
├── transformer.md
├── attention.md
├── agent.md
├── mcp.md
      ...
```

이때 검색 계층을 추가합니다.

```text
                 Wiki
                  │
      ┌───────────┼───────────┐
      ▼           ▼           ▼
    BM25        Vector       Graph
      │           │           │
      └───────────┼───────────┘
                  ▼
                 LLM
```

여기서부터:

```text
LLM Wiki + RAG
```

가 되는 것입니다.

---

# 18. 추천 실험 순서

따라서 아래 순서로 진행하는 것이 가장 좋습니다.

| 단계 | 작업                | 목적                   |
| -- | ----------------- | -------------------- |
| 1  | PDF 1개 준비         | Source               |
| 2  | Files API 업로드     | PDF 입력               |
| 3  | LLM 분석            | 개념 추출                |
| 4  | Structured Output | 출력 안정화               |
| 5  | Markdown 생성       | Persistent Knowledge |
| 6  | Wiki Link 생성      | 관계                   |
| 7  | 자동 검증             | 품질 관리                |
| 8  | 두 번째 PDF 입력       | Knowledge 추가         |
| 9  | 기존 Wiki와 비교       | 관계 발견                |
| 10 | 기존 Wiki 업데이트      | Compounding          |
| 11 | Keyword 검색        | Retrieval            |
| 12 | Vector Search 추가  | RAG                  |
| 13 | Agent 추가          | 자동화                  |
| 14 | MCP 연결            | 외부 데이터               |

---

## 한 가지 비용상 주의할 점

PDF 직접 입력은 편하지만, OpenAI의 현재 PDF 입력은 **추출된 텍스트와 페이지 이미지가 함께 컨텍스트에 포함될 수 있기 때문에 토큰 사용량이 증가할 수 있습니다.** 현재 문서 기준 파일은 개별 50MB 미만이어야 하고 한 요청에 포함되는 파일들의 합계도 50MB 제한입니다. 따라서 실습은 **5~20페이지 정도의 작은 PDF 하나**로 시작하는 것이 좋습니다. ([OpenAI 플랫폼][1])

처음 구현해야 할 핵심은 결국 이것입니다.

```text
          PDF
           │
           ▼
      OpenAI API
           │
           ▼
    Knowledge Extraction
           │
           ▼
     Pydantic Object
           │
           ▼
      Markdown Writer
           │
           ▼
         wiki/
     ┌─────┼─────┐
     ▼     ▼     ▼
   rag   agent   mcp
    │      │      │
    └──── Wiki Link ────┘
           │
           ▼
       Validation
```

**다음 단계로는 방금 만든 `llm_wiki_demo.zip`을 실제로 확장해서, `input` 폴더에 PDF를 넣고 `python ingest_pdf.py sample.pdf` 한 줄을 실행하면 Wiki Markdown 파일들이 자동 생성되는 완성형 실습 프로젝트로 만드는 것이 가장 좋습니다.**

[1]: https://platform.openai.com/docs/guides/pdf-files "File inputs | OpenAI API"
[2]: https://platform.openai.com/docs/quickstart "Developer quickstart | OpenAI API"
[3]: https://pypdf.readthedocs.io/en/latest/user/extract-text.html?utm_source=chatgpt.com "Extract Text from a PDF — pypdf 6.14.2 documentation"
[4]: https://platform.openai.com/docs/guides/structured-outputs "Structured model outputs | OpenAI API"
