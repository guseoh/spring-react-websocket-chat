package project.springreact_chat.controller;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.springreact_chat.dto.ChatMessageResponse;
import project.springreact_chat.dto.ChatRoomCreateRequest;
import project.springreact_chat.dto.ChatRoomParticipantRequest;
import project.springreact_chat.dto.ChatRoomResponse;
import project.springreact_chat.service.ChatRoomService;
import project.springreact_chat.service.ChatWebSocketService;

import java.lang.invoke.CallSite;
import java.util.List;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/chat-rooms")
public class ChatController {

    private final ChatRoomService service;

    // 방 생성
    @PostMapping
    public ResponseEntity<ChatRoomResponse> createRoom(@RequestBody ChatRoomCreateRequest request) {
        ChatRoomResponse response = service.createRoom(request);

        log.info("채팅방이 생성되었습니다: {}", request.getRoomName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 여러 방 조회
    @GetMapping
    public ResponseEntity<List<ChatRoomResponse>> getRooms() {
        return ResponseEntity.ok(service.getRooms());
    }

    // 한개 방 조회
    @GetMapping("/{roomId}")
    public ResponseEntity<ChatRoomResponse> getRoom(@PathVariable Long roomId) {
        log.info("한 개의 방 조회: {}", roomId);
        return ResponseEntity.ok(service.getRoom(roomId));
    }

    // 방 입장
    @PostMapping("/{roomId}/participants")
    public ResponseEntity<Void> joinRoom(@PathVariable Long roomId, @RequestBody ChatRoomParticipantRequest request) {
        service.joinRoom(request.getMemberId(), roomId);
        log.info("{} 방에 입장하였습니다.", roomId);
        return ResponseEntity.ok().build();
    }

    // 메시지 조회
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(@PathVariable Long roomId) {
        return ResponseEntity.ok(service.getMessages(roomId));
    }
}
