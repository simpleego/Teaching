package com.bookstore.order.entity;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OrderDetail {
    private String bookName;
    private String orderDate;
    private int salePrice;
}
