# Step03
> **3단계: DB 연동 기반 사용자 인증 (JPA, Entity, Repository)**

이번 단계의 목표는 👇

> **사용자 정보를 데이터베이스에 저장하고, 로그인 시 DB에서 검증하는 것**입니다.

---

## 🎯 3단계 목표

| 학습 포인트                          | 설명                             |
| ------------------------------- | ------------------------------ |
| ✅ Spring Data JPA 연동            | 사용자 데이터를 DB에 저장                |
| ✅ `User` 엔티티(Entity) 정의         | username, password, role 필드 포함 |
| ✅ `UserRepository` 생성           | JPA를 이용해 사용자 조회                |
| ✅ `UserDetailsService` 수정       | DB에서 사용자 정보 읽어오기               |
| ✅ PasswordEncoder로 암호화된 비밀번호 저장 | 실무형 로그인 구현                     |

---

## 🏗️ 프로젝트 구조

```
spring-security-demo/
 ├─ config/
 │   └─ SecurityConfig.java
 ├─ controller/
 │   └─ HomeController.java
 ├─ entity/
 │   └─ UserEntity.java
 ├─ repository/
 │   └─ UserRepository.java
 ├─ service/
 │   └─ CustomUserDetailsService.java
 └─ SecurityDemoApplication.java
```

---

## ⚙️ 1️⃣ Gradle 의존성 설정

`build.gradle`에 다음을 추가합니다.

```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    runtimeOnly 'com.h2database:h2' // 간단한 메모리 DB
}
```

> 💡 H2 데이터베이스는 테스트용으로 사용하며, 브라우저 콘솔로 접근도 가능합니다.

---

## ⚙️ 2️⃣ H2 데이터베이스 설정

#### 📄 `application.yml`

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password:
  h2:
    console:
      enabled: true
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
```

➡️ 실행 후 브라우저에서 `http://localhost:8080/h2-console` 접속 가능
JDBC URL은 `jdbc:h2:mem:testdb` 로 설정하세요.

---

## 🧩 3️⃣ 사용자 엔티티 정의

#### 📄 `UserEntity.java`

```java
package com.example.securitydemo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;
}
```

---

## 🧩 4️⃣ JPA 리포지토리 정의

#### 📄 `UserRepository.java`

```java
package com.example.securitydemo.repository;

import com.example.securitydemo.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByUsername(String username);
}
```

---

## 🧩 5️⃣ DB 기반 UserDetailsService 구현

#### 📄 `CustomUserDetailsService.java`

```java
package com.example.securitydemo.service;

import com.example.securitydemo.entity.UserEntity;
import com.example.securitydemo.repository.UserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자 없음: " + username));

        return User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRole()) // "ADMIN" 또는 "USER"
                .build();
    }
}
```

---

## 🧩 6️⃣ 비밀번호 암호화 + 시큐리티 설정

#### 📄 `SecurityConfig.java`

```java
package com.example.securitydemo.config;

import com.example.securitydemo.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/join", "/h2-console/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .defaultSuccessUrl("/", true)
                .permitAll()
            )
            .logout(logout -> logout.permitAll());

        // H2 콘솔 접근 허용
        http.headers(headers -> headers.frameOptions().disable());
        http.csrf(csrf -> csrf.disable());

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }
}
```

---

## 🧩 7️⃣ 회원가입 (User 저장) 기능 추가

#### 📄 `HomeController.java`

```java
package com.example.securitydemo.controller;

import com.example.securitydemo.entity.UserEntity;
import com.example.securitydemo.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
public class HomeController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public HomeController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/")
    public String home() {
        return "홈 화면 (로그인 필요)";
    }

    @PostMapping("/join")
    public String join(@RequestBody UserEntity user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return "회원가입 완료: " + user.getUsername();
    }

    @GetMapping("/admin")
    public String admin() {
        return "관리자 전용 페이지";
    }
}
```

---

## 🧪 8️⃣ 테스트 시나리오

### 1️⃣ 회원가입 요청

`POST http://localhost:8080/join`

#### Body (JSON)

```json
{
  "username": "admin",
  "password": "1234",
  "role": "ADMIN"
}
```

➡️ 응답: `회원가입 완료: admin`

### 2️⃣ 로그인 요청

브라우저에서 `http://localhost:8080/login` 접속
➡️ `admin / 1234` 로그인 성공 후 `/`으로 리다이렉트

### 3️⃣ 권한별 접근 확인

| URL           | 접근 가능자           |
| ------------- | ---------------- |
| `/`           | 로그인한 모든 사용자      |
| `/admin`      | `ROLE_ADMIN`만 가능 |
| `/h2-console` | 로그인 없이 접근 가능     |

---

## ✅ 9️⃣ 3단계 요약

| 항목                       | 설명                               |
| ------------------------ | -------------------------------- |
| JPA + H2 연동              | 사용자 정보를 DB에 저장                   |
| UserEntity               | username / password / role 필드 포함 |
| UserRepository           | `findByUsername()`으로 사용자 조회      |
| CustomUserDetailsService | DB에서 사용자 불러와 인증 처리               |
| BCryptPasswordEncoder    | 암호화된 비밀번호 비교                     |
| 결과                       | **실제 DB 로그인 가능한 보안 환경 완성** 🎉    |

---

다음 단계(4단계)에서는 🚀
➡️ **회원가입 시 유효성 검증**,
➡️ **커스텀 로그인 페이지 (HTML Form)**,
➡️ **예외 처리 / 접근 거부 페이지 (403.html)**
등을 추가하면 완성형 “실무 로그인 시스템”이 됩니다.

---

원하시나요?
제가 **4단계: 커스텀 로그인 & 회원가입 폼 + 접근제어 페이지 구현** 으로 바로 이어서 정리해드릴까요?
