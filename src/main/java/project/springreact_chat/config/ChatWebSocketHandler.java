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
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("웹소켓 연결 시작 - sessionId={}", session.getId());

        try {
            chatWebSocketService.connect(session);
        } catch (IllegalArgumentException e) {
            log.warn("웹소켓 연결 거부 - sessionId={}, reason={}", session.getId(), e.getMessage());
            closeSession(session, CloseStatus.POLICY_VIOLATION);
        } catch (RuntimeException e) {
            log.error("웹소켓 연결 처리 실패 - sessionId={}", session.getId(), e);
            closeSession(session, CloseStatus.SERVER_ERROR);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        log.info("웹소켓 연결 종료 - sessionId={}. code={}, reason={}",
                session.getId(), status.getCode(), status.getReason());
        chatWebSocketService.disconnect(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        log.debug("메시지 수신 - sessionId={}", session.getId());

        try {
            chatWebSocketService.handleMessage(session, message.getPayload());
        } catch (RuntimeException e) {
            log.error("웹소켓 메시지 처리 실패 - sessionId={}", session.getId(), e);
            closeSession(session, CloseStatus.SERVER_ERROR);
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.warn("웹소켓 전송 오류 - sessionId={}", session.getId(), exception);
        chatWebSocketService.disconnect(session);
        closeSession(session, CloseStatus.SERVER_ERROR);
    }

    private void closeSession(WebSocketSession session, CloseStatus status) {
        if (!session.isOpen()) {
            return;
        }

        try {
            session.close(status);
        } catch (Exception e) {
            log.warn("웹소켓 세션 종료 실패 - sessionId={}", session.getId(), e);
        }
    }
}
