# Mermaid_스타일 설정
>  Mermaid의 `classDef`는 **CSS와 유사한 스타일 속성**을 사용하지만, 모든 CSS 속성이 Mermaid에서 동일하게 보장되는 것은 아닙니다.
> Mermaid 공식 문서에서 명시적으로 자주 사용되는 핵심 속성은 `fill`, `stroke`, `stroke-width`, `color`, `font-size`, `font-weight`, `font-style`, `stroke-dasharray` 등입니다.
> 특히 `font-size`를 여러 클래스에 지정하는 문법도 공식적으로 지원됩니다. ([Mermaid][1])

먼저 작성하신 코드에서 한 가지 수정할 부분이 있습니다.

```text
classDef box1 fill:#EB7D00,stroke:#ddd,font-size:19px,color:#fff;
classDef box2 fill:#2C5745,stroke:#333,font-size:19px,color:#fff;
```

`color:fff`보다는 **`color:#fff`**로 작성하는 것이 정확합니다.

## 1. Mermaid `classDef` 핵심 스타일

실무에서는 아래 정도를 알고 있으면 대부분의 Mermaid 스타일링을 처리할 수 있습니다.

| 속성                 | 의미      | 예                       |
| ------------------ | ------- | ----------------------- |
| `fill`             | 노드 배경색  | `fill:#EB7D00`          |
| `color`            | 글자색     | `color:#fff`            |
| `stroke`           | 테두리색    | `stroke:#333`           |
| `stroke-width`     | 테두리 두께  | `stroke-width:2px`      |
| `stroke-dasharray` | 점선/파선   | `stroke-dasharray:5\,5` |
| `font-size`        | 글자 크기   | `font-size:19px`        |
| `font-weight`      | 글자 굵기   | `font-weight:bold`      |
| `font-style`       | 기울임     | `font-style:italic`     |
| `font-family`      | 글꼴      | `font-family:Arial`     |
| `opacity`          | 전체 투명도  | `opacity:0.8`           |
| `fill-opacity`     | 배경 투명도  | `fill-opacity:0.7`      |
| `stroke-opacity`   | 테두리 투명도 | `stroke-opacity:0.5`    |

Mermaid 공식 예제에서도 `fill`, `stroke`, `stroke-width`, `color`, `font-size`, `font-weight`, `font-style`가 직접 사용됩니다. ([Mermaid][2])

---

## 2. 배경색 `fill`

```text
classDef box fill:#E8F5E9;
```

가장 많이 사용하는 속성입니다.

```text
fill:#FFFFFF     흰색
fill:#000000     검정색
fill:#EB7D00     주황색
fill:#2C5745     녹색
fill:#E8F5E9     연한 녹색
fill:#E8F0FE     연한 파랑
```

예:

```mermaid
flowchart LR
    A["AI 서비스"]
    
    classDef green fill:#E8F5E9;
    class A green;
```

---

## 3. 글자색 `color`

```mermaid
classDef box color:#ffffff;
```

예:

```mermaid
classDef orange fill:#EB7D00,color:#fff;
classDef green fill:#2C5745,color:#fff;
```

어두운 배경에는 흰색 글자가 잘 어울립니다.

```text
color:#000       검정
color:#333       진한 회색
color:#666       회색
color:#fff       흰색
color:#1F2937    진한 남색 계열
```

---

## 4. 테두리 색 `stroke`

```mermaid
classDef box stroke:#333;
```

CSS의 `border-color`와 비슷한 역할입니다.

```mermaid
classDef box fill:#E8F5E9,stroke:#2C5745;
```

---

## 5. 테두리 두께 `stroke-width`

```mermaid
classDef box stroke-width:2px;
```

예:

```mermaid
classDef normal stroke-width:1px;
classDef important stroke-width:3px;
classDef veryImportant stroke-width:5px;
```

Mermaid 공식 문서에서도 대표적으로 다음 패턴을 사용합니다. ([Mermaid][1])

```mermaid
classDef myStyle fill:#f9f,stroke:#333,stroke-width:4px;
```

---

## 6. 테두리를 점선으로 `stroke-dasharray`

```mermaid
classDef box stroke-dasharray:5\,5;
```

숫자의 의미는

```text
5px 선 → 5px 공백 → 5px 선 → 5px 공백
```

입니다.

다양한 패턴:

```mermaid
classDef dot1 stroke-dasharray:2\,2;
classDef dot2 stroke-dasharray:5\,5;
classDef dot3 stroke-dasharray:10\,5;
classDef dot4 stroke-dasharray:10\,3\,2\,3;
```

