좋습니다. 아래 내용을 그대로 \*\*문서로 복사한 뒤 `인쇄 → PDF로 저장`\*\*하면 초보자용 학습 자료로 사용할 수 있도록 정리했습니다.

 # Pydantic으로 학생 점수 데이터 검증하기

 ## 1\. 전체 코드

```
class Scores(BaseModel):
    korean: int = Field(default=0, ge=0, le=100, strict=True)
    english: int = Field(default=0, ge=0, le=100, strict=True)
    math: int = Field(default=0, ge=0, le=100, strict=True)

    @field_validator('korean', 'english', 'math', mode='before')
    @classmethod
    def empty_to_zero(cls, value):
        if value is None or (isinstance(value, str) and not value.strip()):
            return 0
        return value

class Student(Scores):
    model_config = ConfigDict(
        str_strip_whitespace=True,
        extra='forbid'
    )

    name: str = Field(min_length=1, max_length=30)
    department: str = Field(min_length=1, max_length=50)
```

---

 # 2\. 이 코드가 하는 일

 이 코드는 **Pydantic**을 사용해서 학생 정보를 안전하게 관리하는 모델입니다.

 학생 한 명의 데이터는 다음과 같습니다.

 | 항목 | 설명 |
| --- | --- |
| `name` | 학생 이름 |
| `department` | 학과 |
| `korean` | 국어 점수 |
| `english` | 영어 점수 |
| `math` | 수학 점수 |

그리고 각각에 대해 여러 가지 규칙을 지정합니다.

 예를 들어 점수는:

 - 정수여야 함
- 0점 이상이어야 함
- 100점 이하여야 함
- 입력하지 않으면 0점
- `None`이나 빈 문자열도 0점으로 처리

 하도록 만들어져 있습니다.

---

 # 3. `BaseModel`이란?

```
class Scores(BaseModel):
```

 `BaseModel`은 Pydantic에서 제공하는 클래스입니다.

 Pydantic을 사용하면 입력 데이터가 우리가 정한 규칙에 맞는지 자동으로 검사할 수 있습니다.

 예를 들어:

```
class Student(BaseModel):
    name: str
    age: int
```

 이렇게 정의하면:

```
student = Student(
    name="홍길동",
    age=20
)
```

 처럼 사용할 수 있습니다.

 반면:

```
student = Student(
    name="홍길동",
    age="hello"
)
```

 처럼 잘못된 데이터를 입력하면 검증 오류가 발생합니다.

 즉, `BaseModel`은 다음과 같이 생각하면 됩니다.

 > **"입력받은 데이터를 내가 정한 규칙에 맞는지 검사해 주는 Pydantic의 기본 클래스"**

---

 # 4\. `Scores` 클래스

```
class Scores(BaseModel):
```

 `Scores`는 학생의 점수를 관리하는 클래스입니다.

 세 가지 점수가 있습니다.

```
korean
english
math
```

 각각 국어, 영어, 수학 점수를 의미합니다.

---

 # 5\. 점수 필드 분석

 다음 코드를 살펴봅시다.

```
korean: int = Field(
    default=0,
    ge=0,
    le=100,
    strict=True
)
```

 처음 보면 복잡해 보이지만 하나씩 보면 간단합니다.

---

 ## 5-1. `korean: int`

```
korean: int
```

 `korean`은 정수여야 한다는 뜻입니다.

 정상적인 예:

```
korean=90
```

 잘못된 예:

```
korean="hello"
```

---

 # 6\. `Field()`란?

```
Field(...)
```

 `Field`는 해당 데이터에 **추가적인 조건을 설정할 때** 사용합니다.

 예를 들어:

```
Field(
    default=0,
    ge=0,
    le=100,
    strict=True
)
```

 여기에는 네 가지 조건이 들어 있습니다.

 - `default=0`
- `ge=0`
- `le=100`
- `strict=True`

---

 # 7. `default=0`

```
default=0
```

 값을 입력하지 않았을 때 기본값으로 `0`을 사용합니다.

 예를 들어:

```
Scores()
```

 라고 하면 개념적으로:

```
Scores(
    korean=0,
    english=0,
    math=0
)
```

 와 같은 상태가 됩니다.

