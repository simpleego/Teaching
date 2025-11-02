import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Admin.css';

const Admin = () => {
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        const response = await fetch('http://localhost:5000/api/movies');
        const data = await response.json();
        setMovies(data);
    };

    const handleDelete = async (movieId) => {
        if (window.confirm('정말로 이 영화를 삭제하시겠습니까?')) {
            await fetch(`http://localhost:5000/api/movies/${movieId}`, {
                method: 'DELETE',
            });
            // 삭제 후 영화 목록 다시 불러오기
            fetchMovies();
        }
    };

    return (
        <div className="admin-container">
            <h1>영화 관리</h1>
            <Link to="/admin/add" className="add-movie-btn">새 영화 등록</Link>
            <table className="movie-table">
                <thead>
                    <tr>
                        <th>포스터</th>
                        <th>제목</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {movies.map(movie => (
                        <tr key={movie.id}>
                            <td><img src={movie.poster} alt={movie.title} width="50" /></td>
                            <td>{movie.title}</td>
                            <td>
                                <Link to={`/admin/edit/${movie.id}`} className="edit-btn">수정</Link>
                                <button onClick={() => handleDelete(movie.id)} className="delete-btn">삭제</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Admin;