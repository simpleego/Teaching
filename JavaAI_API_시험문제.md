# JavaAI_API_시험문제
> Java로 OpenAI Chat Completions API에 "자바기초문법에 관한 문제를 10문제 제출해줘" 요청을 보내
> 응답을 받아 HTML로 구성한 뒤(파일로 저장하고) 간단한 HTTP 서버로 제공하는 완전한 예제입니다.

요약
- Java 11+ 필요 (HttpClient 사용)
- 환경변수 OPENAI_API_KEY에 API 키를 설정
- org.json(혹은 Gson)로 JSON 파싱 (예제는 org.json 사용)
- 실행하면 problems.html을 생성하고 http://localhost:8000 에서 결과를 확인 가능

pom.xml 의존성 (Maven)
```xml
<dependency>
  <groupId>org.json</groupId>
  <artifactId>json</artifactId>
  <version>20230227</version>
</dependency>
```

전체 코드 (OpenAIQuizToHtml.java)
```java
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import org.json.JSONArray;
import org.json.JSONObject;

import java.awt.Desktop;
import java.io.*;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class OpenAIQuizToHtml {
    private static final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";
    private static final String MODEL = "gpt-3.5-turbo"; // 필요에 따라 변경

    public static void main(String[] args) throws Exception {
        String apiKey = System.getenv("OPENAI_API_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            System.err.println("환경변수 OPENAI_API_KEY를 설정하세요.");
            return;
        }

        String systemMessage = "You are a JSON-output assistant. Respond with exactly one JSON object with key \"questions\" " +
                "whose value is an array of 10 strings. Each string should be a Java basic-syntax question in Korean. Do NOT include answers or extra commentary.";

        String userMessage = "자바기초문법에 관한 문제를 10문제 제출해줘";

        // 구성할 payload (messages 형식)
        JSONObject payload = new JSONObject();
        payload.put("model", MODEL);
        JSONArray messages = new JSONArray();
        messages.put(new JSONObject().put("role", "system").put("content", systemMessage));
        messages.put(new JSONObject().put("role", "user").put("content", userMessage));
        payload.put("messages", messages);
        payload.put("max_tokens", 800);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(OPENAI_URL))
                .timeout(Duration.ofSeconds(30))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
                .build();

        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

        if (response.statusCode() != 200) {
            System.err.println("OpenAI API 오류: " + response.statusCode());
            System.err.println(response.body());
            return;
        }

        JSONObject resJson = new JSONObject(response.body());
        String assistantText = resJson
                .getJSONArray("choices")
                .getJSONObject(0)
                .getJSONObject("message")
                .getString("content")
                .trim();

        // 먼저 JSON으로 출력했는지 시도
        List<String> questions = extractQuestionsFromJsonOrFallback(assistantText);

        if (questions.isEmpty()) {
            System.err.println("질문을 추출하지 못했습니다. 모델 응답:");
            System.err.println(assistantText);
            return;
        }

        String html = buildHtml(questions);
        Path outFile = Path.of("problems.html");
        Files.writeString(outFile, html, StandardCharsets.UTF_8);

        System.out.println("HTML 파일 생성됨: " + outFile.toAbsolutePath());
        System.out.println("http://localhost:8000 에서 확인 가능합니다.");

        // 간단한 HTTP 서버로 제공
        startHttpServer(html, 8000);

        // 선택적으로 기본 브라우저로 열기 (가능한 환경에서)
        if (Desktop.isDesktopSupported()) {
            try {
                Desktop.getDesktop().browse(new URI("http://localhost:8000"));
            } catch (Exception e) {
                // 무시
            }
        }
    }

    private static List<String> extractQuestionsFromJsonOrFallback(String assistantText) {
        List<String> list = new ArrayList<>();

        // 1) JSON 파싱 시도
        try {
            JSONObject j = new JSONObject(assistantText);
            if (j.has("questions")) {
                JSONArray arr = j.getJSONArray("questions");
                for (int i = 0; i < arr.length(); i++) {
                    String q = arr.getString(i).trim();
                    if (!q.isEmpty()) list.add(q);
                }
                if (!list.isEmpty()) return list;
            }
        } catch (Exception ignored) {}

        // 2) plain text에서 번호 목록 추출 (예: "1. 질문" 또는 "1) 질문")
        Pattern p = Pattern.compile("(?m)^[\\s]*\\d+\\s*[\\.|\\)]\\s*(.+)$");
        Matcher m = p.matcher(assistantText);
        while (m.find()) {
            String q = m.group(1).trim();
            if (!q.isEmpty()) list.add(q);
        }
        if (!list.isEmpty()) return list;

        // 3) 줄 단위로 (최후의 수단)
        String[] lines = assistantText.split("\\r?\\n");
        for (String line : lines) {
            String s = line.trim();
            if (s.length() > 5 && s.length() < 200) {
                // 간단 필터: 너무 짧거나 긴 라인 제외
                list.add(s);
            }
        }
        return list;
    }

    private static String buildHtml(List<String> questions) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!doctype html>\n<html lang=\"ko\">\n<head>\n<meta charset=\"utf-8\">\n");
        sb.append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n");
        sb.append("<title>자바 기초문법 문제 10문제</title>\n");
        sb.append("<style>body{font-family: Arial, sans-serif; padding:20px; max-width:800px; margin:auto;} ");
        sb.append("h1{color:#333;} ol{font-size:16px;} .footer{margin-top:30px;color:#666;font-size:13px;}</style>\n");
        sb.append("</head>\n<body>\n<h1>자바 기초문법 문제 (10문제)</h1>\n");
        sb.append("<ol>\n");
        for (String q : questions) {
            sb.append("<li>").append(escapeHtml(q)).append("</li>\n");
        }
        sb.append("</ol>\n");
        sb.append("<div class=\"footer\">생성일: ").append(java.time.LocalDateTime.now()).append("</div>\n");
        sb.append("</body>\n</html>");
        return sb.toString();
    }

    private static String escapeHtml(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&#39;");
    }

    private static void startHttpServer(String html, int port) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/", new HtmlHandler(html));
        server.setExecutor(null);
        server.start();
    }

    static class HtmlHandler implements HttpHandler {
        private final byte[] content;
        HtmlHandler(String html) {
            this.content = html.getBytes(StandardCharsets.UTF_8);
        }
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().set("Content-Type", "text/html; charset=utf-8");
            exchange.sendResponseHeaders(200, content.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(content);
            }
        }
    }
}
```

