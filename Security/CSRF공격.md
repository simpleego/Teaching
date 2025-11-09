# CSRF(Cross-Site Request Forgery) 공격 정리

## 1. CSRF 공격이란?
<img width="1010" height="505" alt="image" src="https://github.com/user-attachments/assets/0fe91d9e-b324-48a9-ae17-8e4a9ba0f87b" />

<img width="1902" height="1648" alt="image" src="https://github.com/user-attachments/assets/72f95df6-b760-4f6d-ae67-4543ece45fdc" />


**CSRF(Cross-Site Request Forgery)**는 웹 애플리케이션 취약점 공격 기법 중 하나로, **사용자가 자신의 의지와 무관하게 공격자가 의도한 행위를 특정 웹사이트에 요청하게 만드는 공격**입니다.

### 기본 개념
- **피해자**: 로그인된 정상 사용자
- **공격자**: 악의적인 요청을 유발하는 자
- **표적**: 사용자가 인증된 웹 애플리케이션

## 2. CSRF 공격 동작 방식

### 공격 시나리오
```
1. 사용자가 은행 웹사이트에 로그인 (인증 쿠키 저장)
2. 사용자가 악성 사이트 접속
3. 악성 사이트에서 은행으로 자동 송금 요청
4. 브라우저가 인증 쿠키를 함께 전송
5. 은행 서버는 정상 요청으로 판단하고 처리
```

### 공격 코드 예시
```html
<!-- 악성 사이트의 숨겨진 폼 -->
<body onload="document.forms[0].submit()">
  <form action="https://bank.com/transfer" method="POST">
    <input type="hidden" name="to" value="hacker">
    <input type="hidden" name="amount" value="1000000">
  </form>
</body>
```

```html
<!-- 이미지 태그를 이용한 공격 -->
<img src="https://bank.com/transfer?to=hacker&amount=1000000" width="0" height="0">
```

## 3. CSRF 공격의 특징

### 조건
- ✅ 사용자가 대상 사이트에 로그인된 상태
- ✅ 예측 가능한 요청 파라미터
- ✅ 쿠키 기반 인증 사용
- ✅ 상태 변경 작업(GET, POST, PUT, DELETE)

### 영향
- **권한 상승**: 사용자 권한으로 작업 수행
- **데이터 변조**: 정보 수정, 삭제
- **금전적 피해**: 불법 송금, 결제
- **개인정보 유출**: 프로필 변경

## 4. Spring Security에서의 CSRF 보호

### 기본 동작
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable());  // CSRF 보호 비활성화 (위험!)
        
        return http.build();
    }
}
```

### CSRF 보호 활성화 (기본값)
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(Customizer.withDefaults());  // CSRF 보호 활성화 (기본)
        
        return http.build();
    }
}
```

## 5. CSRF 토큰 메커니즘

### 동작 원리
1. **토큰 생성**: 서버가 세션별 고유 CSRF 토큰 생성
2. **토큰 전송**: HTML 폼에 hidden 필드로 포함
3. **토큰 검증**: 요청 시 서버가 토큰 유효성 검증
4. **토큰 불일치**: 요청 거부

### Thymeleaf에서의 CSRF 토큰 사용
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Transfer Money</title>
</head>
<body>
    <h1>송금</h1>
    <form th:action="@{/transfer}" method="post">
        <!-- CSRF 토큰 자동 포함 -->
        <input type="hidden" th:name="${_csrf.parameterName}" th:value="${_csrf.token}"/>
        
        <div>
            <label>받는 사람:</label>
            <input type="text" name="to" required/>
        </div>
        <div>
            <label>금액:</label>
            <input type="number" name="amount" required/>
        </div>
        <button type="submit">송금</button>
    </form>
</body>
</html>
```

### JavaScript(AJAX)에서의 CSRF 토큰 사용
```javascript
// meta 태그에서 토큰 추출
var csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
var csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

