# kakao_Book_Search
> 웹 브라우저에서 동작하는 \*\*리액트(React)\*\*를 사용하여 카카오 도서 검색 서비스 프로그램을 만들어 보겠습니다.

-----

### 사전 준비 사항

1.  **Node.js와 npm(또는 yarn) 설치**: 리액트 개발 환경을 구성하기 위해 필요합니다. [Node.js 공식 홈페이지](https://nodejs.org/)에서 LTS 버전을 설치해주세요.

2.  **카카오 REST API 키**: 이전과 동일하게 [카카오 개발자 사이트](https://developers.kakao.com/)에서 발급받은 **REST API 키**가 필요합니다.

-----

### 1단계: 리액트 프로젝트 생성 및 설정

먼저, 터미널(명령 프롬프트)을 열고 아래 명령어를 실행하여 새로운 리액트 프로젝트를 생성합니다.

```bash
npx create-react-app kakao-book-search
```

프로젝트 생성이 완료되면 해당 폴더로 이동합니다.

```bash
cd kakao-book-search
```

### 2단계: API 키 안전하게 관리하기

API 키를 코드에 직접 노출하는 것은 보안상 위험합니다. 리액트에서는 `.env` 파일을 사용하여 환경 변수로 관리하는 것이 좋습니다.

프로젝트의 최상위 폴더(src 폴더와 같은 위치)에 `.env` 라는 이름의 파일을 만드세요.
그리고 파일 안에 아래와 같이 API 키를 입력합니다. **반드시 `REACT_APP_`으로 시작해야 합니다.**

**`.env`**

```
REACT_APP_KAKAO_API_KEY=여기에_발급받은_REST_API_키를_입력하세요
```

**중요**: `.env` 파일을 수정한 후에는 **개발 서버를 재시작**해야 변경 사항이 적용됩니다.

-----

### 3단계: 도서 검색 컴포넌트 작성하기

이제 `src` 폴더에 있는 `App.js` 파일의 내용을 모두 지우고 아래의 코드로 대체합니다. 이 코드는 검색 UI를 만들고, API를 호출하여 결과를 화면에 표시하는 모든 로직을 담고 있습니다.

**`src/App.js`**

```javascript
import React, { useState } from 'react';
import './App.css'; // 스타일링을 위해 CSS 파일을 import 합니다.

function App() {
  // 상태(state) 관리
  const [query, setQuery] = useState(''); // 검색어
  const [books, setBooks] = useState([]); // 검색 결과
  const [loading, setLoading] = useState(false); // 로딩 상태

  // .env 파일에서 API 키를 가져옵니다.
  const KAKAO_API_KEY = process.env.REACT_APP_KAKAO_API_KEY;

  // 검색 버튼을 누르거나 Enter 키를 눌렀을 때 실행될 함수
  const handleSearch = async (e) => {
    e.preventDefault(); // form의 기본 동작(페이지 새로고침) 방지
    
    if (!query) {
      alert('검색어를 입력해주세요.');
      return;
    }

    setLoading(true); // 로딩 시작
    try {
      const response = await fetch(
        `https://dapi.kakao.com/v3/search/book?query=${query}&sort=accuracy&size=10`,
        {
          headers: {
            Authorization: `KakaoAK ${KAKAO_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('API 호출에 실패했습니다.');
      }

      const data = await response.json();
      setBooks(data.documents); // 검색 결과를 state에 저장
      
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
      alert('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  return (
    <div className="App">
      <h1>📚 카카오 도서 검색</h1>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="책 제목을 입력하세요"
          className="search-input"
        />
        <button type="submit" className="search-button">검색</button>
      </form>

      {/* 로딩 중일 때 메시지 표시 */}
      {loading && <p>검색 중입니다...</p>}
      
      {/* 검색 결과를 화면에 표시 */}
      <div className="book-list">
        {books.map((book, index) => (
          <div key={`${book.isbn}-${index}`} className="book-item">
            <a href={book.url} target="_blank" rel="noopener noreferrer">
              <img 
                src={book.thumbnail || 'https://via.placeholder.com/120x170?text=No+Image'} 
                alt={book.title} 
              />
            </a>
            <div className="book-info">
              <h3>
                <a href={book.url} target="_blank" rel="noopener noreferrer">
                  {book.title}
                </a>
              </h3>
              <p><strong>저자:</strong> {book.authors.join(', ')}</p>
              <p><strong>출판사:</strong> {book.publisher}</p>
              <p><strong>가격:</strong> {book.sale_price.toLocaleString()}원</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
```

-----

### 4단계: 스타일링 (CSS)

사용자 인터페이스를 보기 좋게 만들기 위해 `src` 폴더의 `App.css` 파일 내용을 아래 코드로 대체합니다.

**`src/App.css`**

```css
.App {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  text-align: center;
}

.search-form {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.search-input {
  width: 350px;
  padding: 12px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #ffd700;
}

.search-button {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  background-color: #FFDE00;
  color: #3C1E1E;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-button:hover {
  background-color: #f0d000;
}

.book-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: left;
}

.book-item {
  display: flex;
  align-items: flex-start;
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  gap: 20px;
}

.book-item img {
  width: 120px;
  height: 170px;
  object-fit: cover;
  border-radius: 4px;
}

.book-info {
  flex: 1;
}

.book-info h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 18px;
}

.book-info h3 a {
  text-decoration: none;
  color: #111;
}

.book-info h3 a:hover {
  text-decoration: underline;
}

.book-info p {
  margin: 6px 0;
  font-size: 14px;
  color: #555;
}
```

-----

### 5단계: 프로그램 실행

모든 파일 작성이 끝났으면, 터미널에서 아래 명령어를 입력하여 리액트 개발 서버를 시작합니다.

```bash
npm start
```

이제 웹 브라우저에서 `http://localhost:3000` 주소로 접속하면 직접 만든 도서 검색 서비스를 사용할 수 있습니다.
