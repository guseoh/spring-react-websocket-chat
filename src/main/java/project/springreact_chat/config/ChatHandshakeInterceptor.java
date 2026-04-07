package project.springreact_chat.config;

import org.jspecify.annotations.Nullable;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
public class ChatHandshakeInterceptor implements HandshakeInterceptor {
    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {

        if (!(request instanceof ServletServerHttpRequest servletRequest)) {
            return false;
        }

        String roomId = servletRequest.getServletRequest().getParameter("roomId");
        String memberId = servletRequest.getServletRequest().getParameter("memberId");

        if (roomId == null || memberId == null) {
            return false;
        }

        // attributes에 넣은 값은 나중에 WebSocket 세션에서 꺼낼 수 있다.
        try {
            attributes.put("roomId", Long.parseLong(roomId));
            attributes.put("memberId", Long.parseLong(memberId));
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, @Nullable Exception exception) {

    }
}


/*
    HandshakeInterceptor
    - WebSocket 연결이 실제로 맺어지기 직전에 가로채서 검사하거나 값을 저장하는 역할
    - HTTP 요청으로 WebSocket 연결을 시작할 때 연결을 허용할지 / 막을지 / 필요한 정보 저장할지 결정하는 도구

 */