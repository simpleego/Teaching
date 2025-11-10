일대일 채팅 형태로 재구성하겠습니다. 사용자별로 개별적인 채팅 세션을 관리하는 방식으로 변경하겠습니다.

## 1. WebSocket 설정 수정

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
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
```

## 2. 메시지 모델 확장

### ChatMessage.java
```java
package com.example.chat.model;

import java.time.LocalDateTime;

public class ChatMessage {
    private String content;
    private String sender;
    private String receiver; // 수신자 추가
    private MessageType type;
    private LocalDateTime timestamp;
    private String sessionId; // 세션 ID 추가

    public enum MessageType {
        CHAT, JOIN, LEAVE, PRIVATE
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

    public String getReceiver() {
        return receiver;
    }

    public void setReceiver(String receiver) {
        this.receiver = receiver;
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

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
}
```

## 3. 사용자 세션 관리 서비스

### UserSessionService.java
```java
package com.example.chat.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserSessionService {

    private final Map<String, String> userSessions = new ConcurrentHashMap<>(); // username -> sessionId
    private final Map<String, String> sessionUsers = new ConcurrentHashMap<>(); // sessionId -> username

    public void registerUserSession(String username, String sessionId) {
        userSessions.put(username, sessionId);
        sessionUsers.put(sessionId, username);
    }

    public void removeUserSession(String sessionId) {
        String username = sessionUsers.remove(sessionId);
        if (username != null) {
            userSessions.remove(username);
        }
    }

    public String getSessionIdByUsername(String username) {
        return userSessions.get(username);
    }

    public String getUsernameBySessionId(String sessionId) {
        return sessionUsers.get(sessionId);
    }

    public boolean isUserOnline(String username) {
        return userSessions.containsKey(username);
    }

    public Map<String, String> getAllOnlineUsers() {
        return new ConcurrentHashMap<>(userSessions);
    }
}
```

## 4. 일대일 채팅 컨트롤러

### PrivateChatController.java
```java
package com.example.chat.controller;

import com.example.chat.model.ChatMessage;
import com.example.chat.service.ChatService;
import com.example.chat.service.UserSessionService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.security.Principal;

@Controller
public class PrivateChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;
    private final UserSessionService userSessionService;

    public PrivateChatController(SimpMessagingTemplate messagingTemplate,
                               ChatService chatService,
                               UserSessionService userSessionService) {
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
        this.userSessionService = userSessionService;
    }

    @GetMapping("/")
    public String chatPage(Model model) {
        return "private-chat";
    }

    @GetMapping("/admin")
    public String adminChatPage(Model model) {
        model.addAttribute("onlineUsers", userSessionService.getAllOnlineUsers().keySet());
        return "admin-chat";
    }

    // 사용자 연결 시 세션 등록
    @MessageMapping("/chat.register")
    public void registerUser(@Payload ChatMessage chatMessage,
                           SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        String username = chatMessage.getSender();
        
        userSessionService.registerUserSession(username, sessionId);
        
        // 서버 측에서 환영 메시지 전송
        ChatMessage welcomeMessage = new ChatMessage(
            "안녕하세요 " + username + "님! ChatBot입니다. 무엇을 도와드릴까요?",
            "ChatBot",
            ChatMessage.MessageType.CHAT
        );
        welcomeMessage.setReceiver(username);
        
        messagingTemplate.convertAndSendToUser(
            username, 
            "/queue/messages", 
            welcomeMessage
        );

        // 관리자에게 새 사용자 접속 알림
        notifyAdminUserStatus(username, true);
    }

