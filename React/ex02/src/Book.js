import React, { useState } from "react";
import './Book.css';

function Book({ name, numOfPage }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="book">
      <h1 onClick={() => setShowModal(true)}>{`책 이름: ${name}`}</h1>
      <h2>{`페이지 수: ${numOfPage}`}</h2>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{name}</h2>
            <p>총 페이지: {numOfPage} 페이지</p>
            <button onClick={() => setShowModal(false)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Book;