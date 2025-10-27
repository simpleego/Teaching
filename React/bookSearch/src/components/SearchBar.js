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