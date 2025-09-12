# javaAPI_AI
> Java로 OpenAI의 Chat Completions API(REST)를 간단히 호출하는 방법입니다. Java 11 이상의 HttpClient를 사용한 최소 예제와, 응답에서 assistant 메시지를 파싱하는 예제를 포함합니다. 먼저 환경변수 OPENAI_API_KEY에 API 키를 저장하세요.

1) 최소 예제 (Java 11 HttpClient, 응답을 문자열로 출력)
```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class OpenAIChatSimple {
    public static void main(String[] args) throws Exception {
        String apiKey = System.getenv("OPENAI_API_KEY");
        if (apiKey == null) {
            System.err.println("Set OPENAI_API_KEY environment variable.");
            return;
        }

        String payload = """
        {
          "model": "gpt-4", 
          "messages": [
            {"role": "user", "content": "안녕하세요. 오늘 날씨 어때요?"}
          ],
          "max_tokens": 200
        }
        """;

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://api.openai.com/v1/chat/completions"))
            .timeout(Duration.ofSeconds(30))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + apiKey)
            .POST(HttpRequest.BodyPublishers.ofString(payload))
            .build();

        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println("Status: " + response.statusCode());
        System.out.println("Body: " + response.body());
    }
}
```
실행하면 전체 JSON 응답이 출력됩니다. 실제 응답에서 assistant의 메시지(본문)를 읽으려면 JSON 파싱이 필요합니다.

2) 응답 파싱 예제 (org.json 사용) — Maven 의존성 추가
pom.xml에 (필요 시):
```xml
<dependency>
  <groupId>org.json</groupId>
  <artifactId>json</artifactId>
  <version>20230227</version>
</dependency>
```
파싱 코드:
```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import org.json.JSONArray;
import org.json.JSONObject;

public class OpenAIChatParse {
    public static void main(String[] args) throws Exception {
        String apiKey = System.getenv("OPENAI_API_KEY");
        if (apiKey == null) {
            System.err.println("Set OPENAI_API_KEY environment variable.");
            return;
        }

        JSONObject payload = new JSONObject()
            .put("model", "gpt-4")
            .put("messages", new JSONArray().put(
                new JSONObject().put("role", "user").put("content", "자바로 OpenAI API를 어떻게 호출하나요? 간단히 설명해줘.")
            ))
            .put("max_tokens", 200);

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://api.openai.com/v1/chat/completions"))
            .timeout(Duration.ofSeconds(30))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + apiKey)
            .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
            .build();

        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            System.err.println("Error: " + response.statusCode());
            System.err.println(response.body());
            return;
        }

        JSONObject resJson = new JSONObject(response.body());
        // Chat completions의 'choices' 배열에서 assistant content 추출
        String assistantText = resJson
            .getJSONArray("choices")
            .getJSONObject(0)
            .getJSONObject("message")
            .getString("content");

        System.out.println("Assistant: " + assistantText.trim());
    }
}
```

주의 및 팁
- 모델 이름(gpt-4, gpt-4o, gpt-3.5-turbo 등)은 사용 가능 여부 및 요금에 따라 다릅니다. 사용 가능한 모델은 OpenAI 콘솔 또는 문서를 확인하세요.
- 프로덕션에서는 타임아웃, 재시도, 에러 처리, 토큰 제한 관리, 비용 제어 등을 추가로 구현하세요.
- JSON 파싱엔 Jackson, Gson 등 선호하는 라이브러리를 사용해도 됩니다.
- 파일 업로드, 멀티모달, 스트리밍 등 추가 기능을 사용하려면 OpenAI 문서의 해당 엔드포인트를 참고하세요.

원하시면:
- Maven/Gradle 전체 프로젝트 예제,
- OkHttp + Gson 예제,
- 스트리밍(실시간 응답) 예제
중 하나를 더 준비해 드리겠습니다. 어느 것을 원하시나요?
