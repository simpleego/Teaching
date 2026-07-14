A.X 4.0을 **가장 간단하게 사용하는 방법은 API 호출**입니다. 모델을 직접 내려받지 않기 때문에 GPU가 필요하지 않습니다.

직접 실행하려면 72B 모델 대신 **`skt/A.X-4.0-Light` 7B 모델**을 권장합니다. Light 모델은 Apache 2.0 라이선스이며 최대 16,384 토큰 문맥을 지원합니다. 공식 모델 카드는 `transformers>=4.46.0`을 요구합니다. ([Hugging Face][1])

---

## 1. 가장 간단한 방법: A.X 4.0 API

공식 저장소에서 OpenAI 호환 방식의 API와 공개 테스트 키를 제공하고 있습니다. ([GitHub][2])

### 설치

```python
!pip install -q -U openai
```

### 기본 질문

```python
from openai import OpenAI

# SKT A.X 4.0 공식 공개 테스트 API
client = OpenAI(
    base_url="https://guest-api.sktax.chat/v1",
    api_key="sktax-XyeKFrq67ZjS4EpsDlrHHXV8it"
)

response = client.chat.completions.create(
    model="ax4",
    messages=[
        {
            "role": "system",
            "content": "당신은 비전공자에게 AI 기술을 쉽게 설명하는 한국어 강사입니다."
        },
        {
            "role": "user",
            "content": "RAG가 무엇인지 초보자가 이해할 수 있도록 설명해 주세요."
        }
    ],
    temperature=0.7,
    max_tokens=500
)

print(response.choices[0].message.content)
```

API 주소와 `model="ax4"` 설정은 SKT 공식 저장소의 예제와 동일합니다. 현재 공개 테스트 키가 제공되고 있지만, 운영 정책에 따라 키나 사용 조건은 변경될 수 있습니다. ([GitHub][3])

---

## 2. 대화 기록을 유지하는 챗봇

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://guest-api.sktax.chat/v1",
    api_key="sktax-XyeKFrq67ZjS4EpsDlrHHXV8it"
)

messages = [
    {
        "role": "system",
        "content": (
            "당신은 친절한 한국어 AI 교육 강사입니다. "
            "어려운 기술 용어는 비전공자도 이해할 수 있도록 예시와 함께 설명하세요."
        )
    }
]

while True:
    user_input = input("\n사용자: ").strip()

    if user_input.lower() in ["종료", "exit", "quit"]:
        print("대화를 종료합니다.")
        break

    if not user_input:
        continue

    messages.append({
        "role": "user",
        "content": user_input
    })

    try:
        response = client.chat.completions.create(
            model="ax4",
            messages=messages,
            temperature=0.7,
            max_tokens=700
        )

        answer = response.choices[0].message.content

        messages.append({
            "role": "assistant",
            "content": answer
        })

        print(f"\nA.X 4.0: {answer}")

    except Exception as e:
        print(f"\nAPI 호출 오류: {e}")
```

---

# 3. Colab에서 모델 직접 실행하기

Colab에서 직접 실행할 때는 72B 표준 모델이 아니라 다음 경량 모델을 사용합니다.

```python
MODEL_NAME = "skt/A.X-4.0-Light"
```

A.X 4.0 Light는 약 70억 개 파라미터를 가진 BF16 모델입니다. 원본 정밀도로 적재하면 모델 가중치만 약 14GB 수준이므로 T4 환경에서는 메모리 부족 가능성이 높습니다. 따라서 아래처럼 **4비트 양자화**를 적용하는 것이 현실적입니다. 모델의 공식 기본 사용 예제는 `AutoModelForCausalLM`, `AutoTokenizer`, `apply_chat_template()` 구조를 사용합니다. ([Hugging Face][1])

## 3-1. Colab GPU 설정

Colab 메뉴에서 다음을 선택합니다.

```text
런타임 → 런타임 유형 변경 → T4 GPU
```

## 3-2. 패키지 설치

```python
!pip install -q -U \
    "transformers>=4.46.0" \
    accelerate \
    bitsandbytes \
    sentencepiece
```

설치 후 버전 충돌이 발생한다면 런타임을 한 번 다시 시작합니다.

---

## 3-3. 4비트 모델 로드

```python
import torch

from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    BitsAndBytesConfig
)

MODEL_NAME = "skt/A.X-4.0-Light"

if not torch.cuda.is_available():
    raise RuntimeError(
        "GPU가 감지되지 않았습니다. "
        "Colab에서 런타임 유형을 T4 GPU로 변경해 주세요."
    )

print("GPU:", torch.cuda.get_device_name(0))

# T4 GPU에 적합한 4비트 양자화 설정
quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True,
    bnb_4bit_compute_dtype=torch.float16
)

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME
)

model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    quantization_config=quantization_config,
    device_map="auto",
    torch_dtype=torch.float16,
    low_cpu_mem_usage=True
)

model.eval()

