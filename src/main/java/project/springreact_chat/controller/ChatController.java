package project.springreact_chat.controller;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import project.springreact_chat.dto.ChatRoomCreateRequest;
import project.springreact_chat.dto.ChatRoomResponse;
import project.springreact_chat.service.ChatWebSocketService;

@RestController
@Slf4j
@RequiredArgsConstructor
public class ChatController {

    private final ChatWebSocketService service;

    // 방 생성
    @PostMapping
    public ResponseEntity<ChatRoomResponse> createRoom(@RequestBody ChatRoomCreateRequest request) {
        ChatRoomResponse response = service.
    }

    // 여러 방 조회

    // 한개 방 조회

    // 방 입장

    // 메시지 조회
}
