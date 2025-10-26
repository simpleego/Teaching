# Reducer
>  "[React Hooks에 취한다 - useReducer 확실히 정리해드려요 | 리액트 훅스 시리즈](http://www.youtube.com/watch?v=tdORpiegLg0)" 영상은 React의 `useReducer` 훅을 명확하게 설명하고, 이를 활용한 간단한 은행 앱과 출석부 앱을 통해 사용법을 소개합니다.

-----

### **`useReducer` 기본 개념**

`useReducer`는 `useState`처럼 컴포넌트의 상태를 생성하고 관리하는 훅이지만, 여러 하위 값을 포함하는 복잡한 상태를 다룰 때 코드를 더 깔끔하게 작성하고 유지보수하기 용이합니다 [[00:31](http://www.youtube.com/watch?v=tdORpiegLg0&t=31)]. `useReducer`는 다음 세 가지 주요 개념으로 구성됩니다. [[00:52](http://www.youtube.com/watch?v=tdORpiegLg0&t=52)]

  * **Reducer (리듀서)**: 상태를 업데이트하는 역할을 합니다. 마치 은행이 고객의 요구에 따라 거래 내역(상태)을 업데이트하는 것과 같습니다 [[01:42](http://www.youtube.com/watch?v=tdORpiegLg0&t=102)]. 컴포넌트의 상태를 변경하려면 반드시 리듀서를 통해야 합니다.
  * **Dispatch (디스패치)**: 상태 업데이트를 위해 리듀서에게 보내는 '요구' 행위입니다 [[02:05](http://www.youtube.com/watch?v=tdORpiegLg0&t=125)].
  * **Action (액션)**: 디스패치 안에 담겨 리듀서에게 전달되는 '요구의 내용'입니다. 예를 들어, "만원을 출금해 주세요"와 같은 구체적인 내용이 됩니다 [[02:13](http://www.youtube.com/watch?v=tdORpiegLg0&t=133)].

-----

### **`useReducer` 사용 흐름**

컴포넌트에서 상태를 업데이트하려면, 디스패치 함수를 호출하고 그 인자로 액션을 전달합니다. 그러면 리듀서가 호출되어 액션에 담긴 내용에 따라 상태를 업데이트합니다 [[03:00](http://www.youtube.com/watch?v=tdORpiegLg0&t=180)].

```jsx
import React, { useReducer } from 'react';

// 1. Reducer 함수 정의
function reducer(state, action) {
  // 액션 타입에 따라 상태를 업데이트하는 로직
  switch (action.type) {
    case 'DEPOSIT':
      return state + action.payload;
    case 'WITHDRAW':
      return state - action.payload;
    default:
      return state;
  }
}

function Counter() {
  // 2. useReducer 훅 사용: [상태, 디스패치 함수] = useReducer(리듀서, 초기값)
  const [money, dispatch] = useReducer(reducer, 0); // money는 현재 상태, dispatch는 액션을 보내는 함수

  const handleDeposit = () => {
    // 3. 디스패치 함수 호출: 액션 객체 전달
    dispatch({ type: 'DEPOSIT', payload: 1000 }); // 1000원 예금 액션
  };

  const handleWithdraw = () => {
    dispatch({ type: 'WITHDRAW', payload: 500 }); // 500원 출금 액션
  };

  return (
    <div>
      <h1>잔고: {money}원</h1>
      <button onClick={handleDeposit}>예금</button>
      <button onClick={handleWithdraw}>출금</button>
    </div>
  );
}

export default Counter;
```

-----

### **예제 코드: 은행 앱 구현**

영상에서는 `useReducer`를 사용하여 간단한 은행 앱을 만듭니다. 사용자가 입력한 금액만큼 예금하거나 출금하는 기능을 구현하며, `reducer` 함수 내에서 `action.type`에 따라 다른 상태 업데이트 로직을 처리합니다 [[03:32](http://www.youtube.com/watch?v=tdORpiegLg0&t=212)].

```jsx
import React, { useReducer, useState } from 'react';

// 액션 타입들을 상수로 정의하여 오타 방지 및 가독성 향상
const ACTION_TYPES = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAW: 'WITHDRAW',
};

// Reducer 함수
const reducer = (state, action) => {
  console.log('Reducer가 일을 합니다!', state, action);
  switch (action.type) {
    case ACTION_TYPES.DEPOSIT:
      return state + action.payload;
    case ACTION_TYPES.WITHDRAW:
      return state - action.payload;
    default:
      return state;
  }
};

function App() {
  const [number, setNumber] = useState(0); // input 값을 위한 useState
  const [money, dispatch] = useReducer(reducer, 0); // useReducer로 잔고(money) 상태 관리

  const onChangeNumber = (e) => {
    setNumber(parseInt(e.target.value));
  };

  return (
    <div>
      <h2>useReducer 은행에 오신 것을 환영합니다.</h2>
      <p>현재 잔고: {money}원</p>
      <input
        type="number"
        value={number}
        onChange={onChangeNumber}
        step="1000"
      />
      <button
        onClick={() => {
          // 예금 액션 디스패치
          dispatch({ type: ACTION_TYPES.DEPOSIT, payload: number });
        }}
      >
        예금
      </button>
      <button
        onClick={() => {
          // 출금 액션 디스패치
          dispatch({ type: ACTION_TYPES.WITHDRAW, payload: number });
        }}
      >
        출금
      </button>
    </div>
  );
}

export default App;
```

-----

### **예제 코드: 출석부 앱 구현 (복잡한 상태 관리)**

더 복잡한 상태를 다루는 예제로 출석부 앱을 만듭니다. 학생 추가, 삭제, 출석 여부 토글 기능을 구현하며, `useReducer`의 진정한 강점을 보여줍니다 [[13:38](http://www.youtube.com/watch?v=tdORpiegLg0&t=818)].

**`App.js` 코드:**

```jsx
import React, { useState, useReducer } from 'react';
import Student from './Student'; // Student 컴포넌트 임포트

// 액션 타입 상수
const ACTION_TYPES = {
  ADD_STUDENT: 'ADD_STUDENT',
  DELETE_STUDENT: 'DELETE_STUDENT',
  MARK_STUDENT: 'MARK_STUDENT',
};

// 초기 상태 정의
const initialState = {
  count: 0,
  students: [],
};

// Reducer 함수
const reducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.ADD_STUDENT:
      const newStudent = {
        id: Date.now(),
        name: action.payload.name,
        isHere: false,
      };
      return {
        count: state.count + 1,
        students: [...state.students, newStudent],
      };
    case ACTION_TYPES.DELETE_STUDENT:
      return {
        count: state.count - 1,
        students: state.students.filter(
          (student) => student.id !== action.payload.id
        ),
      };
    case ACTION_TYPES.MARK_STUDENT:
      return {
        count: state.count,
        students: state.students.map((student) => {
          if (student.id === action.payload.id) {
            return { ...student, isHere: !student.isHere };
          }
          return student;
        }),
      };
    default:
      return state;
  }
};

function App() {
  const [name, setName] = useState('');
  const [studentInfo, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <h1>출석부</h1>
      <p>총 학생수: {studentInfo.count}명</p>
      <input
        type="text"
        placeholder="이름을 입력해주세요"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        onClick={() => {
          dispatch({ type: ACTION_TYPES.ADD_STUDENT, payload: { name } });
          setName(''); // 입력 필드 초기화
        }}
      >
        추가
      </button>
      {studentInfo.students.map((student) => (
        <Student
          key={student.id}
          name={student.name}
          dispatch={dispatch}
          id={student.id}
          isHere={student.isHere}
        />
      ))}
    </div>
  );
}

export default App;
```

**`Student.js` 코드:**

```jsx
import React from 'react';

// 액션 타입 상수 (App.js에서 가져오는 것이 일반적)
const ACTION_TYPES = {
  DELETE_STUDENT: 'DELETE_STUDENT',
  MARK_STUDENT: 'MARK_STUDENT',
};

function Student({ name, dispatch, id, isHere }) {
  return (
    <div>
      <span
        onClick={() => {
          dispatch({
            type: ACTION_TYPES.MARK_STUDENT,
            payload: { id },
          });
        }}
        style={{
          textDecoration: isHere ? 'line-through' : 'none',
          color: isHere ? 'gray' : 'black',
          cursor: 'pointer',
        }}
      >
        {name}
      </span>
      <button
        onClick={() => {
          dispatch({ type: ACTION_TYPES.DELETE_STUDENT, payload: { id } });
        }}
      >
        삭제
      </button>
    </div>
  );
}

export default Student;
```

-----

이 영상은 `useReducer`의 개념부터 실제 애플리케이션에 적용하는 방법까지 상세하게 다루고 있어, 복잡한 상태 관리에 대한 이해를 돕는 데 아주 유용합니다.
http://googleusercontent.com/youtube_content/2
