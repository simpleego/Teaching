# OpenAI를 이용한 문제출제 DB화
> 아래는 “GPT에게 자바 기초 4지선다 문제 5개를 요청 → 응답(JSON) 파싱 → DB 저장 → 페이지에서 문제 풀기/채점”까지
> 한 번에 되는 **Spring Boot + JPA + Thymeleaf** 예시 프로젝트 코드입니다.
(※ **API 키는 절대 하드코딩하지 말고 환경변수 `OPENAI_API_KEY`** 로 주입합니다.)

---

# 1) 프로젝트 스캐폴딩

### `pom.xml`

```xml
<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>gpt-quiz</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <properties>
    <java.version>17</java.version>
    <spring-boot.version>3.3.3</spring-boot.version>
  </properties>

  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-dependencies</artifactId>
        <version>${spring-boot.version}</version>
        <type>pom</type>
        <scope>import</scope>
      </dependency>
    </dependencies>
  </dependencyManagement>

  <dependencies>
    <!-- Web & Thymeleaf -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-thymeleaf</artifactId>
    </dependency>

    <!-- JPA & H2 (개발용) -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
      <groupId>com.h2database</groupId>
      <artifactId>h2</artifactId>
      <scope>runtime</scope>
    </dependency>

    <!-- Jackson -->
    <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
    </dependency>

    <!-- Lombok (선호 시) -->
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <optional>true</optional>
    </dependency>

    <!-- Validation -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- WebClient -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-webflux</artifactId>
    </dependency>

    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>
```

### `src/main/resources/application.yml`

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:gptquiz;DB_CLOSE_DELAY=-1;MODE=MySQL
    driverClassName: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate.format_sql: true
  thymeleaf:
    cache: false

logging.level.org.hibernate.SQL: debug

openai:
  api-key: ${OPENAI_API_KEY}  # 환경변수로 주입

server:
  port: 8080
```

---

# 2) 도메인 & JPA

### `Question.java`

```java
package com.example.gptquiz.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Question {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 1000, nullable = false)
    private String text;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("label ASC")
    private List<Choice> choices = new ArrayList<>();

    @Column(length = 1, nullable = false) // 'A'~'D'
    private String correctLabel;

    public void addChoice(Choice c) {
        c.setQuestion(this);
        this.choices.add(c);
    }
}
```

### `Choice.java`

```java
package com.example.gptquiz.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity @Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Choice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "question_id")
    private Question question;

    @Column(length = 1, nullable = false) // 'A','B','C','D'
    private String label;

    @Column(length = 1000, nullable = false)
    private String text;
}
```

### `QuestionRepository.java`

```java
package com.example.gptquiz.repo;

