# 리액트 사이트 구조
> 리액트로 구성된 간단한 웹사이트 예제를 만들어볼게요.
> 이 사이트는 다음과 같은 컴포넌트로 구성됩니다:

- `Header`: 상단 헤더
- `Menu`: 상단 메뉴
- `Footer`: 하단 푸터
- `Content1`, `Content2`, `Content3`: 본문 영역의 세 가지 내용 컴포넌트
- `App`: 전체를 조합하는 루트 컴포넌트

### 🧩 폴더 구조 예시
```
src/
├── components/
│   ├── Header.js
│   ├── Menu.js
│   ├── Footer.js
│   ├── Content1.js
│   ├── Content2.js
│   └── Content3.js
└── App.js
```

### 📦 각 컴포넌트 코드 예시

#### Header.js
```jsx
import React from 'react';

function Header() {
  return <header style={{ padding: '20px', background: '#eee' }}>헤더 영역</header>;
}

export default Header;
```

#### Menu.js
```jsx
import React from 'react';

function Menu() {
  return (
    <nav style={{ padding: '10px', background: '#ddd' }}>
      <ul style={{ display: 'flex', gap: '20px', listStyle: 'none' }}>
        <li>홈</li>
        <li>소개</li>
        <li>문의</li>
      </ul>
    </nav>
  );
}

export default Menu;
```

#### Footer.js
```jsx
import React from 'react';

function Footer() {
  return <footer style={{ padding: '20px', background: '#eee' }}>푸터 영역</footer>;
}

export default Footer;
```

#### Content1.js / Content2.js / Content3.js
```jsx
import React from 'react';

function Content1() {
  return <section style={{ padding: '20px' }}>첫 번째 콘텐츠</section>;
}

export default Content1;
```

(다른 Content 컴포넌트도 동일한 구조로 만들고 텍스트만 바꿔주세요)

#### App.js
```jsx
import React from 'react';
import Header from './components/Header';
import Menu from './components/Menu';
import Footer from './components/Footer';
import Content1 from './components/Content1';
import Content2 from './components/Content2';
import Content3 from './components/Content3';

function App() {
  return (
    <div>
      <Header />
      <Menu />
      <main>
        <Content1 />
        <Content2 />
        <Content3 />
      </main>
      <Footer />
    </div>
  );
}

export default App;
```

이제 `create-react-app`으로 프로젝트를 생성하고 위 컴포넌트들을 추가하면 기본적인 구조가 완성됩니다.
스타일을 더 꾸미거나 라우팅을 추가하고 싶다면 `react-router-dom`도 고려해볼 수 있어요.

---

메뉴에 따라 `Content1`, `Content2`, `Content3` 컴포넌트가 조건적으로 렌더링되도록 하려면 상태(state)를 사용해서 현재 선택된 콘텐츠를 관리해야 합니다.
아래는 `useState`를 활용한 예시입니다:

### ✅ App.js 수정 예시

```jsx
import React, { useState } from 'react';
import Header from './components/Header';
import Menu from './components/Menu';
import Footer from './components/Footer';
import Content1 from './components/Content1';
import Content2 from './components/Content2';
import Content3 from './components/Content3';

function App() {
  const [selectedContent, setSelectedContent] = useState('content1');

  const renderContent = () => {
    switch (selectedContent) {
      case 'content1':
        return <Content1 />;
      case 'content2':
        return <Content2 />;
      case 'content3':
        return <Content3 />;
      default:
        return <Content1 />;
    }
  };

  return (
    <div>
      <Header />
      <Menu onSelect={setSelectedContent} />
      <main>
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
```

---

### ✅ Menu.js 수정 예시

`Menu` 컴포넌트에서 `onSelect`를 props로 받아 클릭 시 해당 콘텐츠를 선택하도록 합니다.

```jsx
import React from 'react';

function Menu({ onSelect }) {
  return (
    <nav>
      <ul>
        <li><button onClick={() => onSelect('content1')}>Content 1</button></li>
        <li><button onClick={() => onSelect('content2')}>Content 2</button></li>
        <li><button onClick={() => onSelect('content3')}>Content 3</button></li>
      </ul>
    </nav>
  );
}

export default Menu;
```

---

이렇게 구성하면 메뉴 버튼을 클릭할 때마다 해당 콘텐츠 컴포넌트만 보여지게 됩니다. 필요하다면 애니메이션이나 라우팅 기능도 추가할 수 있어요. 
혹시 React Router를 활용한 방식도 궁금하신가요?


---

물론이죠! `react-router-dom`을 사용하면 각 콘텐츠를 URL 경로에 따라 렌더링할 수 있어 더 유연한 구조를 만들 수 있습니다. 아래는 `react-router-dom`을 활용한 예시입니다:

---

## 📦 1. 필요한 패키지 설치

```bash
npm install react-router-dom
```

---

## 🧩 2. App.js

```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Menu from './components/Menu';
import Footer from './components/Footer';
import Content1 from './components/Content1';
import Content2 from './components/Content2';
import Content3 from './components/Content3';

function App() {
  return (
    <Router>
      <div>
        <Header />
        <Menu />
        <main>
          <Routes>
            <Route path="/" element={<Content1 />} />
            <Route path="/content1" element={<Content1 />} />
            <Route path="/content2" element={<Content2 />} />
            <Route path="/content3" element={<Content3 />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
```

---

## 🧭 3. Menu.js

```jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Menu() {
  return (
    <nav>
      <ul>
        <li><Link to="/content1">Content 1</Link></li>
        <li><Link to="/content2">Content 2</Link></li>
        <li><Link to="/content3">Content 3</Link></li>
      </ul>
    </nav>
  );
}

export default Menu;
```

---

## ✅ 결과

- `/content1` → `Content1` 컴포넌트 렌더링
- `/content2` → `Content2` 컴포넌트 렌더링
- `/content3` → `Content3` 컴포넌트 렌더링
- `/` → 기본적으로 `Content1` 렌더링

---

이 방식은 URL 기반으로 콘텐츠를 보여주기 때문에 브라우저의 뒤로가기/앞으로가기 기능도 자연스럽게 동작합니다. 혹시 페이지 전환 시 애니메이션이나 상태 공유가 필요하다면 `useLocation`, `useNavigate` 같은 훅도 함께 사용할 수 있어요. 원하시면 그 부분도 도와드릴게요!



