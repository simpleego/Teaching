좋습니다, 박종천 님! `JdbcTemplate`은 Spring에서 제공하는 **JDBC를 간편하게 사용할 수 있도록 도와주는 클래스**입니다. Spring Boot에서도 아주 쉽게 사용할 수 있어요. 아래에 단계별로 정리해드릴게요.

---

## 🧱 1. 의존성 추가 (Spring Boot Starter JDBC)

Spring Boot에서는 `spring-boot-starter-jdbc`가 이미 포함되어 있거나, 명시적으로 추가할 수 있어요.

### ✅ Maven
```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>
```

### ✅ Gradle
```groovy
implementation 'org.springframework.boot:spring-boot-starter-jdbc'
```

그리고 사용할 DB 드라이버도 함께 추가해야 합니다. 예: MySQL

```groovy
implementation 'mysql:mysql-connector-java'
```

---

## ⚙️ 2. DB 설정 (`application.yml` 또는 `application.properties`)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: myuser
    password: mypass
    driver-class-name: com.mysql.cj.jdbc.Driver
```

---

## 🧩 3. JdbcTemplate 자동 주입

Spring Boot는 `DataSource`를 자동으로 설정하고, `JdbcTemplate`도 자동으로 Bean으로 등록해줍니다. 그냥 `@Autowired`로 주입해서 사용하면 됩니다.

```java
@Service
public class UserService {

    private final JdbcTemplate jdbcTemplate;

    public UserService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<User> findAllUsers() {
        String sql = "SELECT * FROM users";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(User.class));
    }
}
```

---

## 📦 4. DTO 클래스 예시

```java
public class User {
    private Long id;
    private String name;
    private String email;

    // Getters and Setters
}
```

---

## 🧪 5. 단일 조회 예시

```java
public User findById(Long id) {
    String sql = "SELECT * FROM users WHERE id = ?";
    return jdbcTemplate.queryForObject(sql, new BeanPropertyRowMapper<>(User.class), id);
}
```

---

## 📝 6. 데이터 삽입 예시

```java
public int insertUser(User user) {
    String sql = "INSERT INTO users (name, email) VALUES (?, ?)";
    return jdbcTemplate.update(sql, user.getName(), user.getEmail());
}
```

---

## 🧠 요약

| 항목 | 설명 |
|------|------|
| 의존성 | `spring-boot-starter-jdbc` |
| 설정 | `application.yml`에서 DB 정보 입력 |
| 사용법 | `JdbcTemplate`을 `@Autowired` 또는 생성자 주입 |
| 쿼리 | `query()`, `queryForObject()`, `update()` 등 다양한 메서드 제공 |

---

혹시 트랜잭션 처리나 커스텀 RowMapper, 또는 NamedParameterJdbcTemplate 같은 고급 기능도 궁금하시면 이어서 설명드릴게요. 어떤 쿼리를 구현하고 싶으신가요? 😊
