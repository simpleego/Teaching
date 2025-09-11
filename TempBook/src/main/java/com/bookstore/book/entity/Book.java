package com.bookstore.book.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Book {
    private int bookid;
    private String bookname;
    private String publisher;
    private int price;
    private String content;
    private String writer;
    // 이미지 업로드를 위한 필드
    private MultipartFile imageFile; // HTML <input type="file">의 name과 일치
    private String originalFileName; // 원본 파일명
    private String storedFileName; // 서버에 저장될 파일명
    private String year;

    public Book(int bookid, String bookname, String publisher, int price,
                String content, String writer, String originalFileName,
                String storedFileName, String year) {
        this.bookid = bookid;
        this.bookname = bookname;
        this.publisher = publisher;
        this.price = price;
        this.content = content;
        this.writer = writer;
        this.originalFileName = originalFileName;
        this.storedFileName = storedFileName;
        this.year = year;
    }
}
