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

이제 `create-react-app`으로 프로젝트를 생성하고 위 컴포넌트들을 추가하면 기본적인 구조가 완성됩니다. 스타일을 더 꾸미거나 라우팅을 추가하고 싶다면 `react-router-dom`도 고려해볼 수 있어요.

원하는 디자인이나 기능이 있다면 더 구체적으로 도와줄게요!
