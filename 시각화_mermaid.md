Mermaid 다이어그램의 배경색을 회색 계열로 일괄 변경하는 방법을 알려드리겠습니다. Mermaid는 CSS 스타일링을 지원하므로 여러 가지 방식으로 적용할 수 있습니다.

---

## 1. `%%{init}%%` 구문으로 전역 테마 설정 (권장)

Mermaid 8.6.0 이상에서 지원하는 `%%{init}%%` 구문을 사용하면 전역적으로 테마와 색상을 설정할 수 있습니다.

### 기본 회색 테마 예시

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#e0e0e0',
    'primaryTextColor': '#333333',
    'primaryBorderColor': '#9e9e9e',
    'lineColor': '#757575',
    'secondaryColor': '#f5f5f5',
    'tertiaryColor': '#fafafa',
    'background': '#fafafa',
    'mainBkg': '#e0e0e0',
    'secondBkg': '#f5f5f5',
    'nodeBorder': '#9e9e9e',
    'clusterBkg': '#eeeeee',
    'clusterBorder': '#bdbdbd',
    'titleColor': '#424242',
    'edgeLabelBackground': '#ffffff',
    'nodeTextColor': '#333333'
  },
  'flowchart': {
    'htmlLabels': true,
    'curve': 'basis'
  }
} }%%

flowchart TD
    A[시작] --> B{조건 확인}
    B -->|Yes| C[처리 A]
    B -->|No| D[처리 B]
    C --> E[종료]
    D --> E
```

---

## 2. 각 다이어그램 유형별 회색 테마 적용

### Flowchart (흐름도)

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#e0e0e0',
    'primaryTextColor': '#333333',
    'primaryBorderColor': '#9e9e9e',
    'lineColor': '#757575',
    'secondaryColor': '#f5f5f5',
    'tertiaryColor': '#fafafa',
    'background': '#fafafa',
    'mainBkg': '#e0e0e0',
    'secondBkg': '#f5f5f5',
    'nodeBorder': '#9e9e9e',
    'clusterBkg': '#eeeeee',
    'clusterBorder': '#bdbdbd',
    'titleColor': '#424242',
    'edgeLabelBackground': '#ffffff',
    'nodeTextColor': '#333333'
  }
} }%%

flowchart TD
    A[시작 단계] --> B{의사결정}
    B -->|경로 1| C[처리 1]
    B -->|경로 2| D[처리 2]
    C --> E[종료]
    D --> E
    
    style A fill:#d6d6d6,stroke:#757575,stroke-width:2px,color:#333
    style B fill:#c0c0c0,stroke:#616161,stroke-width:2px,color:#333
    style C fill:#d6d6d6,stroke:#757575,stroke-width:2px,color:#333
    style D fill:#d6d6d6,stroke:#757575,stroke-width:2px,color:#333
    style E fill:#bdbdbd,stroke:#616161,stroke-width:2px,color:#333
```

---

### Mindmap (마인드맵)

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#e0e0e0',
    'primaryTextColor': '#333333',
    'primaryBorderColor': '#9e9e9e',
    'lineColor': '#757575',
    'secondaryColor': '#f5f5f5',
    'tertiaryColor': '#fafafa',
    'background': '#fafafa'
  }
} }%%

mindmap
  root((중심 주제))
    주제1
      하위1-1
      하위1-2
    주제2
      하위2-1
      하위2-2
    주제3
      하위3-1
