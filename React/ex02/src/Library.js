import React, { useEffect, useState } from "react";
import Book from "./Book";
import "./Library.css"; // 애니메이션 스타일 추가

function Library({ title, location, books, image }) {
  const [fadeClass, setFadeClass] = useState("library");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFadeClass("library fade-in");
    }, 10); // 약간의 지연으로 transition 유도
    return () => clearTimeout(timeout);
  }, [title]);

  return (
    <div className="library fade-in">
      <h1>{`도서관 이름은 ${title} 입니다.`}</h1>
      <h2>{`이 도서관의 위치는 ${location}에 있습니다.`}</h2>
      {books.map((book, index) => (
        <Book key={index} name={book.name} numOfPage={book.numOfPage} />
      ))}
      <img src={image} alt={title} style={{ width: '300px', borderRadius: '10px' }} />

    </div>
  );
}

export default Library;
