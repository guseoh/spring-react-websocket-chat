package project.springreact_chat.dto;

import lombok.Builder;
import lombok.Data;
import project.springreact_chat.domain.ChatMessage;
import project.springreact_chat.domain.Member;

import java.time.LocalDateTime;

@Data
@Builder
public class ChatSocketResponse {

    private MessageType type;
    private Long messageId;
    private Long roomId;
    private Long senderId;
    private String username;
    private String content;
    private LocalDateTime createdAt;

    public static ChatSocketResponse talk(ChatMessage chatMessage) {
        return ChatSocketResponse.builder()
                .type(MessageType.TALK)
                .messageId(chatMessage.getId())
                .roomId(chatMessage.getChatRoom().getId())
                .senderId(chatMessage.getSender().getId())
                .username(chatMessage.getSender().getUsername())
                .content(chatMessage.getContent())
                .createdAt(chatMessage.getCreatedAt())
                .build();
    }

    public static ChatSocketResponse system(MessageType type, Long roomId, Member member, String content) {
        if (type == MessageType.TALK) {
            throw new IllegalArgumentException("시스템 메시지는 TALK 타입을 사용할 수 없습니다.");
        }

        return ChatSocketResponse.builder()
                .type(type)
                .roomId(roomId)
                .senderId(member.getId())
                .username(member.getUsername())
                .content(content)
                .createdAt(LocalDateTime.now())
                .build();
    }

    public static ChatSocketResponse error(String content) {
        return ChatSocketResponse.builder()
                .type(MessageType.ERROR)
                .content(content)
                .createdAt(LocalDateTime.now())
                .build();
    }
}
