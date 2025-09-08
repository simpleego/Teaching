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

이렇게 하면 사용자가 도서 이름이나 출판사로 검색할 수 있는 기능이 완성됩니다. 
필요하다면 검색 조건을 확장하거나, 페이징 처리도 추가할 수 있어요. 다음 단계로 어떤 기능을 더 넣고 싶으신가요? 😄

## 추가기능
좋아요 jong! 🔍 도서 검색 기능을 확장해서 **출판년도 + 출판사 동시 검색**과 **페이징 처리**까지 구현해볼게요. PDF에 기반한 `Book` 테이블에 `year` 컬럼이 있다고 가정하고 진행할게요.

---

## 📘 1. Book 엔티티 확장 (`Book.java`)

```java
public class Book {
    private int bookid;
    private String bookname;
    private String publisher;
    private int price;
    private int year; // 출판년도

    // Getters and Setters
}
```

---

## 📗 2. Mapper 인터페이스 수정 (`BookMapper.java`)

```java
@Mapper
public interface BookMapper {
    List<Book> searchBooks(@Param("publisher") String publisher,
                           @Param("year") Integer year,
                           @Param("offset") int offset,
                           @Param("limit") int limit);

    int countBooks(@Param("publisher") String publisher,
                   @Param("year") Integer year);
}
```

---

## 📙 3. Mapper XML 수정 (`BookMapper.xml`)

```xml
<select id="searchBooks" resultType="Book">
    SELECT * FROM Book
    WHERE
        (publisher LIKE CONCAT('%', #{publisher}, '%') OR #{publisher} IS NULL)
        AND (year = #{year} OR #{year} IS NULL)
    ORDER BY bookid DESC
    LIMIT #{limit} OFFSET #{offset}
</select>

<select id="countBooks" resultType="int">
    SELECT COUNT(*) FROM Book
    WHERE
        (publisher LIKE CONCAT('%', #{publisher}, '%') OR #{publisher} IS NULL)
        AND (year = #{year} OR #{year} IS NULL)
</select>
```

---

## 📕 4. Service 클래스 수정 (`BookService.java`)

```java
@Service
public class BookService {
    @Autowired
    private BookMapper bookMapper;

    public List<Book> searchBooks(String publisher, Integer year, int page, int size) {
        int offset = (page - 1) * size;
        return bookMapper.searchBooks(publisher, year, offset, size);
    }

    public int countBooks(String publisher, Integer year) {
        return bookMapper.countBooks(publisher, year);
    }
}
```

---

## 📘 5. Controller 수정 (`BookController.java`)

```java
@Controller
public class BookController {

    @Autowired
    private BookService bookService;

    @GetMapping("/search")
    public String searchBooks(@RequestParam(required = false) String publisher,
                              @RequestParam(required = false) Integer year,
                              @RequestParam(defaultValue = "1") int page,
                              Model model) {

        int size = 5; // 페이지당 도서 수
        List<Book> books = bookService.searchBooks(publisher, year, page, size);
        int total = bookService.countBooks(publisher, year);
        int totalPages = (int) Math.ceil((double) total / size);

        model.addAttribute("books", books);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", totalPages);
        model.addAttribute("publisher", publisher);
        model.addAttribute("year", year);

        return "search";
    }
}
```

---

## 🖼️ 6. Thymeleaf 템플릿 수정 (`search.html`)

```html
<form method="get" th:action="@{/search}">
    <input type="text" name="publisher" placeholder="출판사" th:value="${publisher}">
    <input type="number" name="year" placeholder="출판년도" th:value="${year}">
    <button type="submit">검색</button>
</form>

<div th:if="${books}">
    <h2>검색 결과</h2>
    <ul>
        <li th:each="book : ${books}">
            <span th:text="${book.bookname}"></span> -
            <span th:text="${book.publisher}"></span> -
            <span th:text="${book.year}"></span>년 -
            <span th:text="${book.price}"></span>원
        </li>
    </ul>

    <div>
        <span th:if="${currentPage > 1}">
            <a th:href="@{/search(publisher=${publisher}, year=${year}, page=${currentPage - 1})}">이전</a>
        </span>
        <span>페이지 [[${currentPage}]] / [[${totalPages}]]</span>
        <span th:if="${currentPage < totalPages}">
            <a th:href="@{/search(publisher=${publisher}, year=${year}, page=${currentPage + 1})}">다음</a>
        </span>
    </div>
</div>
```

---

이제 출판사와 출판년도를 동시에 검색하면서, 결과를 페이지 단위로 나눠서 보여줄 수 있어요! 필요하다면 검색 조건을 더 추가하거나, 정렬 방식도 바꿀 수 있어요. 다음으로 어떤 기능을 넣고 싶으세요 jong? 😄

## 페이징 첫페이지/마지막 페이지 이동
좋아요 jong! 🔄 페이지 이동 기능을 더 직관적으로 만들기 위해 **첫 페이지 / 마지막 페이지로 바로 이동하는 버튼**을 추가해볼게요. 기존 Thymeleaf 템플릿의 페이징 영역을 확장하는 방식으로 진행하겠습니다.

---

## ✅ 수정된 페이징 영역 (`search.html`의 일부)

```html
<div>
    <!-- 첫 페이지 버튼 -->
    <span th:if="${currentPage > 1}">
        <a th:href="@{/search(publisher=${publisher}, year=${year}, page=1)}">
            <button>⏮ 첫 페이지</button>
        </a>
    </span>

    <!-- 이전 페이지 버튼 -->
    <span th:if="${currentPage > 1}">
        <a th:href="@{/search(publisher=${publisher}, year=${year}, page=${currentPage - 1})}">
            <button>◀ 이전</button>
        </a>
    </span>

    <!-- 현재 페이지 표시 -->
    <span>페이지 [[${currentPage}]] / [[${totalPages}]]</span>

    <!-- 다음 페이지 버튼 -->
    <span th:if="${currentPage < totalPages}">
        <a th:href="@{/search(publisher=${publisher}, year=${year}, page=${currentPage + 1})}">
            <button>다음 ▶</button>
        </a>
    </span>

    <!-- 마지막 페이지 버튼 -->
    <span th:if="${currentPage < totalPages}">
        <a th:href="@{/search(publisher=${publisher}, year=${year}, page=${totalPages})}">
            <button>마지막 페이지 ⏭</button>
        </a>
    </span>
</div>
```

---

## 💡 UX 팁

- 버튼 스타일을 CSS로 꾸미면 더 보기 좋게 만들 수 있어요.
- 페이지 번호를 리스트 형태로 보여주는 **페이지 네비게이션 바**도 추가할 수 있어요 (예: 1 2 3 4 5 ...).
- 검색 조건 유지 기능은 이미 반영되어 있으니, 사용자가 조건을 바꾸지 않는 한 계속 유지됩니다.

---

이제 사용자는 원하는 페이지로 빠르게 이동할 수 있어요! 다음으로는 정렬 기능이나 검색 결과 하이라이트 같은 걸 넣어볼까요? 😄


