package project.springreact_chat.dto;

import lombok.Builder;
import lombok.Getter;
import project.springreact_chat.domain.ChatMessage;

import java.time.LocalDateTime;

@Getter
@Builder
public class ChatMessageResponse {

    private MessageType type;
    private Long messageId;
    private Long senderId;
    private Long roomId;
    private String username;
    private String content;
    private LocalDateTime createdAt;


    //todo: 수정 필요
    public static ChatMessageResponse from(ChatMessage chatMessage) {
        return ChatMessageResponse.builder()
                .type(MessageType.TALK)
                .messageId(chatMessage.getId())
                .senderId(chatMessage.getSender().getId())
                .roomId(chatMessage.getChatRoom().getId())
                .username(chatMessage.getSender().getUsername())
                .content(chatMessage.getContent())
                .createdAt(chatMessage.getCreatedAt())
                .build();
    }

}
