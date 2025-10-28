import React from 'react';
import { Link } from 'react-router-dom';
import { movies } from '../data/movies' //  '../data/movies'; // 목업 데이터 import
import './Movies.css'; // CSS 파일 import

const Movies = () => {
  return (
    <div>
      <h1>영화 목록</h1>
      <div className="movie-list">
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