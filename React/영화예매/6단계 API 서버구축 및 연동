# 6단계 API 서버구축 및 연동. 
> 이전 단계에서 만든 프론트엔드에 실제 데이터를 공급할 **Node.js 백엔드 서버를 구축**하고, 리액트 앱이 이 서버와 통신하여 영화 데이터를 받아오도록 연동하는 작업을 진행하겠습니다.

이번 6단계는 크게 **백엔드(Node.js) 구현**과 **프론트엔드(React) 연동** 두 부분으로 나뉩니다.

-----

### **[1부] ⚙️ Node.js 백엔드 서버 구현**

먼저, 영화 데이터를 제공하는 간단한 API 서버를 만들겠습니다.

**1. 서버 프로젝트 폴더 생성 및 초기화**

기존 리액트 프로젝트 폴더(`movie-reservation-app`) **밖으로** 나와서, 백엔드 서버를 위한 새 폴더를 만들고 그 안에서 `npm` 프로젝트를 시작합니다.

```bash
# movie-reservation-app 폴더와 같은 위치에 생성
mkdir movie-api-server

# 새로 만든 폴더로 이동
cd movie-api-server

# npm 프로젝트 시작 (package.json 파일 생성)
npm init -y
```

**2. 필요 라이브러리 설치**

서버를 쉽게 만들 수 있게 해주는 **Express**와, 다른 주소(React 앱: `localhost:3000`)에서의 요청을 허용해주는 **CORS** 라이브러리를 설치합니다.

```bash
npm install express cors
```

**3. 목업 데이터 복사 및 서버 코드 작성**

리액트 프로젝트(`src/data/movies.js`)에 있던 목업 데이터를 이제 서버가 관리하도록 복사해옵니다.

`movie-api-server` 폴더 안에 `movies.js` 파일을 새로 만들고, 기존 목업 데이터 코드를 그대로 붙여넣습니다.

#### **`movie-api-server/movies.js`**

```javascript
// 리액트 프로젝트에 있던 목업 데이터와 동일합니다.
const movies = [
  {
    id: 1,
    title: "웡카",
    poster: "https://via.placeholder.com/200x300.png?text=Wonka",
    genre: "판타지, 드라마",
    director: "폴 킹",
    releaseDate: "2024-01-31",
    description: "세상에서 가장 달콤한 여정, 좋은 일은 모두 꿈에서부터 시작된다!"
  },
  {
    id: 2,
    title: "시민덕희",
    poster: "https://via.placeholder.com/200x300.png?text=Citizen+of+a+Kind",
    genre: "드라마",
    director: "박영주",
    releaseDate: "2024-01-24",
    description: "내 돈은 내가 잡는다! 보이스피싱범을 잡기 위한 평범한 시민의 통쾌한 추적극."
  },
  {
    id: 3,
    title: "외계+인 2부",
    poster: "https://via.placeholder.com/200x300.png?text=Alienoid:Part2",
    genre: "SF, 액션",
    director: "최동훈",
    releaseDate: "2024-01-10",
    description: "마침내 모든 것을 되찾기 위한 시간의 문이 열린다."
  },
];

module.exports = movies; // 다른 파일에서 사용할 수 있도록 export
```

  * 마지막 줄이 `export const movies`에서 `module.exports = movies;`로 바뀐 것에 주목하세요. Node.js의 기본 모듈 시스템 방식입니다.

이제 `movie-api-server` 폴더에 `server.js` 파일을 만들고 API 서버의 핵심 코드를 작성합니다.

#### **`movie-api-server/server.js`**

