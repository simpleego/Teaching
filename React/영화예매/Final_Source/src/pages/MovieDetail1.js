import React from 'react';
import { useParams } from 'react-router-dom';
import { movies } from '../data/movies';
import './MovieDetail.css';

const MovieDetail = () => {
  const { movieId } = useParams(); // URL 파라미터 가져오기
  const movie = movies.find(m => m.id === parseInt(movieId));

  if (!movie) {
    return <div>해당 영화를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="movie-detail-container">
      <img src={movie.poster} alt={movie.title} className="movie-detail-poster" />
      <div className="movie-detail-info">
        <h1>{movie.title}</h1>
        <p><strong>장르:</strong> {movie.genre}</p>
        <p><strong>감독:</strong> {movie.director}</p>
        <p><strong>개봉일:</strong> {movie.releaseDate}</p>
        <p>{movie.description}</p>
      </div>
    </div>
  );
};

export default MovieDetail;