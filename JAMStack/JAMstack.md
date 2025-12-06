# JAMstack 애플리케이션이란?

**JAMstack**은 **J**avaScript, **A**PIs, **M**arkup의 약자로, 클라이언트 사이드 JavaScript, 재사용 가능한 API, 그리고 사전에 빌드된 Markup을 사용하여 웹 애플리케이션을 구축하는 현대적 아키텍처입니다.

## 🔍 **JAMstack의 특징**

1. **사전 렌더링 (Pre-rendering)**: 빌드 시점에 정적 파일 생성
2. **디커플링 (Decoupling)**: 프론트엔드와 백엔드 분리
3. **CDN 호스팅**: 정적 파일을 CDN으로 전 세계에 배포
4. **API 기반**: 동적 기능은 API 호출로 처리

---

# 간단한 JAMstack 예제: 영화 검색 앱

## 1. 기본 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JAMstack 영화 검색 앱</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Arial', sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 30px;
        }
        
        header {
            text-align: center;
            margin-bottom: 40px;
            color: white;
        }
        
        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .subtitle {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .search-box {
            display: flex;
            justify-content: center;
            margin-bottom: 40px;
            gap: 10px;
        }
        
        #searchInput {
            width: 300px;
            padding: 15px 20px;
            border: none;
            border-radius: 50px;
            font-size: 1rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        #searchBtn {
            padding: 15px 30px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: bold;
            transition: all 0.3s;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        #searchBtn:hover {
            background: #45a049;
            transform: translateY(-2px);
        }
        
        .movies-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 25px;
        }
        
        .movie-card {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
            transition: transform 0.3s;
        }
        
        .movie-card:hover {
            transform: translateY(-10px);
        }
        
        .movie-poster {
            width: 100%;
            height: 350px;
            object-fit: cover;
        }
        
        .movie-info {
            padding: 20px;
        }
        
        .movie-title {
            font-size: 1.2rem;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        
        .movie-year {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 15px;
        }
        
        .loading {
            text-align: center;
            color: white;
            font-size: 1.2rem;
            padding: 20px;
        }
        
        .error {
            text-align: center;
            color: #ff6b6b;
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
        }
        
        @media (max-width: 768px) {
            .movies-grid {
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            }
            
            #searchInput {
                width: 100%;
            }
            
            .search-box {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🎬 JAMstack 영화 검색</h1>
            <p class="subtitle">JavaScript + API + Markup으로 만든 동적 정적 사이트</p>
        </header>
        
        <div class="search-box">
            <input 
                type="text" 
                id="searchInput" 
                placeholder="영화 제목을 입력하세요 (영어)"
                autocomplete="off"
            >
            <button id="searchBtn">검색</button>
        </div>
        
        <div id="loading" class="loading" style="display: none;">
            영화를 불러오는 중...
        </div>
        
        <div id="moviesContainer" class="movies-grid">
            <!-- 영화 카드가 여기에 동적으로 생성됩니다 -->
        </div>
        
        <div id="errorContainer" class="error" style="display: none;">
            <!-- 에러 메시지가 여기에 표시됩니다 -->
        </div>
    </div>

    <script>
        // OMDb API 키 (무료 버전 - 하루 1,000회 요청 제한)
        const API_KEY = 'your_api_key_here'; // 실제 사용 시 발급받은 키로 교체
        const API_URL = `https://www.omdbapi.com/?apikey=${API_KEY}&`;
        
        // DOM 요소
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const moviesContainer = document.getElementById('moviesContainer');
        const loadingElement = document.getElementById('loading');
        const errorContainer = document.getElementById('errorContainer');
        
        // 초기 인기 영화 로드
        document.addEventListener('DOMContentLoaded', () => {
            searchMovies('avengers');
        });
        
        // 검색 버튼 클릭 이벤트
        searchBtn.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                searchMovies(searchTerm);
            }
        });
        
        // 엔터 키 이벤트
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = searchInput.value.trim();
                if (searchTerm) {
                    searchMovies(searchTerm);
                }
            }
        });
        
        // 영화 검색 함수
        async function searchMovies(searchTerm) {
            // 로딩 상태 표시
            showLoading(true);
            clearError();
            clearMovies();
            
            try {
                // API 호출 (JAMstack의 'A' - API 부분)
                const response = await fetch(`${API_URL}s=${searchTerm}`);
                const data = await response.json();
                
                if (data.Response === 'True') {
                    // 영화 데이터 표시
                    displayMovies(data.Search);
                } else {
                    showError(data.Error || '영화를 찾을 수 없습니다.');
                }
            } catch (error) {
                showError('API 요청 중 오류가 발생했습니다.');
                console.error('API Error:', error);
            } finally {
                showLoading(false);
            }
        }
        
        // 영화 목록 표시 함수
        function displayMovies(movies) {
            if (!movies || movies.length === 0) {
                showError('검색 결과가 없습니다.');
                return;
            }
            
            // 각 영화 카드 생성 (JAMstack의 'M' - Markup 부분)
            movies.forEach(movie => {
                const movieCard = createMovieCard(movie);
                moviesContainer.appendChild(movieCard);
            });
        }
        
        // 영화 카드 생성 함수
        function createMovieCard(movie) {
            const card = document.createElement('div');
            card.className = 'movie-card';
            
            // 포스터 이미지 (없을 경우 대체 이미지)
            const poster = movie.Poster !== 'N/A' ? movie.Poster : 
                'https://via.placeholder.com/300x450?text=No+Poster';
            
            card.innerHTML = `
                <img src="${poster}" alt="${movie.Title}" class="movie-poster">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.Title}</h3>
                    <p class="movie-year">${movie.Year}</p>
                    <p class="movie-type">${movie.Type === 'movie' ? '🎬 영화' : '📺 시리즈'}</p>
                </div>
            `;
            
            // 카드 클릭 시 상세 정보 보기 (JAMstack의 'J' - JavaScript 부분)
            card.addEventListener('click', () => {
                alert(`선택한 영화: ${movie.Title}\n년도: ${movie.Year}\n타입: ${movie.Type}`);
            });
            
            return card;
        }
        
        // 로딩 상태 표시/숨기기
        function showLoading(show) {
            loadingElement.style.display = show ? 'block' : 'none';
        }
        
        // 에러 메시지 표시
        function showError(message) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
        }
        
        // 에러 메시지 지우기
        function clearError() {
            errorContainer.style.display = 'none';
        }
        
        // 영화 목록 지우기
        function clearMovies() {
            moviesContainer.innerHTML = '';
        }
    </script>
