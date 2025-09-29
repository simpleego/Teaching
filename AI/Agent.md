# AI Agent 개발의 핵심: RAG와 LangChain, LangGraph 비교 분석

요즘 화두가 되고 있는 AI Agent 개발에 핵심적인 RAG 개념과 LangChain, LangGraph 프레임워크에 대해서 소개하고자 합니다.

참고사이트 : https://blog.kyobodts.co.kr/2025/02/28/ai-agent-%EA%B0%9C%EB%B0%9C%EC%9D%98-%ED%95%B5%EC%8B%AC-rag%EC%99%80-langchain-langgraph-%EB%B9%84%EA%B5%90-%EB%B6%84%EC%84%9D/

## RAG (Retrieval-Augmented Generation)

AI Agent가 보다 정교한 이해와 논리적 추론을 수행하려면, 방대한 데이터 속에서 필요한 정보를 효과적으로 검색하고 활용하는 능력이 필수적입니다. 기존의 대형 언어 모델(LLM)은 사전 학습된 지식만을 기반으로 답변을 생성하기 때문에 최신 정보나 특정 도메인의 전문 지식을 반영하는 데 한계가 있습니다. 이를 해결하기 위해 RAG(Retrieval-Augmented Generation) 개념이 도입되었습니다. 외부 데이터베이스에서 필요한 정보를 검색한 후 이를 기반으로 답변을 생성함으로써 더 정확하고 신뢰할 수 있는 응답을 제공합니다. 또한, AI 모델이 스스로 학습한 정보만을 활용할 때 발생하는 환각(hallucination) 문제를 줄이고, 신뢰할 수 있는 출처에서 근거 기반의 답변을 생성할 수 있도록 돕습니다.

AI Agent는 단순한 질의응답을 넘어 연속적인 작업 수행과 의사결정을 해야 하는 경우가 많기 때문에, 동적으로 필요한 정보를 검색하고 이를 조합하여 실행 계획을 수립할 수 있는 능력이 필요합니다. 이를 위해 모듈러 RAG 개념이 등장했고, 검색, 필터링 메모리 관리, 응답 생성 등의 기능을 더욱 정교하게 조합할 수 있도록 LangChain과 LangGraph 같은 프레임워크가 개발되었습니다. 이 기술을 활용하면 AI Agent는 단순한 LLM 기반 챗봇을 넘어 복잡한 문제를 해결하는 지능형 시스템으로 발전할 수 있습니다.

<img width="1024" height="517" alt="image" src="https://github.com/user-attachments/assets/fa708629-09f0-4c91-b174-bcb92e4a3218" />


Naive RAG, Advanced RAG, Modular RAG 비교 (출처: Modular RAG: Transforming RAG System into LEGO-like Reconfigurable Frameworks)
## LangChain VS LangGraph

LangChain과 LangGraph 같은 프레임워는 복잡한 RAG 시스템을 레고 블록처럼 조립할 수 있도록 합니다. LangChain과 LangGraph 는 RAG를 구축하는 핵심적인 역할을 한다는 공통점이 있는 반면, 구성 요소 간 연결 방식과 제어하는 방법에는 차이가 있습니다. LangChain과 LangGraph 의 기본 개념을 살펴보고 최근 LangGraph 가 더욱 주목받고 있는 이유를 분석해 보겠습니다.

## LangChain

LangChain 은 대형 언어 모델(LLM)을 다양한 데이터 소스 및 외부 도구와 손쉽게 연결하여 활용할 수 있도록 돕는 프레임워크입니다. 단순한 프롬프트 입력과 응답 생성만을 수행하는 것이 아니라, 데이터 검색, 메모리 관리, API 연동, 체계적인 워크플로우 구성 등을 가능하게 하여 LLM 기반 애플리케이션을 효율적이고 확장 가능하게 개발할 수 있도록 합니다. 예를들어, RAG 시스템을 구축할 때, LangChain을 활용하면 검색 엔진, 데이터베이스, API 등의 정보 소스를 조합하여 LLM의 응답 품질을 향상시킬 수 있습니다. 이러한 기능 덕분에 챗봇, 자동화 도구, 검색 강화 시스템, AI 기반 업무 지원 솔루션 등 다양한 분야에서 활용되고 있습니다.

LangChain 의 핵심 개념은 모듈화(Modularity)와 조합성(Composability)입니다. 즉, 다양한 기능을 개별적인 구성 요소로 분리하고, 필요에 따라 이를 유기적으로 연결하여 맞춤형 AI 애플리케이션을 만들 수 있습니다. LangChain은 “체인(Chain)”과 “에이전트(Agent)” 라는 두 가지 주요 개념을 제공합니다. 체인은 일련의 프롬프트 흐름을 정의하고 실행하는 구조이며, 에이전트는 여러 도구를 활용하여 동적인 의사결정을 수행할 수 있도록 설계된 시스템입니다. 이를 통해 단순한 단일 질의응답 시스템을 넘어 복잡한 작업을 수행할 수 있는 AI 애플리케이션을 쉽게 구축할 수 있습니다.  

<img width="677" height="460" alt="image" src="https://github.com/user-attachments/assets/fe8136cd-ac78-4ba8-8307-c32420cac713" />


