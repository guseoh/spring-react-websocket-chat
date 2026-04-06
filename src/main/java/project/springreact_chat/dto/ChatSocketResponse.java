package project.springreact_chat.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatSocketResponse {

    private Long roomId;
    private Long senderId;
    private String nickname;
    private String content;
    private LocalDateTime createdAt;

}
