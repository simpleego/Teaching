# Step01 - 기본설정

“**스프링부트 기반으로 스프링 시큐리티(Spring Security)**”를 학습
**1단계(입문 단계)** :  **웹 보안 개념**, **기본 코드**

---

## 🧩 1단계 목표: “스프링 시큐리티의 기본 작동 원리 이해하기”

---

### 🔒 1. 스프링 시큐리티(Spring Security)란?

> **Spring Security**는 스프링 기반 애플리케이션의 인증(Authentication)과 인가(Authorization)를 담당하는 프레임워크입니다.

#### ✅ 핵심 개념 두 가지

| 개념                     | 설명                            | 예시                           |
| ---------------------- | ----------------------------- | ---------------------------- |
| **인증(Authentication)** | 사용자가 누구인지 확인                  | 로그인 시 사용자 이름/비밀번호 확인         |
| **인가(Authorization)**  | 인증된 사용자가 어떤 리소스에 접근할 수 있는지 결정 | `ROLE_ADMIN`만 `/admin` 접근 허용 |

---

### 🧠 2. 웹 보안 기본 개념 정리

| 개념                                    | 설명                            | 예시                                     |
| ------------------------------------- | ----------------------------- | -------------------------------------- |
| **CSRF (Cross-Site Request Forgery)** | 인증된 사용자의 권한을 악용해 원치 않는 요청을 보냄 | “좋아요” 요청을 자동 전송하는 악성 폼                 |
| **XSS (Cross-Site Scripting)**        | 스크립트를 주입해 쿠키나 세션 탈취           | 댓글창에 `<script>alert('해킹')</script>` 삽입 |
| **세션(Session)**                       | 로그인된 사용자 정보를 서버에 저장           | 로그인 시 세션 ID 발급                         |
| **쿠키(Cookie)**                        | 클라이언트(브라우저)에 저장되는 작은 데이터      | 로그인 상태 유지용 토큰                          |

---

### 🏗️ 3. 스프링 시큐리티 기본 프로젝트 구조

```
spring-security-demo/
 ├─ src/main/java/com/example/securitydemo/
 │   ├─ SecurityDemoApplication.java
 │   ├─ config/
 │   │   └─ SecurityConfig.java
 │   └─ controller/
 │       └─ HomeController.java
 └─ build.gradle (또는 pom.xml)
```

---

### ⚙️ 4. Gradle 의존성 설정

#### 📄 `build.gradle`

```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-security'
}
```

---

### 🧩 5. 기본 시큐리티 동작 확인

#### 📄 `SecurityDemoApplication.java`

```java
package com.example.securitydemo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SecurityDemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(SecurityDemoApplication.class, args);
    }
}
```

#### 📄 `HomeController.java`

```java
package com.example.securitydemo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "홈 페이지입니다. 로그인하지 않으면 접근할 수 없습니다.";
    }
}
```

---

### 🧩 6. 시큐리티 설정 (기본 설정)

Spring Boot 3.x 이상에서는 **`SecurityFilterChain` Bean**으로 보안을 설정합니다.

#### 📄 `SecurityConfig.java`

```java
package com.example.securitydemo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 모든 요청은 인증 필요
            .authorizeHttpRequests(auth -> auth
                .anyRequest().authenticated()
            )
            // 기본 로그인 폼 제공
            .formLogin(Customizer.withDefaults())
            // 로그아웃 기능도 기본 제공
            .logout(Customizer.withDefaults());

        return http.build();
    }
}
```

---

### ▶️ 7. 실행 후 확인

1. `./gradlew bootRun` 실행

2. 콘솔에 자동 생성된 비밀번호 확인:

   ```
   Using generated security password: 4b86a79e-xxxx-xxxx
   ```

3. 브라우저에서 `http://localhost:8080` 접속
   👉 로그인 화면이 자동 생성됨

   * ID: `user`
   * PW: 콘솔에 표시된 비밀번호

4. 로그인 성공 시 → “홈 페이지입니다. 로그인하지 않으면 접근할 수 없습니다.” 출력

---

### 🧩 8. 기본 동작 요약

| 기능               | 설명                  |
| ---------------- | ------------------- |
| 로그인 페이지 자동 제공    | `/login` URL        |
| 기본 사용자 `user` 생성 | 랜덤 비밀번호 콘솔 출력       |
| 인증되지 않은 요청 차단    | 자동 필터 체인 적용         |
| 로그아웃             | `/logout` URL 자동 제공 |

---

### ✅ 1단계 정리

| 학습 항목           | 설명                            |
| --------------- | ----------------------------- |
| 스프링 시큐리티의 핵심 개념 | 인증 / 인가 / 필터 체인               |
| 기본 설정 방식        | `SecurityFilterChain` Bean 사용 |
| 자동 제공 기능        | 로그인 폼 / 로그아웃 / 기본 사용자         |
| 실습 결과           | 인증 필수 API 확인                  |

---

다음 단계(2단계)에서는 👇
➡️ **사용자 계정 정보(DB 연동)**,
➡️ **커스텀 로그인 페이지**,
➡️ **역할(Role)에 따른 접근 제어**
를 다루면 됩니다.

---
# 추가 설명

`SecurityConfig` 클래스가 없어도 스프링 시큐리티는 기본 로그인 과정을 자동으로 설정합니다.**

---

### 🔎 이유
Spring Security는 **자동 설정(Auto-Configuration)** 기능을 가지고 있습니다.  
- `spring-boot-starter-security` 의존성을 추가하면, 별도의 설정이 없어도 **기본 보안 필터 체인(SecurityFilterChain)** 이 등록됩니다.  
- 이 기본 설정은 다음을 포함합니다:
  - 모든 요청은 인증 필요 (`anyRequest().authenticated()`)
  - 기본 로그인 폼 제공 (`formLogin()` 자동 적용)
  - 기본 로그아웃 기능 제공
  - 기본 사용자 계정 생성 (`user` / 콘솔에 출력되는 랜덤 비밀번호)

즉, `SecurityConfig`를 작성하지 않아도 **자동으로 로그인 화면이 뜨고, 기본 계정으로 로그인할 수 있습니다.**

---

### ✅ 차이점
- **SecurityConfig 없음** → Spring Boot가 제공하는 **디폴트 설정**이 적용됨.
- **SecurityConfig 있음** → 개발자가 원하는 방식으로 커스터마이징 가능.  
  예를 들어:
  - 특정 URL은 인증 없이 접근 가능하게 (`permitAll()`)
  - 로그인 페이지를 커스텀 HTML로 교체
  - OAuth2, JWT 같은 다른 인증 방식 추가

---

### 🚀 정리
- `SecurityConfig`가 없어도 로그인 과정은 자동 설정됩니다.
- 다만, 프로젝트 요구사항에 맞게 **커스터마이징하려면 SecurityConfig를 작성**

---
