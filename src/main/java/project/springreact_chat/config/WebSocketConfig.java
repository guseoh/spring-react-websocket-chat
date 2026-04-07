package project.springreact_chat.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 *  Spring에서 WebSocket 엔드포인트를 등록할 때는 WebSocketConfigurer와 핸들러 매핑을 사용한다.
 *  registerWebSocketHandlers()에서 URL과 핸들러를 직접 연결하고,
 *  TextWebSocketHandler를 상속한 핸들러에서 연결/수신/종료를 처리한다.
 */

@Configuration
@EnableWebSocket    // 웹소켓 기능 활성화
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final ChatWebSocketHandler chatWebSocketHandler;
    private final ChatHandshakeInterceptor chatHandshakeInterceptor;


    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(chatWebSocketHandler, "/ws/chat")
                .addInterceptors(chatHandshakeInterceptor)
                .setAllowedOriginPatterns("http://localhost:5173", "http://localhost:3000");
    }
}

/*
    Spring Security cors 설정은 HTTP 요청에 관한것만 설정해준다.
    WebSocket 요청은 여기서 별도로 설정한다.
 */