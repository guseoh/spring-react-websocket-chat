package project.springreact_chat.dto;

import lombok.Builder;
import lombok.Getter;
import project.springreact_chat.domain.ChatMessage;

import java.time.LocalDateTime;

@Getter
@Builder
public class ChatMessageResponse {

    private Long messageId;
    private Long senderId;
    private Long roomId;
    private String nickname;
    private String content;
    private LocalDateTime createdAt;


    //todo: 수정 필요
    public static ChatMessageResponse from(ChatMessage chatMessage) {
        return ChatMessageResponse.builder()
                .messageId(chatMessage.getId())
                .senderId(chatMessage.getSender().getId())
                .roomId(chatMessage.getChatRoom().getId())
                .nickname(chatMessage.getSender().getNickname())
                .content(chatMessage.getContent())
                .createdAt(chatMessage.getCreatedAt())
                .build();
    }

}
