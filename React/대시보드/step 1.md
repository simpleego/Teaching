# step 1
>  'MyDashboard' 프로젝트의 첫 번째 단계인 **To-Do 리스트 만들기**에 대한 설명과 전체 코드를 바로 작성해 드리겠습니다.

-----

### \#\# 📝 1단계: To-Do 리스트 만들기 (useState, useEffect)

이 단계에서는 리액트 훅의 가장 기본이 되는 \*\*`useState`\*\*와 \*\*`useEffect`\*\*를 사용하여 사용자와 상호작용하는 동적인 컴포넌트를 만드는 방법을 배웁니다.

  * **`useState`**: 컴포넌트가 기억해야 할 값들, 즉 \*\*상태(state)\*\*를 관리하게 해줍니다. 예를 들어, '할 일 목록'이나 '입력창의 현재 값' 등을 `useState`로 관리할 수 있습니다.
  * **`useEffect`**: 컴포지션이 렌더링 된 후에 어떤 \*\*부수적인 작업(Side Effect)\*\*을 수행해야 할 때 사용합니다. 예를 들어, `localStorage`에 데이터를 저장하거나 API를 호출하는 등의 작업을 처리합니다.

이제 이 두 가지 훅을 사용하여 간단한 To-Do 리스트를 만들어 보겠습니다.

### \#\#\# 💻 코드 (`src/components/TodoList.js`)

먼저 `src/components` 폴더 안에 `TodoList.js` 파일을 생성하고 아래 코드를 붙여넣으세요.

```javascript
import React, { useState, useEffect } from 'react';

// TodoList 컴포넌트
function TodoList() {
  // 1. 상태 관리
  // 'todos'는 할 일 목록 배열, 'setTodos'는 이 배열을 변경하는 함수입니다.
  // useState의 인자로 초기값을 넣어줍니다. 여기서는 빈 배열을 넣었습니다.
  const [todos, setTodos] = useState([]);

  // 'newTodo'는 사용자가 입력창에 입력하는 텍스트, 'setNewTodo'는 이 텍스트를 변경하는 함수입니다.
  const [newTodo, setNewTodo] = useState('');

  // 2. useEffect를 사용한 데이터 연동 (Side Effect 처리)
  // 컴포넌트가 처음 렌더링될 때 localStorage에서 데이터를 불러옵니다.
  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    }
  }, []); // 의존성 배열이 비어있으면( []), 최초 렌더링 시에만 한 번 실행됩니다.

  // 'todos' 상태가 변경될 때마다 localStorage에 데이터를 저장합니다.
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]); // 의존성 배열에 'todos'를 넣어, 'todos'가 변경될 때마다 이 함수가 실행되도록 합니다.


  // 3. 이벤트 핸들러 함수
  // 입력창의 값이 변경될 때마다 'newTodo' 상태를 업데이트합니다.
  const handleInputChange = (e) => {
    setNewTodo(e.target.value);
  };

  // '추가' 버튼을 클릭했을 때 새로운 할 일을 목록에 추가합니다.
  const handleAddTodo = () => {
    if (newTodo.trim() !== '') { // 입력값이 비어있지 않을 때만 추가
      // 새로운 할 일 객체를 만듭니다.
      const newTodoItem = {
        id: Date.now(), // 고유한 id를 위해 현재 시간을 사용
        text: newTodo,
        completed: false,
      };
      // 'setTodos' 함수를 사용하여 기존 목록에 새로운 할 일을 추가합니다.
      // '...'는 Spread 연산자로, 기존 배열을 복사하고 새로운 항목을 뒤에 붙이는 방식입니다.
      setTodos([...todos, newTodoItem]);
      setNewTodo(''); // 입력창을 비웁니다.
    }
  };

  // 할 일 항목의 완료 상태를 변경(toggle)합니다.
  const handleToggleComplete = (id) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // 할 일을 삭제합니다.
  const handleDeleteTodo = (id) => {
    // filter 함수를 사용해 해당 id를 가진 항목만 제외하고 새로운 배열을 만듭니다.
    setTodos(todos.filter(todo => todo.id !== id));
  };


  // 4. JSX 렌더링 부분
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '10px' }}>
      <h2>📝 To-Do List</h2>
      <div>
        <input
          type="text"
          value={newTodo}
          onChange={handleInputChange}
          placeholder="새로운 할 일을 입력하세요"
          style={{ marginRight: '10px' }}
        />
        <button onClick={handleAddTodo}>추가</button>
      </div>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {todos.map(todo => (
          <li key={todo.id} style={{ display: 'flex', alignItems: 'center', margin: '5px 0' }}>
            <span
              onClick={() => handleToggleComplete(todo.id)}
              style={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                cursor: 'pointer',
                flexGrow: 1
              }}
            >
              {todo.text}
            </span>
            <button onClick={() => handleDeleteTodo(todo.id)} style={{ marginLeft: '10px' }}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;

```

### \#\#\# 🚀 실행하기

이제 `src/App.js` 파일을 열고, 방금 만든 `TodoList` 컴포넌트를 가져와서 렌더링합니다.

```javascript
import React from 'react';
import TodoList from './components/TodoList'; // TodoList 컴포넌트를 import 합니다.
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>My Dashboard</h1>
        {/* TodoList 컴포넌트를 여기에 추가합니다. */}
        <TodoList />
      </header>
    </div>
  );
}

export default App;

```

이제 터미널에서 `npm start` 또는 `yarn start` 명령어를 실행하면, 브라우저에 기본적인 To-Do 리스트가 나타나는 것을 확인할 수 있습니다. 할 일을 추가하고, 삭제하고, 완료 처리해보세요. 브라우저를 새로고침해도 데이터가 그대로 남아있는 것을 볼 수 있을 겁니다.

이것으로 1단계가 완료되었습니다\! 다음 2단계에서는 이 코드를 `useReducer`를 사용해서 더 효율적으로 관리하는 방법을 알아보겠습니다. 궁금한 점이 있다면 언제든지 질문해주세요.
