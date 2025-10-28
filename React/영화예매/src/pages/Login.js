import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message); // "로그인 성공!"
                // 로그인 성공 시, 사용자 정보를 localStorage에 저장 (간단한 방식)
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/'); // 메인 페이지로 이동
                window.location.reload(); // 헤더 UI 업데이트를 위해 페이지 새로고침
            } else {
                alert(data.message); // "이메일 또는 비밀번호가..."
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('로그인 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>로그인</h2>
                <input
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">로그인</button>
            </form>
        </div>
    );
};

export default Login;