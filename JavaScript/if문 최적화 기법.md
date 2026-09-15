가능합니다. JavaScript에서는 `if`를 줄이거나 없애는 방법이 꽤 많습니다. 특히 지금 주민번호 예제처럼 **입력값에 따라 결과가 정해지는 문제**에서는 `Object`, `Array`, `Map` 같은 자료구조를 사용하면 코드가 훨씬 단순해질 수 있습니다.

### 1. 가장 먼저: 단순한 두 가지 선택은 삼항 연산자

기존 코드:

```javascript
let gender = "남성";

if (genderCode === 2 || genderCode === 4) {
    gender = "여성";
}
```

삼항 연산자로 바꾸면:

```javascript
let gender =
    (genderCode === 2 || genderCode === 4)
    ? "여성"
    : "남성";
```

성년 여부도:

```javascript
let adult = age >= 19 ? "성년" : "미성년";
```

이 방식은 **조건이 딱 2가지일 때** 가장 적합합니다.

---

### 2. 여러 값의 대응 관계라면 `Object`를 딕셔너리처럼 사용

Python의 딕셔너리와 가장 비슷한 방식입니다.

예를 들어 주민번호 7번째 숫자로 성별을 구분한다면:

```javascript
let genderTable = {
    1: "남성",
    2: "여성",
    3: "남성",
    4: "여성",
    9: "남성",
    0: "여성"
};

let gender = genderTable[genderCode];
```

이 방법의 장점은 조건문이 아예 없다는 것입니다.

학생들에게는 다음과 같이 설명할 수 있습니다.

```text
1 → 남성
2 → 여성
3 → 남성
4 → 여성
```

이 대응표를 그대로 프로그램에 옮긴 것이

```javascript
{
    1: "남성",
    2: "여성",
    3: "남성",
    4: "여성"
}
```

입니다.

즉,

> **조건을 검사하는 대신, 값으로 결과를 찾아온다.**

라는 개념입니다.

---

### 3. 출생 세기도 Object로 처리 가능

기존에는:

```javascript
let birthYear = 2000 + year2;

if (genderCode === 1 || genderCode === 2) {
    birthYear = 1900 + year2;
}

if (genderCode === 9 || genderCode === 0) {
    birthYear = 1800 + year2;
}
```

딕셔너리 방식으로 바꾸면:

```javascript
let centuryTable = {
    0: 1800,
    1: 1900,
    2: 1900,
    3: 2000,
    4: 2000,
    9: 1800
};

let birthYear = centuryTable[genderCode] + year2;
```

이 경우는 자료구조 방식이 훨씬 명확합니다.

```text
주민번호 코드 → 출생 세기

0 → 1800
1 → 1900
2 → 1900
3 → 2000
4 → 2000
9 → 1800
```

---

### 4. 띠처럼 규칙적으로 반복되면 배열이 가장 좋음

현재 코드에서도 이 방법을 사용하고 있습니다.

```javascript
let animals = [
    "원숭이",
    "닭",
    "개",
    "돼지",
    "쥐",
    "소",
    "호랑이",
    "토끼",
    "용",
    "뱀",
    "말",
    "양"
];

let animal = animals[birthYear % 12] + "띠";
```

여기에는 `if`가 전혀 없습니다.

만약 조건문으로 작성한다면 매우 길어집니다.

```javascript
if (...) animal = "쥐띠";
if (...) animal = "소띠";
if (...) animal = "호랑이띠";
...
```

하지만 배열을 사용하면

```javascript
animals[계산된번호]
```

만으로 해결됩니다.

이것이 자료구조 활용의 대표적인 장점입니다.

---

### 5. `includes()`를 사용하면 OR 조건을 단순화할 수 있음

기존:

```javascript
if (
    genderCode === 0 ||
    genderCode === 2 ||
    genderCode === 4
) {
    gender = "여성";
}
```

배열을 사용하면:

```javascript
if ([0, 2, 4].includes(genderCode)) {
    gender = "여성";
}
```

더 나아가 삼항 연산자까지 사용하면:

```javascript
let gender =
    [0, 2, 4].includes(genderCode)
    ? "여성"
    : "남성";
```

학생들에게 상당히 유용한 패턴입니다.

```javascript
[값1, 값2, 값3].includes(검사할값)
```

즉,

> "`검사할값`이 이 목록 안에 있는가?"

라는 뜻입니다.

---

### 6. `Set`을 사용할 수도 있음

많은 값 중 특정 값이 포함되어 있는지만 검사한다면 `Set`도 적합합니다.

```javascript
let femaleCodes = new Set([0, 2, 4]);

let gender =
    femaleCodes.has(genderCode)
    ? "여성"
    : "남성";
```

배열에서는:

```javascript
array.includes(value)
```

Set에서는:

```javascript
set.has(value)
```

를 사용합니다.

