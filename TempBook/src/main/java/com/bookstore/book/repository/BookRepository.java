package com.bookstore.book.repository;

import com.bookstore.book.entity.Book;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class BookRepository {
    private JdbcTemplate jdbc;

    public BookRepository(JdbcTemplate jdbcTemplate) {
        this.jdbc = jdbcTemplate;
    }

    public List<Book> findAll() {
        String sql = "SELECT * FROM book";
        return jdbc.query(sql,bookRowMapper());
    }

    private RowMapper<Book> bookRowMapper() {
        return (rs, rowNum) -> {
            return new Book(
                    rs.getInt("bookid"),
                    rs.getString("bookname"),
                    rs.getString("publisher"),
                    rs.getInt("price"),
                    rs.getString("content"),
                    rs.getString("writer"),
                    rs.getString("originalFileName"),
                    rs.getString("storedFileName"),
                    rs.getString("year")
            );
        };
    }

    public Optional<Book> findById(int bookid) {
        System.out.println("==> book findById"+bookid);
        String sql = "SELECT * FROM book WHERE bookid = ?";

        try {
            Book book = jdbc.queryForObject(sql, bookRowMapper(), bookid);
            return Optional.of(book);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
//        Book book = jdbc.queryForObject(sql, bookRowMapper(), bookid);
//        System.out.println("==> book : "+book);
//        return Optional.ofNullable(book);
}
