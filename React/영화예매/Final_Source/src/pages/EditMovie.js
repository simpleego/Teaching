import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MovieForm from '../components/MovieForm';
import './MovieFormPage.css';

const EditMovie = () => {
    const { movieId } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);

    useEffect(() => {
        const fetchMovie = async () => {
            const response = await fetch(`http://localhost:5000/api/movies/${movieId}`);
            const data = await response.json();
            setMovie(data);
        };
        fetchMovie();
    }, [movieId]);

    const handleEditMovie = async (formData) => {
        await fetch(`http://localhost:5000/api/movies/${movieId}`, {
            method: 'PUT',
            body: formData,
        });
        navigate('/admin');
    };

    if (!movie) return <div>로딩 중...</div>;

    return (
        <div className="form-page-container">
            <h1>영화 정보 수정</h1>
            <MovieForm onSubmit={handleEditMovie} initialData={movie} />
        </div>
    );
};

export default EditMovie;