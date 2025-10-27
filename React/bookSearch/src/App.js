import React, { useState } from 'react';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  // ✨ 추가: 사용자가 선택한 책의 정보를 저장할 state
  const [selectedBook, setSelectedBook] = useState(null);

  const KAKAO_API_KEY = process.env.REACT_APP_KAKAO_API_KEY;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) {
      alert('검색어를 입력해주세요.');
      return;
    }

    // ✨ 추가: 새로운 검색 시, 기존에 선택된 책 정보 초기화
    setSelectedBook(null);
    setLoading(true);

    try {
      const response = await fetch(
        `https://dapi.kakao.com/v3/search/book?query=${query}&sort=accuracy&size=15`, // size를 15로 늘림
        {
          headers: {
            Authorization: `KakaoAK ${KAKAO_API_KEY}`,
          },
        }
      );

      if (!response.ok) throw new Error('API 호출에 실패했습니다.');

      const data = await response.json();
      setBooks(data.documents);
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
      alert('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ✨ 추가: 도서 목록에서 책을 클릭했을 때 실행될 함수
  const handleBookClick = (book) => {
    setSelectedBook(book); // 클릭된 책의 정보를 state에 저장
  };

  // ✨ 추가: 상세 보기 화면에서 목록으로 돌아가는 함수
  const handleGoBack = () => {
    setSelectedBook(null); // 선택된 책 정보를 초기화하여 목록으로 돌아감
  };

  return (
    <div className="App">
      <h1>📚 카카오 도서 검색</h1>
      
      {/* 상세 보기 화면에서는 검색창을 숨김 */}
      {!selectedBook && (
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
      )}

      {loading && <p>검색 중입니다...</p>}
      
      {/* ✨ 변경: selectedBook 값에 따라 다른 컴포넌트를 보여줌 */}
      {selectedBook ? (
        // selectedBook에 값이 있으면 상세 정보 컴포넌트를 렌더링
        <BookDetail book={selectedBook} onBack={handleGoBack} />
      ) : (
        // selectedBook이 null이면 도서 목록을 렌더링
        <div className="book-list">
          {books.map((book, index) => (
            // ✨ 변경: div 대신 button으로 감싸고 onClick 이벤트 추가
            <button key={`${book.isbn}-${index}`} className="book-item" onClick={() => handleBookClick(book)}>
              <img 
                src={book.thumbnail || 'https://via.placeholder.com/120x170?text=No+Image'} 
                alt={book.title} 
              />
              <div className="book-info">
                <h3>{book.title}</h3>
                <p><strong>저자:</strong> {book.authors.join(', ')}</p>
                <p><strong>출판사:</strong> {book.publisher}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ✨ 추가: 도서 상세 정보를 보여주는 새로운 컴포넌트
function BookDetail({ book, onBack }) {
  // 날짜 형식을 'YYYY년 MM월 DD일'로 변환
  const formattedDate = new Date(book.datetime).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="book-detail">
      <button onClick={onBack} className="back-button">&larr; 목록으로 돌아가기</button>
      <div className="detail-header">
        <img 
          src={book.thumbnail || 'https://via.placeholder.com/150x218?text=No+Image'} 
          alt={book.title} 
          className="detail-thumbnail"
        />
        <div className="detail-info">
          <h2>{book.title}</h2>
          <p><strong>저자:</strong> {book.authors.join(', ')}</p>
          <p><strong>출판사:</strong> {book.publisher}</p>
          <p><strong>출판일:</strong> {formattedDate}</p>
          <p><strong>가격:</strong> <span className="sale-price">{book.sale_price.toLocaleString()}원</span> (정가: {book.price.toLocaleString()}원)</p>
          <a href={book.url} target="_blank" rel="noopener noreferrer" className="purchase-link">구매하러 가기</a>
        </div>
      </div>
      <div className="detail-content">
        <h3>책 소개</h3>
        <p>{book.contents ? `${book.contents}...` : '제공되는 책 소개가 없습니다.'}</p>
      </div>
    </div>
  );
}

export default App;