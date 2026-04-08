package project.springreact_chat.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import project.springreact_chat.service.ChatWebSocketService;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ChatWebSocketService chatWebSocketService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        log.info("웹소켓 연결 시작 - sessionId={}", session.getId());
        chatWebSocketService.connect(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        log.info("웹소켓 연결 종료 - sessionId={}. code={}, reason={}",
                session.getId(), status.getCode(), status.getReason());
        chatWebSocketService.disconnect(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        log.info("메시지 수신 - sessionId={}, payload={}", session.getId(), message.getPayload());
        chatWebSocketService.handleMessage(session, message.getPayload());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        chatWebSocketService.disconnect(session);

        if (session.isOpen()) {
            session.close(CloseStatus.SERVER_ERROR);
        }
    }
}
