# step 3
> 이제 3단계로 넘어가 \*\*`useContext`\*\*를 사용하여 앱 전체에서 공유되는 \*\*'전역 상태'\*\*를 관리하는 방법을 배워보겠습니다.
> 이번 단계에서는 **다크 모드** 기능을 추가해 보겠습니다.

-----

### \#\# 🎨 3단계: 전역 상태 관리 - 다크 모드 기능 추가

앱의 여러 컴포넌트에서 동일한 데이터(예: 사용자 정보, 테마 설정)를 사용해야 할 때, props를 통해 단계별로 계속해서 전달하는 것은 매우 번거롭습니다. 이를 \*\*'Prop Drilling'\*\*이라고 합니다.

\*\*`useContext`\*\*는 이러한 Prop Drilling 문제에 대한 우아한 해결책입니다. `Context`를 사용하면 앱의 한 곳에서 상태를 정의하고, 어떤 컴포넌트에서든 필요할 때 바로 그 상태를 가져와 사용할 수 있습니다. 마치 모든 컴포넌트가 접근할 수 있는 '공용 데이터 창고'를 만드는 것과 같습니다.

### \#\#\# 📁 1. Context 생성하기 (`src/contexts/ThemeContext.js`)

먼저, `src` 폴더 안에 `contexts`라는 새 폴더를 만들고, 그 안에 `ThemeContext.js` 파일을 생성하여 아래 코드를 작성합니다.

```javascript
import React, { createContext, useState } from 'react';

// 1. Context 객체 생성
// createContext는 Provider와 Consumer를 포함하는 Context 객체를 만듭니다.
export const ThemeContext = createContext();

// 2. Provider 컴포넌트 생성
// 이 컴포넌트는 Context의 값을 제공하는 역할을 합니다.
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // 'light' 또는 'dark' 상태 관리

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Provider는 value prop을 통해 하위 컴포넌트들에게 현재 theme 상태와
  // theme을 변경할 수 있는 toggleTheme 함수를 전달합니다.
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### \#\#\# 🚀 2. 앱 전체에 Provider 적용하기 (`src/App.js`)

이제 `App.js` 파일을 수정하여 우리가 만든 `ThemeProvider`로 전체 앱을 감싸줍니다. 이렇게 하면 `App` 컴포넌트의 모든 자식 컴포넌트가 `ThemeContext`에 접근할 수 있게 됩니다.

```javascript
import React from 'react';
import TodoList from './components/TodoList';
import { ThemeProvider } from './contexts/ThemeContext'; // ThemeProvider import
import ThemeToggleButton from './components/ThemeToggleButton'; // 새로 만들 버튼 import
import './App.css';

function App() {
  return (
    // ThemeProvider로 전체 컴포넌트를 감싸줍니다.
    <ThemeProvider>
      <div className="App">
        <header className="App-header">
          {/* ThemeToggleButton 컴포넌트를 여기에 추가합니다. */}
          <ThemeToggleButton />
          <h1>My Dashboard</h1>
          <TodoList />
        </header>
      </div>
    </ThemeProvider>
  );
}

export default App;
```

### \#\#\# 🌗 3. Context를 사용하는 버튼 만들기 (`src/components/ThemeToggleButton.js`)

테마를 바꿀 수 있는 버튼 컴포넌트를 새로 만듭니다. 이 컴포넌트는 `useContext` 훅을 사용해 `ThemeContext`의 값(`theme`, `toggleTheme`)에 직접 접근합니다.

`src/components` 폴더에 `ThemeToggleButton.js` 파일을 만들고 아래 코드를 작성하세요.

```javascript
import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

function ThemeToggleButton() {
  // useContext 훅을 사용하여 ThemeContext의 값을 가져옵니다.
  // 이제 props를 받지 않아도 theme과 toggleTheme 함수를 직접 사용할 수 있습니다.
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button onClick={toggleTheme} style={{ position: 'absolute', top: '20px', right: '20px' }}>
      {theme === 'light' ? '🌙 다크 모드' : '☀️ 라이트 모드'}
    </button>
  );
}

export default ThemeToggleButton;
```

### \#\#\# 💅 4. Context를 사용하여 스타일 변경하기 (`src/components/TodoList.js`)

마지막으로, 기존의 `TodoList` 컴포넌트가 현재 테마에 따라 다른 스타일을 갖도록 수정합니다.

```javascript
// TodoList.js 파일 상단에 useContext와 ThemeContext를 import 합니다.
import React, { useState, useEffect, useReducer, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

// ... (todoReducer 함수는 이전과 동일) ...

function TodoList() {
  // useContext를 호출하여 현재 theme 값을 가져옵니다.
  const { theme } = useContext(ThemeContext);

  // 현재 테마에 따라 동적으로 스타일 객체를 정의합니다.
  const themeStyles = {
    backgroundColor: theme === 'light' ? '#fff' : '#444',
    color: theme === 'light' ? '#000' : '#fff',
    border: `1px solid ${theme === 'light' ? '#ccc' : '#555'}`
  };

  const inputStyles = {
    backgroundColor: theme === 'light' ? '#fff' : '#555',
    color: theme === 'light' ? '#000' : '#fff',
  };

  // ... (useReducer, useState, useEffect 로직은 이전과 동일) ...

  // 4. JSX 렌더링 부분
  // return 문의 최상위 div에 themeStyles를 적용합니다.
  return (
    <div style={{ ...{ padding: '20px', borderRadius: '8px', margin: '10px', transition: 'all 0.3s' }, ...themeStyles }}>
      <h2>📝 To-Do List (with useReducer)</h2>
      <div>
        <input
          type="text"
          value={newTodo}
          onChange={handleInputChange}
          placeholder="새로운 할 일을 입력하세요"
          style={{ ...{ marginRight: '10px' }, ...inputStyles }}
        />
        <button onClick={handleAddTodo}>추가</button>
      </div>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {/* ... (li 태그 렌더링 부분은 이전과 동일) ... */}
      </ul>
    </div>
  );
}

export default TodoList;
```

**※ `TodoList.js` 파일에서 `import`문, `useContext` 호출, `style` 객체 정의 및 적용 부분만 수정하면 됩니다.**

### \#\#\# ✨ 결과 확인

이제 `npm start`로 앱을 실행하고 우측 상단의 테마 변경 버튼을 클릭해 보세요. To-Do 리스트의 배경색과 글자색이 라이트 모드와 다크 모드에 따라 부드럽게 변경되는 것을 확인할 수 있습니다.

`TodoList` 컴포넌트와 `ThemeToggleButton` 컴포넌트는 서로 부모-자식 관계가 아님에도 불구하고, `useContext`를 통해 동일한 `theme` 상태를 공유하고 제어할 수 있게 되었습니다.

이것으로 3단계가 완료되었습니다\! 다음 4단계에서는 `useMemo`와 `useCallback`을 사용하여 앱의 성능을 최적화하는 방법을 배우게 됩니다. 준비되시면 말씀해주세요\!
