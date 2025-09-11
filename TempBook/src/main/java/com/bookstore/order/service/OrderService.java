package com.bookstore.order.service;

import com.bookstore.book.entity.Book;
import com.bookstore.order.entity.Order;
import com.bookstore.order.repogitory.OrderRepository;
import com.bookstore.users.entity.User;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * 주문 생성
     */
    public void createOrder(User user, Book book, int quantity) {
        System.out.println("주문 서비스 생성됨...");
        Order order = new Order();
        order.setCustid(user.getCustId());
        order.setBookid(book.getBookid());
        order.setSaleprice(book.getPrice()); // 실제 판매가는 정책에 따라 다를 수 있음
        order.setOrderdate(LocalDate.now()); // 주문일은 현재 날짜

        orderRepository.save(order);
    }

    /**
     * 특정 회원의 주문 목록 조회
     */
    public List<Order> findOrdersByCustomer(int custid) {
        return orderRepository.findByCustId(custid);
    }
}