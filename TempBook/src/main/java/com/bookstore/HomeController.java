package com.bookstore;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {
    // /요청을 처리한다.
    @GetMapping("/")
    public String home() {
        return "redirect:/search?bookname=&publisher=&page=1";
    }
}
