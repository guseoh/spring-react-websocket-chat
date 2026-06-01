package project.springreact_chat.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class ChatRoomParticipantRequest {

    @NotNull(message = "회원 ID는 필수입니다.")
    private Long memberId;
}
