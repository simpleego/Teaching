# **회원가입 → 로그인 → 회원정보 보기** 흐름을 구현하는 서블릿 기반 프로그램
> **JSP와 서블릿을 함께 사용하는 구조**이며, 회원 정보를 메모리에 저장하는 방식으로 간단하게 구성합니다.

---

## 🧩 전체 구성

| 기능 | 파일명 |
|------|--------|
| 회원가입 화면 | `register.jsp` |
| 회원가입 처리 서블릿 | `RegisterServlet.java` |
| 로그인 화면 | `login.jsp` |
| 로그인 처리 서블릿 | `LoginServlet.java` |
| 회원정보 보기 화면 | `welcome.jsp` |

---

## 🗂️ 1. 회원가입 화면 (`register.jsp`)

```html
<!DOCTYPE html>
<html>
<head><title>회원가입</title></head>
<body>
<h2>회원가입</h2>
<form action="register" method="post">
    아이디: <input type="text" name="id"><br>
    비밀번호: <input type="password" name="pw"><br>
    이름: <input type="text" name="name"><br>
    <input type="submit" value="가입하기">
</form>
</body>
</html>
```

---

## 🧮 2. 회원가입 처리 서블릿 (`RegisterServlet.java`)

```java
@WebServlet("/register")
public class RegisterServlet extends HttpServlet {
    private static Map<String, User> userDB = new HashMap<>(); // 메모리 기반 회원 저장소

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String id = request.getParameter("id");
        String pw = request.getParameter("pw");
        String name = request.getParameter("name");

        if (userDB.containsKey(id)) {
            response.sendRedirect("register.jsp?error=duplicate");
            return;
        }

        User user = new User(id, pw, name);
        userDB.put(id, user);

        request.getSession().setAttribute("userDB", userDB); // 선택적 저장
        response.sendRedirect("login.jsp");
    }
}
```

---

## 👤 사용자 정보 클래스 (`User.java`)

```java
public class User {
    private String id;
    private String pw;
    private String name;

    public User(String id, String pw, String name) {
        this.id = id;
        this.pw = pw;
        this.name = name;
    }

    public String getId() { return id; }
    public String getPw() { return pw; }
    public String getName() { return name; }
}
```

---

## 🔐 로그인 화면 (`login.jsp`)

```html
<!DOCTYPE html>
<html>
<head><title>로그인</title></head>
<body>
<h2>로그인</h2>
<form action="login" method="post">
    아이디: <input type="text" name="id"><br>
    비밀번호: <input type="password" name="pw"><br>
    <input type="submit" value="로그인">
</form>
</body>
</html>
```

---

## 🔑 로그인 처리 서블릿 (`LoginServlet.java`)

```java
@WebServlet("/login")
public class LoginServlet extends HttpServlet {
    private static Map<String, User> userDB = RegisterServlet.userDB; // 공유된 회원 DB

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String id = request.getParameter("id");
        String pw = request.getParameter("pw");

        User user = userDB.get(id);
        if (user != null && user.getPw().equals(pw)) {
            HttpSession session = request.getSession();
            session.setAttribute("user", user);
            response.sendRedirect("welcome.jsp");
        } else {
            response.sendRedirect("login.jsp?error=true");
        }
    }
}
```

---

## 🎉 회원정보 보기 화면 (`welcome.jsp`)

```jsp
<%@ page import="User" %>
<%@ page session="true" %>
<%
    User user = (User) session.getAttribute("user");
    if (user == null) {
        response.sendRedirect("login.jsp");
        return;
    }
%>
<!DOCTYPE html>
<html>
<head><title>회원정보</title></head>
<body>
<h2>환영합니다, <%= user.getName() %>님!</h2>
<p>아이디: <%= user.getId() %></p>
<p>이름: <%= user.getName() %></p>
<a href="logout.jsp">로그아웃</a>
</body>
</html>
```

---

## 🧹 로그아웃 기능 (선택) — `logout.jsp`

```jsp
<%
    session.invalidate();
    response.sendRedirect("login.jsp");
%>
```

---

이렇게 구성하면 회원가입 → 로그인 → 회원정보 보기까지의 흐름이 완성됩니다.  
혹시 이걸 DB 연동 방식으로 바꾸거나, 로그인 횟수 추적 기능을 추가하고 싶으신가요? 확장도 얼마든지 가능해요!
