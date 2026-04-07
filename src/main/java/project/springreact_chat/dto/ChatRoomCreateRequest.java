package project.springreact_chat.dto;

import lombok.Getter;
import project.springreact_chat.domain.RoomType;

@Getter
public class ChatRoomCreateRequest {

    private String roomName;
    private RoomType roomType;

}
