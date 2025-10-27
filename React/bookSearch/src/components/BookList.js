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