    // 사용자로부터 메시지 수신
    @MessageMapping("/chat.sendPrivate")
    public void handlePrivateMessage(@Payload ChatMessage chatMessage,
                                   Principal principal) {
        String sender = chatMessage.getSender();
        String content = chatMessage.getContent();

        // 사용자 메시지를 서버(봇)가 수신
        ChatMessage userMessage = new ChatMessage(
            content, 
            sender, 
            ChatMessage.MessageType.CHAT
        );
        userMessage.setReceiver("ChatBot");

        // 사용자에게 자신의 메시지 에코
        messagingTemplate.convertAndSendToUser(
            sender, 
            "/queue/messages", 
            userMessage
        );

        // 봇 응답 생성
        String botResponse = chatService.processMessage(content);
        ChatMessage botMessage = new ChatMessage(
            botResponse,
            "ChatBot",
            ChatMessage.MessageType.CHAT
        );
        botMessage.setReceiver(sender);

        // 사용자에게 봇 응답 전송
        messagingTemplate.convertAndSendToUser(
            sender, 
            "/queue/messages", 
            botMessage
        );

        // 관리자에게도 메시지 복사 (옵션)
        notifyAdminChatActivity(sender, content, botResponse);
    }

    // 관리자에서 사용자에게 메시지 전송
    @MessageMapping("/chat.adminToUser")
    public void sendAdminMessage(@Payload ChatMessage chatMessage) {
        String targetUser = chatMessage.getReceiver();
        String content = chatMessage.getContent();

        if (userSessionService.isUserOnline(targetUser)) {
            // 관리자 메시지를 사용자에게 전송
            ChatMessage adminMessage = new ChatMessage(
                content,
                "관리자",
                ChatMessage.MessageType.CHAT
            );
            adminMessage.setReceiver(targetUser);

            messagingTemplate.convertAndSendToUser(
                targetUser, 
                "/queue/messages", 
                adminMessage
            );

            // 관리자에게 전송 확인
            ChatMessage confirmation = new ChatMessage(
                "메시지가 " + targetUser + "님에게 전송되었습니다.",
                "System",
                ChatMessage.MessageType.CHAT
            );
            confirmation.setReceiver("관리자");

            messagingTemplate.convertAndSendToUser(
                "관리자", 
                "/queue/messages", 
                confirmation
            );
        } else {
            // 사용자가 오프라인인 경우
            ChatMessage errorMessage = new ChatMessage(
                targetUser + "님은 현재 오프라인 상태입니다.",
                "System",
                ChatMessage.MessageType.CHAT
            );
            errorMessage.setReceiver("관리자");

            messagingTemplate.convertAndSendToUser(
                "관리자", 
                "/queue/messages", 
                errorMessage
            );
        }
    }

    // 연결 해제 처리
    @MessageMapping("/chat.disconnect")
    public void handleDisconnect(SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        String username = userSessionService.getUsernameBySessionId(sessionId);
        
        if (username != null) {
            userSessionService.removeUserSession(sessionId);
            notifyAdminUserStatus(username, false);
        }
    }

    private void notifyAdminUserStatus(String username, boolean isOnline) {
        String statusMessage = username + "님이 " + (isOnline ? "접속했습니다." : "퇴장했습니다.");
        
        ChatMessage statusUpdate = new ChatMessage(
            statusMessage,
            "System",
            ChatMessage.MessageType.CHAT
        );
        statusUpdate.setReceiver("관리자");

        messagingTemplate.convertAndSendToUser(
            "관리자", 
            "/queue/messages", 
            statusUpdate
        );
    }