print("A.X 4.0 Light 모델 로드 완료")
```

---

## 3-4. 질문 함수

```python
def ask_ax(
    question: str,
    system_prompt: str = "당신은 친절하고 정확하게 답변하는 한국어 AI 도우미입니다.",
    max_new_tokens: int = 512
) -> str:
    messages = [
        {
            "role": "system",
            "content": system_prompt
        },
        {
            "role": "user",
            "content": question
        }
    ]

    inputs = tokenizer.apply_chat_template(
        messages,
        add_generation_prompt=True,
        tokenize=True,
        return_dict=True,
        return_tensors="pt"
    )

    # 양자화 모델이 적재된 첫 번째 장치로 입력 이동
    device = next(model.parameters()).device
    inputs = {
        key: value.to(device)
        for key, value in inputs.items()
    }

    with torch.inference_mode():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            repetition_penalty=1.05,
            pad_token_id=tokenizer.eos_token_id
        )

    prompt_length = inputs["input_ids"].shape[-1]

    generated_tokens = outputs[0][prompt_length:]

    answer = tokenizer.decode(
        generated_tokens,
        skip_special_tokens=True
    )

    return answer.strip()
```

### 실행

```python
answer = ask_ax(
    question="RAG와 파인튜닝의 차이를 비전공자가 이해할 수 있도록 설명해 주세요.",
    system_prompt=(
        "당신은 생성형 AI를 강의하는 전문 강사입니다. "
        "한국어로 설명하고, 핵심 개념과 쉬운 예시를 함께 제시하세요."
    )
)

print(answer)
```

---

# 4. 결정론적 답변이 필요한 경우

번역, 요약, 문서 정리처럼 답변의 일관성이 중요하면 샘플링을 끕니다.

```python
def ask_ax_stable(
    question: str,
    max_new_tokens: int = 512
) -> str:
    messages = [
        {
            "role": "system",
            "content": (
                "당신은 정확한 한국어 문서 작성 전문가입니다. "
                "추측하지 말고 사용자가 제공한 내용을 중심으로 답변하세요."
            )
        },
        {
            "role": "user",
            "content": question
        }
    ]

    inputs = tokenizer.apply_chat_template(
        messages,
        add_generation_prompt=True,
        tokenize=True,
        return_dict=True,
        return_tensors="pt"
    )

    device = next(model.parameters()).device
    inputs = {
        key: value.to(device)
        for key, value in inputs.items()
    }

    with torch.inference_mode():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            do_sample=False,
            repetition_penalty=1.05,
            pad_token_id=tokenizer.eos_token_id
        )

    prompt_length = inputs["input_ids"].shape[-1]

    return tokenizer.decode(
        outputs[0][prompt_length:],
        skip_special_tokens=True
    ).strip()
```

```python
print(
    ask_ax_stable(
        """
        다음 내용을 세 문장으로 요약하세요.

        검색 증강 생성은 외부 문서를 검색한 후,
        검색된 정보를 대규모 언어 모델의 입력 문맥에 추가하여
        답변의 정확성과 최신성을 높이는 기술이다.
        """
    )
)
```

---

# 5. 간단한 Gradio 챗봇

## 설치

```python
!pip install -q -U gradio
```

## 실행

```python
import gradio as gr


SYSTEM_PROMPT = """
당신은 생성형 AI와 RAG를 강의하는 한국어 AI 강사입니다.

규칙:
1. 비전공자도 이해할 수 있도록 설명합니다.
2. 어려운 용어는 쉬운 예시와 함께 설명합니다.
3. 모든 답변은 한국어로 작성합니다.
4. 핵심 내용을 먼저 설명합니다.
""".strip()


def chatbot(message, history):
    try:
        return ask_ax(
            question=message,
            system_prompt=SYSTEM_PROMPT,
            max_new_tokens=512
        )
    except Exception as e:
        return f"오류가 발생했습니다: {e}"


demo = gr.ChatInterface(
    fn=chatbot,
    title="SKT A.X 4.0 Light 챗봇",
    description="한국어 특화 A.X 4.0 Light 모델을 이용한 AI 교육 챗봇",
    examples=[
        "LLM이 무엇인지 쉽게 설명해 주세요.",
        "RAG와 파인튜닝의 차이는 무엇인가요?",
        "LangChain의 역할을 예시로 설명해 주세요."
    ]
)

demo.launch(debug=True)
```

---

## 권장 선택

| 목적               | 권장 방식             |
| ---------------- | ----------------- |
| 모델을 즉시 시험        | A.X API           |
| GPU 없이 사용        | A.X API           |
| Colab에서 모델 구조 실습 | A.X 4.0 Light 4비트 |
| 프롬프트 및 페르소나 실습   | API 또는 Light      |
| LoRA 파인튜닝        | A.X 4.0 Light     |
| 실제 서비스 배포        | API 또는 vLLM 서버    |

처음에는 **1번 API 코드로 모델의 한국어 응답을 확인**하고, 이후 **3번 4비트 로컬 모델**로 프롬프트·페르소나·LoRA 실습을 진행하는 구성이 가장 효율적입니다. 표준 A.X 4.0은 72B, Light는 7B로 제공되므로 일반적인 단일 Colab GPU에서는 Light가 적합합니다. ([GitHub][4])

[1]: https://huggingface.co/skt/A.X-4.0-Light "skt/A.X-4.0-Light · Hugging Face"
[2]: https://github.com/SKT-AI/A.X-4.0/tree/main/apis "A.X-4.0/apis at main · SKT-AI/A.X-4.0 · GitHub"
[3]: https://github.com/SKT-AI/A.X-4.0/blob/main/apis/README.md "A.X-4.0/apis/README.md at main · SKT-AI/A.X-4.0 · GitHub"
[4]: https://github.com/SKT-AI/A.X-4.0 "GitHub - SKT-AI/A.X-4.0: SKT A.X LLM 4.0 · GitHub"
