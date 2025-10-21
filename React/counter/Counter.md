# Counter 상태 관리 
> React에서 **state**와 **생명주기 메서드**를 사용하는 전체 코드

---

## 🧩 1. 프로젝트 구조

React 앱은 일반적으로 다음과 같은 구조를 가집니다:

```
my-react-app/
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   ├── Counter.js ← 우리가 만들 컴포넌트
│   └── index.js
├── package.json
└── ...
```

---

## 🛠️ 2. `Counter.js` – 클래스형 컴포넌트 작성

```jsx
import React from 'react';

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
    console.log('constructor');
  }

  componentDidMount() {
    console.log('componentDidMount: 컴포넌트가 마운트되었습니다.');
  }

  componentDidUpdate(prevProps, prevState) {
    console.log(`componentDidUpdate: count가 ${prevState.count}에서 ${this.state.count}로 변경되었습니다.`);
  }

  handleClick = () => {
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    console.log('render');
    return (
      <div>
        <h1>카운터: {this.state.count}</h1>
        <button onClick={this.handleClick}>증가</button>
      </div>
    );
  }
}

export default Counter;
```

---

## 📦 3. `App.js` – Counter 컴포넌트 사용

```jsx
import React from 'react';
import Counter from './Counter';

function App() {
  return (
    <div>
      <h2>React State & Lifecycle 예제</h2>
      <Counter />
    </div>
  );
}

export default App;
```

---

## 🚀 4. `index.js` – 앱 렌더링

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

---

## 🧪 5. 실행 방법

1. 프로젝트 생성:  
   ```bash
   npx create-react-app my-react-app
   cd my-react-app
   ```

2. 위의 코드를 각각 `Counter.js`, `App.js`, `index.js`에 작성

3. 실행:  
   ```bash
   npm start
   ```

브라우저에서 `http://localhost:3000`에 접속하면 버튼을 클릭할 때마다 숫자가 증가하고, 콘솔에는 생명주기 로그가 출력됩니다.

---

## 🎁 보너스: 함수형 컴포넌트 버전도 보고 싶다면 말씀해주세요!  
`useState`와 `useEffect`를 활용한 버전도 간단하고 직관적이에요. 원하시면 바로 보여드릴게요.
