package com.bookstore.order.mapper;

import com.bookstore.order.entity.Order;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Optional;

@Mapper
public interface OrderMapper {


    @Select("SELECT * FROM orders  where orderid > 4;")
    List<Order> findAll();

    @Select("SELECT * FROM orders WHERE orderid = #{id}")
    Optional<Order> findById(int id);

    List<Order> findByOrderBook(@Param("bookid") String bookid);


    List<Order> searchOrders(@Param("bookname") String bookname,
                           @Param("publisher") String publisher,
                           @Param("year") String year,
                           @Param("offset") int offset,
                           @Param("limit") int limit,
                           @Param("sort") String sort);

    int countOrders(@Param("bookname") String bookname,
                   @Param("publisher") String publisher,
                   @Param("year") String year);


    void save(Order book);


}
