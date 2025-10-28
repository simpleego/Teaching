import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <a href="/">영화 예매 사이트</a>
      </div>
      <nav className="nav">
        <ul>
          <li><a href="/movies">영화</a></li>
          <li><a href="/reserve">예매</a></li>
          <li><a href="/login">로그인</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;