// AJAX 요청에 토큰 추가
$.ajax({
    url: '/transfer',
    type: 'POST',
    beforeSend: function(xhr) {
        xhr.setRequestHeader(csrfHeader, csrfToken);
    },
    data: {
        to: 'recipient',
        amount: 1000
    },
    success: function(response) {
        console.log('송금 성공');
    }
});
```

## 6. CSRF 보호 구성 옵션

### 커스텀 CSRF 구성
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .ignoringRequestMatchers("/api/public/**", "/webhook/**")
            );
        
        return http.build();
    }
}
```

### CSRF 토큰 저장소 옵션
```java
// 1. 세션 기반 (기본값)
HttpSessionCsrfTokenRepository sessionRepository = new HttpSessionCsrfTokenRepository();

// 2. 쿠키 기반 (Angular, React 등 SPA에 적합)
CookieCsrfTokenRepository cookieRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();

// 3. 커스텀 저장소
CsrfTokenRepository customRepository = new CustomCsrfTokenRepository();
```

## 7. CSRF 예외 처리

### 특정 경로 CSRF 보호 제외
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .ignoringRequestMatchers(
                    "/api/webhook/**",      // 웹훅 엔드포인트
                    "/api/public/**",       // 공개 API
                    "/actuator/**"          // 모니터링 엔드포인트
                )
            );
        
        return http.build();
    }
}
```

## 8. CSRF 방어 전략

### 1. **CSRF 토큰 사용** (가장 효과적)
- 모든 상태 변경 요청에 토큰 포함
- 세션별 무작위 값 사용

### 2. **SameSite 쿠키 속성**
```java
@Bean
public CookieSameSiteSupplier sameSiteSupplier() {
    return CookieSameSiteSupplier.ofStrict();
}
```

### 3. **이중 제출 쿠키**
- 쿠키와 요청 파라미터 모두에 토큰 포함

### 4. **Referer 검증**
```java
http
    .headers(headers -> headers
        .contentSecurityPolicy(csp -> csp
            .policyDirectives("referrer origin-when-cross-origin")
        )
    );
```

### 5. **사용자 상호작용 요구**
- 중요한 작업에 재인증 요구

## 9. 테스트 코드

### CSRF 테스트
```java
@SpringBootTest
@AutoConfigureTestDatabase
class CsrfTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void testCsrfProtection() {
        // CSRF 토큰 없이 POST 요청 시도
        ResponseEntity<String> response = restTemplate.postForEntity(
            "/transfer", 
            new TransferRequest("hacker", 1000000), 
            String.class
        );
        
        // CSRF 보호로 인해 거부되어야 함
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void testWithCsrfToken() {
        // CSRF 토큰 획득
        ResponseEntity<String> csrfResponse = restTemplate.getForEntity("/csrf", String.class);
        String csrfToken = // 토큰 추출 로직
        
        // CSRF 토큰과 함께 POST 요청
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-CSRF-TOKEN", csrfToken);
        
        HttpEntity<TransferRequest> request = new HttpEntity<>(
            new TransferRequest("friend", 1000), 
            headers
        );
        
        ResponseEntity<String> response = restTemplate.exchange(
            "/transfer", 
            HttpMethod.POST, 
            request, 
            String.class
        );
        
        // 정상 처리되어야 함
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
```

## 10. 실제 사례

### 은행 애플리케이션 CSRF 구성
```java
@Configuration
@EnableWebSecurity
public class BankSecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/login", "/public/**").permitAll()
                .requestMatchers("/transfer/**", "/account/**").authenticated()
            )
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .ignoringRequestMatchers("/api/webhook/bank-notifications")
            )
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/dashboard")
            );
        
        return http.build();
    }
}
```

CSRF는 현대 웹 애플리케이션에서 반드시 방어해야 할 주요 보안 위협입니다. Spring Security는 기본적으로 CSRF 보호를 제공하므로, 특별한 경우가 아니면 비활성화하지 않는 것이 좋습니다.
