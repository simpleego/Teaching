# CI(지속적인 통합)


>  비전공자에게 CI를 가르칠 때는 **설명 30% + 직접 실패시켜 보는 실습 70%** 정도가 좋습니다. 핵심은 CI의 모든 기능을 배우는 것이 아니라,
> **“내 컴퓨터에서 잘 되던 코드라도 팀 저장소에 합치기 전에 자동으로 다시 검사해야 한다.”** 라는 필요성을 학생이 직접 경험하게 만드는 것입니다.
> GitHub Actions는 저장소에서 빌드·테스트·배포 같은 작업을 자동화할 수 있는 CI/CD 플랫폼이며, GitHub 공식 문서에서도 Python 프로젝트의 CI workflow를 만들어 자동으로 build/test하는 방법을 제공하고 있습니다. ([GitHub Docs][1])

---

# 1. 먼저 CI를 비전공자에게 어떻게 설명할 것인가

학생들에게는 **공동 문서 작성**으로 비유하면 쉽습니다.

세 명이 하나의 프로그램을 개발한다고 해보겠습니다.

```text
학생 A : 로그인 기능
학생 B : 상품 관리
학생 C : 결제 기능
```

각자의 컴퓨터에서는 모두 실행됩니다.

그런데 코드를 합쳤더니:

```text
A 코드 + B 코드 + C 코드
          ↓
      프로그램 오류
```

가 발생할 수 있습니다.

그래서 코드를 합칠 때마다 사람이 일일이 확인하지 않고 컴퓨터가 자동으로 확인합니다.

```text
학생 코드 작성
      ↓
GitHub에 Push
      ↓
자동 테스트 실행
      ↓
┌───────────────┐
│ 테스트 성공? │
└──────┬────────┘
       │
   ┌───┴───┐
   ↓       ↓
 PASS     FAIL
   ↓       ↓
합쳐도 됨  수정 필요
```

이것이 CI라고 설명하면 됩니다.

---

# 2. Continuous Integration을 단어 그대로 풀어보면

### Continuous

```text
Continuous
=
계속 / 지속적으로
```

한 달에 한 번 검사하는 것이 아니라,

```text
코드 변경
→ 검사

코드 변경
→ 검사

코드 변경
→ 검사
```

처럼 지속적으로 검사합니다.

### Integration

```text
Integration
=
여러 개발자의 코드를 하나로 합치는 것
```

따라서:

> **CI = 여러 개발자가 작성한 코드를 지속적으로 합치고, 문제가 없는지 자동으로 확인하는 개발 방식**

이라고 이해시키면 충분합니다.

GitHub Actions에서는 `push` 같은 저장소 이벤트를 workflow의 실행 조건으로 지정할 수 있으며, workflow는 `.github/workflows` 아래의 YAML 파일로 정의합니다. ([GitHub Docs][2])

---

# 3. CI의 핵심은 사실 "자동 테스트"입니다

비전공자에게 처음부터 복잡하게:

```text
Build
Lint
Static Analysis
Test
Artifact
Dependency Scan
Coverage
...
```

를 가르칠 필요는 없습니다.

처음에는 딱 이것만 경험시키는 것이 좋습니다.

```text
Git Push

   ↓

자동으로 pytest

   ↓

PASS / FAIL
```

이 한 번의 경험이 CI의 본질을 이해하는 데 가장 효과적입니다.

---

# 4. 가장 추천하는 첫 번째 CI 실습

다음처럼 아주 간단한 **계산기 프로젝트**를 사용하면 됩니다.

프로젝트 구조:

```text
ci-practice/

├── calculator.py
├── test_calculator.py
├── requirements.txt
│
└── .github/
    └── workflows/
        └── ci.yml
```

학생들이 여기에서 네 가지 파일의 역할만 이해하면 됩니다.

---

# 5. ① 프로그램 작성

`calculator.py`

```python
def add(a, b):
    return a + b


def subtract(a, b):
    return a - b


def multiply(a, b):
    return a * b


def divide(a, b):
    if b == 0:
        raise ValueError("0으로 나눌 수 없습니다.")

    return a / b
```

학생들에게 먼저 실행시킵니다.

```python
from calculator import add

print(add(10, 20))
```

결과:

```text
30
```

여기까지는 일반적인 Python 교육입니다.

---

# 6. ② 테스트 코드를 작성합니다

`test_calculator.py`

```python
import pytest

from calculator import add, subtract, multiply, divide


def test_add():
    assert add(2, 3) == 5


def test_subtract():
    assert subtract(5, 3) == 2


def test_multiply():
    assert multiply(4, 3) == 12


def test_divide():
    assert divide(10, 2) == 5


def test_divide_zero():
    with pytest.raises(ValueError):
        divide(10, 0)
```