---

 # 8\. `ge=0`

```
ge=0
```

 `ge`는 **greater than or equal**의 약자입니다.

 즉:

 > 0보다 크거나 같아야 한다.

 는 뜻입니다.

 따라서:

```
korean=0
```

 은 가능합니다.

```
korean=50
```

 도 가능합니다.

 하지만:

```
korean=-1
```

 은 허용되지 않습니다.

 결과적으로:

```
점수 >= 0
```

 이라는 조건이 만들어집니다.

---

 # 9\. `le=100`

```
le=100
```

 `le`는 **less than or equal**의 약자입니다.

 즉:

 > 100보다 작거나 같아야 한다.

 는 뜻입니다.

 따라서:

```
korean=100
```

 은 가능합니다.

 하지만:

```
korean=101
```

 은 허용되지 않습니다.

 결국 `ge=0`과 `le=100`을 함께 사용하면:

```
0 <= 점수 <= 100
```

 이라는 조건이 됩니다.

---

 # 10\. `strict=True`

```
strict=True
```

 `strict`는 타입을 엄격하게 검사한다는 의미입니다.

 예를 들어 일반적으로 문자열 형태의 숫자를 숫자로 변환할 수 있는 경우가 있지만, `strict=True`를 사용하면 타입을 엄격하게 검사합니다.

```
korean=80
```

 은 정상입니다.

 하지만:

```
korean="80"
```

 은 문자열이기 때문에 허용되지 않습니다.

 즉:

```
80   → int → 정상
"80" → str → 오류
```

 라고 생각하면 됩니다.

---

 # 11\. `field_validator`

 다음 부분을 살펴봅시다.

```
@field_validator(
    'korean',
    'english',
    'math',
    mode='before'
)
```

 이것은 **Pydantic의 기본 검증을 하기 전에 값을 한 번 가공하는 기능**입니다.

 여기서는 세 개의 필드에 적용됩니다.

```
korean
english
math
```

 그리고:

```
mode='before'
```

 이므로 기본적인 타입 검증보다 먼저 실행됩니다.

 전체적인 순서는 다음과 같습니다.

```
입력 데이터
   ↓
field_validator
   ↓
값 변환
   ↓
타입 검사
   ↓
Field 조건 검사
   ↓
최종 객체 생성
```

---

 # 12\. `empty_to_zero()` 함수

```
@classmethod
def empty_to_zero(cls, value):
    if value is None or (isinstance(value, str) and not value.strip()):
        return 0
    return value
```

 함수 이름:

```
empty_to_zero
```

 를 보면 의미를 쉽게 알 수 있습니다.

 > 빈 값을 0으로 바꾼다.

---

 # 13\. `value is None`

```
if value is None:
```

 입력값이 `None`인지 확인합니다.

 예:

```
korean=None
```

 이라면:

```
None → 0
```

 으로 변경합니다.

---

 # 14\. `isinstance(value, str)`

```
isinstance(value, str)
```

 이 코드는:

 > `value`가 문자열인가?

 를 검사합니다.

 예:

```
isinstance("hello", str)
```

 결과:

```
True
```

 반면:

```
isinstance(100, str)
```

 결과:

```
False
```

 입니다.

---

 # 15\. `value.strip()`

```
value.strip()
```

 문자열의 앞뒤 공백을 제거합니다.

 예:

```
"  hello  ".strip()
```

 결과:

```
"hello"
```

 그리고:

```
"     ".strip()
```

 결과:

```
""
```

 가 됩니다.

 따라서 공백만 입력된 문자열인지 확인할 수 있습니다.

---

 # 16\. 조건문 전체 이해하기

```
if value is None or (isinstance(value, str) and not value.strip()):
    return 0
```

 이것을 쉬운 말로 바꾸면:

 > 값이 `None`이거나, 문자열이면서 공백만 있다면 `0`을 반환한다.

 입니다.

 예를 들어:

 | 입력 | 처리 결과 |
| --- | --- |
| `None` | `0` |
| `""` | `0` |
| `"   "` | `0` |
| `"\t"` | `0` |
| `80` | `80` |
| `0` | `0` |

