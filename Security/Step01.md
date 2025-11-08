# Spring Security를 이용한 회원관리 기능 구현 (1단계)

## 1. 프로젝트 설정

### build.gradle
```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jdbc'
    implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.3'
    implementation 'mysql:mysql-connector-java:8.0.33'
    implementation 'org.springframework.security:spring-security-crypto'
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
}
```

### application.yml
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/security_db
    username: your_username
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  security:
    user:
      password: temporary_password

mybatis:
  mapper-locations: classpath:mappers/*.xml
  type-aliases-package: com.example.security.domain
```

## 2. 데이터베이스 테이블 생성

```sql
CREATE DATABASE security_db;

USE security_db;

CREATE TABLE members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'ROLE_USER',
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE authorities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    authority VARCHAR(50) NOT NULL,
    FOREIGN KEY (username) REFERENCES members(username) ON DELETE CASCADE
);
```

## 3. 도메인 모델 클래스

### Member.java
```java
package com.example.security.domain;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Member {
    private Long id;
    private String username;
    private String password;
    private String email;
    private String role;
    private Boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### MemberAuthority.java
```java
package com.example.security.domain;

import lombok.Data;

@Data
public class MemberAuthority {
    private Long id;
    private String username;
    private String authority;
}
```

## 4. Mapper 인터페이스

### MemberMapper.java
```java
package com.example.security.mapper;

import com.example.security.domain.Member;
import com.example.security.domain.MemberAuthority;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;
import java.util.Optional;

@Mapper
public interface MemberMapper {
    
    // 회원 저장
    void saveMember(Member member);
    
    // 회원명으로 회원 조회
    Optional<Member> findByUsername(String username);
    
    // 이메일로 회원 조회
    Optional<Member> findByEmail(String email);
    
    // 모든 회원 조회
    List<Member> findAll();
    
    // 회원 권한 저장
    void saveAuthority(MemberAuthority authority);
    
    // 회원명으로 권한 조회
    List<MemberAuthority> findAuthoritiesByUsername(String username);
    
    // 회원 정보 수정
    void updateMember(Member member);
    
    // 회원 비활성화
    void disableMember(String username);
}
```

## 5. Mapper XML

### src/main/resources/mappers/MemberMapper.xml
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
"http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.example.security.mapper.MemberMapper">

    <insert id="saveMember" parameterType="Member" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO members (username, password, email, role, enabled)
        VALUES (#{username}, #{password}, #{email}, #{role}, #{enabled})
    </insert>

    <select id="findByUsername" parameterType="string" resultType="Member">
        SELECT id, username, password, email, role, enabled, created_at, updated_at
        FROM members
        WHERE username = #{username}
    </select>

    <select id="findByEmail" parameterType="string" resultType="Member">
        SELECT id, username, password, email, role, enabled, created_at, updated_at
        FROM members
        WHERE email = #{email}
    </select>

    <select id="findAll" resultType="Member">
        SELECT id, username, password, email, role, enabled, created_at, updated_at
        FROM members
    </select>

    <insert id="saveAuthority" parameterType="MemberAuthority">
        INSERT INTO authorities (username, authority)
        VALUES (#{username}, #{authority})
    </insert>

    <select id="findAuthoritiesByUsername" parameterType="string" resultType="MemberAuthority">
        SELECT id, username, authority
        FROM authorities
        WHERE username = #{username}
    </select>

    <update id="updateMember" parameterType="Member">
        UPDATE members
        SET email = #{email}, updated_at = CURRENT_TIMESTAMP
        WHERE username = #{username}
    </update>

    <update id="disableMember" parameterType="string">
        UPDATE members
        SET enabled = FALSE, updated_at = CURRENT_TIMESTAMP
        WHERE username = #{username}
    </update>

</mapper>
```

## 6. 서비스 계층

### MemberService.java
```java
package com.example.security.service;

import com.example.security.domain.Member;
import com.example.security.domain.MemberAuthority;
import com.example.security.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberMapper memberMapper;
    private final PasswordEncoder passwordEncoder;

    // 회원 가입
    @Transactional
    public Member registerMember(Member member) {
        // 비밀번호 암호화
        member.setPassword(passwordEncoder.encode(member.getPassword()));
        member.setRole("ROLE_USER");
        member.setEnabled(true);
        
        // 회원 저장
        memberMapper.saveMember(member);
        
        // 기본 권한 부여
        MemberAuthority authority = new MemberAuthority();
        authority.setUsername(member.getUsername());
        authority.setAuthority("ROLE_USER");
        memberMapper.saveAuthority(authority);
        
        return member;
    }

    // 회원명으로 회원 조회
    public Optional<Member> findMemberByUsername(String username) {
        return memberMapper.findByUsername(username);
    }

    // 이메일로 회원 조회
    public Optional<Member> findMemberByEmail(String email) {
        return memberMapper.findByEmail(email);
    }

    // 모든 회원 조회
    public List<Member> findAllMembers() {
        return memberMapper.findAll();
    }

    // 회원 정보 수정
    @Transactional
    public void updateMember(String username, String email) {
        Member member = new Member();
        member.setUsername(username);
        member.setEmail(email);
        memberMapper.updateMember(member);
    }

    // 회원 비활성화
    @Transactional
    public void disableMember(String username) {
        memberMapper.disableMember(username);
    }

    // 회원 권한 조회
    public List<MemberAuthority> findAuthoritiesByUsername(String username) {
        return memberMapper.findAuthoritiesByUsername(username);
    }
}
```

## 7. Spring Security 설정

### SecurityConfig.java
```java
package com.example.security.config;

import com.example.security.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final MemberService memberService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/home", "/register", "/css/**", "/js/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/dashboard")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutSuccessUrl("/")
                .permitAll()
            )
            .rememberMe(remember -> remember
                .key("uniqueAndSecret")
                .tokenValiditySeconds(86400) // 24시간
            );

        return http.build();
    }
}
```

## 8. 컨트롤러

### MemberController.java
```java
package com.example.security.controller;

import com.example.security.domain.Member;
import com.example.security.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    // 홈 페이지
    @GetMapping("/")
    public String home() {
        return "home";
    }

    // 회원 가입 페이지
    @GetMapping("/register")
    public String registerForm(Model model) {
        model.addAttribute("member", new Member());
        return "register";
    }

    // 회원 가입 처리
    @PostMapping("/register")
    public String register(@ModelAttribute Member member) {
        memberService.registerMember(member);
        return "redirect:/login";
    }

    // 로그인 페이지
    @GetMapping("/login")
    public String login() {
        return "login";
    }

    // 대시보드 페이지
    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard";
    }

    // 관리자 페이지 - 회원 목록
    @GetMapping("/admin/members")
    public String memberList(Model model) {
        List<Member> members = memberService.findAllMembers();
        model.addAttribute("members", members);
        return "admin/member-list";
    }
}
```

## 9. 뷰 템플릿 (Thymeleaf)

### src/main/resources/templates/home.html
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Home</title>
</head>
<body>
    <h1>Welcome to Spring Security Demo</h1>
    <div th:if="${#authentication.isAuthenticated()}">
        <p>Welcome, <span th:text="${#authentication.name}">User</span>!</p>
        <a th:href="@{/dashboard}">Go to Dashboard</a>
        <form th:action="@{/logout}" method="post">
            <input type="submit" value="Logout"/>
        </form>
    </div>
    <div th:unless="${#authentication.isAuthenticated()}">
        <a th:href="@{/login}">Login</a> | 
        <a th:href="@{/register}">Register</a>
    </div>
</body>
</html>
```

### src/main/resources/templates/register.html
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Register</title>
</head>
<body>
    <h1>회원 가입</h1>
    <form th:action="@{/register}" th:object="${member}" method="post">
        <div>
            <label>Username:</label>
            <input type="text" th:field="*{username}" required/>
        </div>
        <div>
            <label>Password:</label>
            <input type="password" th:field="*{password}" required/>
        </div>
        <div>
            <label>Email:</label>
            <input type="email" th:field="*{email}" required/>
        </div>
        <button type="submit">가입하기</button>
    </form>
    <a th:href="@{/}">홈으로</a>
</body>
</html>
```

### src/main/resources/templates/login.html
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Login</title>
</head>
<body>
    <h1>로그인</h1>
    <div th:if="${param.error}">
        <p style="color: red;">Invalid username or password.</p>
    </div>
    <div th:if="${param.logout}">
        <p style="color: green;">You have been logged out.</p>
    </div>
    <form th:action="@{/login}" method="post">
        <div>
            <label>Username:</label>
            <input type="text" name="username" required/>
        </div>
        <div>
            <label>Password:</label>
            <input type="password" name="password" required/>
        </div>
        <div>
            <input type="checkbox" name="remember-me"/> Remember me
        </div>
        <button type="submit">로그인</button>
    </form>
    <a th:href="@{/register}">회원가입</a> | 
    <a th:href="@{/}">홈으로</a>
</body>
</html>
```

## 10. 커스텀 UserDetailsService 구현

### CustomUserDetailsService.java
```java
package com.example.security.service;

import com.example.security.domain.Member;
import com.example.security.domain.MemberAuthority;
import com.example.security.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final MemberMapper memberMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Member member = memberMapper.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        List<MemberAuthority> authorities = memberMapper.findAuthoritiesByUsername(username);
        List<GrantedAuthority> grantedAuthorities = authorities.stream()
                .map(auth -> new SimpleGrantedAuthority(auth.getAuthority()))
                .collect(Collectors.toList());

        return User.builder()
                .username(member.getUsername())
                .password(member.getPassword())
                .authorities(grantedAuthorities)
                .disabled(!member.getEnabled())
                .build();
    }
}
```

## 실행 방법

1. MySQL 데이터베이스 생성 및 테이블 설정
2. application.yml 파일에 데이터베이스 연결 정보 설정
3. 애플리케이션 실행
4. http://localhost:8080 접속

이렇게 구성하면 기본적인 Spring Security 기반의 회원 관리 시스템이 구현됩니다. 다음 단계에서는 인증/인가 처리, JWT 통합, OAuth2 연동 등 더 심화된 내용을 다루겠습니다.
