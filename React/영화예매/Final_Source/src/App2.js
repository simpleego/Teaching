import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Layout from './components/Layout';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Reserve from './pages/Reserve';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout 컴포넌트를 부모 경로로 설정 */}
        <Route path="/" element={<Layout />}>
          {/* 자식 경로들: index는 부모 경로와 동일한 경로를 의미 */}
          <Route index element={<Home />} /> 
          <Route path="movies" element={<Movies />} />
          <Route path="reserve" element={<Reserve />} />
        </Route>
        
        {/* 위에서 정의되지 않은 모든 경로는 NotFound 페이지로 연결 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;