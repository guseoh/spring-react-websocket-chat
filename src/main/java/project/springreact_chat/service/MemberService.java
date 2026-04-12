package project.springreact_chat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import project.springreact_chat.domain.Member;
import project.springreact_chat.dto.MemberResponse;
import project.springreact_chat.dto.SignupRequest;
import project.springreact_chat.repository.MemberRepository;

@Service
@Slf4j
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final BCryptPasswordEncoder passwordEncoder;


    public MemberResponse join(SignupRequest request) {

        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }

        if (memberRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("이미 존재하는 닉네임입니다.");
        }

        String encodePassword = passwordEncoder.encode(request.getPassword());

        Member member = memberRepository.save(
                Member.create(
                        request.getEmail(),
                        request.getUsername(),
                        encodePassword));

        return MemberResponse.from(member);
    }
}
