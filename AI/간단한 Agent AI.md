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

