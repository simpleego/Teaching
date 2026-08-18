좋아 jong, **Bark를 바로 체험해볼 수 있는 가장 간단한 미니 프로젝트**를 만들어줄게.  
아예 **가상환경 생성 → 필요한 모듈 설치 → 샘플 코드 작성 → 실행 방법**까지 한 번에 끝내는 형태로 구성했어.  
이대로 따라 하면 10분 안에 Bark 오디오를 생성할 수 있어.

---

# 🎯 Bark 미니 프로젝트  
**목표:**  
텍스트를 입력하면 Bark가 음성을 생성하고 `output.wav` 파일로 저장하는 간단한 프로젝트

---

## 🧱 1. 프로젝트 구조
```
bark-mini/
 ├── main.py
 └── requirements.txt
```

---

## 🐍 2. 가상환경 생성

### Windows (PowerShell)
```powershell
python -m venv venv
.\venv\Scripts\activate
```

### macOS / Linux
```bash
python3 -m venv venv
source venv/bin/activate
```

---

## 📦 3. 필요한 파이썬 모듈

`requirements.txt` 파일을 만들고 아래 내용을 넣어줘:

```
torch
numpy
scipy
bark
```

> ⚠️ **torch는 GPU가 있으면 자동으로 CUDA 버전을 설치**하고, 없으면 CPU 버전이 설치됨.

설치:
```bash
pip install -r requirements.txt
```

---

## 🎙️ 4. Bark 테스트 코드 (`main.py`)

```python
from bark import SAMPLE_RATE, generate_audio, preload_models
from scipy.io.wavfile import write

# Bark 모델 로드
preload_models()

# 생성할 텍스트
text_prompt = """
안녕하세요 jong님! 저는 Bark 모델이에요.
이렇게 텍스트만으로 음성을 만들 수 있어요. [laughs]
"""

# 오디오 생성
audio_array = generate_audio(text_prompt)

# 파일로 저장
output_path = "output.wav"
write(output_path, SAMPLE_RATE, audio_array)

print(f"생성 완료! 파일이 저장되었습니다: {output_path}")
```

---

## ▶️ 5. 실행

가상환경이 활성화된 상태에서:

```bash
python main.py
```

실행 후 프로젝트 폴더에 **output.wav** 파일이 생성됨.  
열어보면 Bark가 텍스트를 읽고 `[laughs]`까지 포함해서 자연스럽게 말해줄 거야.

---

# 🚀 6. BarkF(빠른 Bark)로 확장하고 싶다면?
BarkF는 Bark의 **경량·고속 버전**으로,  
위 프로젝트 구조 그대로 두고 모듈만 바꾸면 돼.

예시:

```bash
pip install bark-faster
```

그리고 코드에서:

```python
from bark_faster import generate_audio, preload_models
```

이렇게만 바꾸면 끝.

---

# 🔧 7. 옵션 확장 (선택)
원하면 다음 기능도 추가해줄 수 있어:
- 화자 프리셋 적용  
- 비언어적 소리 더 다양하게 사용  
- 긴 문장 자동 분할  
- 웹 UI(Gradio)로 Bark 체험 페이지 만들기  
- BarkF + GPU 최적화  

---

jong, 다음 단계로 **웹 UI 버전**을 만들어보고 싶어?  
아니면 BarkF로 **더 빠른 생성**을 해보고 싶어?