---

 # 17\. `"80"`은 어떻게 될까?

 중요한 부분입니다.

```
korean="80"
```

 을 입력하면 `empty_to_zero()`는 `"80"`을 빈 값으로 판단하지 않습니다.

 따라서:

```
"80" → "80"
```

 그대로 반환합니다.

 그런 다음 `strict=True`가 적용됩니다.

```
"80" → 문자열
80   → 정수
```

 타입이 다르므로 오류가 발생합니다.

 즉, 이 코드에서는:

```
korean=80
```

 은 정상이고,

```
korean="80"
```

 은 오류입니다.

---

 # 18. `Student(Scores)`의 의미

 이제 두 번째 클래스를 살펴보겠습니다.

```
class Student(Scores):
```

 여기서 `Student`는 `Scores`를 **상속**받습니다.

 상속이란 쉽게 말하면:

 > 부모 클래스가 가지고 있는 기능과 필드를 자식 클래스가 물려받는 것

 입니다.

 따라서 `Student`에는 `Scores`에 정의된:

```
korean
english
math
```

 가 자동으로 포함됩니다.

 그리고 `Student`에서는 추가로:

```
name
department
```

 를 정의합니다.

 결과적으로:

```
Student
├── name
├── department
├── korean
├── english
└── math
```

 와 같은 구조가 됩니다.

---

 # 19\. `model_config`

```
model_config = ConfigDict(
    str_strip_whitespace=True,
    extra='forbid'
)
```

 `Student` 모델에 적용할 설정입니다.

 두 가지 설정이 있습니다.

```
str_strip_whitespace=True
extra='forbid'
```

---

 # 20\. `str_strip_whitespace=True`

```
str_strip_whitespace=True
```

 문자열의 앞뒤에 있는 공백을 제거합니다.

 예:

```
name="  홍길동  "
```

 입력하면:

```
"홍길동"
```

 으로 처리됩니다.

 하지만 문자열 중간의 공백은 제거하지 않습니다.

 예:

```
"  홍 길동  "
```

 은:

```
"홍 길동"
```

 이 됩니다.

---

 # 21\. `extra='forbid'`

```
extra='forbid'
```

 모델에 정의되지 않은 필드를 금지합니다.

 현재 `Student`에 정의된 필드는:

```
name
department
korean
english
math
```

 입니다.

 그런데 다음과 같이 입력한다면:

```
Student(
    name="홍길동",
    department="컴퓨터공학과",
    age=20
)
```

 `age`는 정의되어 있지 않습니다.

 따라서 오류가 발생합니다.

 즉:

```
extra='forbid'
```

 는 다음 의미입니다.

 > **"내가 미리 정의한 필드만 입력받겠다."**

---

 # 22\. `name` 필드

```
name: str = Field(
    min_length=1,
    max_length=30
)
```

 `name`은 문자열이어야 합니다.

 그리고 길이에 대한 조건이 있습니다.

```
min_length=1
```

 최소 1글자

```
max_length=30
```

 최대 30글자

 입니다.

 따라서:

```
name="홍길동"
```

 은 정상입니다.

 하지만:

```
name=""
```

 은 오류입니다.

---

 # 23\. `department` 필드

```
department: str = Field(
    min_length=1,
    max_length=50
)
```

 학과도 문자열이어야 합니다.

 그리고:

```
최소 1글자
최대 50글자
```

 라는 조건이 있습니다.

 예:

```
department="컴퓨터공학과"
```

 는 정상입니다.

---

 # 24\. 실제로 Student 만들기

 다음과 같이 사용할 수 있습니다.

```
student = Student(
    name="홍길동",
    department="컴퓨터공학과",
    korean=90,
    english=85,
    math=95
)
```

 그러면 학생 객체에는 다음 정보가 들어갑니다.

```
name       = 홍길동
department = 컴퓨터공학과
korean     = 90
english    = 85
math       = 95
```

---

 # 25\. 점수를 입력하지 않은 경우

```
student = Student(
    name="홍길동",
    department="컴퓨터공학과"
)
```

 점수를 입력하지 않았습니다.

 하지만 점수 필드에는:

