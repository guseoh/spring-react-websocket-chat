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
import project.springreact_chat.dto.MessageType;
import project.springreact_chat.dto.SessionInfo;
import project.springreact_chat.repository.ChatMessageRepository;
import project.springreact_chat.repository.ChatRoomParticipantRepository;
import project.springreact_chat.repository.ChatRoomRepository;
import project.springreact_chat.repository.MemberRepository;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketService {

    private static final int MAX_MESSAGE_LENGTH = 500;

    private final ChatRoomRepository chatRoomRepository;
    private final MemberRepository memberRepository;
    private final ChatRoomParticipantRepository chatRoomParticipantRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ObjectMapper objectMapper;

    private final Map<Long, Set<WebSocketSession>> roomSessions = new ConcurrentHashMap<>();
    private final Map<String, SessionInfo> sessionInfoMap = new ConcurrentHashMap<>();

    public void connect(WebSocketSession session) {
        SessionInfo sessionInfo = extractSessionInfo(session);
        JoinContext context = validateJoin(sessionInfo.roomId(), sessionInfo.memberId());

        roomSessions.computeIfAbsent(sessionInfo.roomId(), key -> ConcurrentHashMap.newKeySet())
                .add(session);
        sessionInfoMap.put(session.getId(), sessionInfo);

        log.info("웹소켓 연결 완료 - sessionId={}, roomId={}, memberId={}",
                session.getId(), sessionInfo.roomId(), sessionInfo.memberId());
        broadcast(sessionInfo.roomId(), ChatSocketResponse.system(
                MessageType.ENTER,
                sessionInfo.roomId(),
                context.member(),
                context.member().getUsername() + "님이 입장했습니다."
        ));
    }

    @Transactional
    public void handleMessage(WebSocketSession session, String payload) {
        SessionInfo sessionInfo = sessionInfoMap.get(session.getId());
        if (sessionInfo == null) {
            log.warn("등록되지 않은 세션의 메시지 수신 - sessionId={}", session.getId());
            sendError(session, "채팅방 연결 정보가 없습니다.");
            closeSession(session, CloseStatus.POLICY_VIOLATION);
            return;
        }

        ChatSocketRequest request;
        try {
            request = objectMapper.readValue(payload, ChatSocketRequest.class);
        } catch (JacksonException e) {
            log.warn("잘못된 JSON 메시지 수신 - sessionId={}, payload={}", session.getId(), payload);
            sendError(session, "메시지 형식이 올바르지 않습니다.");
            return;
        }

        if (request.getTypeOrDefault() != MessageType.TALK) {
            log.warn("지원하지 않는 클라이언트 메시지 타입 - sessionId={}, type={}",
                    session.getId(), request.getTypeOrDefault());
            sendError(session, "클라이언트는 TALK 메시지만 보낼 수 있습니다.");
            return;
        }

        String content = request.getTrimmedContent();
        if (content.isBlank()) {
            log.warn("빈 메시지 수신 - sessionId={}", session.getId());
            sendError(session, "메시지를 입력해주세요.");
            return;
        }

        if (content.length() > MAX_MESSAGE_LENGTH) {
            log.warn("메시지 길이 초과 - sessionId={}, length={}", session.getId(), content.length());
            sendError(session, "메시지는 500자 이하로 입력해주세요.");
            return;
        }

        JoinContext context = validateJoin(sessionInfo.roomId(), sessionInfo.memberId());

        ChatMessage chatMessage = ChatMessage.create(
                content,
                context.member(),
                context.chatRoom()
        );

        ChatMessage saved = chatMessageRepository.save(chatMessage);
        broadcast(sessionInfo.roomId(), ChatSocketResponse.talk(saved));
    }

    public void disconnect(WebSocketSession session) {
        SessionInfo sessionInfo = sessionInfoMap.remove(session.getId());

        if (sessionInfo == null) {
            return;
        }

        Member member = memberRepository.findById(sessionInfo.memberId()).orElse(null);
        Set<WebSocketSession> sessions = roomSessions.get(sessionInfo.roomId());
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                roomSessions.remove(sessionInfo.roomId(), sessions);
            }
        }

        log.info("웹소켓 세션 정리 완료 - sessionId={}, roomId={}, memberId={}",
                session.getId(), sessionInfo.roomId(), sessionInfo.memberId());

        if (member != null) {
            broadcast(sessionInfo.roomId(), ChatSocketResponse.system(
                    MessageType.LEAVE,
                    sessionInfo.roomId(),
                    member,
                    member.getUsername() + "님이 퇴장했습니다."
            ));
        }
    }

    private void broadcast(Long roomId, ChatSocketResponse response) {
        Set<WebSocketSession> sessions = roomSessions.getOrDefault(roomId, Set.of());
        if (sessions.isEmpty()) {
            return;
        }

        String json;
        try {
            json = objectMapper.writeValueAsString(response);
        } catch (JacksonException e) {
            log.error("웹소켓 응답 직렬화 실패 - roomId={}, type={}", roomId, response.getType(), e);
            return;
        }

        Set<WebSocketSession> failedSessions = new HashSet<>();
        for (WebSocketSession webSocketSession : sessions) {
            if (!sendMessage(webSocketSession, json)) {
                failedSessions.add(webSocketSession);
            }
        }

        failedSessions.forEach(this::removeSession);
    }

    private JoinContext validateJoin(Long roomId, Long memberId) {
        if (roomId == null || memberId == null) {
            throw new IllegalArgumentException("roomId, memberId가 필요합니다.");
        }

        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방이 존재하지 않습니다."));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        boolean joined = chatRoomParticipantRepository.existsByChatRoomIdAndMemberId(roomId, memberId);
        if (!joined) {
            throw new IllegalArgumentException("해당 사용자는 채팅방 참가자가 아닙니다.");
        }

        return new JoinContext(chatRoom, member);
    }

    private SessionInfo extractSessionInfo(WebSocketSession session) {
        Long roomId = (Long) session.getAttributes().get("roomId");
        Long memberId = (Long) session.getAttributes().get("memberId");
        return new SessionInfo(roomId, memberId);
    }

    private void sendError(WebSocketSession session, String message) {
        try {
            String json = objectMapper.writeValueAsString(ChatSocketResponse.error(message));
            sendMessage(session, json);
        } catch (JacksonException e) {
            log.error("웹소켓 에러 응답 직렬화 실패 - sessionId={}", session.getId(), e);
        }
    }

    private boolean sendMessage(WebSocketSession session, String payload) {
        if (!session.isOpen()) {
            log.debug("닫힌 세션 전송 생략 - sessionId={}", session.getId());
            return false;
        }

        try {
            synchronized (session) {
                if (!session.isOpen()) {
                    return false;
                }
                session.sendMessage(new TextMessage(payload));
            }
            return true;
        } catch (IOException | RuntimeException e) {
            log.warn("웹소켓 메시지 전송 실패 - sessionId={}", session.getId(), e);
            return false;
        }
    }

    private void removeSession(WebSocketSession session) {
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
            roomSessions.remove(sessionInfo.roomId(), sessions);
        }
    }

    private void closeSession(WebSocketSession session, CloseStatus status) {
        if (!session.isOpen()) {
            return;
        }

        try {
            session.close(status);
        } catch (IOException e) {
            log.warn("웹소켓 세션 종료 실패 - sessionId={}", session.getId(), e);
        }
    }

    private record JoinContext(ChatRoom chatRoom, Member member) {
    }
}
