package project.springreact_chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import project.springreact_chat.domain.ChatRoomParticipant;

public interface ChatRoomParticipantRepository extends JpaRepository<ChatRoomParticipant, Long> {

}
