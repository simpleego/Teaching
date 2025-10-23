# fetchAPI
> JavaScript의 `fetch` API를 사용하여 [JSONPlaceholder](https://jsonplaceholder.typicode.com/users)에서 회원 목록을 가져와 출력하는 간단한 예제입니다.

### ✅ HTML + JavaScript 예제

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>회원 목록 출력</title>
</head>
<body>
  <h1>회원 목록</h1>
  <ul id="user-list"></ul>

  <script>
    // JSONPlaceholder에서 사용자 목록 가져오기
    fetch('https://jsonplaceholder.typicode.com/users')
      .then(response => {
        if (!response.ok) {
          throw new Error('네트워크 오류 발생');
        }
        return response.json();
      })
      .then(users => {
        const userList = document.getElementById('user-list');
        users.forEach(user => {
          const li = document.createElement('li');
          li.textContent = `${user.name} (${user.email})`;
          userList.appendChild(li);
        });
      })
      .catch(error => {
        console.error('데이터를 불러오는 중 오류 발생:', error);
      });
  </script>
</body>
</html>
```

### 🔍 설명
- `fetch()` 함수는 URL에 요청을 보내고 응답을 받아옵니다.
- 응답을 JSON으로 변환한 후, 각 사용자 정보를 `<li>` 요소로 만들어 `<ul>`에 추가합니다.
- 오류가 발생하면 콘솔에 메시지를 출력합니다.

이 코드를 브라우저에서 실행하면 JSONPlaceholder의 사용자 목록이 화면에 표시됩니다. 혹시 이 데이터를 테이블 형태로 출력하거나, 특정 필터를 적용하고 싶으신가요?
