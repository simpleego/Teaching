import React, { useState, useEffect } from 'react';
import './MovieForm.css';

const MovieForm = ({ onSubmit, initialData = {} }) => {
    const [movie, setMovie] = useState({
        title: '',
        genre: '',
        director: '',
        releaseDate: '',
        description: '',
    });
    const [posterFile, setPosterFile] = useState(null);

    useEffect(() => {
        if (initialData.id) {
            setMovie(initialData);
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMovie(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setPosterFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(movie).forEach(key => formData.append(key, movie[key]));
        if (posterFile) {
            formData.append('poster', posterFile);
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="movie-form">
            <label>영화제목</label><input name="title" value={movie.title} onChange={handleChange} placeholder="제목" required />
            <label>영화장르</label><input name="genre" value={movie.genre} onChange={handleChange} placeholder="장르" required />
            <label>영화감독</label><input name="director" value={movie.director} onChange={handleChange} placeholder="감독" required />
            <label>영화출시일</label><input name="releaseDate" type="date" value={movie.releaseDate} onChange={handleChange} required />
            <label>영화이야기</label><textarea rows="5" cols="40" name="description" value={movie.description} onChange={handleChange} placeholder="설명" required />
            <label>영화포스터</label><input type="file" onChange={handleFileChange} />
            {initialData.poster && !posterFile && <img src={initialData.poster} alt="Poster" width="100" />}
            <button type="submit">{initialData.id ? '수정하기' : '등록하기'}</button>
        </form>
    );
};

export default MovieForm;