# step 6
> 이번에는 지금까지 배웠던 훅들을 조합하여 반복되는 로직을 재사용 가능한 코드로 만드는 \*\*'커스텀 훅(Custom Hook)'\*\*을 만들어 보겠습니다.

-----

### \#\# 🛠️ 6단계: 로직 재사용 - 커스텀 훅 만들기

지금 `App.js` 컴포넌트를 보면, `useReducer`로 상태를 관리하는 로직과 `useEffect`를 사용해 그 상태를 `localStorage`와 동기화하는 로직이 함께 있습니다. 만약 다른 컴포넌트에서도 `localStorage`에 데이터를 저장하고 불러오는 기능이 필요하다면, 이 로직을 또 복사해서 붙여넣어야 할까요?

**커스텀 훅**은 바로 이런 문제를 해결합니다. `use`로 시작하는 함수를 직접 만들어, 상태 관련 로직을 컴포넌트로부터 완전히 분리하고 어디서든 재사용할 수 있게 만드는 것입니다.

우리는 `useReducer`의 기능에 `localStorage` 동기화 기능을 합친 **`useLocalStorageReducer`** 라는 커스텀 훅을 만들어 보겠습니다.

### \#\#\# 📁 1. 커스텀 훅 파일 생성하기 (`src/hooks/useLocalStorageReducer.js`)

먼저 `src` 폴더 안에 `hooks`라는 새 폴더를 만들고, 그 안에 `useLocalStorageReducer.js` 파일을 생성하여 아래 코드를 작성합니다.

```javascript
import { useReducer, useEffect } from 'react';

// 커스텀 훅: useLocalStorageReducer
// useReducer와 비슷하지만, 자동으로 localStorage와 상태를 동기화해줍니다.
function useLocalStorageReducer(key, defaultVal, reducer) {
  // 1. useReducer를 사용하여 상태(state)와 dispatch 함수를 생성합니다.
  // 초기 상태를 설정할 때, localStorage에 저장된 값이 있으면 그 값을 사용하고,
  // 없으면 defaultVal을 사용합니다.
  const [state, dispatch] = useReducer(reducer, defaultVal, () => {
    let val;
    try {
      val = JSON.parse(
        window.localStorage.getItem(key) || String(defaultVal)
      );
    } catch (e) {
      val = defaultVal;
    }
    return val;
  });

  // 2. useEffect를 사용하여 'state'가 변경될 때마다 localStorage에 자동으로 저장합니다.
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]); // key나 state가 변경될 때만 실행됩니다.

  // 3. useReducer와 동일하게 [상태, dispatch 함수]를 반환합니다.
  return [state, dispatch];
}

export { useLocalStorageReducer };
```

이 커스텀 훅은 세 개의 인자(`key`, `초기값`, `리듀서 함수`)를 받아서, `localStorage` 연동이라는 복잡한 과정을 내부적으로 모두 처리한 뒤, `useReducer`와 똑같은 `[state, dispatch]` 배열을 반환합니다.

### \#\#\# ✨ 2. `App.js` 리팩토링하기

이제 `App.js`에서 복잡하게 작성했던 `useReducer`와 `useEffect` 로직을 방금 만든 커스텀 훅으로 간단하게 교체해 보겠습니다.

`src/App.js` 파일을 아래와 같이 수정하세요. 코드가 얼마나 깔끔해지는지 확인해 보세요\!

```javascript
// src/App.js

import React from 'react';
// useEffect와 useReducer는 이제 App.js에서 직접 사용하지 않습니다.
import TodoList, { todoReducer } from './components/TodoList';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggleButton from './components/ThemeToggleButton';
import StatsWidget from './components/StatsWidget';
// 우리가 만든 커스텀 훅을 import 합니다.
import { useLocalStorageReducer } from './hooks/useLocalStorageReducer';
import './App.css';

function App() {
  // 기존의 useReducer와 useEffect 로직 전체가 이 한 줄로 대체됩니다!
  // 'todos'라는 key로 localStorage에 저장하고, 초기값은 [], 리듀서 함수는 todoReducer를 사용합니다.
  const [todos, dispatch] = useLocalStorageReducer('todos', [], todoReducer);

  // localStorage와 관련된 useEffect 훅들은 이제 필요 없으므로 삭제합니다.

  return (
    <ThemeProvider>
      <div className="App">
        <header className="App-header">
          <ThemeToggleButton />
          <h1>My Dashboard</h1>
          <TodoList todos={todos} dispatch={dispatch} />
          <StatsWidget todos={todos} />
        </header>
      </div>
    </ThemeProvider>
  );
}

export default App;
```

### \#\#\# ✅ 변경된 점

  * `App.js`에 있던 `useReducer`와 두 개의 `useEffect` 훅이 **단 한 줄의 커스텀 훅 호출**로 변경되었습니다: `useLocalStorageReducer('todos', [], todoReducer)`
  * 컴포넌트의 코드가 훨씬 간결해지고, "무엇을 하는지"가 명확하게 드러납니다. "어떻게" 동작하는지에 대한 복잡한 내용은 커스텀 훅 내부로 숨겨졌습니다.

### \#\#\# 🚀 최종 결과 및 정리

이제 앱을 실행해 보면 이전과 모든 기능이 완벽하게 동일하게 동작하는 것을 확인할 수 있습니다. 하지만 코드의 구조는 훨씬 더 깔끔하고 재사용성이 높아졌습니다.

이것으로 리액트 훅 정복을 위한 'MyDashboard' 프로젝트의 모든 단계를 마쳤습니다\!

1.  \*\*`useState`, `useEffect`\*\*로 동적인 컴포넌트를 만들었고,
2.  \*\*`useReducer`\*\*로 복잡한 상태 로직을 분리했으며,
3.  \*\*`useContext`\*\*로 전역 상태를 관리했고,
4.  \*\*`useMemo`, `useCallback`\*\*으로 성능을 최적화했으며,
5.  \*\*`useRef`\*\*로 DOM에 직접 접근했고,
6.  마지막으로 **커스텀 훅**을 만들어 로직을 재사용하는 방법까지 배웠습니다.

이 프로젝트를 통해 리액트 훅의 핵심 개념과 사용법을 종합적으로 학습하셨기를 바랍니다. 앞으로 리액트로 개발하실 때 큰 도움이 될 것입니다. 수고하셨습니다\!
