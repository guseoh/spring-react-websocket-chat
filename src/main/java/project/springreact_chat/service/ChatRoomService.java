package project.springreact_chat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import project.springreact_chat.domain.ChatMessage;
import project.springreact_chat.domain.ChatRoom;
import project.springreact_chat.domain.ChatRoomParticipant;
import project.springreact_chat.domain.Member;
import project.springreact_chat.dto.ChatMessageResponse;
import project.springreact_chat.dto.ChatRoomCreateRequest;
import project.springreact_chat.dto.ChatRoomResponse;
import project.springreact_chat.repository.ChatMessageRepository;
import project.springreact_chat.repository.ChatRoomParticipantRepository;
import project.springreact_chat.repository.ChatRoomRepository;
import project.springreact_chat.repository.MemberRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final MemberRepository memberRepository;
    private final ChatRoomParticipantRepository chatRoomParticipantRepository;
    private final ChatMessageRepository chatMessageRepository;


    public ChatRoomResponse createRoom(ChatRoomCreateRequest request) {
        ChatRoom chatRoom = ChatRoom.builder()
                .roomName(request.getRoomName())
                .roomType(request.getRoomType())
                .build();

        ChatRoom saved = chatRoomRepository.save(chatRoom);

        return ChatRoomResponse.from(chatRoom);
    }

    public List<ChatRoomResponse> getRooms() {
        return chatRoomRepository.findAll().stream()
                .map(ChatRoomResponse::from)
                .toList();
    }

    public ChatRoomResponse getRoom(Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("해당 방이 존재하지 않습니다."));
        return ChatRoomResponse.from(chatRoom);
    }

    public void joinRoom(Long memberId, Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("해당 방이 존재하지 않습니다."));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        boolean exists = chatRoomParticipantRepository.existsByChatRoomIdAndMemberId(roomId, memberId);
        if (exists) {
            return;
        }

        ChatRoomParticipant chatRoomParticipant = ChatRoomParticipant.create(member, chatRoom);
        chatRoomParticipantRepository.save(chatRoomParticipant);
    }

    public List<ChatMessageResponse> getMessages(Long roomId) {
        if (!chatRoomRepository.existsById(roomId)) {
            throw new IllegalArgumentException("해당 방이 존재하지 않습니다.");
        }

        return chatMessageRepository.findAllByChatRoomIdOrderByCreatedAtAsc(roomId).stream()
                .map(ChatMessageResponse::from)
                .toList();
    }
}
