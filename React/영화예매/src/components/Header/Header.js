import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  // localStorage에서 사용자 정보를 가져옵니다. 없으면 null.
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user'); // 사용자 정보 삭제
    navigate('/'); // 홈으로 이동
    window.location.reload(); // 새로고침
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">영화 예매 사이트</Link>
      </div>
      <nav className="nav">
        <ul>
          <li><Link to="/movies">영화</Link></li>
          <li><Link to="/reserve">예매</Link></li>
          {user ? (
            // 로그인된 상태일 때
            <>
              <li><span>{user.email}님</span></li>
              <li><button onClick={handleLogout} className="logout-button">로그아웃</button></li>
            </>
          ) : (
            // 로그아웃된 상태일 때
            <>
              <li><Link to="/login">로그인</Link></li>
              <li><Link to="/signup">회원가입</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;