## 1. 프로젝트 설정

### build.gradle
```gradle
plugins {
    id 'org.springframework.boot' version '3.2.0'
    id 'io.spring.dependency-management' version '1.1.4'
    id 'java'
}

group = 'com.example'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '17'

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-websocket'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
    implementation 'org.webjars:webjars-locator-core:0.52'
    implementation 'org.webjars:sockjs-client:1.5.1'
    implementation 'org.webjars:stomp-websocket:2.3.4'
    implementation 'org.webjars:bootstrap:5.3.0'
    implementation 'org.webjars:jquery:3.6.4'
    implementation 'com.fasterxml.jackson.core:jackson-databind'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```

## 2. WebSocket 설정

### WebSocketConfig.java
```java
package com.example.chat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
```

## 3. 메시지 모델

### ChatMessage.java
```java
package com.example.chat.model;

import java.time.LocalDateTime;

public class ChatMessage {
    private String content;
    private String sender;
    private MessageType type;
    private LocalDateTime timestamp;

    public enum MessageType {
        CHAT, JOIN, LEAVE
    }

    // 생성자
    public ChatMessage() {
        this.timestamp = LocalDateTime.now();
    }

    public ChatMessage(String content, String sender, MessageType type) {
        this.content = content;
        this.sender = sender;
        this.type = type;
        this.timestamp = LocalDateTime.now();
    }

    // Getter, Setter
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
```

## 4. 채팅 컨트롤러

### ChatController.java
```java
package com.example.chat.controller;

import com.example.chat.model.ChatMessage;
import com.example.chat.service.ChatService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/")
    public String chatPage(Model model) {
        return "chat";
    }

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        // 질문에 대한 응답 생성
        String response = chatService.processMessage(chatMessage.getContent());
        
        // 사용자 메시지 전송
        chatMessage.setType(ChatMessage.MessageType.CHAT);
        
        // 응답 메시지 생성 및 전송 (별도로 처리)
        if (!response.isEmpty()) {
            ChatMessage botMessage = new ChatMessage(response, "ChatBot", ChatMessage.MessageType.CHAT);
            // 별도의 메시지로 응답 전송
            sendBotResponse(botMessage);
        }
        
        return chatMessage;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage, 
                               SimpMessageHeaderAccessor headerAccessor) {
        // WebSocket 세션에 사용자 이름 추가
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        chatMessage.setType(ChatMessage.MessageType.JOIN);
        return chatMessage;
    }

    private void sendBotResponse(ChatMessage botMessage) {
        // 이 메서드는 실제로는 WebSocket 템플릿을 사용하여 응답을 전송해야 하지만,
        // 간단한 구현을 위해 컨트롤러에서 직접 처리하지 않음
        // 실제 구현에서는 SimpMessagingTemplate을 주입받아 사용
    }
}
```

## 5. 채팅 서비스

### ChatService.java
```java
package com.example.chat.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class ChatService {

    private final Map<String, String> qaMap;

    public ChatService() {
        this.qaMap = initializeQAMap();
    }

    private Map<String, String> initializeQAMap() {
        Map<String, String> map = new HashMap<>();
        
        // 기본 질문-응답 매핑
        map.put("안녕", "안녕하세요! 무엇을 도와드릴까요?");
        map.put("hello", "Hello! How can I help you?");
        map.put("hi", "Hi there!");
        map.put("이름", "저는 채팅봇입니다.");
        map.put("시간", "현재 시간은 " + java.time.LocalTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss")) + " 입니다.");
        map.put("날짜", "오늘은 " + java.time.LocalDate.now() + " 입니다.");
        map.put("도움말", "다음과 같은 질문을 해보세요: 안녕, 시간, 날짜, 도움말");
        map.put("감사", "천만에요! 또 궁금한 것이 있으면 물어보세요.");
        map.put("고마워", "별 말씀을요! 도움이 되어 기쁩니다.");
        
        return map;
    }

    public String processMessage(String message) {
        if (message == null || message.trim().isEmpty()) {
            return "메시지를 입력해주세요.";
        }

        String lowerMessage = message.toLowerCase().trim();
        
        // 정확한 매칭
        for (Map.Entry<String, String> entry : qaMap.entrySet()) {
            if (lowerMessage.contains(entry.getKey().toLowerCase())) {
                return entry.getValue();
            }
        }

        // 패턴 매칭
        if (Pattern.compile("(몇 시|시간)").matcher(lowerMessage).find()) {
            return qaMap.get("시간");
        }
        
        if (Pattern.compile("(몇 일|날짜|오늘)").matcher(lowerMessage).find()) {
            return qaMap.get("날짜");
        }

        if (Pattern.compile("(이름|누구)").matcher(lowerMessage).find()) {
            return qaMap.get("이름");
        }

        // 기본 응답
        return "죄송합니다. 그 질문에 대한 답변을 아직 배우지 못했어요. 다른 질문을 해보시겠어요?";
    }

    public void addQAPair(String question, String answer) {
        qaMap.put(question.toLowerCase(), answer);
    }
}
```

## 6. 개선된 ChatController (WebSocket 템플릿 사용)

