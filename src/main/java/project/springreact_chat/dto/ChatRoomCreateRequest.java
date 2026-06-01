package project.springreact_chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import project.springreact_chat.domain.RoomType;

@Getter
public class ChatRoomCreateRequest {

    @NotBlank(message = "채팅방 이름은 필수입니다.")
    private String roomName;

    @NotNull(message = "채팅방 타입은 필수입니다.")
    private RoomType roomType;

}