```

> ⚠️ Mindmap은 `style` 구문이 제한적이므로 `themeVariables`로 전역 설정하는 것이 가장 효과적입니다.

---

### Gantt Chart (간트 차트)

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#e0e0e0',
    'primaryTextColor': '#333333',
    'primaryBorderColor': '#9e9e9e',
    'lineColor': '#757575',
    'secondaryColor': '#f5f5f5',
    'tertiaryColor': '#fafafa',
    'background': '#fafafa',
    'sectionBkgColor': '#e0e0e0',
    'altSectionBkgColor': '#f5f5f5',
    'gridColor': '#bdbdbd',
    'todayLineColor': '#616161',
    'taskBkgColor': '#d6d6d6',
    'taskTextColor': '#333333',
    'taskTextLightColor': '#666666',
    'taskTextOutsideColor': '#333333',
    'activeTaskBkgColor': '#bdbdbd',
    'activeTaskBorderColor': '#757575',
    'section0': '#e0e0e0',
    'section1': '#d6d6d6',
    'section2': '#cccccc',
    'section3': '#c0c0c0'
  }
} }%%

gantt
    title 프로젝트 일정
    dateFormat  YYYY-MM-DD
    section Must Have
    기능 A 개발      :a1, 2026-08-03, 5d
    기능 B 개발      :a2, after a1, 5d
    section Should Have
    기능 C 개발      :b1, after a2, 3d
    기능 D 개발      :b2, after b1, 3d
    section Could Have
    기능 E 개발      :c1, after b2, 2d
```

---

### Pie Chart (파이 차트)

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#e0e0e0',
    'primaryTextColor': '#333333',
    'primaryBorderColor': '#9e9e9e',
    'lineColor': '#757575',
    'secondaryColor': '#f5f5f5',
    'tertiaryColor': '#fafafa',
    'background': '#fafafa',
    'pieOuterStrokeWidth': '2px',
    'pieTitleTextSize': '25px',
    'pieTitleTextColor': '#424242',
    'pieSectionTextSize': '17px',
    'pieSectionTextColor': '#333333',
    'pieStrokeColor': '#9e9e9e',
    'pieStrokeWidth': '2px'
  }
} }%%

pie title MoSCoW 분배
    "Must Have" : 60
    "Should Have" : 20
    "Could Have" : 20
```

> ⚠️ Pie Chart의 각 조각 색상은 `themeVariables`로 직접 지정이 어려워 별도 `style`이 필요할 수 있습니다. 아래 **커스텀 색상 매핑**을 참고하세요.

---

## 3. 개별 노드에 직접 회색 스타일 적용

전역 설정과 별개로, 특정 노드에만 색상을 지정하고 싶을 때는 `style` 구문을 사용합니다.

```mermaid
flowchart TD
    A[기본 회색 노드]
    B[밝은 회색 노드]
    C[어두운 회색 노드]
    D[테두리 강조 노드]
    
    %% 개별 노드 스타일 지정
    style A fill:#e0e0e0,stroke:#9e9e9e,stroke-width:2px,color:#333333
    style B fill:#f5f5f5,stroke:#bdbdbd,stroke-width:2px,color:#424242
    style C fill:#bdbdbd,stroke:#757575,stroke-width:2px,color:#212121
    style D fill:#eeeeee,stroke:#616161,stroke-width:3px,color:#333333,stroke-dasharray: 5 5
    
    A --> B --> C --> D
