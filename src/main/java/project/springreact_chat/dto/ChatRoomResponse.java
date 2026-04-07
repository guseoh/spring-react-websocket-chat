package project.springreact_chat.dto;

import lombok.Builder;
import lombok.Getter;
import project.springreact_chat.domain.ChatRoom;
import project.springreact_chat.domain.RoomType;

import java.time.LocalDateTime;

@Getter
@Builder
public class ChatRoomResponse {

    private Long roomId;
    private String roomName;
    private RoomType roomType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ChatRoomResponse from(ChatRoom chatRoom) {
        return ChatRoomResponse.builder()
                .roomId(chatRoom.getId())
                .roomName(chatRoom.getRoomName())
                .roomType(chatRoom.getRoomType())
                .createdAt(chatRoom.getCreatedAt())
                .updatedAt(chatRoom.getUpdatedAt())
                .build();
    }
}
