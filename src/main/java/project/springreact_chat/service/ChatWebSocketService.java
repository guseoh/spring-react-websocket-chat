package project.springreact_chat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import project.springreact_chat.domain.ChatMessage;
import project.springreact_chat.domain.ChatRoom;
import project.springreact_chat.domain.Member;
import project.springreact_chat.dto.ChatSocketRequest;
import project.springreact_chat.dto.ChatSocketResponse;
import project.springreact_chat.dto.SessionInfo;
import project.springreact_chat.repository.ChatMessageRepository;
import project.springreact_chat.repository.ChatRoomParticipantRepository;
import project.springreact_chat.repository.ChatRoomRepository;
import project.springreact_chat.repository.MemberRepository;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 핵심 서비스: 방별 세션 관리 + DB 저장 + 브로드캐스트
 * <p>
 * 순수 WebSocket에서는 서버가 클라이언트 세션을 직접 들고 있어야 한다.
 * 방별로 분리해서 전송하려면 roomId -> session set 같은 구조를 직접 관리해야 한다.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketService {

    private final ChatRoomRepository chatRoomRepository;
    private final MemberRepository memberRepository;
    private final ChatRoomParticipantRepository chatRoomParticipantRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ObjectMapper objectMapper;

    // <roomId, 해당 방의 세션들>
    private final Map<Long, Set<WebSocketSession>> roomSessions = new ConcurrentHashMap<>();

    // <sessionId, roomId/memberId?
    private final Map<String, SessionInfo> sessionInfoMap = new ConcurrentHashMap<>();


    public void connect(WebSocketSession session) {
        Long roomId = (Long) session.getAttributes().get("roomId");
        Long memberId = (Long) session.getAttributes().get("memberId");

        log.info("웹소켓 연결 요청 - sessionId={}, roomId={}, memberId={}", session.getId(), roomId, memberId);

        validateJoin(roomId, memberId);

        roomSessions.computeIfAbsent(roomId, key -> ConcurrentHashMap.newKeySet())
                .add(session);

        sessionInfoMap.put(session.getId(), new SessionInfo(roomId, memberId));

        log.info("웹소켓 연결 완료 - sessionId={}, roomId={}, memberId={}", session.getId(), roomId, memberId);
    }

    @Transactional
    public void handleMessage(WebSocketSession session, String payload) throws IOException {
        log.info("메시지 처리 시작 - sessionId={}, palload={}", session.getId(), payload);

        SessionInfo sessionInfo = sessionInfoMap.get(session.getId());

        if (sessionInfo == null) {
            if (session.isOpen()) {
                session.close(CloseStatus.POLICY_VIOLATION);
                log.warn("세션 종료 - sessionId={}", session.getId());
            }
            return;
        }

        ChatSocketRequest request = objectMapper.readValue(payload, ChatSocketRequest.class);

        log.info("메시지 파싱 완료 - sessionId={}, content={}", session.getId(), request.getContent());

        if (request.getContent() == null || request.getContent().isBlank()) {
            log.warn("빈 메시지 수신 - sessionId={}", session.getId());
            return;
        }

        Long roomId = sessionInfo.roomId();
        Long memberId = sessionInfo.memberId();

        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방이 존재하지 않습니다."));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        ChatMessage chatMessage = ChatMessage.create(
                request.getContent(),
                member,
                chatRoom
        );

        ChatMessage saved = chatMessageRepository.save(chatMessage);

        ChatSocketResponse response = ChatSocketResponse.builder()
                .roomId(roomId).
                senderId(member.getId())
                .nickname(member.getNickname())
                .content(saved.getContent())
                .createdAt(saved.getCreatedAt())
                .build();
        broadcast(roomId, response);
    }

    public void disconnect(WebSocketSession session) {
        SessionInfo sessionInfo = sessionInfoMap.remove(session.getId());

        if (sessionInfo == null) {
            return;
        }

        Set<WebSocketSession> sessions = roomSessions.get(sessionInfo.roomId());
        if (sessions == null) {
            return;
        }

        sessions.remove(session);

        if (sessions.isEmpty()) {
            roomSessions.remove(sessionInfo.roomId());
        }
    }

    private void broadcast(Long roomId, ChatSocketResponse response) throws IOException {
        Set<WebSocketSession> sessions = roomSessions.getOrDefault(roomId, Set.of());
        String json = objectMapper.writeValueAsString(response);

        for (WebSocketSession webSocketSession : sessions) {
            if (webSocketSession.isOpen()) {
                webSocketSession.sendMessage(new TextMessage(json));
            }
        }
    }

    private void validateJoin(Long roomId, Long memberId) {
        if (roomId == null || memberId == null) {
            throw new IllegalArgumentException("roomId, memberId가 필요합니다.");
        }

        if (!chatRoomRepository.existsById(roomId)) {
            throw new IllegalArgumentException("채팅방이 존재하지 않습니다.");
        }

        if (!memberRepository.existsById(memberId)) {
            throw new IllegalArgumentException("회원이 존재하지 않습니다.");
        }

        boolean joined = chatRoomParticipantRepository.existsByChatRoomIdAndMemberId(roomId, memberId);
        if (!joined) {
            throw new IllegalArgumentException("해당 사용자는 채팅방 참가자가 아닙니다.");
        }
    }
}

/*
    순수 WebSocket에서는 서버가 클라이언트 세션을 직접 들고 있어야 한다.
    - 서버가 "누가 연결되어 있는지", "어느 세션에 메시지를 보낼지"를 직접 기억하고 관리해야 한다.
    - 고수준 메시지 라우팅 기능을 기본으로 재공하지 않기 때문


    computeIfAbsent (Map 기능)
    - Key가 존재할 경우 기존 Value 리턴, 않을 경우 새로운 값을 저장한 후 반환
 */