여기서 `assert`를 학생들에게 이렇게 설명합니다.

> **“내가 예상한 값과 프로그램 결과가 같은지 확인하는 검사문”**

예:

```python
assert add(2, 3) == 5
```

의 의미는:

```text
2 + 3을 프로그램에게 시킨다.

        ↓

결과가 5인가?

        ↓

맞으면 PASS

틀리면 FAIL
```

입니다.

pytest는 `assert`를 기반으로 테스트를 작성할 수 있고 `test_*.py` 같은 이름을 가진 테스트 파일을 자동으로 찾아 실행할 수 있습니다. ([pytest 문서][3])

---

# 7. ③ pytest 설치

`requirements.txt`

```text
pytest
```

그리고 터미널에서:

```bash
pip install -r requirements.txt
```

또는:

```bash
pip install pytest
```

를 실행합니다.

현재 pytest 공식 문서도 기본 설치 방법으로 `pip install -U pytest`를 안내하고 있습니다. ([pytest 문서][3])

---

# 8. ④ 먼저 로컬에서 테스트합니다

```bash
pytest
```

또는 좀 더 간단하게:

```bash
pytest -q
```

정상이라면 대략:

```text
.....

5 passed
```

가 나옵니다.

학생들에게 여기에서 질문합니다.

> "그럼 우리가 매번 GitHub에 코드를 올릴 때마다 사람이 pytest를 실행해야 할까요?"

당연히 귀찮습니다.

그래서 **CI가 등장합니다.**

---

# 9. GitHub Actions를 연결합니다

이제 프로젝트에 다음 디렉터리를 만듭니다.

```text
.github
   └── workflows
          └── ci.yml
```

GitHub Actions workflow는 `.github/workflows` 디렉터리 안의 YAML 파일로 정의합니다. ([GitHub Docs][2])

`ci.yml`:

```yaml
name: Python CI

on:
  push:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: 코드 가져오기
        uses: actions/checkout@v6

      - name: Python 설치
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: 라이브러리 설치
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      - name: 테스트 실행
        run: pytest -q
```

현재 GitHub 공식 Python CI 예제에서는 `actions/checkout@v6`와 `actions/setup-python@v5`를 사용하는 구성을 안내하고 있습니다. ([GitHub Docs][4])

---

# 10. YAML을 비전공자에게 어떻게 설명할 것인가

YAML 문법을 먼저 강의하지 않는 것이 좋습니다.

다음 네 부분만 설명합니다.

### ① 언제 실행할 것인가

```yaml
on:
  push:
  pull_request:
```

의 의미:

```text
GitHub에 코드를 Push하거나

Pull Request를 만들면

CI를 실행하라.
```

---

### ② 어디에서 실행할 것인가

```yaml
runs-on: ubuntu-latest
```

쉽게 말하면:

> "GitHub가 임시 Linux 컴퓨터 한 대를 준비해 준다."

GitHub-hosted runner에서 job이 실행되며, `ubuntu-latest`를 지정하면 GitHub가 제공하는 Ubuntu 환경에서 작업 단계들이 실행됩니다. ([GitHub Docs][2])

---

### ③ 준비

```yaml
- uses: actions/checkout@v6
```

의 의미:

```text
GitHub 저장소에 있는
우리 프로그램을 가져온다.
```

---

### ④ 검사

```yaml
- run: pytest -q
```

의 의미:

```text
테스트 실행

       ↓

성공?

PASS / FAIL
```

입니다.

---

# 11. 이제 가장 중요한 실습을 합니다

처음에는 CI를 성공시킵니다.

```text
Git Push

     ↓

GitHub Actions

     ↓

pytest

     ↓

5 passed

     ↓

✅ Success
```

학생들은 GitHub 저장소의 **Actions** 탭에서 workflow 실행 내역과 각 step의 실행 결과를 볼 수 있습니다. GitHub는 workflow가 실행되면 각 단계의 진행상황과 로그를 확인할 수 있도록 제공합니다. ([GitHub Docs][2])

---

# 12. 그런데 일부러 프로그램을 망가뜨립니다

이 부분이 교육에서 가장 중요합니다.

`calculator.py`의:

```python
def add(a, b):
    return a + b
```

를 일부러:

```python
def add(a, b):
    return a - b
```

로 변경합니다.

그리고:

```bash
git add .
git commit -m "bug test"
git push
```

합니다.

그러면:

```text
GitHub

   ↓

CI 실행

   ↓

pytest

   ↓

test_add()

   ↓

Expected : 5

Actual : -1

   ↓

❌ FAIL
```

