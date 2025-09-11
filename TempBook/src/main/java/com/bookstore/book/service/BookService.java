package com.bookstore.book.service;

import com.bookstore.book.entity.Book;
import com.bookstore.book.mapper.BookMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BookService {

    //private BookRepository bookRepository;
    private final BookMapper bookMapper;

    @Value("${file.upload-dir}") // application.properties의 값 주입
    private String uploadDir;

    public BookService(BookMapper bookMapper) {
        this.bookMapper = bookMapper;
    }

    public List<Book> searchBooks(String bookname, String publisher, String year, int page, int size, String sort) {
        int offset = (page - 1) * size;

        System.out.println("Service-->");
        System.out.println("offset: " + offset);
        System.out.println("publisher:" +publisher);
        return bookMapper.searchBooks(bookname, publisher,year,offset, size, sort);
    }

    public int countBooks(String bookname, String publisher, String year) {
        return bookMapper.countBooks(bookname, publisher, year);
    }

    public void saveBook(Book book) throws IOException {
        System.out.println("BookService saveBook");

        MultipartFile imageFile = book.getImageFile();
        if (imageFile != null && !imageFile.isEmpty()) {
            // 원본 파일명
            String originalFileName = imageFile.getOriginalFilename();
            // 서버에 저장될 고유한 파일명 생성
            String storedFileName = createStoredFileName(originalFileName);

            // 파일 저장
            String fullPath = uploadDir + storedFileName;
            imageFile.transferTo(new File(fullPath));

            // DTO에 파일 정보 설정
            book.setOriginalFileName(originalFileName);
            book.setStoredFileName(storedFileName);
        }
        bookMapper.save(book);
    }

    // 고유한 파일명 생성을 위한 메소드
    private String createStoredFileName(String originalFileName) {
        String ext = originalFileName.substring(originalFileName.lastIndexOf("."));
        return UUID.randomUUID().toString() + ext;
    }

    public List<Book> searchByName(String name) {
        return bookMapper.findByBookname(name);
    }

    public List<Book> searchByPublisher(String publisher) {
        return bookMapper.findByPublisher(publisher);
    }

    public List<Book> findAll(){
        return  bookMapper.findAll();
    }

    public Optional<Book> findById(int id) {
        return bookMapper.findById(id);
    }
}
