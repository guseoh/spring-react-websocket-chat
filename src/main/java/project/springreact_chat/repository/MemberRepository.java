package project.springreact_chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import project.springreact_chat.domain.Member;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    Optional<Member> findByUsername(String username);

    Optional<Member> findByEmail(String email);
}
