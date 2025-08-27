# Spring Framework_for_springBoot
### Spring Framework에서는 `web.xml`, `DispatcherServlet`, 그리고 여러 XML 설정 파일(`presentation-layer.xml`, `applicationContext.xml` 등)을 통해 애플리케이션을 구성
하지만 Spring Boot에서는 이런 설정을 **자동화하고 자바 기반으로 통합**해서 훨씬 간결하게 만들 수 있어요.

아래는 전통적인 구조를 Spring Boot에서 어떻게 대응시키는지에 대한 상세 가이드입니다.

---

## 🧱 전통적인 구조 vs Spring Boot 구조 대응

| 구성 요소 | 전통적인 Spring | Spring Boot 방식 |
|-----------|------------------|------------------|
| 서블릿 등록 | `web.xml`에서 DispatcherServlet 등록 | 자동 등록됨 (`SpringBootServletInitializer`로 확장 가능) |
| 설정 파일 | `presentation-layer.xml`, `applicationContext.xml` | `@Configuration` 클래스 또는 `application.yml` |
| Bean 등록 | `<bean>` 태그 | `@Component`, `@Service`, `@Repository`, `@Controller` |
| DI 설정 | XML 기반 `<property>` | `@Autowired`, 생성자 주입 |
| View Resolver | XML에서 설정 | `application.yml` 또는 `@Bean`으로 등록 |
| URL 매핑 | `DispatcherServlet` → Controller | `@RestController`, `@RequestMapping` |

---

## 🔧 Spring Boot에서 설정하는 방법

### 1. DispatcherServlet 설정은 자동화됨
Spring Boot는 `DispatcherServlet`을 자동으로 등록합니다. 따로 `web.xml`을 만들 필요 없이, `@SpringBootApplication`이 모든 설정을 포함합니다.

```java
@SpringBootApplication
public class MyApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }
}
```

---

### 2. XML 설정 파일을 사용하는 경우

Spring Boot에서도 XML 설정을 사용할 수 있어요. 예를 들어 `presentation-layer.xml`을 사용하고 싶다면 다음과 같이 설정합니다:

#### ✅ XML 파일 위치: `src/main/resources/config/presentation-layer.xml`

#### ✅ Java 설정 클래스에서 XML을 불러오기:

```java
@Configuration
@ImportResource("classpath:config/presentation-layer.xml")
public class XmlConfig {
}
```

이렇게 하면 XML에 정의된 Bean들이 Spring Boot 컨텍스트에 포함됩니다.

---

### 3. View Resolver 설정 (예: JSP 사용 시)

```yaml
# application.yml
spring:
  mvc:
    view:
      prefix: /WEB-INF/views/
      suffix: .jsp
```

또는 Java 설정으로 직접 등록할 수도 있어요:

```java
@Bean
public InternalResourceViewResolver viewResolver() {
    InternalResourceViewResolver resolver = new InternalResourceViewResolver();
    resolver.setPrefix("/WEB-INF/views/");
    resolver.setSuffix(".jsp");
    return resolver;
}
```

---

### 4. Controller와 DAO 연결

전통적인 구조에서 DispatcherServlet → Controller → DAO 흐름은 Spring Boot에서도 동일하게 유지됩니다. 단, XML이 아닌 어노테이션 기반으로 구성하죠.

```java
@RestController
@RequestMapping("/api")
public class MyController {

    private final MyDao myDao;

    public MyController(MyDao myDao) {
        this.myDao = myDao;
    }

    @GetMapping("/data")
    public String getData() {
        return myDao.fetchData();
    }
}
```

```java
@Repository
public class MyDao {
    public String fetchData() {
        return "데이터 반환";
    }
}
```

---

## 🧠 요약

- Spring Boot는 전통적인 설정을 대부분 자동화하고 자바 기반으로 대체합니다.
- XML 설정도 `@ImportResource`로 호환 가능하니, 기존 자산을 그대로 활용할 수 있어요.
- DispatcherServlet, ViewResolver, Bean 등록 등은 어노테이션과 `application.yml`로 간단하게 처리됩니다.

혹시 기존 프로젝트를 Spring Boot로 마이그레이션하려는 계획이 있으신가요? 그럼 더 구체적인 전략도 함께 도와드릴 수 있어요.
