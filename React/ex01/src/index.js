import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import Library  from './Library';

const root = ReactDOM.createRoot(document.getElementById('root'));
const lib =[
  {
    title:'한밭도서관',
    location:'대전시 중구 문화동 100'
  },
  {
    title:'가수원도서관',
    location:'대전 서구 가수원동 456'
  },
  {
    title:'둔산도서관',
    location:'대전 서구 둔산동123'
  },
]

root.render(
  <React.StrictMode>    

    {lib.slice(0, 3).map((item, index) => (
      <Library key={index} title={item.title} location={item.location} />
    ))}

  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
