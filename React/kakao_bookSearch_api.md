# kakao_bookSearch_api
>  React를 사용해서 외부 API로 도서 정보를 검색
> [Kakao 책 검색 API](https://developers.kakao.com/docs/latest/ko/daum-search/dev-guide#search-book)를 사용한다고 가정하겠습니다. (API 키가 필요합니다.)

---

## 📦 1. 프로젝트 준비

```bash
npx create-react-app book-search-app
cd book-search-app
npm install axios
```

---

## 🧠 2. 주요 컴포넌트 구조

- `App.js`: 전체 앱 구조
- `SearchBar.js`: 검색어 입력
- `BookList.js`: 검색 결과 출력

---

## 🧩 3. App.js

```jsx
import React, { useState } from 'react';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import BookList from './components/BookList';

function App() {
  const [books, setBooks] = useState([]);

  const searchBooks = async (query) => {
    try {
      const response = await axios.get('https://dapi.kakao.com/v3/search/book', {
        headers: {
          Authorization: 'KakaoAK YOUR_API_KEY' // 여기에 본인의 API 키 입력
        },
        params: {
          query: query
        }
      });
      setBooks(response.data.documents);
    } catch (error) {
      console.error('도서 검색 중 오류 발생:', error);
    }
  };

  return (
    <div>
      <h1>📚 도서 검색</h1>
      <SearchBar onSearch={searchBooks} />
      <BookList books={books} />
    </div>
  );
}

export default App;
```

---

## 🔍 4. SearchBar.js

```jsx
import React, { useState } from 'react';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="도서 제목을 입력하세요"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit">검색</button>
    </form>
  );
}

export default SearchBar;
```

---

## 📚 5. BookList.js

```jsx
import React from 'react';

function BookList({ books }) {
  return (
    <div>
      {books.length === 0 ? (
        <p>검색 결과가 없습니다.</p>
      ) : (
        <ul>
          {books.map((book, index) => (
            <li key={index} style={{ marginBottom: '20px' }}>
              <img src={book.thumbnail} alt={book.title} style={{ width: '100px' }} />
              <h3>{book.title}</h3>
              <p>{book.authors.join(', ')}</p>
              <p>{book.publisher}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BookList;
```

---

## ✅ 결과

- 사용자가 도서 제목을 입력하고 검색하면 Kakao API를 통해 도서 정보를 받아와 화면에 출력합니다.
- 썸네일, 제목, 저자, 출판사 정보가 표시됩니다.

---

원하시면 검색 결과에 페이지네이션, 상세 정보 보기, 즐겨찾기 기능도 추가할 수 있어요. 혹시 다른 API를 사용하고 싶거나 스타일링을 원하시면 말씀해주세요!
