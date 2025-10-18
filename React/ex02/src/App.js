import React, { useState } from 'react';
import Library from './Library';
import hanbatImage from './images/hanbat.png'; // 경로에 맞게 import
import doonsanImage from './images/doonsan.jpg'; // 경로에 맞게 import
import kasoowonImage from './images/kasoowon.jpg'; // 경로에 맞게 import

const lib = [
  {
    title: '한밭도서관',
    location: '대전시 중구 문화동 100',
    image: hanbatImage,
    books: [
      { name: '파이썬 입문', numOfPage: 320 },
      { name: '자바스크립트 마스터', numOfPage: 450 }
    ]
  },
  {
    title: '가수원도서관',
    location: '대전 서구 가수원동 456',
    image: kasoowonImage,
    books: [
      { name: 'AWS 클라우드', numOfPage: 400 },
      { name: '리액트 제대로 배우기', numOfPage: 500 }
    ]
  },
  {
    title: '둔산도서관',
    location: '대전 서구 둔산동123',
    image: doonsanImage,
    books: [
      { name: '데이터 사이언스', numOfPage: 600 },
      { name: '머신러닝 실전', numOfPage: 550 }
    ]
  }
];

function App() {
  const [selectedLibrary, setSelectedLibrary] = useState(null);

  return (
    <div className="app">
      <h1>📚 도서관 메뉴</h1>
      <ul className="menu">
        {lib.map((item, index) => (
          <li key={index}>
            <p class="link" onClick={() => setSelectedLibrary(item)}>
              {item.title}
            </p>
            {/* <button onClick={() => setSelectedLibrary(item)}>
              {item.title}
            </button> */}
          </li>
        ))}
      </ul>

      <hr />

      {selectedLibrary ? (
        <Library
          title={selectedLibrary.title}
          location={selectedLibrary.location}
          books={selectedLibrary.books}
          image={selectedLibrary.image}
        />
      ) : (
        <p>도서관을 선택해주세요.</p>
      )}
    </div>
  );
}

export default App;