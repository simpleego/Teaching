package com.bookstore.order.entity;

import lombok.Data;

import java.time.LocalDate;

@Data
public class Order {
    private int orderid;
    private int custid;
    private int bookid;
    private int saleprice;
    private LocalDate orderdate;
    private int quantity;
}
