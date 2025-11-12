package com.example.securitydemo.controller;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home(){
//        return "home Page 로그인하지 않으면 접근할 수 없습니다.";
        return "index";
    }
}
