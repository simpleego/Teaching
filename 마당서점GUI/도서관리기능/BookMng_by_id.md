# 도서관리 기능
좋아 jong! 이미 등록 기능을 아주 잘 구현했어👏 이제 여기에 아래와 같은 클래스를 추가로 만들어서 도서 관리 시스템을 완성할 수 있어요:

---

## 📘 1. 도서 수정 클래스 `UpdateBook.java`

```java
package step1.bookui;

import step1.entity.Book;

import java.util.List;

public class UpdateBook {
    public boolean updateBookById(List<Book> bookList, int id, String newName, String newPublisher, int newPrice) {
        for (Book book : bookList) {
            if (book.getId() == id) {
                book.setName(newName);
                book.setPublisher(newPublisher);
                book.setPrice(newPrice);
                System.out.println("수정 완료: " + book);
                return true;
            }
        }
        System.out.println("수정 실패: 해당 아이디의 도서가 없습니다.");
        return false;
    }
}
```

---

## 🔍 2. 도서 검색 클래스 `SearchBook.java`

```java
package step1.bookui;

import step1.entity.Book;

import java.util.List;

public class SearchBook {
    public Book searchById(List<Book> bookList, int id) {
        for (Book book : bookList) {
            if (book.getId() == id) {
                System.out.println("검색 결과: " + book);
                return book;
            }
        }
        System.out.println("검색 실패: 해당 아이디의 도서가 없습니다.");
        return null;
    }
}
```

---

## 🗑️ 3. 도서 삭제 클래스 `DeleteBook.java`

```java
package step1.bookui;

import step1.entity.Book;

import java.util.Iterator;
import java.util.List;

public class DeleteBook {
    public boolean deleteBookById(List<Book> bookList, int id) {
        Iterator<Book> iterator = bookList.iterator();
        while (iterator.hasNext()) {
            Book book = iterator.next();
            if (book.getId() == id) {
                iterator.remove();
                System.out.println("삭제 완료: " + book);
                return true;
            }
        }
        System.out.println("삭제 실패: 해당 아이디의 도서가 없습니다.");
        return false;
    }
}
```

---

## ✨ 어떻게 활용하냐면요...

`RegisterBook` 클래스에서 `bookList`를 유지하고 있으니, 위의 클래스들을 인스턴스화해서 기능을 실행하면 됩니다. 예를 들어:

```java
UpdateBook updater = new UpdateBook();
updater.updateBookById(bookList, 101, "새책이름", "새출판사", 20000);
```

---
