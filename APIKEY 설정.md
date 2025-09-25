
### 🔑 OpenAI API Key 세팅 국룰!

1.  **OpenAI API 키 발급받기**
    *   먼저, OpenAI 사이트 가서 로그인하고 API 키를 발급받아야 해요 [1]. (아직 없으면 만들고 오세여!)

2.  **환경변수 설정 (feat. 로컬 개발 환경)**

    *   **로컬 OS 환경변수로 등록**:
        *   윈도우: `제어판 > 시스템 및 보안 > 시스템 > 고급 시스템 설정 > 환경 변수` 가서 `OPENAI_API_KEY` 같은 이름으로 키 값을 넣어줘요.
        *   맥/리눅스: `~/.bashrc`나 `~/.zshrc` 같은 쉘 설정 파일에 `export OPENAI_API_KEY="sk-~~~~"` 이런 식으로 추가하고 `source ~/.zshrc` (혹은 bashrc)로 적용!
        *   **왜 이렇게 하냐고요?** 이 방식이 가장 일반적이고 보안에 강해요. 앱을 실행할 때 OS 레벨에서 바로 이 변수를 읽어오도록 하는 거죠.

    *   **IntelliJ에서 설정 (개발할 때 편함)** [3] [5]:
        *   인텔리제이에서 `Run` -> `Edit Configurations...` 으로 들어가세요.
        *   사용하는 Run/Debug Configuration (예: Spring Boot Application)을 선택하고, `Modify options` 클릭 후 `Environment variables`를 추가해요.
        *   거기에 `OPENAI_API_KEY=sk-~~~` 이런 식으로 직접 입력하거나, 이미 OS에 설정했다면 `OPENAI_API_KEY=${OPENAI_API_KEY}` 이렇게 참조할 수도 있어요.

3.  **Spring Boot 프로젝트에서 사용하기**

    *   **`application.properties` or `application.yml` 활용하기** [6]:
        *   제일 간단하고 많이 쓰는 방법! `application.properties` 파일에 이렇게 추가해 줘요:
            ```properties
            # OS 환경변수 OPENAI_API_KEY를 참조함
            # 만약 OS에 설정 안 했으면 여기에 바로 키값 넣어도 되지만, 보안상 비추!
            spring.ai.openai.api-key=${OPENAI_API_KEY}
            ```
        *   `application.yml` 파일은 이렇게!
            ```yaml
            spring:
              ai:
                openai:
                  api-key: ${OPENAI_API_KEY}
            ```
            **⭐ 꿀팁**: `spring.ai.openai.api-key` 이 속성 이름은 Spring AI 프로젝트에서 OpenAI 키를 자동으로 인식하는 데 사용하는 이름이라서 이걸 쓰는 게 제일 깔끔해요! [10]

    *   **코드에서 사용하기 (feat. `@Value` 나 `@ConfigurationProperties`)** [5]:
        *   **`@Value` 어노테이션 사용:**
            ```java
            import org.springframework.beans.factory.annotation.Value;
            import org.springframework.stereotype.Service;

            @Service
            public class OpenAIService {

                @Value("${spring.ai.openai.api-key}") // application.properties의 키값 주입!
                private String openaiApiKey;

                public void callOpenAI() {
                    System.out.println("My OpenAI API Key: " + openaiApiKey);
                    // 이 키로 OpenAI API 호출 로직 구현
                }
            }
            ```
        *   **`@ConfigurationProperties` 사용 (좀 더 구조적이고 대량 설정에 좋음):**
            만약 OpenAI 관련 설정이 많다면 클래스로 묶어서 관리하는 게 편해요. [5]

            ```java
            import org.springframework.boot.context.properties.ConfigurationProperties;
            import org.springframework.stereotype.Component;
            import lombok.Getter;
            import lombok.Setter;

            @Getter
            @Setter
            @Component
            @ConfigurationProperties(prefix = "spring.ai.openai") // application.properties의 spring.ai.openai 프리픽스 하위 속성들을 매핑
            public class OpenAIConfigProperties {
                private String apiKey; // spring.ai.openai.api-key 와 매핑됨
                // 추가로 다른 설정들이 있다면 여기에 필드 추가
            }

            // 사용하는 곳에서는 이렇게
            import org.springframework.beans.factory.annotation.Autowired;
            import org.springframework.stereotype.Service;

            @Service
            public class MyService {

                private final OpenAIConfigProperties openaiConfigProperties;

                @Autowired
                public MyService(OpenAIConfigProperties openaiConfigProperties) {
                    this.openaiConfigProperties = openaiConfigProperties;
                }

                public void doSomethingWithOpenAI() {
                    System.out.println("OpenAI API Key: " + openaiConfigProperties.getApiKey());
                    // openaiConfigProperties.getApiKey() 사용
                }
            }
            ```

이렇게 하면 API 키 유출 걱정 없이 안전하게 개발할 수 있을 거예요! 혹시 `401 Unauthorized` 에러 뜨면 키가 잘못됐거나 설정이 안 된 거니 다시 한번 확인해보세용 [2]! 궁금한 거 있으면 또 물어봐여! 🔥 

참고 자료 

[1] medium.com - Integration of OpenAI Chat Completions API with Spring Boot (https://medium.com/@surezms/integration-of-openai-chat-completions-api-with-spring-boot-24f7291c0174)
[2] stackoverflow.com - Why openai key is not working in spring boot (https://stackoverflow.com/questions/76922671/why-openai-key-is-not-working-in-spring-boot)
[3] velog.io - [Spring Boot / IntelliJ] Application 환경변수 설정하기 (https://velog.io/@ygy0102/Spring-Boot-IntelliJ-Application-%ED%99%98%EA%B2%BD%EB%B3%80%EC%88%98-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0)
[4] itconquest.tistory.com - [Spring Boot] 인텔리제이에서 DB 정보 환경 변수 설정하기 (https://itconquest.tistory.com/entry/Spring-Boot-%EC%9D%B8%ED%85%94%EB%A6%AC%EC%A0%9C%EC%9D%B4%EC%97%90%EC%84%9C-DB-%EC%A0%95%EB%B3%B4-%ED%99%98%EA%B2%BD-%EB%B3%80%EC%88%98-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0)
[5] velog.io - Spring Boot에서 환경 변수 사용하기 (https://velog.io/@rhqjatn2398/Spring-Boot%EC%97%90%EC%84%9C-%ED%99%98%EA%B2%BD-%EB%B3%80%EC%88%98-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0)
[6] application.yml (Profile) - [Spring Boot] 환경변수 설정 - application.yml (Profile) (https://margin1103.tistory.com/58)
[7] docs.spring.io - OpenAI Embeddings :: Spring AI Reference (https://docs.spring.io/spring-ai/reference/api/embeddings/openai-embeddings.html)
[8] naturecancoding.tistory.com - [Spring/기초] 환경 변수 파일 사용하기 (env.properties) (https://naturecancoding.tistory.com/96)
[9] stackoverflow.com - The OPENAI_API_KEY environment variable is missing or ... (https://stackoverflow.com/questions/77797590/error-the-openai-api-key-environment-variable-is-missing-or-empty)
[10] docs.spring.io - OpenAI Chat :: Spring AI Reference (https://docs.spring.io/spring-ai/reference/api/chat/openai-chat.html)
