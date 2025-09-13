# 문제출력 및 정답 전손
> 순수 JavaScript를 사용하여 문제 출제 화면을 구성하고, 백엔드 API를 호출해 문제를 받아온 뒤 화면에 출력하고, 사용자가 입력한 정답을 서버에 전송하는 전체 흐름을 보여주는 예제입니다.

---

## 🧩 시나리오 요약

1. 사용자가 과목/주제/문제 수를 입력하고 "문제 생성" 버튼 클릭  
2. JavaScript가 백엔드 API(`/api/questions/generate`)를 호출  
3. 응답으로 받은 문제들을 화면에 출력  
4. 사용자가 각 문제에 대해 정답을 입력  
5. "정답 제출" 버튼 클릭 시 서버에 정답 전송 (`/api/answers/submit` 등)

---

## 🖥️ HTML + JavaScript 예제

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>LMS 문제 출제</title>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    .question { margin-bottom: 20px; }
    input[type="text"] { width: 300px; }
  </style>
</head>
<body>

  <h1>문제 출제 및 풀이</h1>

  <div>
    <label>과목: <input type="text" id="subject" value="수학"></label><br>
    <label>주제: <input type="text" id="topic" value="2차 방정식"></label><br>
    <label>문제 수: <input type="number" id="count" value="3"></label><br>
    <button onclick="generateQuestions()">문제 생성</button>
  </div>

  <hr>

  <div id="questionsArea"></div>

  <button onclick="submitAnswers()">정답 제출</button>

  <script>
    let questions = [];

    async function generateQuestions() {
      const subject = document.getElementById("subject").value;
      const topic = document.getElementById("topic").value;
      const count = parseInt(document.getElementById("count").value);

      const response = await fetch("/api/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topic, count })
      });

      const data = await response.json();
      questions = data;

      const container = document.getElementById("questionsArea");
      container.innerHTML = "";

      questions.forEach((q, index) => {
        const div = document.createElement("div");
        div.className = "question";
        div.innerHTML = `
          <p><strong>문제 ${index + 1}:</strong> ${q.questionText}</p>
          <label>내 답안: <input type="text" id="answer-${index}"></label>
        `;
        container.appendChild(div);
      });
    }

    async function submitAnswers() {
      const answers = questions.map((q, index) => {
        const userAnswer = document.getElementById(`answer-${index}`).value;
        return {
          questionId: q.id,
          userAnswer: userAnswer
        };
      });

      const response = await fetch("/api/answers/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      });

      const result = await response.json();
      alert("제출 완료! 결과: " + JSON.stringify(result));
    }
  </script>

</body>
</html>
```

---

## 🧠 백엔드 연동 포인트

- `/api/questions/generate`: 문제 생성 API (앞서 Java 예제에서 구현한 컨트롤러)
- `/api/answers/submit`: 사용자의 정답을 서버에 전송하는 API (추가 구현 필요)

```java
@PostMapping("/answers/submit")
public ResponseEntity<?> submitAnswers(@RequestBody AnswerRequest request) {
    // request.answers → questionId, userAnswer
    // 각 문제의 정답과 비교 후 채점
    // 결과 반환
}
```

---

## 🚀 확장 아이디어

- 정답 제출 후 AI가 해설 제공
- 틀린 문제에 대해 유사 문제 재출제
- 사용자별 학습 이력 저장 및 분석

---

필요하시면 React나 Vue 기반으로도 UI를 구성해드릴 수 있어요. 또는 백엔드 채점 로직도 함께 설계해볼까요?
