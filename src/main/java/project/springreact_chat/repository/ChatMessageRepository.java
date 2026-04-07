package project.springreact_chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import project.springreact_chat.domain.ChatMessage;
import project.springreact_chat.dto.ChatMessageResponse;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findAllByChatRoomIdOrderByCreatedAtAsc(Long chatRoomId);
}