</body>
</html>
```

## 2. API 키 발급 방법

위 예제를 작동시키려면 OMDb API 키가 필요합니다:

1. [OMDb API 사이트](http://www.omdbapi.com/apikey.aspx) 방문
2. 무료 API 키 신청 (하루 1,000회 요청 가능)
3. `const API_KEY = 'your_api_key_here';` 부분을 발급받은 키로 교체

## 3. JAMstack 요소 분석

| 요소 | 설명 | 예제에서의 구현 |
|------|------|----------------|
| **J**avaScript | 클라이언트 사이드 로직 | `searchMovies()`, 이벤트 리스너 |
| **A**PIs | 외부 서비스와 통신 | OMDb API fetch 요청 |
| **M**arkup | 사전 렌더된 HTML | 정적 HTML 구조 + 동적 생성 카드 |

## 4. 배포 방법

이 예제를 JAMstack 방식으로 배포하는 단계:

```bash
# 1. GitHub 저장소 생성
git init
git add .
git commit -m "Initial commit"

# 2. GitHub에 푸시
git remote add origin https://github.com/사용자명/저장소명.git
git branch -M main
git push -u origin main

# 3. 배포 (선택사항)
# - GitHub Pages: Settings → Pages → Source 선택
# - Netlify: drag & drop
# - Vercel: GitHub 저장소 연결
```

## 5. JAMstack의 장점

이 예제에서 보여주는 JAMstack의 이점:

1. **빠른 로딩**: 정적 파일을 CDN에서 제공
2. **확장성**: API 호출로 동적 데이터 처리
3. **보안**: 정적 파일이므로 서버 사이드 공격 노출 적음
4. **개발 효율성**: 프론트엔드와 백엔드 분리 개발 가능

이 예제를 실행하면 API를 통해 실시간으로 영화 데이터를 가져오지만, 웹사이트 자체는 정적 파일로 배포되는 전형적인 JAMstack 애플리케이션을 경험할 수 있습니다.