import com.example.gptquiz.domain.Question;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Question, Long> {
}
```

---

# 3) OpenAI 호출 DTO + 파서

우리는 **JSON으로 응답 받도록** 프롬프트를 설계합니다. (문자 파싱/정규식보다 안전)

### 요청/응답 DTO

```java
package com.example.gptquiz.openai;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatRequest {
    private String model;
    private List<Message> messages;
    private Map<String, Object> response_format; // {"type": "json_object"}

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Message {
        private String role;    // "system", "user"
        private String content;
    }
}

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class ChatResponse {
    private List<Choice> choices;

    @Getter @Setter
    public static class Choice {
        private Message message;
    }

    @Getter @Setter
    public static class Message {
        private String role;
        private String content; // JSON string (we asked for json_object)
    }
}
```

### 문제 응답(JSON) 스키마 DTO

```java
package com.example.gptquiz.quizdto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizPayload {
    private List<Item> questions;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Item {
        private String question;
        private Options options;
        private String correct; // "A" | "B" | "C" | "D"
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Options {
        private String A;
        private String B;
        private String C;
        private String D;
    }
}
```

---

# 4) OpenAI 클라이언트 서비스

### `OpenAiConfig.java`

```java
package com.example.gptquiz.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class OpenAiConfig {

    @Bean
    public WebClient openAiWebClient(@Value("${openai.api-key}") String apiKey) {
        return WebClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                // 응답이 길어질 경우 대비 버퍼 확장
                .exchangeStrategies(ExchangeStrategies.builder()
                        .codecs(cfg -> cfg.defaultCodecs().maxInMemorySize(4 * 1024 * 1024))
                        .build())
                .build();
    }
}
```

### `OpenAiService.java`

```java
package com.example.gptquiz.service;

import com.example.gptquiz.openai.ChatRequest;
import com.example.gptquiz.openai.ChatResponse;
import com.example.gptquiz.quizdto.QuizPayload;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OpenAiService {

    private final WebClient openAiWebClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public QuizPayload requestJavaBasicsQuiz(int count) {
        String system = "You are a helpful assistant that outputs strictly valid JSON for quizzes.";
        String user = """
            자바 기초 4지선다 문제를 %d개 만들어줘.
            난이도: 초중급 혼합.
            출력은 반드시 JSON(UTF-8)으로만, 아래 스키마를 준수해.
            {
              "questions": [
                {
                  "question": "문항 내용",
                  "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
                  "correct": "A"
                }
              ]
            }
            제약:
            - 각 문항은 보기 텍스트가 중복되지 않게.
            - '정답은 ~' 같은 설명 금지(오직 JSON).
            - 한국어로 작성.
            """.formatted(count);

        ChatRequest req = ChatRequest.builder()
                .model("gpt-4o-mini") // 또는 'gpt-4.1-mini', 필요시 변경
                .messages(List.of(
                        ChatRequest.Message.builder().role("system").content(system).build(),
                        ChatRequest.Message.builder().role("user").content(user).build()
                ))
                .response_format(Map.of("type", "json_object"))
                .build();

        ChatResponse res = openAiWebClient.post()
                .uri("/chat/completions")
                .bodyValue(req)
                .retrieve()
                .bodyToMono(ChatResponse.class)
                .block();

        if (res == null || res.getChoices() == null || res.getChoices().isEmpty()) {
            throw new IllegalStateException("OpenAI 응답이 비어 있습니다.");
        }

        String json = res.getChoices().get(0).getMessage().getContent();
        try {
            return objectMapper.readValue(json, QuizPayload.class);
        } catch (Exception e) {
            throw new RuntimeException("OpenAI JSON 파싱 실패: " + e.getMessage() + "\n원본: " + json, e);
        }
    }
}
```

---

# 5) 비즈니스 서비스 (저장/조회/채점)

### `QuizService.java`

```java
package com.example.gptquiz.service;

import com.example.gptquiz.domain.Choice;
import com.example.gptquiz.domain.Question;
import com.example.gptquiz.quizdto.QuizPayload;
import com.example.gptquiz.repo.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuestionRepository questionRepository;
    private final OpenAiService openAiService;

    @Transactional
    public List<Question> generateAndSave(int count) {
        QuizPayload payload = openAiService.requestJavaBasicsQuiz(count);

        List<Question> toSave = new ArrayList<>();
        for (QuizPayload.Item item : payload.getQuestions()) {
            Question q = Question.builder()
                    .text(item.getQuestion())
                    .correctLabel(item.getCorrect())
                    .createdAt(LocalDateTime.now())
                    .build();

            Map<String, String> opt = Map.of(
                    "A", item.getOptions().getA(),
                    "B", item.getOptions().getB(),
                    "C", item.getOptions().getC(),
                    "D", item.getOptions().getD()
            );
            opt.forEach((label, text) -> q.addChoice(
                    Choice.builder().label(label).text(text).build()
            ));
            toSave.add(q);
        }
        return questionRepository.saveAll(toSave);
    }

    public List<Question> findAll() {
        return questionRepository.findAll();
    }

    public int grade(Map<Long, String> userAnswers) {
        List<Question> all = questionRepository.findAll();
        int score = 0;
        for (Question q : all) {
            String user = userAnswers.get(q.getId());
            if (user != null && user.equalsIgnoreCase(q.getCorrectLabel())) {
                score++;
            }
        }
        return score;
    }
}
```

---

# 6) 컨트롤러 & 뷰

### `QuizController.java`

```java
package com.example.gptquiz.web;

import com.example.gptquiz.domain.Question;
import com.example.gptquiz.service.QuizService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Controller
@RequiredArgsConstructor
@Validated
public class QuizController {

    private final QuizService quizService;

    @GetMapping("/")
    public String home(Model model) {
        List<Question> questions = quizService.findAll();
        model.addAttribute("questions", questions);
        return "index";
    }

    @PostMapping("/generate")
    public String generate(@RequestParam(defaultValue = "5") @Min(1) @Max(20) int count) {
        quizService.generateAndSave(count);
        return "redirect:/";
    }

