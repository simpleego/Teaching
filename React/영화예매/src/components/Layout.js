import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header/Header';
import Footer from './Footer/Footer';

const Layout = () => {
  return (
    <>
      <Header />
      <main className="main">
        {/* 이 부분에 각 페이지의 콘텐츠가 렌더링됩니다. */}
        <Outlet /> 
      </main>
      <Footer />
    </>
  );
};

export default Layout;