이 경험을 꼭 하게 해야 합니다.

---

# 13. 학생이 여기에서 CI를 이해합니다

교사가 질문합니다.

> "여러분은 테스트 버튼을 눌렀나요?"

학생:

> "아니요."

교사:

> "그런데 왜 테스트가 실행됐나요?"

학생:

> "GitHub에 Push했기 때문입니다."

그러면:

```text
Push
 ↓
Trigger
 ↓
Workflow
 ↓
Test
 ↓
Result
```

를 설명합니다.

이것이 CI의 핵심입니다.

---

# 14. 다시 코드를 수정합니다

```python
def add(a, b):
    return a + b
```

다시:

```bash
git add .
git commit -m "fix add function"
git push
```

하면:

```text
CI

↓

pytest

↓

5 passed

↓

✅ Success
```

가 됩니다.

여기에서 학생들이 **자동 검증 Feedback Loop**를 경험합니다.

---

# 15. 사실 이것이 Loop Engineering과 바로 연결됩니다

앞에서 이야기한 Loop Engineering 관점에서 보면 CI는 매우 중요한 **Verifier** 역할을 합니다.

```text
                개발 목표
                   ↓
                 코드
                   ↓
                 Push
                   ↓
            ┌────────────┐
            │     CI     │
            └──────┬─────┘
                   ↓
                pytest
                   ↓
              PASS ?
             ↙       ↘
           FAIL      PASS
             ↓         ↓
           수정       완료
             │
             └────→ Push
```

기존 개발에서는 사람이:

```text
FAIL
 ↓
원인 분석
 ↓
코드 수정
```

합니다.

Loop Engineering에서는 이 부분의 일부를 Agent가 담당하게 만들 수 있습니다.

```text
GitHub Push

      ↓

CI

      ↓

Test FAIL

      ↓

Error Log

      ↓

AI Agent

      ↓

코드 분석

      ↓

수정

      ↓

Test

      ↓

PASS

      ↓

STOP
```

그래서 학생들에게 **CI를 단순한 DevOps 도구가 아니라 “AI가 자기 작업을 검증하는 자동 검사 장치”**라고 연결해주면 Loop Engineering 교육과 매우 잘 맞습니다.

---

# 16. 두 번째 단계에서는 Pull Request까지 확장합니다

첫 수업에서는:

```text
Push → CI
```

까지만 합니다.

다음 단계에서는:

```text
개발자 A

feature-login
      ↓
Pull Request
      ↓
CI
      ↓
Test
      ↓
PASS
      ↓
main Merge
```

구조를 경험하게 합니다.

학생에게:

```bash
git checkout -b feature-calculator
```

기능을 수정하게 하고:

```bash
git add .
git commit -m "add calculator feature"
git push origin feature-calculator
```

후 GitHub에서 Pull Request를 생성합니다.

`ci.yml`에 이미:

```yaml
on:
  pull_request:
```

가 있기 때문에 PR에서도 CI가 실행됩니다.

---

# 17. 세 번째 단계에서는 CI 검사 항목을 늘립니다

초급:

```text
pytest
```

중급에서는:

```text
           CI
            │
      ┌─────┼─────┐
      ↓     ↓     ↓
    Lint   Test  Security
      │     │     │
      └─────┼─────┘
            ↓
          PASS
```

정도로 확대할 수 있습니다.

예:

```yaml
- name: 테스트
  run: pytest

- name: 코드 검사
  run: ruff check .
```

그리고 `requirements.txt`:

```text
pytest
ruff
```

정도로 하면 충분합니다.

---

# 18. 조금 더 실무적으로 만들려면

FastAPI 프로젝트로 넘어갑니다.

예:

```text
Student Management API
```

API:

```text
POST   /students
GET    /students
GET    /students/{id}
DELETE /students/{id}
```

CI:

```text
코드 Push
   ↓
Python 환경 준비
   ↓
라이브러리 설치
   ↓
Unit Test
   ↓
API Test
   ↓
PASS
```

이렇게 되면 학생들은 CI가 실제 개발 프로젝트에서 왜 필요한지 훨씬 명확히 이해합니다.

---

# 19. CI와 CD는 이 시점에서 구분해 주면 됩니다

학생들이 가장 많이 혼동하는 부분입니다.

### CI

```text
Code
 ↓
Build
 ↓
Test
 ↓
검증
```

### CD

```text
검증 완료
 ↓
Docker
 ↓
Server
 ↓
Deploy
```

즉 아주 단순화하면:

> **CI = 제대로 만들었는지 자동으로 검사**

> **CD = 검사한 프로그램을 실제 서버에 자동으로 배포**