```javascript
const express = require('express');
const cors = require('cors');
const movies = require('./movies'); // 영화 데이터 가져오기

const app = express();
const port = 5000; // 리액트 앱(3000)과 다른 포트 사용

app.use(cors()); // CORS 미들웨어 사용

// API 엔드포인트 1: 전체 영화 목록 가져오기
app.get('/api/movies', (req, res) => {
  res.json(movies);
});

// API 엔드포인트 2: 특정 ID의 영화 정보 가져오기
app.get('/api/movies/:id', (req, res) => {
  const movieId = parseInt(req.params.id, 10);
  const movie = movies.find(m => m.id === movieId);

  if (movie) {
    res.json(movie);
  } else {
    res.status(404).send('Movie not found');
  }
});

app.listen(port, () => {
  console.log(`Movie API server listening at http://localhost:${port}`);
});
```

**4. 서버 실행**

터미널에서 아래 명령어로 방금 만든 Node.js 서버를 실행합니다.

```bash
node server.js
```

"Movie API server listening at http://localhost:5000" 라는 메시지가 보이면 성공입니다. 이제 이 터미널은 그대로 둔 채로 둡니다.

-----

### **[2부] 🖥️ 리액트 프론트엔드 연동**

이제 리액트 앱이 로컬 파일이 아닌, 방금 만든 API 서버에 데이터를 요청하도록 코드를 수정합니다.

**새로운 터미널을 열고** 기존 리액트 프로젝트 폴더(`movie-reservation-app`)로 이동하여 작업을 진행합니다.

**1. `Movies.js` 수정 (영화 목록 페이지)**

`src/pages/Movies.js` 파일을 열고, 데이터를 직접 `import` 하는 대신 서버에 요청하여 받아오도록 수정합니다. 리액트의 \*\*`useEffect`\*\*와 **`useState`** 훅을 사용합니다.

```javascript
import React, { useState, useEffect } from 'react'; // useState, useEffect import
import { Link } from 'react-router-dom';
// import { movies } from '../data/movies'; // <- 이 줄은 삭제합니다!
import './Movies.css';

const Movies = () => {
  // 컴포넌트의 상태로 영화 목록을 관리합니다. 초기값은 빈 배열.
  const [movies, setMovies] = useState([]);

  // useEffect를 사용하여 컴포넌트가 처음 렌더링될 때 API를 호출합니다.
  useEffect(() => {
    fetch('http://localhost:5000/api/movies') // 우리 API 서버에 요청
      .then(response => response.json()) // 응답을 JSON 형태로 파싱
      .then(data => setMovies(data)) // 받아온 데이터로 movies 상태 업데이트
      .catch(error => console.error("Error fetching movies:", error));
  }, []); // []를 넣어주면 마운트될 때 한 번만 실행됩니다.

  return (
    <div>
      <h1>영화 목록</h1>
      <div className="movie-list">
        {/* movies 상태를 기반으로 목록을 렌더링하는 부분은 동일합니다. */}
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
```

**2. `MovieDetail.js` 수정 (영화 상세 페이지)**

상세 페이지도 마찬가지로, `movieId`가 바뀔 때마다 서버에 해당 영화의 데이터를 요청하도록 수정합니다.

```javascript
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
```

-----

### **[3부] ✅ 실행 및 확인**

이제 모든 준비가 끝났습니다.

1.  **첫 번째 터미널**에서는 **Node.js API 서버**가 계속 실행 중인지 확인합니다 (`node server.js`).
2.  **두 번째 터미널**에서는 **리액트 개발 서버**를 실행합니다 (`npm start`).

브라우저에서 `http://localhost:3000`으로 접속하여 '영화' 메뉴를 클릭하고, 영화 포스터를 클릭하여 상세 페이지로 이동해보세요.

**이전과 똑같이 작동한다면 성공입니다\!** 눈에 보이는 결과는 같지만, 이제 데이터는 리액트 앱 내부의 정적 파일이 아니라, 우리가 직접 만든 외부 API 서버로부터 실시간으로 받아오는 방식으로 변경되었습니다.

**개발자 도구(F12)의 'Network' 탭**을 열어보면, 페이지를 이동할 때마다 `localhost:5000`으로 향하는 `movies` 요청이 기록되는 것을 실제로 확인할 수 있습니다.
