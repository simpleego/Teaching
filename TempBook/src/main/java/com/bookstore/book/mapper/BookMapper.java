package com.bookstore.book.mapper;

import com.bookstore.book.entity.Book;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Optional;

@Mapper
public interface BookMapper {


    @Select("SELECT * FROM book  where bookid > 4;")
    List<Book> findAll();

    @Select("SELECT * FROM book WHERE bookid = #{id}")
    Optional<Book> findById(int id);

    @Select("SELECT * FROM book WHERE bookname LIKE CONCAT('%', #{bookname}, '%')")
    List<Book> findByBookname(@Param("bookname") String bookname);


    //    @Select("SELECT * FROM book " +
//            "WHERE (#{bookname} IS NULL OR bookname LIKE CONCAT('%', #{bookname}, '%')) " +
//            "AND (#{publisher} IS NULL OR publisher LIKE CONCAT('%', #{publisher}, '%')) " +
//            "ORDER BY bookid DESC " +
//            "LIMIT #{limit} OFFSET #{offset}")
//    @Select("SELECT * FROM book " +
//            "WHERE (bookname LIKE CONCAT('%', #{bookname}, '%') OR #{bookname} IS NULL) " +
//            " ORDER BY bookid DESC " +
//            "LIMIT #{limit} OFFSET #{offset}")
    List<Book> searchBooks(@Param("bookname") String bookname,
                           @Param("publisher") String publisher,
                           @Param("year") String year,
                           @Param("offset") int offset,
                           @Param("limit") int limit,
                           @Param("sort") String sort);

    int countBooks(@Param("bookname") String bookname,
                   @Param("publisher") String publisher,
                   @Param("year") String year);

    @Select("SELECT * FROM book WHERE publisher LIKE CONCAT('%', #{publisher}, '%')")
    List<Book> findByPublisher(@Param("publisher") String publisher);

    void save(Book book);

    void updateBook(int price, int id);


    @Delete("DELETE FROM book WHERE bookid = #{id}")
    void deleteById(int id);
}