사용법
1. OPENAI_API_KEY 환경변수 설정
   - macOS/Linux: export OPENAI_API_KEY="sk-..."
   - Windows (PowerShell): $env:OPENAI_API_KEY="sk-..."
2. 컴파일/실행
   - Maven 프로젝트라면 의존성 추가 후 mvn package / mvn exec:java 사용
   - 단일 파일로 실행 시 org.json 라이브러리를 클래스패스에 넣어 javac/java 실행
3. 실행 후 브라우저에서 http://localhost:8000 접속하면 문제 목록 확인 가능

참고 및 개선점
- 모델 출력이 항상 JSON 규격을 지킨다는 보장이 없으므로 코드에서 파싱 실패 시 여러 방식으로 추출하도록 처리했습니다.
- 프로덕션에서는 예외 처리, 재시도 로직, 입력 검증, CORS 설정(외부에서 접근 시) 등을 추가하세요.
- 문제를 답안과 함께 제공하거나 난이도/보기 포함 등의 포맷을 원하면 system/user 메시지를 변경해 요청하면 됩니다.

원하시면:
- Maven/Gradle 전체 예제(pom.xml 포함),
- Spring Boot로 REST 엔드포인트 제공하는 버전,
- 문제에 대한 정답/해설을 함께 표시하도록 확장
중 어떤 것을 원하시는지 말씀해 주세요.