```
default=0
```

 이 설정되어 있습니다.

 따라서:

```
korean  = 0
english = 0
math    = 0
```

 이 됩니다.

---

 # 26\. `None`을 입력한 경우

```
student = Student(
    name="홍길동",
    department="컴퓨터공학과",
    korean=None
)
```

 처리 과정은:

```
korean=None
     ↓
validator 실행
     ↓
None 발견
     ↓
0으로 변경
     ↓
정수인지 검사
     ↓
korean=0
```

 입니다.

 따라서 정상적으로 처리됩니다.

---

 # 27\. 빈 문자열을 입력한 경우

```
student = Student(
    name="홍길동",
    department="컴퓨터공학과",
    korean=" "
)
```

 공백만 입력했습니다.

 validator에서:

```
value.strip()
```

 을 실행하면:

```
" "
 ↓
""
```

 가 됩니다.

 따라서 빈 값으로 판단하고:

```
" " → 0
```

 으로 변경합니다.

---

 # 28\. 전체 동작 과정

 이 코드를 이해하는 데 가장 중요한 부분입니다.

```
             Student 데이터 입력
                     │
                     ▼
       ┌──────────────────────────┐
       │ korean / english / math  │
       │ validator 실행           │
       └──────────────────────────┘
                     │
                     ▼
            None 또는 빈 값인가?
               /          \
             YES           NO
              │             │
              ▼             ▼
             0으로        원래 값
             변경          그대로
               \          /
                \        /
                 ▼      ▼
              타입 검사
                  │
                  ▼
             점수 범위 검사
               0 ~ 100
                  │
                  ▼
          name / department 검사
                  │
                  ▼
            추가 필드 검사
                  │
                  ▼
             Student 생성
```

---

 # 29\. 최종적으로 기억해야 할 것

 이 코드에서 가장 중요한 개념은 다음과 같습니다.

 ### `BaseModel`

 Pydantic 모델의 기본 클래스입니다.

```
class Scores(BaseModel):
```

 데이터를 검증하는 기반이 됩니다.

 ### `Field`

 필드에 구체적인 조건을 추가합니다.

```
Field(default=0, ge=0, le=100, strict=True)
```

 ### `default`

 값을 입력하지 않았을 때 사용할 기본값입니다.

```
default=0
```

 ### `ge`

 크거나 같음입니다.

```
ge=0
```

 → 0 이상

 ### `le`

 작거나 같음입니다.

```
le=100
```

 → 100 이하

 ### `strict=True`

 타입을 엄격하게 검사합니다.

```
80   → 정상
"80" → 오류
```

 ### `field_validator`

 Pydantic의 기본 검증 전에 값을 가공할 수 있습니다.

```
@field_validator(..., mode='before')
```

 ### `@classmethod`

 클래스 메서드로 정의합니다.

```
@classmethod
def empty_to_zero(cls, value):
```

 ### `None`

 값이 없다는 의미입니다.

 이 코드에서는:

```
None → 0
```

 으로 변환합니다.

 ### `strip()`

 문자열 양쪽의 공백을 제거합니다.

```
"  hello  ".strip()
```

 →

```
"hello"
```

 ### 상속

```
class Student(Scores):
```

 `Student`가 `Scores`의 기능과 필드를 물려받습니다.

 ### `str_strip_whitespace=True`

 문자열 앞뒤 공백을 제거합니다.

 ### `extra='forbid'`

 정의하지 않은 필드를 입력하면 오류를 발생시킵니다.

---

 # 30\. 한 문장으로 정리

 이 코드는:

 > **Pydantic을 이용해 학생의 이름과 학과, 국어·영어·수학 점수를 입력받고, 점수는 0\~100 범위의 정수로 제한하며, 비어 있는 점수는 0으로 처리하고, 잘못된 데이터나 정의되지 않은 필드는 자동으로 거부하는 데이터 검증 모델입니다.**

 특히 초보자라면 이 코드 전체를 한꺼번에 외우기보다 **① `BaseModel` → ② `Field` → ③ `validator` → ④ `상속` → ⑤ `ConfigDict`** 순서로 익히는 것이 좋습니다.