```

---

## 4. 클래스(class)를 활용한 일괄 스타일링

반복적으로 사용하는 스타일은 `classDef`로 정의하고 `class`로 적용하면 효율적입니다.

```mermaid
flowchart TD
    %% 클래스 정의
    classDef gray1 fill:#e0e0e0,stroke:#9e9e9e,stroke-width:2px,color:#333333
    classDef gray2 fill:#f5f5f5,stroke:#bdbdbd,stroke-width:2px,color:#424242
    classDef gray3 fill:#bdbdbd,stroke:#757575,stroke-width:2px,color:#212121
    classDef gray4 fill:#eeeeee,stroke:#616161,stroke-width:2px,color:#333333
    classDef highlight fill:#d6d6d6,stroke:#424242,stroke-width:3px,color:#212121
    
    %% 노드 정의
    A[Must Have]:::gray1
    B[Should Have]:::gray2
    C[Could Have]:::gray3
    D[Won't Have]:::gray4
    E[핵심 기능]:::highlight
    
    A --> B --> C --> D
    A --> E
```

---

## 5. 회색 계열 색상 팔레트 참고

자주 사용하는 회색 계열 색상 코드입니다:

| 색상명 | HEX 코드 | 용도 |
|--------|----------|------|
| 아주 밝은 회색 | `#fafafa` | 배경, tertiaryColor |
| 밝은 회색 | `#f5f5f5` | 보조 배경, secondaryColor |
| 연한 회색 | `#eeeeee` | 섹션 배경, clusterBkg |
| 기본 회색 | `#e0e0e0` | 주요 노드, primaryColor |
| 중간 회색 | `#d6d6d6` | 강조 노드, taskBkgColor |
| 중간-어두운 회색 | `#bdbdbd` | 어두운 노드, activeTaskBkgColor |
| 어두운 회색 | `#9e9e9e` | 테두리, primaryBorderColor |
| 더 어두운 회색 | `#757575` | 선, lineColor |
| 진한 회색 | `#616161` | 강조 테두리 |
| 매우 진한 회색 | `#424242` | 제목, 강조 텍스트 |
| 거의 검정 | `#333333` | 본문 텍스트 |
| 검정 | `#212121` | 강조 텍스트 |

---

## 6. 실전 예시: MoSCoW 강의자료용 회색 테마

아래는 앞서 작성한 MoSCoW 강의자료를 회색 테마로 변환한 완성 예시입니다:

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#e0e0e0',
    'primaryTextColor': '#333333',
    'primaryBorderColor': '#9e9e9e',
    'lineColor': '#757575',
    'secondaryColor': '#f5f5f5',
    'tertiaryColor': '#fafafa',
    'background': '#fafafa',
    'mainBkg': '#e0e0e0',
    'secondBkg': '#f5f5f5',
    'nodeBorder': '#9e9e9e',
    'clusterBkg': '#eeeeee',
    'clusterBorder': '#bdbdbd',
    'titleColor': '#424242',
    'edgeLabelBackground': '#ffffff',
    'nodeTextColor': '#333333'
  }
} }%%

mindmap
  root((MoSCoW<br/>우선순위 결정 기법))
    M[Must Have<br/>필수]
      M1["프로젝트 없이는<br/>성립 불가능한 기능"]
      M2["법적/규제적<br/>요구사항 포함"]
      M3["최소 사용 가능<br/>부분집합(MUST)"]
      M4["⚠️ 전체 노력의<br/>최대 60% 권장"]
    S[Should Have<br/>중요]
      S1["매우 중요하지만<br/>필수는 아님"]
      S2["다음 릴리즈로<br/>미룰 수 있음"]
      S3["임시 해결책으로<br/>대체 가능"]
      S4["가치 제공은<br/>확실함"]
    C[Could Have<br/>선택]
      C1["있으면 좋은<br/>기능 (Nice-to-have)"]
      C2["사용자 경험<br/>향상 효과"]
      C3["리소스 여유 시<br/>포함 가능"]
      C4["⚠️ 전체 노력의<br/>약 20% 권장"]
    W[Won't Have<br/>제외]
      W1["현재 릴리즈에서<br/>제외됨"]
      W2["향후 릴리즈에서<br/>고려 가능"]
      W3["효과 대비<br/>투입 리소스 과다"]
      W4["범위 확장<br/>방지 (Scope Creep)"]
```

---

## 7. 적용 방법 요약

| 방법 | 사용 상황 | 코드 위치 |
|------|----------|----------|
| `%%{init}%%` | 전역 테마 설정 | 다이어그램 최상단 |
| `style` | 개별 노드 스타일링 | 노드 정의 후 |
| `classDef` + `class` | 반복 스타일 일괄 적용 | 다이어그램 상단에 정의 |
| `themeVariables` | 세부 색상 변수 조정 | `%%{init}%%` 내부 |

---

전경 텍스트를 검정색(#212121) 또는 흰색(#ffffff)으로 대비를 명확히 하여 두 테마를 다시 만들어 드리겠습니다.

---

# 🍊 오렌지 테마 (대비 개선)

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#fff3e0',
    'primaryTextColor': '#212121',
    'primaryBorderColor': '#ff9800',
    'lineColor': '#f57c00',
    'secondaryColor': '#ffe0b2',
    'tertiaryColor': '#fff8e1',
    'background': '#fff8e1',
    'mainBkg': '#fff3e0',
    'secondBkg': '#ffe0b2',
    'nodeBorder': '#ff9800',
    'clusterBkg': '#ffecb3',
    'clusterBorder': '#ffa726',
    'titleColor': '#e65100',
    'edgeLabelBackground': '#ffffff',
    'nodeTextColor': '#212121',
    'sectionBkgColor': '#fff3e0',
    'altSectionBkgColor': '#ffe0b2',
    'gridColor': '#ffb74d',
    'todayLineColor': '#e65100',
    'taskBkgColor': '#ffcc80',
    'taskTextColor': '#212121',
    'taskTextLightColor': '#424242',
    'taskTextOutsideColor': '#212121',
    'activeTaskBkgColor': '#ffa726',
    'activeTaskBorderColor': '#ef6c00',
    'section0': '#fff3e0',
    'section1': '#ffe0b2',
    'section2': '#ffcc80',
    'section3': '#ffb74d'
  }
} }%%

flowchart TD
    A[시작] --> B{조건 확인}
    B -->|Yes| C[처리 A]
    B -->|No| D[처리 B]
    C --> E[종료]
    D --> E
    
    style A fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#212121
    style B fill:#ffe0b2,stroke:#f57c00,stroke-width:2px,color:#212121
    style C fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#212121
    style D fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#212121
    style E fill:#ffcc80,stroke:#ef6c00,stroke-width:2px,color:#212121
```

---

### 오렌지 테마 - Mindmap 예시

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#fff3e0',
    'primaryTextColor': '#212121',
    'primaryBorderColor': '#ff9800',
    'lineColor': '#f57c00',
    'secondaryColor': '#ffe0b2',
    'tertiaryColor': '#fff8e1',
    'background': '#fff8e1'
  }
} }%%

