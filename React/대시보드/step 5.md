# step 5
> 이번에는 **`useRef`** 훅을 사용하여 DOM 요소에 직접 접근하고 제어하는 방법을 배워보겠습니다.

-----

### \#\# 🖱️ 5단계: DOM 직접 접근 - 입력창 자동 포커스 기능 구현

리액트는 가상 DOM(Virtual DOM)을 사용하여 UI를 효율적으로 업데이트하기 때문에, 개발자가 실제 DOM에 직접 접근하는 경우는 드뭅니다. 하지만 특정 상황에서는 DOM 요소에 직접 접근해야만 합니다. 예를 들어, 특정 input에 포커스를 주거나, 스크롤 위치를 제어하거나, 특정 요소의 크기나 위치를 읽어올 때입니다.

\*\*`useRef`\*\*는 바로 이럴 때 사용하는 훅입니다. `useRef`는 렌더링에 영향을 주지 않는 '저장 공간'을 제공하며, 주로 DOM 요소에 대한 참조(reference)를 보관하는 데 사용됩니다.

이 기능을 학습하기 위해 **To-Do 리스트에 새로운 항목을 추가한 후, 자동으로 입력창에 다시 포커스가 가도록** 만들어 보겠습니다.

### \#\#\# 💻 코드 수정 (`src/components/TodoList.js`)

`App.js`는 수정할 필요가 없습니다. `TodoList.js` 파일만 아래와 같이 수정해 주세요.

1.  `useRef`를 `react`에서 import 합니다.
2.  `useRef`를 호출하여 `inputRef`라는 참조 변수를 만듭니다.
3.  JSX의 `<input>` 태그에 `ref={inputRef}` 속성을 추가하여 참조를 연결합니다.
4.  `handleAddTodo` 함수 마지막에 `inputRef.current.focus()` 코드를 추가하여 포커스를 제어합니다.

<!-- end list -->

```javascript
// src/components/TodoList.js

// 1. useRef를 import 합니다.
import React, { useState, useContext, useCallback, useRef } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

// props로 todos와 dispatch를 받습니다.
function TodoList({ todos, dispatch }) {
  const { theme } = useContext(ThemeContext);
  const [newTodo, setNewTodo] = useState('');

  // 2. useRef를 사용하여 input 요소에 대한 참조를 생성합니다.
  // .current 프로퍼티가 우리가 참조할 실제 DOM 요소를 가리키게 됩니다.
  const inputRef = useRef(null);

  const themeStyles = {
    backgroundColor: theme === 'light' ? '#fff' : '#444',
    color: theme === 'light' ? '#000' : '#fff',
    border: `1px solid ${theme === 'light' ? '#ccc' : '#555'}`
  };

  const inputStyles = {
    backgroundColor: theme === 'light' ? '#fff' : '#555',
    color: theme === 'light' ? '#000' : '#fff',
  };

  const handleInputChange = (e) => {
    setNewTodo(e.target.value);
  };

  const handleAddTodo = () => {
    if (newTodo.trim() !== '') {
      dispatch({
        type: 'ADD_TODO',
        payload: {
          id: Date.now(),
          text: newTodo,
          completed: false
        }
      });
      setNewTodo('');
      // 4. 할 일을 추가한 후, inputRef의 current(현재 참조하는 요소)에 focus()를 호출합니다.
      inputRef.current.focus();
    }
  };
  
  // useCallback으로 감싼 함수들은 이전과 동일합니다.
  const handleToggleComplete = useCallback((id) => {
    dispatch({ type: 'TOGGLE_TODO', payload: { id } });
  }, [dispatch]);

  const handleDeleteTodo = useCallback((id) => {
    dispatch({ type: 'DELETE_TODO', payload: { id } });
  }, [dispatch]);


  return (
    <div style={{ ...{ padding: '20px', borderRadius: '8px', margin: '10px', transition: 'all 0.3s' }, ...themeStyles }}>
      <h2>📝 To-Do List</h2>
      <div>
        {/* 3. input 태그에 ref 속성을 추가하여 inputRef와 연결합니다. */}
        <input
          ref={inputRef}
          type="text"
          value={newTodo}
          onChange={handleInputChange}
          placeholder="새로운 할 일을 입력하세요"
          style={{ ...{ marginRight: '10px' }, ...inputStyles }}
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

### \#\#\# ✨ 결과 확인

이제 앱을 실행하고 To-Do 리스트에 새로운 할 일을 추가해 보세요. '추가' 버튼을 클릭하는 즉시, 입력창이 비워지고 다시 커서가 깜빡이며 포커스가 잡히는 것을 확인할 수 있습니다. 사용자가 다음 할 일을 바로 이어서 입력할 수 있게 되어 사용자 경험이 향상되었습니다.

이것으로 5단계가 완료되었습니다\! `useRef`를 통해 리액트의 제어 밖의 영역인 DOM과 직접 상호작용하는 방법을 배웠습니다.

이제 마지막 단계인, 반복되는 로직을 재사용 가능한 코드로 만드는 **'커스텀 훅(Custom Hook)'** 만들기가 남았습니다. 준비되시면 마지막 단계를 진행하겠습니다\!
