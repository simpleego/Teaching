# LMS_채점 
> 이제 학생이 제출한 답안을 기반으로 서버에서 자동 채점하는 백엔드 로직을 Java(Spring Boot)로 구성해볼게요.
> 이 로직은 문제의 정답과 학생의 답안을 비교하여 점수를 계산하고, 결과를 반환하는 기능을 포함합니다.

---

## 🧠 채점 로직 구성 흐름

### 📥 입력 데이터 구조 (JSON 예시)

```json
{
  "answers": [
    { "questionId": 1, "userAnswer": "정답 1" },
    { "questionId": 2, "userAnswer": "틀린 답" },
    { "questionId": 3, "userAnswer": "정답 3" }
  ]
}
```

---

## 🧩 Java 코드 구성

### 1. DTO 클래스

```java
public class AnswerSubmission {
    private Long questionId;
    private String userAnswer;

    // Getters and Setters
}

public class AnswerRequest {
    private List<AnswerSubmission> answers;

    // Getters and Setters
}
```

### 2. 채점 결과 DTO

```java
public class AnswerResult {
    private Long questionId;
    private String correctAnswer;
    private String userAnswer;
    private boolean isCorrect;

    // Getters and Setters
}
```

### 3. 채점 서비스

```java
import org.springframework.stereotype.Service;

@Service
public class GradingService {

    private final QuestionRepository questionRepository;

    public GradingService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    public List<AnswerResult> gradeAnswers(List<AnswerSubmission> submissions) {
        List<AnswerResult> results = new ArrayList<>();

        for (AnswerSubmission submission : submissions) {
            Question question = questionRepository.findById(submission.getQuestionId())
                .orElseThrow(() -> new RuntimeException("문제를 찾을 수 없습니다"));

            boolean isCorrect = question.getAnswer().trim().equalsIgnoreCase(submission.getUserAnswer().trim());

            AnswerResult result = new AnswerResult();
            result.setQuestionId(question.getId());
            result.setCorrectAnswer(question.getAnswer());
            result.setUserAnswer(submission.getUserAnswer());
            result.setIsCorrect(isCorrect);

            results.add(result);
        }

        return results;
    }
}
```

### 4. Controller 구현

```java
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/answers")
public class AnswerController {

    private final GradingService gradingService;

    public AnswerController(GradingService gradingService) {
        this.gradingService = gradingService;
    }

    @PostMapping("/submit")
    public List<AnswerResult> submitAnswers(@RequestBody AnswerRequest request) {
        return gradingService.gradeAnswers(request.getAnswers());
    }
}
```

---

## ✅ 결과 예시 (응답 JSON)

```json
[
  {
    "questionId": 1,
    "correctAnswer": "정답 1",
    "userAnswer": "정답 1",
    "isCorrect": true
  },
  {
    "questionId": 2,
    "correctAnswer": "정답 2",
    "userAnswer": "틀린 답",
    "isCorrect": false
  }
]
```

---

## 🚀 확장 아이디어

- 점수 계산 및 총점 반환 (`score`, `total`)
- 틀린 문제에 대해 AI 해설 자동 제공
- 학생별 채점 결과 저장 및 학습 분석
- 난이도별 정답률 통계 생성

---

이제 프론트엔드에서 정답을 제출하면 이 로직이 자동으로 채점하고 결과를 반환해줍니다. 필요하시면 AI 해설 생성 로직도 함께 설계해드릴 수 있어요. 다음으로 어떤 기능을 확장해볼까요?