mindmap
  root((MoSCoW<br/>우선순위 결정 기법))
    M[Must Have<br/>필수]
      M1["프로젝트 없이는<br/>성립 불가능한 기능"]
      M2["법적/규제적<br/>요구사항 포함"]
      M3["최소 사용 가능<br/>부분집합(MUST)"]
      M4["⚠️ 전체 노력의<br/>최대 60% 권장"]
    S[Should Have<br/>중요]
      S1["매우 중요하지만<br/>필수는 아님"]
      S2["다음 릴리즈로<br/>미룰 수 있음"]
      S3["임시 해결책으로<br/>대체 가능"]
      S4["가치 제공은<br/>확실함"]
    C[Could Have<br/>선택]
      C1["있으면 좋은<br/>기능 (Nice-to-have)"]
      C2["사용자 경험<br/>향상 효과"]
      C3["리소스 여유 시<br/>포함 가능"]
      C4["⚠️ 전체 노력의<br/>약 20% 권장"]
    W[Won't Have<br/>제외]
      W1["현재 릴리즈에서<br/>제외됨"]
      W2["향후 릴리즈에서<br/>고려 가능"]
      W3["효과 대비<br/>투입 리소스 과다"]
      W4["범위 확장<br/>방지 (Scope Creep)"]
```

---

### 오렌지 테마 - Gantt Chart 예시

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#fff3e0',
    'primaryTextColor': '#212121',
    'primaryBorderColor': '#ff9800',
    'lineColor': '#f57c00',
    'secondaryColor': '#ffe0b2',
    'tertiaryColor': '#fff8e1',
    'background': '#fff8e1',
    'sectionBkgColor': '#fff3e0',
    'altSectionBkgColor': '#ffe0b2',
    'gridColor': '#ffb74d',
    'todayLineColor': '#e65100',
    'taskBkgColor': '#ffcc80',
    'taskTextColor': '#212121',
    'taskTextLightColor': '#424242',
    'taskTextOutsideColor': '#212121',
    'activeTaskBkgColor': '#ffa726',
    'activeTaskBorderColor': '#ef6c00',
    'section0': '#fff3e0',
    'section1': '#ffe0b2',
    'section2': '#ffcc80',
    'section3': '#ffb74d'
  }
} }%%

gantt
    title 프로젝트 일정 - 오렌지 테마
    dateFormat  YYYY-MM-DD
    section Must Have
    기능 A 개발      :a1, 2026-08-03, 5d
    기능 B 개발      :a2, after a1, 5d
    section Should Have
    기능 C 개발      :b1, after a2, 3d
    기능 D 개발      :b2, after b1, 3d
    section Could Have
    기능 E 개발      :c1, after b2, 2d
```

---

### 오렌지 테마 - Pie Chart 예시

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#fff3e0',
    'primaryTextColor': '#212121',
    'primaryBorderColor': '#ff9800',
    'lineColor': '#f57c00',
    'secondaryColor': '#ffe0b2',
    'tertiaryColor': '#fff8e1',
    'background': '#fff8e1',
    'pieOuterStrokeWidth': '2px',
    'pieTitleTextSize': '25px',
    'pieTitleTextColor': '#e65100',
    'pieSectionTextSize': '17px',
    'pieSectionTextColor': '#212121',
    'pieStrokeColor': '#ff9800',
    'pieStrokeWidth': '2px'
  }
} }%%

