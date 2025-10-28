import React, { useState, useEffect } from 'react'; // useState, useEffect import
import { useParams } from 'react-router-dom';
// import { movies } from '../data/movies'; // <- 이 줄은 삭제합니다!
import './MovieDetail.css';

const MovieDetail = () => {
  const { movieId } = useParams();
  // 영화 객체 하나를 상태로 관리합니다. 초기값은 null.
  const [movie, setMovie] = useState(null); 
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    fetch(`http://localhost:5000/api/movies/${movieId}`) // API에 특정 영화 요청
      .then(response => response.json())
      .then(data => {
        setMovie(data); // 받아온 데이터로 movie 상태 업데이트
        setLoading(false); // 로딩 완료
      })
      .catch(error => {
        console.error("Error fetching movie details:", error);
        setLoading(false); // 에러 발생 시에도 로딩 완료 처리
      });
  }, [movieId]); // movieId가 변경될 때마다 useEffect가 다시 실행됩니다.

  // 로딩 중일 때 보여줄 UI
  if (loading) {
    return <div>로딩 중...</div>;
  }

  // 영화 데이터가 없을 때 (잘못된 ID 등)
  if (!movie) {
    return <div>해당 영화를 찾을 수 없습니다.</div>;
  }

  // 로딩이 끝나고 영화 데이터가 있으면 상세 정보를 렌더링
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