package com.bookstore.book.controller;

import com.bookstore.book.entity.Book;
import com.bookstore.book.service.BookService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Controller
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @Value("${file.upload-dir}")
    private String uploadDir;

    // 도서 검색
    @GetMapping("/search")
    public String searchBooks(@RequestParam(required = false, defaultValue = "") String bookname,
                              @RequestParam(required = false, defaultValue = "") String publisher,
                              @RequestParam(required = false) String year,
                              @RequestParam(defaultValue = "1") int page,
                              @RequestParam(defaultValue = "bookname") String sort,
                              Model model) {

        System.out.println("Controller-->");
        System.out.println("bookname: " + bookname);
        System.out.println("publisher: " + publisher);


        // 년도값이 없으면 올해 년도로 설정
        if (year == null) {
            year = String.valueOf(LocalDate.now().getYear());
        }

        int size = 3; // 페이지당 도서 수
        List<Book> books = bookService.searchBooks(bookname, publisher, year, page, size, sort);

        int total = bookService.countBooks(bookname, publisher, year);
        int totalPages = (int) Math.ceil((double) total / size);

        model.addAttribute("books", books);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", totalPages);
        model.addAttribute("publisher", publisher);
        model.addAttribute("bookname", bookname);
        model.addAttribute("year", year);
        model.addAttribute("sort", sort);

        return "home";
    }

    // 도서 목록
    @GetMapping("/book/list")
    public String bookList(Model model) {
        System.out.println("BookController bookList");
        model.addAttribute("books", bookService.findAll());
        return "home";
    }

    // 도서 수정 화면
    @GetMapping("/book/detail/{id}")
    public String bookEditForm(@PathVariable int id, Model model) {

        System.out.println("BookDetail -->");

        Optional<Book> bookOptional = bookService.findById(id); // BookRepository 직접 사용
        if (bookOptional.isPresent()) {
            model.addAttribute("book", bookOptional.get());
            System.out.println("imgFile:"+ bookOptional.get().getStoredFileName() );
            return "books/bookDetail";
        } else {
            return "redirect:/"; // 책이 없으면 홈으로
        }
    }

    // 도서 등록 폼 페이지
    @GetMapping("/book/new")
    public String addBookForm() {
        return "/books/addBookForm"; // templates/addBookForm.html
    }

    // 도서 등록 처리
    @PostMapping("/book/add")
    public String save(@ModelAttribute Book book) throws IOException {
        System.out.println("BookController addBook");
        bookService.saveBook(book);
        return "redirect:/"; // 등록 후 홈페이지로 이동
    }
}
