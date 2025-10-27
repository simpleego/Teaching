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
          Authorization: '967d3c4e8a114837ba9fc0cbf9d1f5e3' // 여기에 본인의 API 키 입력
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
