package project.springreact_chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import project.springreact_chat.domain.Member;

public interface MemberRepository extends JpaRepository<Member, Long> {
}
