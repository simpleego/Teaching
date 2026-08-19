# 미니 LLM Wiki 실습 프로젝트
> 직접 체험할 수 있도록 **미니 LLM Wiki 실습 프로젝트**를 만들어 두었습니다. 외부 API 없이 바로 실행할 수 있고, 마지막 검증도 통과했습니다.

[LLM Wiki 실습 프로젝트 다운로드](sandbox:/mnt/data/llm_wiki_demo.zip)

압축을 풀면 다음 구조입니다.

```text
llm_wiki_demo/
├── raw/                       # 원본 자료
│   ├── rag.md
│   ├── llm_wiki.md
│   └── agent_mcp.md
│
├── wiki/                      # 구조화된 Persistent Knowledge
│   ├── index.md
│   ├── rag.md
│   ├── llm-wiki.md
│   ├── agent.md
│   ├── mcp.md
│   └── knowledge-operations.md
│
├── scripts/
│   ├── search_wiki.py         # 검색
│   ├── validate_wiki.py       # Wiki 자동 검증
│   ├── write_back.py          # 새 지식 저장
│   └── wiki_utils.py
│
└── README.md
```

### 가장 먼저 해볼 실습

VS Code에서 프로젝트 폴더를 열고 터미널에서 다음을 실행해 보시면 됩니다.

**① LLM Wiki 검증**

```bash
python scripts/validate_wiki.py
```

정상적으로:

```text
=== LLM Wiki Validation ===
PASS: 구조 검증에서 발견된 문제가 없습니다.
```

가 나옵니다.

**② Wiki 검색**

```bash
python scripts/search_wiki.py "RAG LLM Wiki 차이"
```

여기서는 단순 문자열 검색이 아니라 교육용 TF-IDF 검색으로 관련 Wiki 페이지를 찾습니다.

Wiki의 연결 관계까지 검색하려면:

```bash
python scripts/search_wiki.py "Agent 외부 도구 지식" --expand-links
```

그러면:

```text
질문
 ↓
관련 Wiki 검색
 ↓
agent.md
 ↓
[[mcp]]
[[llm-wiki]]
[[rag]]
 ↓
연결 페이지 추가 검색
```

과정을 직접 볼 수 있습니다.

### ③ `raw`와 `wiki`를 직접 비교해보는 것이 핵심입니다

먼저:

```text
raw/llm_wiki.md
```

를 열어보고 다음으로:

```text
wiki/llm-wiki.md
```

를 열어보십시오.

차이가 보입니다.

원문은:

```text
LLM Wiki는 원문 자료를 단순히 chunk로...
지식 페이지는 Markdown으로...
새로운 자료가 들어오면...
```

처럼 **문서 중심**입니다.

Wiki에서는:

```markdown
---
title: LLM Wiki
source: raw/llm_wiki.md
status: checked
confidence: 0.94
related: rag, agent, knowledge-operations
---

# LLM Wiki

## 정의

## 저장 형태

## 검색

## RAG와의 차이

## 관련 개념
- [[rag]]
- [[agent]]
```

처럼 **지식 중심**으로 재구성되어 있습니다.

바로 이것이 일반적인 RAG의 Chunk와 LLM Wiki의 Knowledge Page 차이를 체험하는 부분입니다.

### ④ Write-back도 직접 체험할 수 있습니다

LLM과 대화하면서 새로운 지식이 만들어졌다고 가정합니다.

```bash
python scripts/write_back.py --title "RAG와 LLM Wiki의 역할 분담" --summary "RAG는 질문 시점의 검색에 강하고, LLM Wiki는 지식을 장기간 구조화하고 갱신하는 데 초점을 둔다."
```

그러면 `wiki/` 안에 새로운 Markdown 파일이 만들어집니다.

중요한 점은 자동으로:

```yaml
status: draft
confidence: 0.70
```

로 저장된다는 것입니다.

즉 바로 신뢰 지식으로 등록하지 않고:

```text
LLM 생성
 ↓
Draft
 ↓
검증
 ↓
Checked
 ↓
Verified
```

과정을 거치도록 한 것입니다.

### 이번 프로젝트에서 체험하게 되는 LLM Wiki 핵심

```text
Raw Document
      ↓
Structured Knowledge
      ↓
Markdown Wiki
      ↓
Metadata + Provenance
      ↓
Wiki Links
      ↓
Retrieval
      ↓
Answer
      ↓
Write-back
      ↓
Knowledge Update
```

특히 제가 앞에서 설명했던 **Persistent, Compounding Knowledge Base**의 기본 구조가 실제 파일로 어떻게 만들어지는지를 확인할 수 있습니다.

다만 현재 버전은 **LLM Wiki의 구조를 이해하기 위한 1단계 버전**이라 실제 LLM API 호출은 넣지 않았습니다. `wiki/*.md`는 LLM이 생성했다고 가정하여 미리 만들어 놓았습니다.

다음 단계가 훨씬 중요합니다. 이 프로젝트에 실제 LLM을 연결하면:

```text
내 PDF/Markdown 투입
        ↓
LLM이 자동 분석
        ↓
Wiki Page 자동 생성
        ↓
기존 Wiki와 관계 자동 연결
        ↓
중복/모순 자동 검사
        ↓
RAG 검색
        ↓
질문
        ↓
좋은 답변 Write-back
```

까지 실제로 동작하는 **진짜 개인용 LLM Wiki**가 됩니다.

다음 실습에서는 이 프로젝트를 그대로 확장해서 **사용자가 PDF나 Markdown 하나를 넣으면 LLM이 `wiki/*.md` 파일을 자동 생성하고 기존 페이지와 링크까지 연결하도록** 만드는 것이 가장 적절합니다. 이 단계를 해보면 기존 RAG와 LLM Wiki의 차이가 거의 완전히 체감됩니다.
