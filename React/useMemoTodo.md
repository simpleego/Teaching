# useMemo  Todo
> jsonplaceholder의 todos 데이터를 활용한 React useMemo 예제를 소개할게요. 이 예제는 불필요한 연산을 줄이고 성능을 최적화하는 데 초점을 맞춰 있어.
> 특히 filter나 count 같은 연산이 반복적으로 실행되는 경우에 유용해.

---

🧠 useMemo를 활용한 Todo 분석 예제

📦 데이터 출처
- https://jsonplaceholder.typicode.com/todos에서 가져온 todo 리스트

💡 주요 기능
- 전체 todo 수, 완료된 todo 수, 미완료된 todo 수 계산
- 검색어에 따라 todo 필터링
- useMemo를 사용해 분석 연산 최적화

---

🧩 코드 예제

`jsx
import React, { useEffect, useState, useMemo } from "react";

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [search, setSearch] = useState("");

  // 데이터 불러오기
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/todos")
      .then((res) => res.json())
      .then((data) => setTodos(data));
  }, []);

  // 검색어에 따라 필터링
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) =>
      todo.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [todos, search]);

  // 분석 데이터 계산 (useMemo로 최적화)
  const { totalCount, doneCount, notDoneCount } = useMemo(() => {
    console.log("🔍 분석 연산 실행됨");
    const totalCount = filteredTodos.length;
    const doneCount = filteredTodos.filter((todo) => todo.completed).length;
    const notDoneCount = totalCount - doneCount;
    return { totalCount, doneCount, notDoneCount };
  }, [filteredTodos]);

  return (
    <div>
      <h2>📋 Todo List</h2>
      <input
        type="text"
        placeholder="검색어 입력"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div>
        <p>전체: {totalCount}</p>
        <p>완료: {doneCount}</p>
        <p>미완료: {notDoneCount}</p>
      </div>
      <ul>
        {filteredTodos.map((todo) => (
          <li key={todo.id}>
            <strong>{todo.completed ? "✅" : "⬜️"}</strong> {todo.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
`

---

🚀 왜 useMemo가 중요한가요?

- filteredTodos와 분석 데이터는 렌더링마다 다시 계산될 수 있음
- useMemo를 사용하면 의존성(todos, search)이 변경될 때만 연산 실행
- 성능 향상 + 불필요한 계산 방지

---

이 예제는 특히 리스트가 길거나 연산이 복잡할 때 효과가  있음
