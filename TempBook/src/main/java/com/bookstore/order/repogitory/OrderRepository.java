package com.bookstore.order.repogitory;

import com.bookstore.order.entity.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.util.List;

@Repository
public class OrderRepository {
    private final JdbcTemplate jdbcTemplate;

    public OrderRepository(DataSource dataSource) {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

    private RowMapper<Order> orderRowMapper() {
        return (rs, rowNum) -> {
            Order order = new Order();
            order.setOrderid(rs.getInt("orderid"));
            order.setCustid(rs.getInt("custid"));
            order.setBookid(rs.getInt("bookid"));
            order.setSaleprice(rs.getInt("saleprice"));
            order.setOrderdate(rs.getDate("orderdate").toLocalDate());
            return order;
        };
    }

    // 주문 정보 저장
    public Order save(Order order) {
        String sql = "INSERT INTO Orders(custid, bookid, saleprice, orderdate, quantity) VALUES(?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql,
                order.getCustid(),
                order.getBookid(),
                order.getSaleprice(),
                order.getOrderdate(),
                order.getQuantity());
        System.out.println("주문 db에 저장됨");
        return order;
    }

    // 특정 회원의 모든 주문 내역 조회
    public List<Order> findByCustId(int custid) {
        String sql = "SELECT * FROM Orders WHERE custid = ?";
        return jdbcTemplate.query(sql, orderRowMapper(), custid);
    }
}