라고 설명하면 됩니다.

GitHub Actions는 공식적으로 CI와 CD 양쪽의 workflow 자동화를 지원합니다. ([GitHub Docs][1])

---

# 20. 비전공자 CI 교육에서 Jenkins부터 시작하지 않는 이유

CI 도구에는 여러 가지가 있습니다.

| 도구              | 입문 추천 |
| --------------- | ----: |
| GitHub Actions  | ★★★★★ |
| GitLab CI/CD    | ★★★★☆ |
| Jenkins         | ★★★☆☆ |
| CircleCI        | ★★★☆☆ |
| Azure Pipelines | ★★★☆☆ |

비전공자 첫 교육에서는 **GitHub Actions가 가장 자연스럽습니다.**

이미:

```text
Git
+
GitHub
+
Python
```

을 배우는 과정에서 별도의 CI 서버 구축 없이 같은 GitHub 저장소 안에서 workflow를 만들고 실행 결과를 볼 수 있기 때문입니다. GitHub 공식 문서에서도 저장소의 Actions 탭에서 workflow template을 추가하거나 `.github/workflows`에 직접 workflow를 추가하는 방식을 지원합니다. ([GitHub Docs][4])

Jenkins는 나중에:

```text
"회사가 자체 CI 서버를 운영한다면?"
```

이라는 주제로 소개하는 것이 좋습니다.

---

# 21. 제가 4시간 수업으로 구성한다면

|       시간 | 교육 내용                         | 형태    |
| -------: | ----------------------------- | ----- |
|    0~30분 | CI 필요성·개념                     | 이론    |
|   30~60분 | Git/Push/PR 복습                | 실습    |
|   60~90분 | pytest                        | 실습    |
|  90~120분 | 의도적 테스트 실패                    | 실습    |
| 120~150분 | GitHub Actions 구조             | 이론+실습 |
| 150~180분 | Push → 자동 테스트                 | 실습    |
| 180~210분 | 실패 → 수정 → PASS                | 실습    |
| 210~240분 | PR + CI + Loop Engineering 연결 | 종합 실습 |

**이론 25~30%, 실습 70~75% 정도**입니다.

---

# 22. 학생에게 반드시 경험시켜야 할 세 번의 순간

CI를 강의했다는 것보다 다음을 직접 경험했느냐가 중요합니다.

### 첫 번째

```text
pytest

✅ PASS
```

"테스트란 이런 것이구나."

### 두 번째

```text
git push

       ↓

GitHub Actions

       ↓

✅ PASS
```

"내가 테스트를 실행하지 않았는데 자동으로 검사했네."

### 세 번째

```text
Bug Push

   ↓

GitHub Actions

   ↓

❌ FAIL

   ↓

코드 수정

   ↓

Push

   ↓

✅ PASS
```

이 순간 학생이 **CI를 실제로 이해합니다.**

---

# 23. Loop Engineering 과정에서는 CI를 이렇게 위치시키는 것이 좋습니다

제가 앞서 제안한 전체 과정에 CI를 넣는다면:

```text
Python
  ↓
Git / GitHub
  ↓
Unit Test
  ↓
CI
  ↓
FastAPI / DB
  ↓
Agent
  ↓
Loop Engineering
```

이 순서를 추천합니다.

왜냐하면 Loop Engineering을 배우기 전에 학생이 먼저:

```text
"자동으로 검증한다"
```

라는 개념을 이해해야 하기 때문입니다.

그리고 나서:

```text
        일반 CI

Code
 ↓
Test
 ↓
PASS / FAIL


         ↓ 발전


     Loop Engineering

Goal
 ↓
AI Code
 ↓
CI / Test
 ↓
FAIL
 ↓
AI Fix
 ↓
CI / Test
 ↓
PASS
 ↓
STOP
```

로 연결하면 됩니다.

**이 연결이 매우 중요합니다.** 비전공자에게 CI를 별도의 DevOps 과목으로만 가르치기보다는, **Loop Engineering에서 `Verification → Feedback → Retry → Stop`을 구현하기 위한 핵심 인프라**로 가르치면 학생들이 왜 CI를 배워야 하는지 훨씬 쉽게 이해할 수 있습니다.

[1]: https://docs.github.com/articles/getting-started-with-github-actions?utm_source=chatgpt.com "Understanding GitHub Actions"
[2]: https://docs.github.com/en/actions/tutorials/create-an-example-workflow "Creating an example workflow - GitHub Docs"
[3]: https://docs.pytest.org/en/stable/getting-started.html "Get Started - pytest documentation"
[4]: https://docs.github.com/actions/guides/building-and-testing-python "Building and testing Python - GitHub Docs"
