# NameChange 상태관리
>  **함수형 컴포넌트**를 사용해서 `useState`와 `useEffect` 훅을 활용한 예제

---

## 🧪 예제: 이름 입력 컴포넌트 (`NameInput.js`)

```jsx
import React, { useState, useEffect } from 'react';

function NameInput() {
  const [name, setName] = useState('');

  // 컴포넌트가 처음 마운트될 때 실행
  useEffect(() => {
    console.log('컴포넌트가 마운트되었습니다.');
  }, []);

  // name이 변경될 때마다 실행
  useEffect(() => {
    if (name) {
      console.log(`이름이 변경되었습니다: ${name}`);
    }
  }, [name]);

  return (
    <div>
      <h2>이름을 입력하세요</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름 입력"
      />
      <p>안녕하세요, {name || '익명'}님!</p>
    </div>
  );
}

export default NameInput;
```

---

## 📦 `App.js`에서 사용하기

```jsx
import React from 'react';
import NameInput from './NameInput';

function App() {
  return (
    <div>
      <h1>React useState & useEffect 예제</h1>
      <NameInput />
    </div>
  );
}

export default App;
```

---

## 🔍 주요 포인트

- `useState`: 입력값을 상태로 관리합니다.
- `useEffect`: 생명주기처럼 동작하며, 의존성 배열을 통해 특정 상태 변화에 반응합니다.
  - 빈 배열 `[]` → 마운트 시 한 번만 실행
  - `[name]` → `name`이 변경될 때마다 실행

---

이런 방식으로 함수형 컴포넌트에서도 생명주기와 상태 관리를 깔끔하게 구현할 수 있어요. 혹시 타이머, API 호출, 또는 조건부 렌더링을 활용한 예제도 보고 싶으신가요?
