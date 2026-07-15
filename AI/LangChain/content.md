네. 아래는 해당 위키독스 도서에서 **Part 1부터 Part 8까지 목차만 계층 구조로 정리한 결과**입니다. 현재 사이트 목차에는 **Part 6과 Part 7이 없으며, Part 5 다음에 Part 8이 배치**되어 있습니다. ([위키독스][1])

# Part 1. LangChain 기초

## 1-1. LangChain이란?

* 1-1-1. LangChain 버전 히스토리
* 1-1-2. LangChain 1.0 프레임워크 구성
* 1-1-3. 필수 라이브러리 설치
* 1-1-3. 필수 라이브러리 설치(v0.3 호환)
* 1-1-4. OpenAI 인증키 등록

## 1-2. LLM 체인(LLMChain) 만들기

* 1-2-1. 기본 LLM 체인(Prompt + LLM)
* 1-2-2. 멀티 체인(Multi-Chain)
* 1-2-3. 체인을 실행하는 방법
* 1-2-4. 메시지(Messages)
* 1-2-5. 스트리밍(Streaming)

## 1-3. 프롬프트(Prompt)

* 1-3-1. 프롬프트 작성 원칙
* 1-3-2. 프롬프트 템플릿(PromptTemplate)
* 1-3-3. 챗 프롬프트 템플릿(ChatPromptTemplate)
* 1-3-4. Few-shot Prompt
* 1-3-5. Partial Prompt

## 1-4. LangChain의 언어 모델(Model)

### 1-4-1. LangChain 모델 유형

* 1-4-1-1. LLM
* 1-4-1-2. Chat Model
* 1-4-1-3. 통합 모델 초기화(init_chat_model)

### 1-4-2. LangChain의 LLM 모델 파라미터 설정

* 1-4-2-1. LLM 모델에 직접 파라미터 전달
* 1-4-2-2. LLM 모델 파라미터를 추가로 바인딩(bind 메소드)

### 1-4-3. 다른 공급업체의 모델 살펴보기

* 1-4-3-1. Claude(Anthropic)
* 1-4-3-2. Gemini(Google)

## 1-5. 출력 파서(Output Parser)

* 1-5-1. CSV Parser
* 1-5-2. JSON Parser

## 1-6. 메모리와 대화 관리

* 1-6-1. 메모리의 필요성과 개념
* 1-6-2. RunnableWithMessageHistory
* 1-6-3. 다양한 메모리 저장 방식
* 1-6-4. 단기 메모리 패턴
* 1-6-5. 장기 메모리

([위키독스][1])

---

# Part 2. RAG 기법

## 2-1. RAG 개요

## 2-2. RAG－Document Loader

* 2-2-1. 웹 문서(WebBaseLoader)
* 2-2-2. 텍스트 문서(TextLoader)
* 2-2-3. 디렉토리 폴더(DirectoryLoader)
* 2-2-4. CSV 문서(CSVLoader)

### 2-2-5. PDF 문서

* 2-2-5-1. PDF 문서를 페이지별로 로드(PyPDFLoader)
* 2-2-5-2. 형식이 없는 PDF 문서 로드(UnstructuredPDFLoader)
* 2-2-5-3. PDF 문서의 메타데이터를 상세하게 추출(PyMuPDFLoader)
* 2-2-5-4. 온라인 PDF 문서 로드(OnlinePDFLoader)
* 2-2-5-5. 특정 폴더의 모든 PDF 문서 로드(PyPDFDirectoryLoader)

## 2-3. RAG－Text Splitter

* 2-3-1. CharacterTextSplitter
* 2-3-2. RecursiveCharacterTextSplitter
* 2-3-3. 토큰 수를 기준으로 텍스트 분할(Tokenizer 활용)

## 2-4. RAG－Embedding

* 2-4-1. OpenAIEmbeddings
* 2-4-2. HuggingFaceEmbeddings
* 2-4-3. GoogleGenerativeAIEmbeddings

## 2-5. RAG－Vector Store

### 2-5-1. Chroma

* 2-5-1-1. 유사도 기반 검색(Similarity Search)
* 2-5-1-2. MMR(Maximum Marginal Relevance Search)
* 2-5-1-3. 벡터스토어에 메타데이터 추가

### 2-5-2. FAISS

* 2-5-2-1. 유사도 기반 검색(Similarity Search)
* 2-5-2-2. MMR(Maximum Marginal Relevance Search)
* 2-5-2-3. FAISS DB를 로컬에 저장하기

### 2-5-3. Pinecone

* 2-5-3-1. 유사도 기반 검색(Similarity Search)
* 2-5-3-2. 메타데이터 필터링

## 2-6. RAG－Retriever

* 2-6-1. Vector Store Retriever
* 2-6-2. Contextual Compression
* 2-6-3. Ensemble Retriever
* 2-6-4. RAG-Fusion
* 2-6-5. Reranker(Cross-Encoder)

## 2-7. RAG 최적화

* 2-7-1. 생성 최적화(Generator Enhancement)
* 2-7-2. 인덱싱 최적화(Indexing Enhancement)
* 2-7-3. 쿼리 최적화(Query Enhancement)

([위키독스][1])

---

# Part 3. Agents & Tools

* 3-1. Agent 개요
* 3-2. 내장 도구
* 3-3. 커스텀 도구
* 3-4. ToolRuntime & 컨텍스트

([위키독스][1])

---

# Part 4. 미들웨어 & 가드레일

* 4-1. 미들웨어(Middleware) 개요

## 4-2. 내장 미들웨어

* 4-2-1. 컨텍스트 관리 미들웨어
* 4-2-2. 호출 제한 미들웨어
* 4-2-3. 복원력 미들웨어
* 4-2-4. 도구 최적화 미들웨어

## 기타 항목

* 4-3. 커스텀 미들웨어
* 4-4. 가드레일 개요
* 4-5. PII 탐지
* 4-6. Human-in-the-Loop

([위키독스][1])

---

# Part 5. 멀티 에이전트 시스템

* 5-1. 멀티 에이전트 개요
* 5-2. Subagents 패턴
* 5-3. Handoffs 패턴
* 5-4. Skills 패턴
* 5-5. Router 패턴

([위키독스][1])

---

# Part 6

현재 사이트 목차에 **Part 6은 등록되어 있지 않습니다.**

---

# Part 7

현재 사이트 목차에 **Part 7은 등록되어 있지 않습니다.**

---

# Part 8. 오픈소스 LLM 활용

## 8-1. 올라마

* 8-1-1. 설치
* 8-1-2. 모델 다운로드
* 8-1-3. LangChain 적용

## 8-2. Groq API

* 8-2-1. 인증키 발급
* 8-2-2. LangChain 적용

([위키독스][1])

[1]: https://wikidocs.net/book/14473 "
            
    랭체인(LangChain) 입문부터 응용까지 [ver 1.0+] - WikiDocs

        "