LangChain 프레임워크 구조 (출처: https://cobusgreyling.medium.com)
## LangGraph

LangGraph는 LangChain의 발전된 형태로, 더 복잡하고 동적인 작업을 처리하기 위해 다양한 AI 도구와 데이터를 시각적으로 연결하고 관리할 수 있는 프레임워크입니다. LangGraph의 핵심은 그래프 기반의 연결 방식으로, 각 요소(모듈)를 노드로, 이들 간의 관계를 엣지로 표현하여, 복잡한 AI 시스템의 작업 흐름을 시각적으로 설계하고 조정할 수 있게 합니다. 이를 통해 다양한 도구를 결합하고 데이터 흐름을 명확하게 시각화하여, AI 시스템의 각 단계를 보다 효율적으로 조정하고 최적화할 수 있습니다.

특히 복잡한 다단계 작업, 대규모 데이터 처리, 동적인 의사결정 과정을 효율적으로 관리하는 데 강점을 지닌 프레임워크입니다. LangGraph는 그리드 형식의 시각적 인터페이스를 제공하여, 사용자가 각 모듈의 흐름을 직관적으로 연결하고 조정할 수 있게 합니다. 예를 들어, 데이터 검색, 분석, 결과 생성 등의 여러 단계를 하나의 그래프 구조로 묶어 시각화함으로써, 데이터가 어떻게 흐르고 각 단계에서 어떤 작업이 이루어지는지를 쉽게 추적할 수 있습니다.

<img width="630" height="480" alt="image" src="https://github.com/user-attachments/assets/68b53b27-4efa-44f0-a24d-4819eee7a686" />

출처: LangGraph
## LangChain VS LangGraph

구조와 워크플로우

LangChain 은 모듈화된 체인 구조를 통해 다양한 구성 요소를 순차적으로 연결하여 애플리케이션을 구성합니다. 주로 순차적인 작업 흐름을 처리하며, 각 단계에서의 입력과 출력을 명확하게 정의하여 작업을 진행합니다.

LangGraph 는 그래프 기반의 구조를 통해 노드와 엣지로 구성된 복잡한 워크플로우를 설계합니다. 각 노드는 특정 작업을 수행하며, 엣지는 작업 간의 관계를 정의합니다. 병렬 처리와 조건부 로직을 통해 복잡한 작업 흐름을 관리할 수 있고, 다중 에이전트 협업을 지원하여 다양한 작업을 동시에 처리할 수 있습니다.

<img width="1000" height="713" alt="image" src="https://github.com/user-attachments/assets/cf10a21c-fb7e-454a-aa0a-78e98cf5a122" />

Simple multi agent 다이어그램 (출처: https://blog.langchain.dev/langgraph-multi-agent-workflows/)
## 확장성 및 유연성

LangChain은 다양한 외부 도구와의 통합이 용이하고 간단한 체인 구조로 빠른 프로토타이핑이 가능합니다. 하지만 복잡한 작업 흐름이나 다중 에이전트 구현에는 제한이 있습니다. 또한, 복잡한 워크플로우나 대규모 시스템 구축에는 추가적인 개발이 필요할 수 있습니다.

LangGraph는 복잡한 작업 흐름과 조건부 로직을 유연하게 처리할수 있고 다중 에이전트 구현으로 다양한 작업을 동시에 처리하여 확장성이 높습니다. 하지만 구조의 복잡성으로 인해 학습에 오랜 시간이 걸릴 수 있습니다.

## 상태관리

LangChain은 각 체인 내에서 독립적인 상태 관리를 수행하며, 복잡한 상태 관리에는 외부 시스템과의 통합이 필요할 수 있습니다.

LangGraph는 그래프의 각 노드가 상태를 유지하며, 노드 간의 상태 전달과 업데이트를 통해 복잡한 상태 관리를 처리합니다.

<img width="1024" height="486" alt="image" src="https://github.com/user-attachments/assets/2019a6d5-a92f-403c-9f1c-2dac25c6642f" />

Node, Edge로 Multi agent 를 관리하는 Langgraph (출처: https://medium.com/@ashpaklmulani)
앞서 살펴본 바와 같이 빠른 프로토타이핑이 필요할 때, 간단한 LLM 기반 애플리케이션 개발을 할 때, 다양한 외부 도구와의 통합이 필요할 때는 LangChain을 선택해서 개발하는 것이 좋습니다.
반면, 복잡한 작업 흐름과 조건부 로직 처리가 필요하고 다중 에이전트 협업이 요구될 때, 정교한 의사결정 프로세스 구현이 필요할 때는 LangGraph 를 선택하여 개발하는 것이 좋습니다.

LangChain과 LangGraph 는 각각의 특성과 장단점이 있으며 프로젝트의 요구 사항과 복잡성에 따라 적절한 프레임워크를 선택하는 것이 중요합니다.

## References
- Modular RAG: Transforming RAG Systems into LEGO-like Reconfigurable Frameworks (https://arxiv.org/pdf/2407.21059)
- LahgChain framework architecture (https://python.langchain.com/docs/concepts/architecture/)
- https://medium.com/@ashpaklmulani/multi-agent-with-langgraph-23c26e9bf076
- https://brunch.co.kr/@harryban0917/339
