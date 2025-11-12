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

    @GetMapping("/user")
    public String test() {
        return "관리자 페이지 (ROLE_ADMIN만 접근 가능)";
    }
}