pie title MoSCoW 분배 - 오렌지 테마
    "Must Have" : 60
    "Should Have" : 20
    "Could Have" : 20
```

---

### 오렌지 테마 - ClassDef 활용 예시

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#fff3e0',
    'primaryTextColor': '#212121',
    'primaryBorderColor': '#ff9800',
    'lineColor': '#f57c00',
    'secondaryColor': '#ffe0b2',
    'tertiaryColor': '#fff8e1',
    'background': '#fff8e1'
  }
} }%%

flowchart TD
    classDef orange1 fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#212121
    classDef orange2 fill:#ffe0b2,stroke:#f57c00,stroke-width:2px,color:#212121
    classDef orange3 fill:#ffcc80,stroke:#ef6c00,stroke-width:2px,color:#212121
    classDef orange4 fill:#ffb74d,stroke:#e65100,stroke-width:2px,color:#212121
    classDef highlight fill:#ffa726,stroke:#e65100,stroke-width:3px,color:#212121
    
    A[Must Have]:::orange1
    B[Should Have]:::orange2
    C[Could Have]:::orange3
    D[Won't Have]:::orange4
    E[핵심 기능]:::highlight
    
    A --> B --> C --> D
    A --> E
```

---

# 🌸 핑크 테마 (대비 개선)

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#fce4ec',
    'primaryTextColor': '#212121',
    'primaryBorderColor': '#e91e63',
    'lineColor': '#d81b60',
    'secondaryColor': '#f8bbd9',
    'tertiaryColor': '#fff0f5',
    'background': '#fff0f5',
    'mainBkg': '#fce4ec',
    'secondBkg': '#f8bbd9',
    'nodeBorder': '#e91e63',
    'clusterBkg': '#f48fb1',
    'clusterBorder': '#ec407a',
    'titleColor': '#c2185b',
    'edgeLabelBackground': '#ffffff',
    'nodeTextColor': '#212121',
    'sectionBkgColor': '#fce4ec',
    'altSectionBkgColor': '#f8bbd9',
    'gridColor': '#f48fb1',
    'todayLineColor': '#c2185b',
    'taskBkgColor': '#f8bbd9',
    'taskTextColor': '#212121',
    'taskTextLightColor': '#424242',
    'taskTextOutsideColor': '#212121',
    'activeTaskBkgColor': '#f48fb1',
    'activeTaskBorderColor': '#ad1457',
    'section0': '#fce4ec',
    'section1': '#f8bbd9',
    'section2': '#f48fb1',
    'section3': '#f06292'
  }
} }%%

flowchart TD
    A[시작] --> B{조건 확인}
    B -->|Yes| C[처리 A]
    B -->|No| D[처리 B]
    C --> E[종료]
    D --> E
    
    style A fill:#fce4ec,stroke:#e91e63,stroke-width:2px,color:#212121
    style B fill:#f8bbd9,stroke:#d81b60,stroke-width:2px,color:#212121
    style C fill:#fce4ec,stroke:#e91e63,stroke-width:2px,color:#212121
    style D fill:#fce4ec,stroke:#e91e63,stroke-width:2px,color:#212121
    style E fill:#f48fb1,stroke:#ad1457,stroke-width:2px,color:#212121
