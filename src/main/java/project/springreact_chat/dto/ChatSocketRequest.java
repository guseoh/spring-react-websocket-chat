package project.springreact_chat.dto;

import lombok.Data;

@Data
public class ChatSocketRequest {

    private MessageType type = MessageType.TALK;
    private String content;

    public MessageType getTypeOrDefault() {
        return type == null ? MessageType.TALK : type;
    }

    public String getTrimmedContent() {
        return content == null ? "" : content.trim();
    }
}
