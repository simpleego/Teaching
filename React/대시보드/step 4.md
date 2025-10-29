# step 4
> 4단계에서는 앱의 성능을 최적화하는 데 필수적인 \*\*`useMemo`\*\*와 **`useCallback`** 훅에 대해 알아보겠습니다.

-----

### \#\# ⚡ 4단계: 렌더링 최적화 - 통계 위젯 만들기

리액트 컴포넌트는 자신의 상태(state)나 부모로부터 받은 props가 변경될 때마다 다시 렌더링(re-render)됩니다. 대부분의 경우 이는 문제가 되지 않지만, 컴포넌트가 복잡한 연산을 수행하거나 자식 컴포넌트에 함수를 props로 계속 전달하면 불필요한 작업이 반복되어 성능 저하의 원인이 될 수 있습니다.

\*\*`useMemo`\*\*와 \*\*`useCallback`\*\*은 이러한 불필요한 반복 작업을 막아주는 "기억(memoization)" 도구입니다.

  * **`useMemo`**: 복잡한 연산의 **결과 값**을 기억합니다. 의존성 배열의 값이 변경될 때만 연산을 다시 수행하고, 그렇지 않으면 이전에 계산해둔 값을 재사용합니다.
  * **`useCallback`**: **함수 자체**를 기억합니다. 의존성 배열의 값이 변경될 때만 함수를 재생성합니다. 자식 컴포넌트에 props로 함수를 넘겨줄 때, 부모가 리렌더링되어도 함수가 불필요하게 재생성되는 것을 막아 자식 컴포넌트의 불필요한 리렌더링을 방지합니다.

이 개념들을 학습하기 위해 완료된 할 일의 개수를 보여주는 **통계 위젯**을 만들어 보겠습니다.

### \#\#\# 📊 1. `useMemo`를 사용한 통계 위젯 만들기 (`src/components/StatsWidget.js`)

먼저, `src/components` 폴더에 `StatsWidget.js` 파일을 새로 만들고 아래 코드를 작성합니다. 이 컴포넌트는 `todos` 배열을 props로 받아 완료된 항목의 수를 계산합니다.

```javascript
import React, { useMemo } from 'react';

function StatsWidget({ todos }) {
  // useMemo를 사용하여 복잡한 연산 결과 값을 기억(memoization)합니다.
  const completedCount = useMemo(() => {
    // 이 함수는 'todos' 배열이 변경될 때만 실행됩니다.
    console.log('완료된 할 일 개수 계산 중...');
    return todos.filter(todo => todo.completed).length;
  }, [todos]); // 의존성 배열에 'todos'를 넣습니다.

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>📊 통계</h3>
      <p>총 할 일: {todos.length}개</p>
      <p>완료된 할 일: {completedCount}개</p>
    </div>
  );
}

export default StatsWidget;
```

\*\*`useMemo`\*\*를 사용했기 때문에, `console.log`는 `todos` 배열에 변화가 있을 때만 (항목 추가, 삭제, 완료 상태 변경 시) 콘솔에 출력됩니다. 만약 `useMemo` 없이 그냥 계산했다면, 관련 없는 다른 상태(예: 테마 변경)가 변할 때도 불필요하게 이 계산을 반복했을 것입니다.

### \#\#\# 🔄 2. `useCallback`으로 이벤트 핸들러 최적화하기 (`src/components/TodoList.js`)

이제 `TodoList` 컴포넌트에서 자식 컴포넌트에게 전달될 함수들을 `useCallback`으로 감싸줍니다. 지금 당장은 자식 컴포넌트가 없어서 성능 차이를 체감하기 어렵지만, 나중에 `TodoItem` 같은 컴포넌트로 분리할 때를 대비한 매우 중요한 최적화 작업입니다.

`TodoList.js` 파일을 열고 `handleToggleComplete`와 `handleDeleteTodo` 함수를 아래와 같이 수정하세요.

```javascript
// TodoList.js 파일 상단에 useCallback을 import 합니다.
import React, { useState, useEffect, useReducer, useContext, useCallback } from 'react';
// ... (다른 import문 및 todoReducer 함수는 동일)

function TodoList() {
  // ... (useContext, useReducer, useState, useEffect 로직은 이전과 동일)

  // 3. 이벤트 핸들러 수정 (useCallback 적용)
  // dispatch 함수는 리액트에 의해 항상 동일성이 보장되므로 의존성 배열에 추가해도 됩니다.
  const handleToggleComplete = useCallback((id) => {
    dispatch({ type: 'TOGGLE_TODO', payload: { id } });
  }, []); // 의존성이 없으므로 빈 배열을 넣습니다.

  const handleDeleteTodo = useCallback((id) => {
    dispatch({ type: 'DELETE_TODO', payload: { id } });
  }, []); // 의존성이 없으므로 빈 배열을 넣습니다.

  // ... (handleInputChange, handleAddTodo 함수는 자식에게 전달되지 않으므로 그대로 둬도 괜찮습니다.)
  
  // 4. JSX 렌더링 부분 (이전과 동일)
  return (
    // ...
  );
}

export default TodoList;
```