Mermaid에서는 쉼표가 스타일 속성을 구분하는 문자이기 때문에 `stroke-dasharray` 내부의 쉼표는 **`\ ,`가 아니라 `\,` 형태로 escape**하는 것이 공식 권장 방식입니다. ([Mermaid][3])

---

# 7. 글자 크기 `font-size`

```mermaid
classDef box font-size:19px;
```

또는

```mermaid
classDef box font-size:16pt;
```

공식 문서에도 다음과 같은 문법이 소개되어 있습니다. ([Mermaid][2])

```mermaid
classDef firstClassName,secondClassName font-size:12pt;
```

강의자료라면 일반적으로 다음 정도가 적절합니다.

```text
14px   작은 설명
16px   기본
18px   중간 강조
20px   강조
24px   큰 제목
```

---

# 8. 글자 굵기 `font-weight`

```mermaid
classDef box font-weight:bold;
```

값은 일반적인 CSS 방식으로 사용할 수 있습니다.

```mermaid
classDef normal font-weight:normal;
classDef strong font-weight:bold;
```

공식 Mermaid state diagram 예제에서도 `font-weight:bold`를 사용합니다. ([Mermaid][4])

강의자료에서는 다음 조합을 많이 사용할 수 있습니다.

```mermaid
classDef important fill:#EB7D00,color:#fff,font-weight:bold;
```

---

# 9. 기울임 `font-style`

```mermaid
classDef box font-style:italic;
```

예:

```mermaid
classDef normal font-style:normal;
classDef italic font-style:italic;
```

이 역시 Mermaid 공식 예제에서 사용되는 속성입니다. ([Mermaid][4])

---

# 10. 글꼴 `font-family`

다음과 같이 설정할 수 있습니다.

```mermaid
classDef box font-family:Arial;
```

또는

```mermaid
classDef box font-family:"Noto Sans KR";
```

다만 전체 Mermaid 다이어그램의 글꼴을 변경하려면 개별 `classDef`보다 Mermaid 설정의 `fontFamily`를 사용하는 방법도 있습니다. Mermaid 공식 문서에서도 directive/config를 통한 `fontFamily` 설정을 지원합니다. ([Mermaid][5])

예:

```mermaid
---
config:
  fontFamily: "Arial"
---
flowchart LR
    A --> B
```

---

# 11. 투명도 `opacity`

SVG/CSS 계열 스타일로 다음과 같은 투명도 속성을 사용할 수 있습니다.

```mermaid
classDef box opacity:0.7;
```

범위:

```text
0   완전 투명
0.5 반투명
1   완전 불투명
```

예:

```mermaid
classDef disabled fill:#ddd,opacity:0.5;
```

다만 `opacity`처럼 Mermaid가 생성하는 SVG 요소에 직접 적용되는 CSS/SVG 속성은 **다이어그램 종류와 Mermaid 렌더링 방식에 따라 결과가 달라질 수 있습니다.** Mermaid 자체에서도 Gantt 등의 SVG 요소 스타일에 `opacity`를 사용합니다. ([Mermaid][6])

---

# 12. 배경만 투명하게 `fill-opacity`

```mermaid
classDef box fill:#EB7D00,fill-opacity:0.5;
```

전체 노드가 아니라 **fill 영역만 투명하게** 만드는 용도로 사용할 수 있습니다.

```text
opacity
 └─ 노드 전체

fill-opacity
 └─ 배경만
```

---

# 13. 테두리 투명도 `stroke-opacity`

```mermaid
classDef box stroke:#333,stroke-opacity:0.5;
```

테두리만 흐리게 만들 때 사용합니다.

---

# 14. 여러 속성을 한번에 사용

실제로는 아래와 같이 조합하는 것이 일반적입니다.

```mermaid
flowchart LR

    A["사용자 문제"]
    B["서비스 아이디어"]
    C["AI 활용 가능성"]
    D["서비스 기능"]
    E["사용자 경험"]

    A --> B --> C --> D --> E

    classDef orange fill:#EB7D00,stroke:#C26400,stroke-width:2px,color:#fff,font-size:18px,font-weight:bold;
    classDef green fill:#2C5745,stroke:#183B2D,stroke-width:2px,color:#fff,font-size:18px,font-weight:bold;
    classDef blue fill:#E8F0FE,stroke:#6B8FD6,stroke-width:2px,color:#1F2937,font-size:18px;
    
    class A orange;
    class B,C green;
    class D,E blue;
```

