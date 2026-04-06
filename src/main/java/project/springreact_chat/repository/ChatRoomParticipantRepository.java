package project.springreact_chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import project.springreact_chat.domain.ChatRoomParticipant;

public interface ChatRoomParticipantRepository extends JpaRepository<ChatRoomParticipant, Long> {

    // 해당 사용자가 그 방 참가자인지 검증
    boolean existsByChatRoomIdAndMemberId(Long chatRoomId, Long memberId);
}
