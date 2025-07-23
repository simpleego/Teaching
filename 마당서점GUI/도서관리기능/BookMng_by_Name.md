# 도서이름 기반으로 도서를 찾고 수정·삭제할 수 있도록 각 클래스를 개선

---

## ✏️ 수정 기능 (도서 이름으로)

```java
public boolean updateBookByName(List<Book> bookList, String name, String newPublisher, int newPrice) {
    for (Book book : bookList) {
        if (book.getName().equalsIgnoreCase(name)) {
            book.setPublisher(newPublisher);
            book.setPrice(newPrice);
            System.out.println("수정 완료: " + book);
            return true;
        }
    }
    System.out.println("수정 실패: 해당 이름의 도서가 없습니다.");
    return false;
}
```

---

## 🔍 검색 기능 (도서 이름으로)

```java
public Book searchByName(List<Book> bookList, String name) {
    for (Book book : bookList) {
        if (book.getName().equalsIgnoreCase(name)) {
            System.out.println("검색 결과: " + book);
            return book;
        }
    }
    System.out.println("검색 실패: 해당 이름의 도서가 없습니다.");
    return null;
}
```

---

## 🗑️ 삭제 기능 (도서 이름으로)

```java
public boolean deleteBookByName(List<Book> bookList, String name) {
    Iterator<Book> iterator = bookList.iterator();
    while (iterator.hasNext()) {
        Book book = iterator.next();
        if (book.getName().equalsIgnoreCase(name)) {
            iterator.remove();
            System.out.println("삭제 완료: " + book);
            return true;
        }
    }
    System.out.println("삭제 실패: 해당 이름의 도서가 없습니다.");
    return false;
}
```

---

## ✅ 사용 예시

이제 이렇게 쓸 수 있어요:

```java
UpdateBook updater = new UpdateBook();
updater.updateBookByName(bookList, "자바의 정석", "개정출판사", 25000);

SearchBook finder = new SearchBook();
finder.searchByName(bookList, "자바의 정석");

DeleteBook deleter = new DeleteBook();
deleter.deleteBookByName(bookList, "자바의 정석");
```

---
