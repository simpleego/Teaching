import React, { useState, useEffect } from 'react';

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
            <input name="title" value={movie.title} onChange={handleChange} placeholder="제목" required />
            <input name="genre" value={movie.genre} onChange={handleChange} placeholder="장르" required />
            <input name="director" value={movie.director} onChange={handleChange} placeholder="감독" required />
            <input name="releaseDate" type="date" value={movie.releaseDate} onChange={handleChange} required />
            <textarea name="description" value={movie.description} onChange={handleChange} placeholder="설명" required />
            <input type="file" onChange={handleFileChange} />
            {initialData.poster && !posterFile && <img src={initialData.poster} alt="Poster" width="100" />}
            <button type="submit">{initialData.id ? '수정하기' : '등록하기'}</button>
        </form>
    );
};

export default MovieForm;