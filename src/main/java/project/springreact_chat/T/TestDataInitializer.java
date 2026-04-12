package project.springreact_chat.T;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import project.springreact_chat.domain.ChatRoom;
import project.springreact_chat.domain.ChatRoomParticipant;
import project.springreact_chat.domain.Member;
import project.springreact_chat.repository.ChatRoomParticipantRepository;
import project.springreact_chat.repository.ChatRoomRepository;
import project.springreact_chat.repository.MemberRepository;

@Component
@RequiredArgsConstructor
public class TestDataInitializer implements CommandLineRunner {

    private final MemberRepository memberRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomParticipantRepository chatRoomParticipantRepository;


    @Override
    public void run(String... args) throws Exception {

        Member member1 = memberRepository.save(Member.create("member1@tt.com", "유저1"));
        Member member2 = memberRepository.save(Member.create("member2@tt.com", "유저2"));

        ChatRoom chatRoom = chatRoomRepository.save(ChatRoom.create("테스트방"));

        chatRoomParticipantRepository.save(ChatRoomParticipant.create(member1, chatRoom));
        chatRoomParticipantRepository.save(ChatRoomParticipant.create(member2, chatRoom));
    }
}
