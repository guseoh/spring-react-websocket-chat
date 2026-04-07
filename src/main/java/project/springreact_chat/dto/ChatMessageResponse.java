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

    public static ChatMessageResponse from(ChatMessage chatMessage) {
        return ChatMessageResponse.builder()
                .messageId(chatMessage.getId())
    }

}
