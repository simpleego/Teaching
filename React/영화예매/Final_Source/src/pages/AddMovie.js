import React from 'react';
import { useNavigate } from 'react-router-dom';
import MovieForm from '../components/MovieForm';
import './MovieFormPage.css';

const AddMovie = () => {
    const navigate = useNavigate();

    const handleAddMovie = async (formData) => {
        await fetch('http://localhost:5000/api/movies', {
            method: 'POST',
            body: formData, // FormData는 Content-Type을 자동으로 설정해줌
        });
        navigate('/admin');
    };

    return (
        <div className="form-page-container">
            <h1>새 영화 등록</h1>
            <MovieForm onSubmit={handleAddMovie} />
        </div>
    );  
};

export default AddMovie;