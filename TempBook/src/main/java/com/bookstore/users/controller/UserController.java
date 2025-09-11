package com.bookstore.users.controller;

import com.bookstore.users.entity.User;
import com.bookstore.users.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Optional;

@Controller
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/user/add")
    public String addForm(Model model) {
        model.addAttribute("user", new User());
        return "users/addUser";
    }

    // User 등록
    @PostMapping("/user/add")
    public String addUser(@ModelAttribute User user,
                RedirectAttributes message) {
        //userService.register(user);
        try {
            userService.join(user);
            return "redirect:/user/login";
        }catch (IllegalStateException e){
            message.addFlashAttribute("errorMessage",e.getMessage());
        }
        return "redirect:/user/add";
    }

    // login 폼으로 이동
    @GetMapping("/user/login")
    public String loginForm(){
        return "users/loginForm";
    }

    @PostMapping("/user/login")
    public String login(@RequestParam("username") String username,
                        @RequestParam("password") String password,
                        HttpServletRequest request,
                        RedirectAttributes redirectAttributes) {
        Optional<User> loginResult = userService.login(username, password);

        if (loginResult.isPresent()) {
            HttpSession session = request.getSession();
            session.setAttribute("loginUser", loginResult.get());
            return "redirect:/";
        }else {
            redirectAttributes.addFlashAttribute("errorMessage",
                    "아이디 또는 비밀번호가 맞지 않습니다.");
            return "redirect:/user/login";
        }
    }

    @GetMapping("/user/logout")
    public String logout(HttpServletRequest request) {
        HttpSession session = request.getSession();
        if(session != null){
            session.invalidate();
        }
        return "redirect:/";
    }

    @GetMapping("/user/list")
    public String userList(Model model){
        System.out.println("UserController userList");
        model.addAttribute("users",userService.findAll());
        return "users/userList";
    }

    @GetMapping("/user/edit/{id}")
    public String userEditForm(@PathVariable int id, Model model){
           User user = (User) userService.findById(id).orElseThrow(
                   ()->new IllegalArgumentException("Invaild user id "));
           model.addAttribute("user",user);
        System.out.println("user : "+user);
        return "users/editUser";
    }

    @PostMapping("/user/edit")
    public String userEdit(@ModelAttribute User user){
        userService.update(user.getCustId());
        return "redirect:/user/list";
    }

    @PostMapping("/user/delete")
    public String deleteUser(@RequestParam int id) {
        userService.deleteById(id);
        return "redirect:/user/list";
    }

}
