# step 2  
네, 그럼요. 1단계에서 `useState`로 작성했던 To-Do 리스트 코드를 **`useReducer`를 사용해서 더 효율적으로 관리하는 방법**으로 변경해 드릴게요.

-----

### \#\# 🔄 2단계: `useReducer`로 To-Do 리스트 개선하기

`useState`는 상태가 단순할 때 유용하지만, 하나의 상태에 **다양한 종류의 업데이트**가 필요해지면 컴포넌트가 복잡해지기 시작합니다. 예를 들어, To-Do 리스트에는 '추가', '삭제', '완료 상태 변경' 등 여러 가지 상태 변경 로직이 있습니다.

\*\*`useReducer`\*\*는 이렇게 복잡한 상태 업데이트 로직을 컴포넌트 바깥의 **'리듀서(reducer)' 함수**로 분리해주는 훅입니다. 이를 통해 컴포넌트는 상태가 '어떻게' 변하는지 신경 쓸 필요 없이, 단지 어떤 '행동(action)'이 일어났는지만 알려주면 됩니다.

  * **상태 업데이트 로직 중앙화**: 모든 상태 변경 로직이 리듀서 함수 한 곳에 모여 있어 코드를 이해하고 관리하기 쉬워집니다.
  * **가독성 및 유지보수성 향상**: 컴포넌트 코드에서는 `dispatch({ type: 'ADD_TODO' })`처럼 간단하게 상태 변경을 요청할 수 있어 코드가 훨씬 깔끔해집니다.

이제 1단계 코드를 `useReducer`를 사용하도록 리팩토링해 보겠습니다.

### \#\#\# 💻 코드 (`src/components/TodoList.js`)

`src/components/TodoList.js` 파일을 아래 코드로 수정하거나 새로 작성해 보세요.

```javascript
import React, { useState, useEffect, useReducer } from 'reac
// 1. 리듀서(Reducer) 함수 정의
// 이 함수는 컴포넌트 바깥에 위치합니다.
// 현재 상태(state)와 행동(action) 객체를 받아 새로운 상태를 반환합니다.
const todoReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TODOS':
      return action.payload;
    case 'ADD_TODO':
      // 새로운 할 일을 기존 상태 배열에 추가하여 새로운 배열을 반환합니다.
      return [...state, action.payload];
    case 'TOGGLE_TODO':
      // map을 사용해 id가 일치하는 항목의 completed 값을 반전시킵니다.
      return state.map(todo =>
        todo.id === action.payload.id ? { ...todo, completed: !todo.completed } : todo
      );
    case 'DELETE_TODO':
      // filter를 사용해 id가 일치하는 항목을 제외한 새로운 배열을 반환합니다.
      return state.filter(todo => todo.id !== action.payload.id);
    default:
      // 정의되지 않은 action 타입에 대해서는 기존 상태를 그대로 반환합니다.
      return state;
  }
};


function TodoList() {
  // 2. useReducer 사용
  // useReducer는 [상태, dispatch함수]를 반환합니다.
  // 첫 번째 인자는 리듀서 함수, 두 번째 인자는 상태의 초기값입니다.
  const [todos, dispatch] = useReducer(todoReducer, []);

  // 입력창을 위한 상태는 여전히 useState로 관리하는 것이 간단하고 효율적입니다.
  const [newTodo, setNewTodo] = useState('');

  // localStorage 연동 로직은 이전과 동일합니다.
  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      // 컴포넌트가 처음 마운트될 때 localStorage의 데이터로 상태를 설정합니다.
      dispatch({ type: 'SET_TODOS', payload: JSON.parse(storedTodos) });
    }
  }, []); // 최초 렌더링 시 한 번만 실행

  useEffect(() => {
    // todos 상태가 변경될 때마다 localStorage에 저장합니다.
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]); // todos가 변경될 때마다 실행


  // 3. 이벤트 핸들러 수정
  // 이제 모든 상태 변경은 'dispatch'를 통해 이루어집니다.
  const handleInputChange = (e) => {
    setNewTodo(e.target.value);
  };

  const handleAddTodo = () => {
    if (newTodo.trim() !== '') {
      // 'ADD_TODO' 액션을 dispatch(발송)합니다.
      // payload에는 액션에 필요한 데이터(새로운 할 일 객체)를 담아 보냅니다.
      dispatch({
        type: 'ADD_TODO',
        payload: {
          id: Date.now(),
          text: newTodo,
          completed: false
        }
      });
      setNewTodo('');
    }
  };

  // 각 핸들러는 해당하는 액션 타입과 필요한 데이터를 담아 dispatch를 호출하기만 하면 됩니다.
  const handleToggleComplete = (id) => {
    dispatch({ type: 'TOGGLE_TODO', payload: { id } });
  };

  const handleDeleteTodo = (id) => {
    dispatch({ type: 'DELETE_TODO', payload: { id } });
  };


  // 4. JSX 렌더링 부분 (1단계와 동일)
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '10px' }}>
      <h2>📝 To-Do List (with useReducer)</h2>
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

### \#\#\# ✨ 변경된 점 요약

1.  **`todoReducer` 함수 추가**: `ADD_TODO`, `DELETE_TODO` 등 상태를 변경하는 모든 로직이 이 함수 안에 `switch` 문으로 정리되었습니다.
2.  **`useState` → `useReducer`**: `const [todos, setTodos] = useState([])` 부분이 `const [todos, dispatch] = useReducer(todoReducer, [])`로 변경되었습니다.
3.  **`setTodos` → `dispatch`**: 기존에 `setTodos(...)`를 호출하여 직접 상태를 변경하던 모든 부분이, 이제는 `dispatch({ type: '...' })`를 호출하여 어떤 행동이 일어났는지만 알려주는 방식으로 바뀌었습니다.

코드를 실행해보면 기능은 1단계와 완전히 동일하게 동작하지만, **컴포넌트 내부의 코드는 훨씬 간결해지고 상태 관리 로직은 한 곳에 모여 더 명확해진 것**을 확인할 수 있습니다.

이것으로 2단계가 완료되었습니다\! 다음 단계에서는 `useContext`를 사용해 여러 컴포넌트가 함께 사용하는 '전역 상태'를 관리하는 방법을 배우게 됩니다. 계속 진행할 준비가 되시면 알려주세요\!