    @PostMapping("/submit")
    public String submit(@RequestParam Map<String, String> params, Model model) {
        // params key 형식: answer_{questionId} = "A"~"D"
        Map<Long, String> answers = new HashMap<>();
        params.forEach((k, v) -> {
            if (k.startsWith("answer_")) {
                try {
                    Long qid = Long.valueOf(k.substring("answer_".length()));
                    answers.put(qid, v);
                } catch (NumberFormatException ignored) {}
            }
        });
        int total = quizService.findAll().size();
        int correct = quizService.grade(answers);
        model.addAttribute("score", correct);
        model.addAttribute("total", total);
        model.addAttribute("questions", quizService.findAll());
        model.addAttribute("answers", answers);
        return "result";
    }
}
```

### `src/main/resources/templates/index.html`

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>GPT 시험문제 제출 및 풀이</title>
  <style>
    #container { width: 70%; margin: 50px auto; border-top: 10px solid #aaa; border-bottom: 20px solid #333; padding: 2em; }
    .question { margin: 1em 0; }
    .choices label { display: block; margin: 4px 0; }
  </style>
</head>
<body>
<div id="container">
  <h2>🧠 자바 기초 문제</h2>

  <form th:action="@{/generate}" method="post" style="margin-bottom: 1em;">
    <label>생성할 문항 수: <input type="number" name="count" value="5" min="1" max="20"/></label>
    <button type="submit">문제 생성하기</button>
  </form>

  <form th:if="${#lists.size(questions) > 0}" th:action="@{/submit}" method="post">
    <div th:each="q : ${questions}" class="question">
      <strong th:text="${q.id} + '. ' + ${q.text}"></strong>
      <div class="choices">
        <label th:each="c : ${q.choices}">
          <input type="radio" th:name="${'answer_' + q.id}" th:value="${c.label}"/>
          <span th:text="${c.label + '. ' + c.text}"></span>
        </label>
      </div>
    </div>
    <button type="submit">제출하기</button>
  </form>

  <div th:if="${#lists.size(questions) == 0}">
    아직 저장된 문제가 없습니다. “문제 생성하기”를 눌러 생성하세요.
  </div>
</div>
</body>
</html>
```

### `src/main/resources/templates/result.html`

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>결과</title>
  <style>
    #container { width: 70%; margin: 50px auto; border-top: 10px solid #aaa; border-bottom: 20px solid #333; padding: 2em; }
    .correct { color: blue; font-weight: bold; }
    .wrong { color: red; font-weight: bold; }
    .na { color: orange; font-weight: bold; }
  </style>
</head>
<body>
<div id="container">
  <h2>🧮 점수: <span th:text="${score}"></span>/<span th:text="${total}"></span></h2>
  <a th:href="@{/}">← 돌아가기</a>
  <hr/>
  <div th:each="q : ${questions}">
    <div>
      <strong th:text="${q.id} + '. ' + ${q.text}"></strong>
      <div th:each="c : ${q.choices}">
        <span th:text="${c.label + '. ' + c.text}"></span>
        <span th:if="${answers['answer_' + q.id] == c.label and c.label == q.correctLabel}" class="correct"> — 정답 (선택)</span>
        <span th:if="${answers['answer_' + q.id] == c.label and c.label != q.correctLabel}" class="wrong"> — 오답 (선택)</span>
        <span th:if="${answers['answer_' + q.id]} == null and c.label == q.correctLabel" class="na"> — 정답</span>
        <br/>
      </div>
      <div><em>정답: <span th:text="${q.correctLabel}"></span></em></div>
    </div>
    <hr/>
  </div>
</div>
</body>
</html>
```

---

# 7) 부트스트랩 클래스

### `GptQuizApplication.java`

```java
package com.example.gptquiz;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GptQuizApplication {
    public static void main(String[] args) {
        SpringApplication.run(GptQuizApplication.class, args);
    }
}
```

---

# 8) 보안 & 운영 팁

* **API 키**: 로컬에서는 `export OPENAI_API_KEY="sk-..."` 로 환경변수 설정.
  프로덕션은 Secret Manager/환경변수/CI 주입 등 사용.
* **응답 포맷 고정**: `response_format: {"type":"json_object"}` 로 JSON만 받도록 강제 → 파싱 안정성 ↑
* **검증/중복제거**: 실서비스에서는 저장 전 **문항 중복 검사**(문자열 유사도)나 **욕설/부적절성 필터** 추가 권장.
* **DB 전환**: H2 → MySQL/PostgreSQL 전환 시 `application.yml` 의 datasource만 교체.
* **모델 선택**: 예제는 `gpt-4o-mini` 사용. 비용/속도/품질 기준으로 교체 가능.
* **오류 핸들링**: OpenAI 오류코드(401/429 등) 대응 메시지 및 재시도 로직(백오프) 필요시 추가.

---

# 9) 원하는 흐름

1. `/` 접속 → 저장된 문제가 없으면 안내.
2. “문제 생성하기” 누르면 `/generate` POST → OpenAI 호출 → 5문항 생성 및 DB 저장.
3. 다시 `/`로 리다이렉트 → 문제 라디오 버튼 표시.
4. 제출 시 `/submit` POST → 서버에서 채점 → 결과 페이지 표시.

---

필요에 따라 **문제 카테고리/난이도/개수/언어** 등 파라미터를 UI에 더 추가해드릴 수도 있어요. 확장 원하시면 말씀만 해주세요!
