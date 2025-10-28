import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Layout from './components/Layout';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Reserve from './pages/Reserve';
import NotFound from './pages/NotFound';
import MovieDetail from './pages/MovieDetail'; // MovieDetail 컴포넌트 import

import Signup from './pages/Signup'; // Signup 컴포넌트 import
import Login from './pages/Login';   // Login 컴포넌트 import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="movies" element={<Movies />} />
          <Route path="movies/:movieId" element={<MovieDetail />} />
          <Route path="reserve" element={<Reserve />} />
          <Route path="signup" element={<Signup />} /> {/* 회원가입 경로 추가 */}
          <Route path="login" element={<Login />} />   {/* 로그인 경로 추가 */}
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;