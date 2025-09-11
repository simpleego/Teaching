package com.bookstore.order.controller;

import com.bookstore.book.entity.Book;
import com.bookstore.book.repository.BookRepository;
import com.bookstore.order.entity.Order;
import com.bookstore.order.service.OrderService;
import com.bookstore.users.entity.User;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Optional;

@Controller
public class OrderController {

    private final OrderService orderService;
    private final BookRepository bookRepository; // Book 정보 조회를 위해 주입

    public OrderController(OrderService orderService, BookRepository bookRepository) {
        this.orderService = orderService;
        this.bookRepository = bookRepository;
    }

    @PostMapping("/order/new")
    public String createOrder(@RequestParam("bookid") int bookid,
                              @RequestParam("quantity") int quantity,
                              HttpSession session,
                              RedirectAttributes redirectAttributes) {
        User loginUser = (User) session.getAttribute("loginUser");
        System.out.println("** user : " + loginUser);
        if (loginUser == null) {
            return "redirect:/user/login"; // 로그인 안되어 있으면 로그인 페이지로
        }

        Optional<Book> bookOptional = bookRepository.findById(Math.toIntExact(bookid));
        if (bookOptional.isPresent()) {
            orderService.createOrder(loginUser, bookOptional.get(), quantity);
            redirectAttributes.addFlashAttribute("successMessage", "도서 구매가 완료되었습니다.");
            return "redirect:/order/history"; // 구매 완료 후 주문 내역 페이지로
        } else {
            redirectAttributes.addFlashAttribute("errorMessage", "존재하지 않는 도서입니다.");
            return "redirect:/";
        }
    }

    @GetMapping("/order/history")
    public String orderHistory(HttpSession session, Model model) {
        User loginMember = (User) session.getAttribute("loginUser");
        if (loginMember == null) {
            return "redirect:/user/login";
        }

        List<Order> orders = orderService.findOrdersByCustomer(loginMember.getCustId());
        model.addAttribute("orders", orders);

        return "orders/orderHistory";
    }
}