```

---

### 핑크 테마 - Mindmap 예시

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#fce4ec',
    'primaryTextColor': '#212121',
    'primaryBorderColor': '#e91e63',
    'lineColor': '#d81b60',
    'secondaryColor': '#f8bbd9',
    'tertiaryColor': '#fff0f5',
    'background': '#fff0f5'
  }
} }%%

mindmap
  root((MoSCoW<br/>우선순위 결정 기법))
    M[Must Have<br/>필수]
      M1["프로젝트 없이는<br/>성립 불가능한 기능"]
      M2["법적/규제적<br/>요구사항 포함"]
      M3["최소 사용 가능<br/>부분집합(MUST)"]
      M4["⚠️ 전체 노력의<br/>최대 60% 권장"]
    S[Should Have<br/>중요]
      S1["매우 중요하지만<br/>필수는 아님"]
      S2["다음 릴리즈로<br/>미룰 수 있음"]
      S3["임시 해결책으로<br/>대체 가능"]
      S4["가치 제공은<br/>확실함"]
    C[Could Have<br/>선택]
      C1["있으면 좋은<br/>기능 (Nice-to-have)"]
      C2["사용자 경험<br/>향상 효과"]
      C3["리소스 여유 시<br/>포함 가능"]
      C4["⚠️ 전체 노력의<br/>약 20% 권장"]
    W[Won't Have<br/>제외]
      W1["현재 릴리즈에서<br/>제외됨"]
      W2["향후 릴리즈에서<br/>고려 가능"]
      W3["효과 대비<br/>투입 리소스 과다"]
      W4["범위 확장<br/>방지 (Scope Creep)"]
```

---

### 핑크 테마 - Gantt Chart 예시

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#fce4ec',
    'primaryTextColor': '#212121',
    'primaryBorderColor': '#e91e63',
    'lineColor': '#d81b60',
    'secondaryColor': '#f8bbd9',
    'tertiaryColor': '#fff0f5',
    'background': '#fff0f5',
    'sectionBkgColor': '#fce4ec',
    'altSectionBkgColor': '#f8bbd9',
    'gridColor': '#f48fb1',
    'todayLineColor': '#c2185b',
    'taskBkgColor': '#f8bbd9',
    'taskTextColor': '#212121',
    'taskTextLightColor': '#424242',
    'taskTextOutsideColor': '#212121',
    'activeTaskBkgColor': '#f48fb1',
    'activeTaskBorderColor': '#ad1457',
    'section0': '#fce4ec',
    'section1': '#f8bbd9',
    'section2': '#f48fb1',
    'section3': '#f06292'
  }
} }%%

gantt
    title 프로젝트 일정 - 핑크 테마
    dateFormat  YYYY-MM-DD
    section Must Have
    기능 A 개발      :a1, 2026-08-03, 5d
    기능 B 개발      :a2, after a1, 5d
    section Should Have
    기능 C 개발      :b1, after a2, 3d
    기능 D 개발      :b2, after b1, 3d
    section Could Have
    기능 E 개발      :c1, after b2, 2d
```

---

### 핑크 테마 - Pie Chart 예시

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#fce4ec',
    'primaryTextColor': '#212121',
    'primaryBorderColor': '#e91e63',
    'lineColor': '#d81b60',
    'secondaryColor': '#f8bbd9',
    'tertiaryColor': '#fff0f5',
    'background': '#fff0f5',
    'pieOuterStrokeWidth': '2px',
    'pieTitleTextSize': '25px',
    'pieTitleTextColor': '#c2185b',
    'pieSectionTextSize': '17px',
    'pieSectionTextColor': '#212121',
    'pieStrokeColor': '#e91e63',
    'pieStrokeWidth': '2px'
  }
} }%%

pie title MoSCoW 분배 - 핑크 테마
    "Must Have" : 60
    "Should Have" : 20
    "Could Have" : 20
```

---

### 핑크 테마 - ClassDef 활용 예시

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#fce4ec',
    'primaryTextColor': '#212121',
    'primaryBorderColor': '#e91e63',
    'lineColor': '#d81b60',
    'secondaryColor': '#f8bbd9',
    'tertiaryColor': '#fff0f5',
    'background': '#fff0f5'
  }
} }%%

