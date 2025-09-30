# 간단한 Agent AI 소스 코드

--- 

```python

# 필요한 라이브러리 설치
# pip install langchain langchain-openai langgraph faiss-cpu tiktoken

from typing import TypedDict, List, Optional
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.document_loaders import TextLoader
from langchain.chains import RetrievalQA
from langgraph.graph import StateGraph

# 1. 상태 스키마 정의
class RAGState(TypedDict):
    question: str
    answer: Optional[str]
    sources: Optional[List[str]]

# 2. 문서 로딩 및 벡터화
loader = TextLoader("docs/sample.txt")  # 검색 대상 문서 경로
documents = loader.load()
embedding = OpenAIEmbeddings(openai_api_key="api key"
vectorstore = FAISS.from_documents(documents, embedding)

# 3. RAG 체인 구성
retriever = vectorstore.as_retriever()
rag_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4", openai_api_key="api key"),
    retriever=retriever,
    return_source_documents=True
)

# 4. LangGraph 노드 함수 정의
def retrieve_node(state: RAGState) -> RAGState:
    result = rag_chain({"query": state["question"]})
    return {
        "question": state["question"],
        "answer": result["result"],
        "sources": result["source_documents"]
    }

# 5. 그래프 구성
graph = StateGraph(RAGState)
graph.add_node("retrieve", retrieve_node)
graph.set_entry_point("retrieve")
graph.set_finish_point("retrieve")
app = graph.compile()

# 6. 실행
state = {"question": "삼성전자의 최근 실적은 어떻게 되나요?"}
result = app.invoke(state)

# 7. 결과 출력
print("💬 질문:", result["question"])
print("📌 답변:", result["answer"])
print("📚 출처 문서 수:", len(result["sources"]))

```
---  


## 아래는 LangChain과 LangGraph를 활용한 RAG 기반 챗봇 코드의 **전체 구조와 역할**을 단계별로 자세히 설명한 정리입니다.   
이 코드는 문서를 검색해 LLM이 더 정확한 답변을 생성하도록 돕는 구조예요.

---

## 🧠 전체 흐름 요약

> 사용자의 질문 → 문서 검색 → 응답 생성 → 결과 반환  
> 이 과정을 LangChain으로 구현하고, LangGraph로 워크플로우를 제어합니다.

---

## 1️⃣ 라이브러리 설치

```bash
pip install langchain langchain-openai langgraph faiss-cpu tiktoken
```

- `langchain`: LLM 기반 앱을 만들기 위한 프레임워크
- `langchain-openai`: OpenAI 모델 및 임베딩 클래스
- `langgraph`: 상태 기반 워크플로우 엔진
- `faiss-cpu`: 문서 검색을 위한 벡터 인덱스
- `tiktoken`: 토큰 계산용 라이브러리 (일부 LangChain 기능에 필요)

---

## 2️⃣ 상태 스키마 정의

```python
from typing import TypedDict, List, Optional

class RAGState(TypedDict):
    question: str
    answer: Optional[str]
    sources: Optional[List[str]]
```

- LangGraph는 상태를 `dict`로 관리하므로, 어떤 키가 포함될지 명시해야 합니다.
- `TypedDict`를 사용해 `question`, `answer`, `sources`를 정의합니다.

---

## 3️⃣ 문서 로딩 및 벡터화

```python
from langchain.document_loaders import TextLoader
from langchain.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

loader = TextLoader("docs/sample.txt")
documents = loader.load()
embedding = OpenAIEmbeddings(openai_api_key="your-api-key")
vectorstore = FAISS.from_documents(documents, embedding)
```

- `TextLoader`: 텍스트 문서를 불러옵니다.
- `OpenAIEmbeddings`: 문서를 벡터로 변환합니다.
- `FAISS`: 벡터 검색 인덱스를 생성합니다.

---

## 4️⃣ RAG 체인 구성

```python
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI

retriever = vectorstore.as_retriever()
rag_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4", openai_api_key="your-api-key"),
    retriever=retriever,
    return_source_documents=True
)
```

- `RetrievalQA`: 검색된 문서를 기반으로 LLM이 응답을 생성하는 체인
- `ChatOpenAI`: GPT-4 모델을 사용해 응답 생성

---

## 5️⃣ LangGraph 노드 정의 및 그래프 구성

```python
from langgraph.graph import StateGraph

def retrieve_node(state: RAGState) -> RAGState:
    result = rag_chain({"query": state["question"]})
    return {
        "question": state["question"],
        "answer": result["result"],
        "sources": result["source_documents"]
    }

graph = StateGraph(RAGState)
graph.add_node("retrieve", retrieve_node)
graph.set_entry_point("retrieve")
graph.set_finish_point("retrieve")
app = graph.compile()
```

- `retrieve_node`: 질문을 받아 검색하고 응답을 생성하는 노드
- `StateGraph`: 노드를 연결해 워크플로우를 구성
- `compile()`: 그래프를 실행 가능한 형태로 컴파일

---

## 6️⃣ 실행 및 결과 출력

```python
state = {"question": "삼성전자의 최근 실적은 어떻게 되나요?"}
result = app.invoke(state)

print("💬 질문:", result["question"])
print("📌 답변:", result["answer"])
print("📚 출처 문서 수:", len(result["sources"]))
```

- `invoke()`: 그래프 실행
- 결과는 `dict` 형태로 반환되며, 질문·답변·출처를 출력합니다.

---

## 📁 문서 예시 (`docs/sample.txt`)

```text
삼성전자는 2025년 2분기에 매출 67조 4천억 원, 영업이익 10조 1천억 원을 기록했다.
반도체 부문은 AI 서버 수요 증가로 매출 21조 원, 영업이익 4조 3천억 원을 달성했다.
...
```

- 이 문서가 검색 대상이며, 질문에 따라 관련 내용을 추출해 응답에 활용됩니다.

---

## 🔄 확장 아이디어
- 멀티턴 대화: 이전 질문/답변을 상태에 저장
- 요약 기능 추가: 검색된 문서를 요약해 응답
- 사용자 피드백 반영: "더 자세히 알려줘" 같은 흐름 분기

---

필요하시면 이 구조를 기반으로 챗봇 UI, API 서버, 또는 다양한 산업용 시나리오로 확장하는 방법도 알려드릴게요!
