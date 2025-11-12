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