    private void notifyAdminChatActivity(String username, String userMessage, String botResponse) {
        ChatMessage activityMessage = new ChatMessage(
            "[" + username + "] 질문: " + userMessage + " → 응답: " + botResponse,
            "System",
            ChatMessage.MessageType.CHAT
        );
        activityMessage.setReceiver("관리자");

        messagingTemplate.convertAndSendToUser(
            "관리자", 
            "/queue/messages", 
            activityMessage
        );
    }
}
```

## 5. 사용자 채팅 페이지

### src/main/resources/templates/private-chat.html
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>1:1 채팅</title>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="/webjars/bootstrap/5.3.0/css/bootstrap.min.css" />
    <style>
        .chat-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .message-area {
            height: 500px;
            overflow-y: auto;
            border: 1px solid #ddd;
            padding: 10px;
            margin-bottom: 10px;
            background-color: #f9f9f9;
        }
        .message {
            margin-bottom: 10px;
            padding: 8px 12px;
            border-radius: 15px;
            max-width: 70%;
            word-wrap: break-word;
        }
        .user-message {
            background-color: #007bff;
            color: white;
            margin-left: auto;
            text-align: right;
        }
        .bot-message {
            background-color: #e9ecef;
            color: #333;
            margin-right: auto;
        }
        .system-message {
            background-color: #fff3cd;
            color: #856404;
            text-align: center;
            max-width: 100%;
            font-style: italic;
        }
        .chat-header {
            background-color: #343a40;
            color: white;
            padding: 10px;
            border-radius: 5px 5px 0 0;
        }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="chat-header text-center">
            <h4>1:1 채팅 서비스</h4>
            <small id="status">연결 중...</small>
        </div>
        
        <div id="messageArea" class="message-area">
            <div class="message system-message">
                채팅 서비스에 연결 중입니다...
            </div>
        </div>
        
        <div class="input-group mb-3">
            <input type="text" id="message" class="form-control" 
                   placeholder="메시지를 입력하세요..." disabled />
            <button id="send" class="btn btn-primary" disabled>전송</button>
        </div>
        
        <div class="card">
            <div class="card-body">
                <h6 class="card-title">예시 질문</h6>
                <div class="d-flex flex-wrap gap-2">
                    <button class="btn btn-outline-secondary btn-sm example-btn">안녕</button>
                    <button class="btn btn-outline-secondary btn-sm example-btn">시간</button>
                    <button class="btn btn-outline-secondary btn-sm example-btn">날짜</button>
                    <button class="btn btn-outline-secondary btn-sm example-btn">도움말</button>
                </div>
            </div>
        </div>
    </div>

    <script src="/webjars/jquery/3.6.4/jquery.min.js"></script>
    <script src="/webjars/sockjs-client/1.5.1/sockjs.min.js"></script>
    <script src="/webjars/stomp-websocket/2.3.4/stomp.min.js"></script>
    <script>
        let stompClient = null;
        let username = null;
        let connected = false;

        function connect() {
            username = prompt('채팅에서 사용할 이름을 입력하세요:');
            if (!username) {
                alert('이름을 입력해야 채팅을 사용할 수 있습니다.');
                return;
            }

            const socket = new SockJS('/ws-chat');
            stompClient = Stomp.over(socket);
            
            stompClient.connect({}, function(frame) {
                connected = true;
                console.log('Connected: ' + frame);
                updateStatus('연결됨', 'success');
                
                // 사용자 등록
                stompClient.send("/app/chat.register", {}, 
                    JSON.stringify({sender: username, type: 'JOIN'})
                );
                
                // 개인 메시지 수신 구독
                stompClient.subscribe('/user/queue/messages', function(message) {
                    showMessage(JSON.parse(message.body));
                });

                // 입력 필드 활성화
                $('#message').prop('disabled', false);
                $('#send').prop('disabled', false);
                $('#message').focus();
            }, function(error) {
                console.log('Connection error: ' + error);
                updateStatus('연결 실패', 'danger');
                setTimeout(connect, 5000); // 5초 후 재연결 시도
            });
        }

        function sendMessage() {
            const messageInput = $('#message');
            const messageContent = messageInput.val().trim();
            
            if(messageContent && stompClient && connected) {
                const chatMessage = {
                    sender: username,
                    content: messageContent,
                    type: 'CHAT'
                };
                
                stompClient.send("/app/chat.sendPrivate", {}, 
                    JSON.stringify(chatMessage));
                messageInput.val('');
            }
        }

        function showMessage(message) {
            const messageArea = $('#messageArea');
            const messageElement = $('<div>').addClass('message');
            
            if(message.sender === 'System') {
                messageElement.addClass('system-message');
                messageElement.text(message.content);
            } else if(message.sender === 'ChatBot' || message.sender === '관리자') {
                messageElement.addClass('bot-message');
                messageElement.html(`
                    <strong>${message.sender}</strong><br>
                    ${message.content}
                    <div class="text-muted" style="font-size: 0.8em;">
                        ${new Date().toLocaleTimeString()}
                    </div>
                `);
            } else {
                messageElement.addClass('user-message');
                messageElement.html(`
                    <strong>${message.sender}</strong><br>
                    ${message.content}
                    <div style="font-size: 0.8em; opacity: 0.8;">
                        ${new Date().toLocaleTimeString()}
                    </div>
                `);
            }
            
            messageArea.append(messageElement);
            messageArea.scrollTop(messageArea[0].scrollHeight);
        }

        function updateStatus(text, type) {
            const status = $('#status');
            status.text(text);
            status.removeClass('text-success text-danger text-warning');
            status.addClass('text-' + type);
        }

        function sendExampleMessage(text) {
            if (connected) {
                $('#message').val(text);
                sendMessage();
            }
        }

        // 이벤트 리스너 설정
        $(document).ready(function() {
            $('#send').click(sendMessage);
            $('#message').keypress(function(e) {
                if(e.which === 13) { // Enter key
                    sendMessage();
                }
            });

            $('.example-btn').click(function() {
                sendExampleMessage($(this).text());
            });

            // 페이지 언로드 시 연결 해제
            $(window).on('beforeunload', function() {
                if (stompClient && connected) {
                    stompClient.send("/app/chat.disconnect", {}, {});
                }
            });

            connect();
        });
    </script>
</body>
</html>
```

## 6. 관리자 채팅 페이지

### src/main/resources/templates/admin-chat.html
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>관리자 채팅</title>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="/webjars/bootstrap/5.3.0/css/bootstrap.min.css" />
    <style>
        .admin-container {
            max-width: 1200px;
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
        .users-panel {
            height: 400px;
            overflow-y: auto;
            border: 1px solid #ddd;
            padding: 10px;
            background-color: #f8f9fa;
        }
        .message {
            margin-bottom: 10px;
            padding: 8px;
            border-radius: 5px;
        }
        .admin-message {
            background-color: #d4edda;
            margin-left: 20%;
        }
        .user-activity {
            background-color: #e2e3e5;
            margin-right: 20%;
        }
        .system-message {
            background-color: #fff3cd;
            text-align: center;
        }
        .user-item {
            padding: 8px;
            margin: 2px 0;
            background-color: white;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            cursor: pointer;
        }
        .user-item:hover {
            background-color: #e9ecef;
        }
        .user-item.active {
            background-color: #007bff;
            color: white;
        }
    </style>
</head>
<body>
    <div class="admin-container">
        <h2 class="text-center mb-4">관리자 채팅 패널</h2>
        
        <div class="row">
            <div class="col-md-3">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">온라인 사용자</h5>
                    </div>
                    <div class="users-panel card-body" id="usersPanel">
                        <div class="text-muted">접속 중인 사용자가 없습니다.</div>
                    </div>
                </div>
                
                <div class="card mt-3">
                    <div class="card-body">
                        <h6>사용자에게 메시지 보내기</h6>
                        <input type="text" id="targetUser" class="form-control mb-2" 
                               placeholder="사용자 이름" />
                        <textarea id="adminMessage" class="form-control mb-2" 
                                  placeholder="메시지 내용" rows="3"></textarea>
                        <button id="sendToUser" class="btn btn-primary w-100">전송</button>
                    </div>
                </div>
            </div>
            
            <div class="col-md-9">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">시스템 활동 로그</h5>
                    </div>
                    <div id="messageArea" class="message-area card-body">
                        <div class="message system-message">
                            관리자 패널이 시작되었습니다.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="/webjars/jquery/3.6.4/jquery.min.js"></script>
    <script src="/webjars/sockjs-client/1.5.1/sockjs.min.js"></script>
    <script src="/webjars/stomp-websocket/2.3.4/stomp.min.js"></script>
    <script>
        let stompClient = null;
        let connected = false;

        function connect() {
            const socket = new SockJS('/ws-chat');
            stompClient = Stomp.over(socket);
            
            stompClient.connect({}, function(frame) {
                connected = true;
                console.log('Admin connected: ' + frame);
                
                // 관리자 등록
                stompClient.send("/app/chat.register", {}, 
                    JSON.stringify({sender: '관리자', type: 'JOIN'})
                );
                
                // 개인 메시지 수신 구독
                stompClient.subscribe('/user/queue/messages', function(message) {
                    showMessage(JSON.parse(message.body));
                });

            }, function(error) {
                console.log('Connection error: ' + error);
                setTimeout(connect, 5000);
            });
        }

        function showMessage(message) {
            const messageArea = $('#messageArea');
            const messageElement = $('<div>').addClass('message');
            
            if(message.sender === 'System') {
                messageElement.addClass('system-message');
                messageElement.text(message.content);
                
                // 시스템 메시지에서 사용자 상태 업데이트 정보 추출
                updateUsersPanel(message.content);
            } else if(message.sender === 'ChatBot') {
                messageElement.addClass('user-activity');
                messageElement.html(`
                    <strong>${message.sender}</strong><br>
                    ${message.content}
                    <div class="text-muted" style="font-size: 0.8em;">
                        ${new Date().toLocaleTimeString()}
                    </div>
                `);
            } else {
                messageElement.addClass('user-activity');
                messageElement.html(`
                    <strong>${message.sender}</strong><br>
                    ${message.content}
                    <div class="text-muted" style="font-size: 0.8em;">
                        ${new Date().toLocaleTimeString()}
                    </div>
                `);
            }
            
            messageArea.append(messageElement);
            messageArea.scrollTop(messageArea[0].scrollHeight);
        }

        function updateUsersPanel(systemMessage) {
            // 간단한 구현: 실제로는 서버에서 온라인 사용자 목록을 주기적으로 받아와야 함
            const usersPanel = $('#usersPanel');
            
            // 시스템 메시지에서 사용자 이름 추출 (실제 구현에서는 더 정교한 파싱 필요)
            if (systemMessage.includes('접속했습니다')) {
                const username = systemMessage.split('님')[0];
                if (!$(`#user-${username}`).length) {
                    const userElement = $(`
                        <div class="user-item" id="user-${username}">
                            ${username}
                        </div>
                    `);
                    userElement.click(function() {
                        $('#targetUser').val(username);
                    });
                    usersPanel.append(userElement);
                    
                    // "접속 중인 사용자가 없습니다" 메시지 제거
                    usersPanel.find('.text-muted').remove();
                }
            } else if (systemMessage.includes('퇴장했습니다')) {
                const username = systemMessage.split('님')[0];
                $(`#user-${username}`).remove();
                
                // 사용자가 없을 때 메시지 표시
                if (usersPanel.children().length === 0) {
                    usersPanel.html('<div class="text-muted">접속 중인 사용자가 없습니다.</div>');
                }
            }
        }

        function sendToUser() {
            const targetUser = $('#targetUser').val().trim();
            const messageContent = $('#adminMessage').val().trim();
            
            if(targetUser && messageContent && stompClient && connected) {
                const chatMessage = {
                    sender: '관리자',
                    receiver: targetUser,
                    content: messageContent,
                    type: 'CHAT'
                };
                
                stompClient.send("/app/chat.adminToUser", {}, 
                    JSON.stringify(chatMessage));
                
                $('#adminMessage').val('');
            } else {
                alert('사용자 이름과 메시지를 입력해주세요.');
            }
        }

        // 이벤트 리스너 설정
        $(document).ready(function() {
            $('#sendToUser').click(sendToUser);
            
            $('#adminMessage').keypress(function(e) {
                if(e.ctrlKey && e.which === 13) { // Ctrl + Enter
                    sendToUser();
                }
            });

            connect();
        });
    </script>
</body>
</html>
```

## 주요 변경사항

1. **일대일 통신**: `/user/queue/messages`를 통해 사용자별 개인 메시지 전송
2. **세션 관리**: `UserSessionService`로 사용자 연결 상태 관리
3. **관리자 패널**: 모든 채팅 활동 모니터링 및 개입 가능
4. **개인화된 응답**: 각 사용자에게 맞춤형 응답 제공
5. **연결 상태 관리**: 사용자 접속/해제 실시간 추적

이제 서버와 클라이언트가 일대일로 메시지를 주고받을 수 있으며, 관리자는 모든 채팅을 모니터링하고 필요시 개입할 수 있습니다.
