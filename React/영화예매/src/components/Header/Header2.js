import React from 'react';
import { Link } from 'react-router-dom'; // Link 컴포넌트 import
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">영화 예매 사이트</Link> {/* a 태그를 Link로 변경 */}
      </div>
      <nav className="nav">
        <ul>
          <li><Link to="/movies">영화</Link></li> {/* a 태그를 Link로 변경 */}
          <li><Link to="/reserve">예매</Link></li> {/* a 태그를 Link로 변경 */}
          {/* 로그인 기능은 나중에 구현 예정 */}
          <li><a href="#!">로그인</a></li> 
        </ul>
      </nav>
    </header>
  );
};

export default Header;