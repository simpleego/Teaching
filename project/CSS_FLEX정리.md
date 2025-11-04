# CSS_FLEX정리
## CSS Flexbox: 기본 원리, 사용법, 주의사항

Flexbox는 CSS의 레이아웃 모델 중 하나로, 요소들을 유연하게 배치하고 정렬하는 데 사용됩니다.

## 기본 원리

Flexbox는 **컨테이너(부모)**와 **항목(자식)**으로 구성됩니다:

```
[ Flex 컨테이너 ]
├── [ Flex 항목 1 ]
├── [ Flex 항목 2 ]
└── [ Flex 항목 3 ]
```

## 기본 사용법

### 1. Flex 컨테이너 설정

```css
.container {
  display: flex; /* 또는 inline-flex */
}
```

### 2. 주요 Flex 속성들

#### 컨테이너 속성

```css
.container {
  display: flex;
  
  /* 주축 방향 설정 */
  flex-direction: row | row-reverse | column | column-reverse;
  
  /* 줄 바꿈 설정 */
  flex-wrap: nowrap | wrap | wrap-reverse;
  
  /* 주축 정렬 */
  justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly;
  
  /* 교차축 정렬 */
  align-items: stretch | flex-start | flex-end | center | baseline;
  
  /* 여러 줄일 때 교차축 정렬 */
  align-content: stretch | flex-start | flex-end | center | space-between | space-around;
}
```

#### 항목 속성

```css
.item {
  /* 항목의 순서 */
  order: 0; /* 기본값, 숫자가 작을수록 앞에 위치 */
  
  /* 항목의 확대 비율 */
  flex-grow: 0; /* 기본값, 0이면 확대되지 않음 */
  
  /* 항목의 축소 비율 */
  flex-shrink: 1; /* 기본값, 0이면 축소되지 않음 */
  
  /* 항목의 기본 크기 */
  flex-basis: auto; /* 기본값 */
  
  /* 위 세 속성을 한번에 지정 */
  flex: 0 1 auto; /* flex-grow, flex-shrink, flex-basis */
  
  /* 개별 항목의 교차축 정렬 */
  align-self: auto | flex-start | flex-end | center | baseline | stretch;
}
```

## 실전 예제

### 기본 레이아웃

```css
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 300px;
  background-color: #f0f0f0;
}

.item {
  width: 100px;
  height: 100px;
  background-color: #4CAF50;
  margin: 10px;
}
```

### 반응형 카드 레이아웃

```css
.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.card {
  flex: 1 1 300px; /* 최소 300px, 가능한 확대 */
  max-width: 400px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
```

## 주의사항 및 팁

### 1. **브라우저 호환성**
- 모든 현대 브라우저에서 지원되지만, 오래된 브라우저를 지원해야 한다면 폴백 필요
- IE10, IE11에서는 부분적으로 지원 (접두어 필요)

### 2. **성능 고려사항**
- 매우 많은 수의 항목(1000개 이상)에서는 성능 저하 가능
- 모바일 장치에서 복잡한 flex 레이아웃은 렌더링 지연 발생 가능

### 3. **자주 하는 실수**

```css
/* ❌ 너무 많은 중첩 flex 컨테이너 */
.container > .item {
  display: flex; /* 필요할 때만 사용 */
}

/* ❌ 불필요한 flex 사용 */
.simple-layout {
  display: flex; /* 단순한 레이아웃은 block/inline으로 충분 */
}

/* ✅ 적절한 사용 */
.complex-layout {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

### 4. **반응형 디자인 팁**

```css
.container {
  display: flex;
  flex-direction: column; /* 모바일: 세로 배치 */
}

@media (min-width: 768px) {
  .container {
    flex-direction: row; /* 데스크탑: 가로 배치 */
  }
}
```

### 5. **텍스트 오버플로우 처리**

```css
.item {
  display: flex;
  min-width: 0; /* 텍스트 오버플로우 방지 */
}

.item-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### 6. **높이 관련 이슈**

```css
.container {
  display: flex;
  height: 100vh; /* 뷰포트 높이 */
}

.item {
  /* 자식 요소들이 컨테이너 높이를 채우도록 */
  align-items: stretch; /* 기본값 */
}
```

## Flexbox vs Grid

- **Flexbox**: 1차원 레이아웃 (한 방향)
- **Grid**: 2차원 레이아웃 (행과 열)

```css
/* Flexbox - 가로 방향 정렬에 적합 */
.navigation {
  display: flex;
  justify-content: space-between;
}

/* Grid - 복잡한 2차원 레이아웃에 적합 */
.page-layout {
  display: grid;
  grid-template-columns: 1fr 3fr;
  grid-template-rows: auto 1fr auto;
}
```

Flexbox는 간단한 레이아웃부터 복잡한 정렬까지 다양한 상황에서 유용하게 사용할 수 있는 강력한 도구입니다. 적절히 활용하면 반응형이고 유지보수가 쉬운 레이아웃을 만들 수 있습니다.