`useReducer`의 `dispatch` 함수는 리액트가 그 정체성을 보장해주기 때문에 의존성 배열에 넣지 않거나, 명시적으로 `[]`로 비워두어도 안전합니다. 이렇게 `useCallback`으로 감싸진 함수들은 `TodoList` 컴포넌트가 리렌더링되어도 메모리에 저장된 동일한 함수를 계속 참조하게 됩니다.

### \#\#\# 🚀 3. 앱에 통계 위젯 추가하기 (`src/App.js`)

마지막으로 `App.js` 파일을 수정하여 새로 만든 `StatsWidget`를 `TodoList` 아래에 추가하고, `todos` 상태를 `TodoList`로부터 받아와 `StatsWidget`에 전달해야 합니다. 이를 위해 `TodoList`의 상태를 `App` 컴포넌트로 끌어올리는 **"상태 끌어올리기(Lifting State Up)"** 작업이 필요합니다.

**`TodoList.js` 수정 (상태 끌어올리기 준비)**

먼저 `TodoList.js`가 내부에서 관리하던 `todos` 상태 대신, props로 `todos`와 `dispatch`를 받도록 수정합니다.

```javascript
// src/components/TodoList.js

// ... (imports)

// TodoList 컴포넌트 외부로 todoReducer를 export 합니다.
export const todoReducer = (state, action) => {
  // ... (reducer 로직은 동일)
};

// props로 todos와 dispatch를 받도록 수정합니다.
function TodoList({ todos, dispatch }) {
  const { theme } = useContext(ThemeContext);
  const [newTodo, setNewTodo] = useState('');
  
  // 컴포넌트 내부의 useReducer와 useEffect는 App.js로 이동했으므로 삭제합니다.
  
  // ... (이벤트 핸들러 및 JSX는 동일)
}
```

**`App.js` 수정 (상태 관리 및 위젯 추가)**

이제 `App.js`가 `useReducer`를 통해 `todos` 상태를 직접 관리하고, `TodoList`와 `StatsWidget`에 필요한 데이터를 props로 내려줍니다.

```javascript
// src/App.js

import React, { useEffect, useReducer } from 'react';
import TodoList, { todoReducer } from './components/TodoList'; // todoReducer import
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggleButton from './components/ThemeToggleButton';
import StatsWidget from './components/StatsWidget'; // StatsWidget import
import './App.css';

function App() {
  // TodoList에 있던 useReducer 로직을 App 컴포넌트로 가져옵니다.
  const [todos, dispatch] = useReducer(todoReducer, []);

  // localStorage 연동 로직도 App 컴포넌트로 가져옵니다.
  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      dispatch({ type: 'SET_TODOS', payload: JSON.parse(storedTodos) });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  return (
    <ThemeProvider>
      <div className="App">
        <header className="App-header">
          <ThemeToggleButton />
          <h1>My Dashboard</h1>
          {/* TodoList에는 todos 상태와 dispatch 함수를 props로 전달합니다. */}
          <TodoList todos={todos} dispatch={dispatch} />
          {/* StatsWidget에는 todos 상태를 props로 전달합니다. */}
          <StatsWidget todos={todos} />
        </header>
      </div>
    </ThemeProvider>
  );
}

export default App;
```

### \#\#\# ✨ 결과 확인

이제 앱을 실행하면 To-Do 리스트 아래에 통계 위젯이 보입니다. 개발자 도구의 콘솔을 열어두고 To-Do 리스트에 항목을 추가하거나 변경해 보세요. '완료된 할 일 개수 계산 중...' 메시지는 `todos`가 변경될 때만 나타납니다. 하지만 **테마 변경 버튼**을 눌렀을 때는 이 메시지가 나타나지 않는 것을 확인할 수 있습니다. `useMemo`가 불필요한 연산을 성공적으로 막아준 것입니다\!

이것으로 4단계가 완료되었습니다. 다음 5단계에서는 `useRef`를 사용하여 DOM 요소에 직접 접근하는 방법을 배우게 됩니다. 계속 진행할까요?