---

# 15. 강의자료용으로 추천하는 기본 스타일 세트

지금 사용하고 계신 색상 계열이라면 다음처럼 미리 만들어 두는 것이 편합니다.

```mermaid
flowchart LR

    A["문제 발견"] --> B["아이디어"]
    B --> C["AI 활용"]
    C --> D["서비스 설계"]
    D --> E["프로토타입"]

    classDef orange
        fill:#F6B768,
        stroke:#EB7D00,
        stroke-width:2px,
        color:#4A2A00,
        font-size:18px,
        font-weight:bold;

    classDef green
        fill:#DCEAE4,
        stroke:#2C5745,
        stroke-width:2px,
        color:#16382A,
        font-size:18px,
        font-weight:bold;

    classDef blue
        fill:#E8F0FE,
        stroke:#6B8FD6,
        stroke-width:2px,
        color:#1F2937,
        font-size:18px;

    classDef yellow
        fill:#FFF7D6,
        stroke:#D9B44A,
        stroke-width:2px,
        color:#493B12,
        font-size:18px;

    classDef gray
        fill:#F3F4F6,
        stroke:#9CA3AF,
        stroke-width:1px,
        color:#374151,
        font-size:18px;

    class A orange;
    class B green;
    class C blue;
    class D yellow;
    class E gray;
```

---

## 16. `classDef` 사용 문법 3가지

### 방법 ① 나중에 class 지정

```mermaid
flowchart LR
    A["사용자"] --> B["AI"]

    classDef box fill:#E8F0FE,stroke:#333;
    
    class A,B box;
```

### 방법 ② 노드 선언과 동시에 지정

보다 간결해서 제가 추천하는 방식입니다.

```mermaid
flowchart LR
    A["사용자"]:::user --> B["AI"]:::ai

    classDef user fill:#E8F0FE,stroke:#6B8FD6;
    classDef ai fill:#DCEAE4,stroke:#2C5745;
```

`:::`를 이용해 노드 선언과 동시에 클래스를 연결하는 문법은 Mermaid Flowchart 공식 문법입니다. ([Mermaid][1])

### 방법 ③ 기본 스타일 만들기

```mermaid
classDef default fill:#F5F5F5,stroke:#999,color:#333,font-size:18px;
```

`default`라는 이름으로 클래스를 정의하면 별도 스타일이 없는 노드에 기본 스타일을 적용할 수 있습니다. ([Mermaid][1])

---

# 17. 중요한 속성만 암기한다면

실제로 Mermaid 강의자료를 작성할 때는 **다음 8개만 기억해도 거의 충분합니다.**

```text
fill               배경색
color              글자색

stroke             테두리색
stroke-width       테두리 두께
stroke-dasharray   테두리 점선

font-size          글자 크기
font-weight        글자 굵기
font-style         글자 기울임
```

즉, 사용자께서 지금 사용하고 있는 코드를 조금 확장하면 제가 가장 추천하는 기본형은 다음입니다.

```mermaid
classDef box1 fill:#EB7D00,stroke:#C26400,stroke-width:2px,color:#fff,font-size:19px,font-weight:bold;

classDef box2 fill:#2C5745,stroke:#183B2D,stroke-width:2px,color:#fff,font-size:19px,font-weight:bold;
```

그리고 앞으로 Mermaid 강의자료의 스타일을 통일하려면 **`orange / green / blue / yellow / gray / red` 6개 정도의 공통 `classDef`를 미리 만들어 복사해서 사용하는 방식**이 가장 관리하기 좋습니다. Mermaid는 여러 노드 또는 여러 클래스에 같은 스타일 정의를 재사용하도록 `classDef`를 제공하고 있습니다. ([Mermaid][1])

[1]: https://mermaid.js.org/syntax/flowchart.html?utm_source=chatgpt.com "Flowcharts Syntax | Mermaid"
[2]: https://mermaid.js.org/syntax/classDiagram.html?utm_source=chatgpt.com "Class diagrams"
[3]: https://mermaid.js.org/syntax/flowchart.html "Flowcharts Syntax | Mermaid"
[4]: https://mermaid.js.org/syntax/stateDiagram.html?utm_source=chatgpt.com "State diagrams - Mermaid AI"
[5]: https://mermaid.js.org/config/directives.html?utm_source=chatgpt.com "Directives | Mermaid"
[6]: https://mermaid.js.org/syntax/gantt.html?utm_source=chatgpt.com "Gantt diagrams"
