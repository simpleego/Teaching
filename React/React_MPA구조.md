# React_MPA구조

---

### 📁 프로젝트 구조
```
my-mpa-react-site/
├── public/
│   ├── index.html
│   ├── about.html
│   └── contact.html
├── src/
│   ├── index.js
│   ├── about.js
│   ├── contact.js
│   └── components/
│       ├── Header.js
│       └── Footer.js
├── package.json
└── webpack.config.js
```

---

### 📄 `public/index.html`
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>홈</title>
</head>
<body>
  <div id="root"></div>
  <script src="../dist/index.js"></script>
</body>
</html>
```

### 📄 `public/about.html`
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>소개</title>
</head>
<body>
  <div id="root"></div>
  <script src="../dist/about.js"></script>
</body>
</html>
```

### 📄 `public/contact.html`
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>문의</title>
</head>
<body>
  <div id="root"></div>
  <script src="../dist/contact.js"></script>
</body>
</html>
```

---

### 📄 `src/index.js`
```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import Header from './components/Header';
import Footer from './components/Footer';

const Home = () => (
  <>
    <Header />
    <main><h2>홈 페이지입니다.</h2></main>
    <Footer />
  </>
);

ReactDOM.render(<Home />, document.getElementById('root'));
```

### 📄 `src/about.js`
```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import Header from './components/Header';
import Footer from './components/Footer';

const About = () => (
  <>
    <Header />
    <main><h2>소개 페이지입니다.</h2></main>
    <Footer />
  </>
);

ReactDOM.render(<About />, document.getElementById('root'));
```

### 📄 `src/contact.js`
```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import Header from './components/Header';
import Footer from './components/Footer';

const Contact = () => (
  <>
    <Header />
    <main><h2>문의 페이지입니다.</h2></main>
    <Footer />
  </>
);

ReactDOM.render(<Contact />, document.getElementById('root'));
```

---

### 📄 `src/components/Header.js`
```jsx
import React from 'react';

const Header = () => (
  <header>
    <h1>My MPA 사이트</h1>
    <nav>
      <a href="/index.html">홈</a> | 
      <a href="/about.html">소개</a> | 
      <a href="/contact.html">문의</a>
    </nav>
  </header>
);

export default Header;
```

### 📄 `src/components/Footer.js`
```jsx
import React from 'react';

const Footer = () => (
  <footer>
    <p>© 2025 MySite</p>
  </footer>
);

export default Footer;
```

---

### 📄 `webpack.config.js` (MPA용 설정)
```js
const path = require('path');

module.exports = {
  entry: {
    index: './src/index.js',
    about: './src/about.js',
    contact: './src/contact.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  mode: 'development',
};
```

---

### 📄 `package.json` (필수 의존성)
```json
{
  "name": "my-mpa-react-site",
  "version": "1.0.0",
  "scripts": {
    "build": "webpack"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "webpack": "^5.88.0",
    "webpack-cli": "^5.1.4",
    "babel-loader": "^9.1.3",
    "@babel/core": "^7.23.0",
    "@babel/preset-env": "^7.23.0",
    "@babel/preset-react": "^7.22.15"
  },
  "babel": {
    "presets": ["@babel/preset-env", "@babel/preset-react"]
  }
}
```

---

이제 이 구조를 그대로 복사해서 프로젝트 폴더에 붙여넣고 `npm install` → `npm run build` 하면 `dist/` 폴더에 각 페이지용 JS가 생성됩니다. 그걸 `public/`의 HTML과 함께 웹서버에 배포하면 완성된 MPA 리액트 사이트가 됩니다!

필요하다면 이걸 기반으로 압축파일을 직접 만들어보시거나, GitHub에 올려서 공유할 수도 있어요. 원하시면 GitHub 업로드 방법도 알려드릴게요!