flowchart TD
    classDef pink1 fill:#fce4ec,stroke:#e91e63,stroke-width:2px,color:#212121
    classDef pink2 fill:#f8bbd9,stroke:#d81b60,stroke-width:2px,color:#212121
    classDef pink3 fill:#f48fb1,stroke:#ad1457,stroke-width:2px,color:#212121
    classDef pink4 fill:#f06292,stroke:#c2185b,stroke-width:2px,color:#212121
    classDef highlight fill:#ec407a,stroke:#880e4f,stroke-width:3px,color:#ffffff
    
    A[Must Have]:::pink1
    B[Should Have]:::pink2
    C[Could Have]:::pink3
    D[Won't Have]:::pink4
    E[핵심 기능]:::highlight
    
    A --> B --> C --> D
    A --> E
```

---

## 🎨 수정된 색상 팔레트 비교

### 오렌지 테마 색상 팔레트 (대비 개선)

| 용도 | 배경색 | 테두리색 | 텍스트색 |
|------|--------|----------|----------|
| 배경 | `#fff8e1` | - | - |
| 주요 노드 | `#fff3e0` | `#ff9800` | **검정 `#212121`** |
| 보조 노드 | `#ffe0b2` | `#f57c00` | **검정 `#212121`** |
| 강조 노드 | `#ffcc80` | `#ef6c00` | **검정 `#212121`** |
| 어두운 노드 | `#ffb74d` | `#e65100` | **검정 `#212121`** |
| 하이라이트 | `#ffa726` | `#e65100` | **검정 `#212121`** |
| 선 | - | `#f57c00` | - |
| 제목 | - | - | `#e65100` |

### 핑크 테마 색상 팔레트 (대비 개선)

| 용도 | 배경색 | 테두리색 | 텍스트색 |
|------|--------|----------|----------|
| 배경 | `#fff0f5` | - | - |
| 주요 노드 | `#fce4ec` | `#e91e63` | **검정 `#212121`** |
| 보조 노드 | `#f8bbd9` | `#d81b60` | **검정 `#212121`** |
| 강조 노드 | `#f48fb1` | `#ad1457` | **검정 `#212121`** |
| 어두운 노드 | `#f06292` | `#c2185b` | **검정 `#212121`** |
| 하이라이트 | `#ec407a` | `#880e4f` | **흰색 `#ffffff`** |
| 선 | - | `#d81b60` | - |
| 제목 | - | - | `#c2185b` |

---

## 💡 핵심 변경 사항

| 항목 | 이전 | 변경 후 |
|------|------|---------|
| `primaryTextColor` | `#e65100` (오렌지) / `#c2185b` (핑크) | `#212121` (검정) |
| `nodeTextColor` | `#bf360c` (오렌지) / `#880e4f` (핑크) | `#212121` (검정) |
| `taskTextColor` | `#e65100` (오렌지) / `#c2185b` (핑크) | `#212121` (검정) |
| `taskTextLightColor` | `#f57c00` (오렌지) / `#d81b60` (핑크) | `#424242` (진한 회색) |
| 하이라이트 노드 텍스트 | - | `#ffffff` (흰색) - 배경이 어두울 때 |

이제 모든 전경 텍스트는 **검정색(#212121)** 또는 **흰색(#ffffff)**으로 설정되어 배경색과 명확한 대비를 제공합니다. 특히 핑크 테마의 `highlight` 클래스는 배경색(`#ec407a`)이 어두우므로 텍스트를 흰색으로 설정하여 가독성을 확보했습니다.

## 💡 팁

1. **GitHub/GitLab Markdown**에서 사용 시: `%%{init}%%` 구문이 지원되지 않을 수 있으므로, `style`이나 `classDef`를 사용하세요.
2. **Mermaid Live Editor**에서 미리보기: [https://mermaid.live](https://mermaid.live)에서 실시간으로 색상을 테스트해보세요.
3. **일관성 유지**: 모든 다이어그램에 동일한 `themeVariables`를 복사-붙여넣기하여 일관된 디자인을 유지하세요.

이 방법들을 조합하여 원하는 회색 테마를 적용하시면 됩니다!
