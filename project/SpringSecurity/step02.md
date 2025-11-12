# step02 - 사용자 보안 설정 1단계

## 2단계: 사용자 인증 커스터마이징(UserDetailsService, PasswordEncoder 등)

> 이 단계의 목표는 **“내가 정의한 사용자 정보로 로그인 처리하기”**
> 즉, 더 이상 `user / 랜덤 비밀번호`로 로그인하지 않고,
> **내가 만든 계정** (예: `admin / 1234`)으로 로그인할 수 있게 만드는 것

---

## 🚀 2단계 목표

✅ 스프링 시큐리티의 **인증 구조** 이해
✅ `UserDetailsService`로 **사용자 정보 커스터마이징**
✅ `PasswordEncoder`로 **비밀번호 암호화 처리**
✅ **DB 연동 준비를 위한 기반 코드 이해**

---

## 🔒 1. 스프링 시큐리티 인증 구조 간단 이해

스프링 시큐리티는 다음과 같은 흐름으로 인증을 수행합니다.

```
사용자 요청 → UsernamePasswordAuthenticationFilter → AuthenticationManager 
→ UserDetailsService → UserDetails → 인증 성공/실패 처리
```

| 컴포넌트                                   | 역할                                      |
| -------------------------------------- | --------------------------------------- |
| `UsernamePasswordAuthenticationFilter` | 로그인 폼에서 받은 username/password 처리         |
| `AuthenticationManager`                | 인증 수행 총괄 (스프링 시큐리티 내부 핵심)               |
| `UserDetailsService`                   | 사용자 정보 로드 (DB or 메모리 등에서)               |
| `UserDetails`                          | 사용자 객체 정보 (username, password, roles 등) |
| `PasswordEncoder`                      | 암호화된 비밀번호 비교 수행                         |

---

## 🏗️ 2. 기본 구조

```
spring-security-demo/
 ├─ config/
 │   └─ SecurityConfig.java
 ├─ service/
 │   └─ CustomUserDetailsService.java
 ├─ model/
 │   └─ CustomUser.java
 ├─ controller/
 │   └─ HomeController.java
```

---

## 🧩 3. `UserDetails` 구현하기

#### 📄 `CustomUser.java`

```java
package com.example.securitydemo.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;

public class CustomUser implements UserDetails {

    private String username;
    private String password;
    private String role;

    public CustomUser(String username, String password, String role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    // 계정 만료, 잠금 등은 기본 true
    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
```

---

## 🧩 4. `UserDetailsService` 구현하기

#### 📄 `CustomUserDetailsService.java`

```java
package com.example.securitydemo.service;

import com.example.securitydemo.model.CustomUser;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 실제로는 DB에서 조회해야 하지만 지금은 예제용으로 하드코딩
        if (username.equals("admin")) {
            return new CustomUser("admin", "{noop}1234", "ROLE_ADMIN");
            // {noop} : 암호화하지 않은 평문 비밀번호 사용
        } else if (username.equals("user")) {
            return new CustomUser("user", "{noop}1111", "ROLE_USER");
        }

        throw new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username);
    }
}
```

> ⚠️ `{noop}` 접두어는 “비밀번호 암호화를 생략하겠다”는 의미입니다.
> (실무에서는 반드시 암호화 필요 → 다음 섹션에서 다룸)

---

## 🧩 5. `SecurityConfig` 수정하기

#### 📄 `SecurityConfig.java`

```java
package com.example.securitydemo.config;

import com.example.securitydemo.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;

    public SecurityConfig(CustomUserDetailsService customUserDetailsService) {
        this.customUserDetailsService = customUserDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .defaultSuccessUrl("/", true)
                .permitAll()
            )
            .logout(logout -> logout.permitAll());

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // 아직은 암호화 미적용 (다음 단계에서 BCrypt로 변경)
        return NoOpPasswordEncoder.getInstance();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }
}
```

---

## 🧩 6. 테스트용 Controller

#### 📄 `HomeController.java`

```java
package com.example.securitydemo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "홈 화면 (모든 인증 사용자 접근 가능)";
    }

    @GetMapping("/admin")
    public String admin() {
        return "관리자 페이지 (ROLE_ADMIN만 접근 가능)";
    }
}
```

---

## 🧪 7. 실행 및 테스트

1. `./gradlew bootRun` 실행
2. 브라우저에서 `http://localhost:8080` 접속
3. 로그인 시도

   * `admin / 1234` → `/admin` 접근 가능
   * `user / 1111` → `/admin` 접근 불가 (403 Forbidden)

---

## 🔐 8. 실무형 비밀번호 암호화 적용 (BCrypt)

이제 `{noop}` 대신 **BCryptPasswordEncoder**를 적용해야 합니다.

#### 📄 `SecurityConfig.java` 수정

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

#### 📄 `CustomUserDetailsService.java` 수정

```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Override
public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    if (username.equals("admin")) {
        return new CustomUser("admin", encoder.encode("1234"), "ROLE_ADMIN");
    } else if (username.equals("user")) {
        return new CustomUser("user", encoder.encode("1111"), "ROLE_USER");
    }

    throw new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username);
}
```

---

## ✅ 2단계 요약

| 항목                   | 설명                                          |
| -------------------- | ------------------------------------------- |
| `UserDetails`        | 사용자 정보를 담는 객체                               |
| `UserDetailsService` | 사용자 정보를 조회하는 서비스                            |
| `PasswordEncoder`    | 비밀번호 암호화/비교 수행                              |
| 인증 흐름                | 로그인 요청 → 필터 → UserDetailsService → 인증 성공/실패 |
| 결과                   | 하드코딩 사용자 계정으로 커스텀 로그인 성공                    |

---

다음 단계(3단계)에서는 🔜
➡️ **DB 연동 (JPA + H2 or MySQL)**
➡️ **회원가입 기능 추가**
➡️ **권한(Role)에 따른 접근 제어 강화**
를 진행하면 실무에 가까워집니다.

---