초급 단계에서는 `includes()`가 더 직관적이고, 이후 자료구조 수업에서 `Set`을 소개하면 좋습니다.

---

### 7. `switch`도 여러 조건을 정리하는 방법

`if ~ else if`가 많아지는 경우 `switch`를 사용할 수 있습니다.

```javascript
let gender;

switch (genderCode) {

    case 1:
    case 3:
    case 9:
        gender = "남성";
        break;

    case 0:
    case 2:
    case 4:
        gender = "여성";
        break;
}
```

하지만 이 주민번호 예제에서는 사실 `Object`가 더 간단합니다.

```javascript
let genderTable = {
    0: "여성",
    1: "남성",
    2: "여성",
    3: "남성",
    4: "여성",
    9: "남성"
};

let gender = genderTable[genderCode];
```

따라서 `switch`는 학생들에게 "여러 조건 처리 방법"으로 소개하되, **단순 대응표 문제라면 Object가 더 효율적이다**라고 설명하면 좋습니다.

---

### 8. 함수도 Object에 저장할 수 있음

조금 더 발전시키면 결과뿐 아니라 **처리 함수 자체를 자료구조에 저장**할 수도 있습니다.

```javascript
let commands = {
    gender: function () {
        return "성별 계산";
    },

    zodiac: function () {
        return "띠 계산";
    },

    star: function () {
        return "별자리 계산";
    }
};

console.log(commands.gender());
console.log(commands.zodiac());
```

이런 구조는 나중에 **라우팅, 이벤트 처리, 전략 패턴, API 처리** 등으로 발전합니다.

---

### 9. 주민번호 예제에서 가장 추천하는 조합

| 처리 내용       | 추천 방법           |
| ----------- | --------------- |
| 성년 / 미성년    | 삼항 연산자          |
| 성별          | Object 또는 Array |
| 출생 세기       | Object          |
| 띠           | Array + `%`     |
| 별자리         | 조건문 또는 데이터 테이블  |
| 지역번호        | Object / Array  |
| 유효성 검사      | `if + return`   |
| 여러 허용 코드 검사 | `includes()`    |
| 복잡한 명령 분기   | Object + 함수     |

특히 **유효성 검사에서는 `if`를 억지로 없애지 않는 것이 좋습니다.**

예를 들어:

```javascript
if (juminNum.length !== 13) {
    return;
}

if (!validDate) {
    return;
}

if (!validChecksum) {
    return;
}
```

이런 코드는 오히려 `if`를 사용하는 것이 가장 읽기 쉽습니다. 이런 방식을 **Guard Clause, 조기 반환(Early Return)**이라고 합니다.

---

## 주민번호 코드라면 이렇게 많이 단순화할 수 있습니다

예를 들어 핵심 부분을 다음처럼 만들 수 있습니다.

```javascript
let code = parseInt(juminNum.charAt(6));


// 성별
let genderTable = {
    0: "여성",
    1: "남성",
    2: "여성",
    3: "남성",
    4: "여성",
    9: "남성"
};

let gender = genderTable[code];


// 출생 세기
let centuryTable = {
    0: 1800,
    1: 1900,
    2: 1900,
    3: 2000,
    4: 2000,
    9: 1800
};

let birthYear =
    centuryTable[code] +
    parseInt(juminNum.substring(0, 2));


// 성년
let adult =
    age >= 19 ? "성년" : "미성년";


// 띠
let animals = [
    "원숭이", "닭", "개", "돼지",
    "쥐", "소", "호랑이", "토끼",
    "용", "뱀", "말", "양"
];

let animal =
    animals[birthYear % 12] + "띠";
```

그러면 핵심 코드에 `if`가 거의 없어집니다.

### 수업에서는 이렇게 발전시키는 것이 좋습니다

```text
1단계
if ~ else

        ↓

2단계
기본값 + if

        ↓

3단계
삼항 연산자
조건 ? 참 : 거짓

        ↓

4단계
includes()
여러 값 중 포함 여부

        ↓

5단계
Array
순서가 있는 대응표

        ↓

6단계
Object / Map
키 → 값 대응

        ↓

7단계
Object + 함수
키 → 처리 로직
```

이 순서가 특히 좋은 이유는 학생들이 **"조건문을 배우는 것"에서 끝나지 않고 "조건 자체를 데이터로 바꿀 수 있다"**는 프로그래밍 사고를 배우기 때문입니다.

예를 들어

```javascript
if (code === 1) ...
if (code === 2) ...
if (code === 3) ...
```

를 보면서 한 단계 더 생각하여

```javascript
let table = {
    1: 결과1,
    2: 결과2,
    3: 결과3
};
```

로 바꾸는 것입니다.

이것은 AX/풀스택 과정에서도 중요한 사고방식입니다. 나중에는 동일한 개념이 **JSON, API 응답, DB 조회, 라우팅 테이블, 설정 파일, 상태 관리**로 그대로 연결됩니다.
