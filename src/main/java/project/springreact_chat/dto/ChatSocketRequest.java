package project.springreact_chat.dto;

import lombok.Data;

@Data
public class ChatSocketRequest {

    private String content;
}

/*
    소켓 요청/응답 DTO가 필요한 이유
    - WebSocket은 기본적으로 "연결된 상태에서 문자열(또는 바이너리)을 주고받는 통로"이다.
    - 문제는 WebSocket 자체에서 채팅 메시지인지, 입장 메시지인지 구분 해주지 않는다.
    - 그래서 "클라이언트와 서버가 어떤 JSON 형식으로 주고받을지" 정해줘야한다.
 */