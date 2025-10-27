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