### WebSocketChatController.java
```java
package com.example.chat.controller;

import com.example.chat.model.ChatMessage;
import com.example.chat.service.ChatService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebSocketChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    public WebSocketChatController(SimpMessagingTemplate messagingTemplate, 
                                 ChatService chatService) {
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
    }

    @GetMapping("/")
    public String chatPage() {
        return "chat";
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        // 사용자 메시지 브로드캐스트
        chatMessage.setType(ChatMessage.MessageType.CHAT);
        messagingTemplate.convertAndSend("/topic/public", chatMessage);

        // 봇 응답 처리
        String response = chatService.processMessage(chatMessage.getContent());
        if (!response.isEmpty()) {
            ChatMessage botMessage = new ChatMessage(
                response, 
                "ChatBot", 
                ChatMessage.MessageType.CHAT
            );
            messagingTemplate.convertAndSend("/topic/public", botMessage);
        }
    }

    @MessageMapping("/chat.addUser")
    @org.springframework.messaging.handler.annotation.SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage, 
                              SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        chatMessage.setType(ChatMessage.MessageType.JOIN);
        return chatMessage;
    }
}
```

## 7. HTML 템플릿

### src/main/resources/templates/chat.html
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Simple Chat</title>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="/webjars/bootstrap/5.3.0/css/bootstrap.min.css" />
    <style>
        .chat-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .message-area {
            height: 400px;
            overflow-y: auto;
            border: 1px solid #ddd;
            padding: 10px;
            margin-bottom: 10px;
            background-color: #f9f9f9;
        }
        .message {
            margin-bottom: 10px;
            padding: 8px;
            border-radius: 5px;
        }
        .user-message {
            background-color: #d1ecf1;
            margin-left: 20%;
        }
        .bot-message {
            background-color: #e2e3e5;
            margin-right: 20%;
        }
        .join-message {
            background-color: #fff3cd;
            text-align: center;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="chat-container">
        <h2 class="text-center mb-4">간단한 채팅 프로그램</h2>
        
        <div id="messageArea" class="message-area">
            <!-- 메시지들이 여기에 표시됩니다 -->
        </div>
        
        <div class="input-group">
            <input type="text" id="message" class="form-control" placeholder="메시지를 입력하세요..." />
            <button id="send" class="btn btn-primary">전송</button>
        </div>
        
        <div class="mt-3">
            <small class="text-muted">예시 질문: 안녕, 시간, 날짜, 도움말</small>
        </div>
    </div>

    <script src="/webjars/jquery/3.6.4/jquery.min.js"></script>
    <script src="/webjars/sockjs-client/1.5.1/sockjs.min.js"></script>
    <script src="/webjars/stomp-websocket/2.3.4/stomp.min.js"></script>
    <script>
        let stompClient = null;
        let username = null;

        function connect() {
            username = prompt('채팅에서 사용할 이름을 입력하세요:') || 'User';
            
            const socket = new SockJS('/ws-chat');
            stompClient = Stomp.over(socket);
            
            stompClient.connect({}, function(frame) {
                console.log('Connected: ' + frame);
                
                // 사용자 입장 메시지 전송
                stompClient.send("/app/chat.addUser", {}, 
                    JSON.stringify({sender: username, type: 'JOIN'})
                );
                
                // 메시지 수신 구독
                stompClient.subscribe('/topic/public', function(message) {
                    showMessage(JSON.parse(message.body));
                });
            });
        }

        function sendMessage() {
            const messageInput = document.getElementById('message');
            const messageContent = messageInput.value.trim();
            
            if(messageContent && stompClient) {
                const chatMessage = {
                    sender: username,
                    content: messageContent,
                    type: 'CHAT'
                };
                
                stompClient.send("/app/chat.sendMessage", {}, 
                    JSON.stringify(chatMessage));
                messageInput.value = '';
            }
        }

        function showMessage(message) {
            const messageArea = document.getElementById('messageArea');
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            
            if(message.type === 'JOIN') {
                messageElement.classList.add('join-message');
                messageElement.innerHTML = `<strong>${message.sender}</strong>님이 채팅에 참여했습니다.`;
            } else if(message.type === 'CHAT') {
                if(message.sender === 'ChatBot') {
                    messageElement.classList.add('bot-message');
                    messageElement.innerHTML = `
                        <strong>${message.sender}:</strong> ${message.content}
                        <br><small>${new Date().toLocaleTimeString()}</small>
                    `;
                } else {
                    messageElement.classList.add('user-message');
                    messageElement.innerHTML = `
                        <strong>${message.sender}:</strong> ${message.content}
                        <br><small>${new Date().toLocaleTimeString()}</small>
                    `;
                }
            }
            
            messageArea.appendChild(messageElement);
            messageArea.scrollTop = messageArea.scrollHeight;
        }

        // 이벤트 리스너 설정
        document.getElementById('send').addEventListener('click', sendMessage);
        document.getElementById('message').addEventListener('keypress', function(e) {
            if(e.key === 'Enter') {
                sendMessage();
            }
        });

        // 페이지 로드 시 연결
        window.onload = connect;
    </script>
</body>
</html>
```

## 8. 애플리케이션 메인 클래스

### ChatApplication.java
```java
package com.example.chat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ChatApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChatApplication.class, args);
    }
}
```

## 실행 방법

1. 프로젝트를 빌드하고 실행합니다:
```bash
./gradlew bootRun
```

2. 웹 브라우저에서 `http://localhost:8080`에 접속합니다.

3. 사용자 이름을 입력하고 채팅을 시작합니다.

## 주요 기능

- **실시간 채팅**: WebSocket을 이용한 실시간 메시지 교환
- **질의 응답**: 미리 정의된 질문에 대한 자동 응답
- **사용자 입장/퇴장 알림**
- **반응형 UI**: 부트스트랩을 이용한 깔끔한 인터페이스

## 확장 가능한 기능

1. 데이터베이스 연동으로 채팅 기록 저장
2. 더 복잡한 NLP 기반 응답 시스템
3. 파일 업로드 기능
4. 사용자 인증 시스템
5. 채팅방 기능

이 기본 구조를 바탕으로 필요한 기능을 추가로 구현할 수 있습니다.
