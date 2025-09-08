# search_paging
> 마당서점의 `Book` 테이블 정보를 바탕으로, Spring Boot + MyBatis + Thymeleaf를 활용한 **도서 검색 기능**을 구현해볼게요.
> 사용자는 도서 이름 또는 출판사(저자 정보는 없지만 출판사로 대체 가능)를 기준으로 검색할 수 있도록 구성하겠습니다.

---

## 🛠️ 프로젝트 구성 개요

- **Backend**: Spring Boot + MyBatis
- **Frontend**: Thymeleaf
- **DB 테이블**: `Book(bookid, bookname, publisher, price)`

---

## 1️⃣ Entity 클래스 (`Book.java`)

```java
public class Book {
    private int bookid;
    private String bookname;
    private String publisher;
    private int price;

    // Getters and Setters
}
```

---

## 2️⃣ Mapper 인터페이스 (`BookMapper.java`)

```java
@Mapper
public interface BookMapper {
    List<Book> findByBookname(@Param("bookname") String bookname);
    List<Book> findByPublisher(@Param("publisher") String publisher);
}
```

---

## 3️⃣ Mapper XML (`BookMapper.xml`)

```xml
<mapper namespace="com.example.mapper.BookMapper">

    <select id="findByBookname" resultType="Book">
        SELECT * FROM Book
        WHERE bookname LIKE CONCAT('%', #{bookname}, '%')
    </select>

    <select id="findByPublisher" resultType="Book">
        SELECT * FROM Book
        WHERE publisher LIKE CONCAT('%', #{publisher}, '%')
    </select>

</mapper>
```

---

## 4️⃣ Service 클래스 (`BookService.java`)

```java
@Service
public class BookService {
    @Autowired
    private BookMapper bookMapper;

    public List<Book> searchByName(String name) {
        return bookMapper.findByBookname(name);
    }

    public List<Book> searchByPublisher(String publisher) {
        return bookMapper.findByPublisher(publisher);
    }
}
```

---

## 5️⃣ Controller 클래스 (`BookController.java`)

```java
@Controller
public class BookController {

    @Autowired
    private BookService bookService;

    @GetMapping("/search")
    public String searchForm() {
        return "search";
    }

    @PostMapping("/search")
    public String searchBooks(@RequestParam(required = false) String bookname,
                              @RequestParam(required = false) String publisher,
                              Model model) {
        List<Book> results = new ArrayList<>();

        if (bookname != null && !bookname.isEmpty()) {
            results = bookService.searchByName(bookname);
        } else if (publisher != null && !publisher.isEmpty()) {
            results = bookService.searchByPublisher(publisher);
        }

        model.addAttribute("books", results);
        return "search";
    }
}
```

---

## 6️⃣ Thymeleaf 템플릿 (`search.html`)

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>도서 검색</title>
</head>
<body>
    <h1>도서 검색</h1>
    <form method="post" th:action="@{/search}">
        <input type="text" name="bookname" placeholder="도서 이름">
        <input type="text" name="publisher" placeholder="출판사">
        <button type="submit">검색</button>
    </form>

    <div th:if="${books}">
        <h2>검색 결과</h2>
        <ul>
            <li th:each="book : ${books}">
                <span th:text="${book.bookname}"></span> -
                <span th:text="${book.publisher}"></span> -
                <span th:text="${book.price}"></span>원
            </li>
        </ul>
    </div>
</body>
</html>
```

---

이렇게 하면 사용자가 도서 이름이나 출판사로 검색할 수 있는 기능이 완성됩니다. 필요하다면 검색 조건을 확장하거나, 페이징 처리도 추가할 수 있어요. 다음 단계로 어떤 기능을 더 넣고 싶으신가요? 😄
