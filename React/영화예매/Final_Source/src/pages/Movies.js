import React, { useState, useEffect } from 'react'; // useState, useEffect import
import { Link } from 'react-router-dom';
// import { movies } from '../data/movies'; // <- 이 줄은 삭제합니다!
import './Movies.css';

const Movies = () => {
  // 컴포넌트의 상태로 영화 목록을 관리합니다. 초기값은 빈 배열.
  const [movies, setMovies] = useState([]);

  // useEffect를 사용하여 컴포넌트가 처음 렌더링될 때 API를 호출합니다.
  useEffect(() => {
    fetch('http://localhost:5000/api/movies') // 우리 API 서버에 요청
      .then(response => response.json()) // 응답을 JSON 형태로 파싱
      .then(data => setMovies(data)) // 받아온 데이터로 movies 상태 업데이트
      .catch(error => console.error("Error fetching movies:", error));
  }, []); // []를 넣어주면 마운트될 때 한 번만 실행됩니다.

  return (
    <div>
      <h1>영화 목록</h1>
      <div className="movie-list">
        {/* movies 상태를 기반으로 목록을 렌더링하는 부분은 동일합니다. */}
        {movies.map(movie => (
          <div key={movie.id} className="movie-item">
            <Link to={`/movies/${movie.id}`}>
              <img src={movie.poster} alt={movie.title} />
              <h3>{movie.title}</h3>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Movies;