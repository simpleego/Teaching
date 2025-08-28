# 아이디중복확인_Ajax기반
좋아요, 박종천 님! 기존의 Spring Boot + Thymeleaf 기반 회원가입 프로젝트를 **JavaScript의 `fetch` API를 활용한 비동기 아이디 중복 체크** 방식으로 재구성해드릴게요. 핵심은 프론트엔드에서 아이디 입력 시 `fetch`로 서버에 중복 여부를 요청하고, 결과에 따라 메시지를 보여주는 구조입니다.

---

## 🧱 전체 구성 요약

| 구성 요소       | 설명 |
|----------------|------|
| **Backend**    | Spring Boot + JdbcTemplate + REST API (`/check-username`) |
| **Frontend**   | Thymeleaf + JavaScript `fetch` |
| **DB**         | MySQL (`users` 테이블) |

---

## 📦 1. Controller 수정 – REST API 추가

```java
@RestController
@RequestMapping("/api")
public class UserApiController {

    private final UserRepository userRepository;

    public UserApiController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/check-username")
    public ResponseEntity<Boolean> checkUsername(@RequestParam String username) {
        boolean exists = userRepository.existsByUsername(username);
        return ResponseEntity.ok(exists);
    }
}
```

> ✅ `/api/check-username?username=xxx` 요청 시 `true` 또는 `false` 반환

---

## 🧑‍💻 2. 기존 회원가입 Controller 유지

```java
@Controller
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/signup")
    public String signupForm(Model model) {
        model.addAttribute("user", new User());
        return "signup";
    }

    @PostMapping("/signup")
    public String signupSubmit(@ModelAttribute User user, Model model) {
        if (userRepository.existsByUsername(user.getUsername())) {
            model.addAttribute("error", "이미 존재하는 아이디입니다.");
            return "signup";
        }

        userRepository.save(user);
        model.addAttribute("message", "회원가입 성공!");
        return "signup";
    }
}
```

---

## 🖼️ 3. signup.html – fetch를 이용한 비동기 체크

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>회원가입</title>
    <meta charset="UTF-8">
    <script>
        async function checkUsername() {
            const username = document.getElementById("username").value;
            const resultText = document.getElementById("check-result");

            if (!username) {
                resultText.textContent = "";
                return;
            }

            try {
                const response = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`);
                const exists = await response.json();

                if (exists) {
                    resultText.textContent = "이미 사용 중인 아이디입니다.";
                    resultText.style.color = "red";
                } else {
                    resultText.textContent = "사용 가능한 아이디입니다.";
                    resultText.style.color = "green";
                }
            } catch (error) {
                resultText.textContent = "서버 오류 발생";
                resultText.style.color = "orange";
            }
        }
    </script>
</head>
<body>
<h2>회원가입</h2>

<form th:action="@{/signup}" th:object="${user}" method="post">
    <label>아이디:
        <input type="text" th:field="*{username}" id="username" oninput="checkUsername()" />
        <span id="check-result"></span>
    </label><br/>
    <label>비밀번호: <input type="password" th:field="*{password}" /></label><br/>
    <button type="submit">가입하기</button>
</form>

<p th:if="${error}" th:text="${error}" style="color:red;"></p>
<p th:if="${message}" th:text="${message}" style="color:green;"></p>
</body>
</html>
```

> 💡 `oninput="checkUsername()"` 이벤트로 실시간 중복 체크

---

## ⚙️ 4. application.yml (변경 없음)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/testdb
    username: root
    password: yourpassword
    driver-class-name: com.mysql.cj.jdbc.Driver
  thymeleaf:
    cache: false
```

---

## 🧾 5. MySQL 테이블

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
);
```

---

## ✅ 결과

- 사용자가 아이디 입력 시 `fetch`로 `/api/check-username` 호출
- 서버는 DB에서 중복 여부 확인 후 `true/false` 반환
- 프론트는 결과에 따라 메시지 표시 (빨간색/초록색)

---

이제 Ajax 없이도 fetch만으로 깔끔한 비동기 체크가 가능해졌어요. 혹시 이걸 더 확장해서 debounce 처리나 회원가입 버튼 비활성화까지 하고 싶다면, 한 번 더 도와드릴게요!
