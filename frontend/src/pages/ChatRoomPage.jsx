import {useEffect, useRef, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {getChatMessages, getChatRoom, joinChatRoom} from "../api/chatApi";

export default function ChatRoomPage() {
    const {roomId} = useParams();
    const memberId = 2;

    const [room, setRoom] = useState(null);
    const [content, setContent] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const socketRef = useRef(null);
    const messageEndRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                setError("");

                const roomData = await getChatRoom(roomId);
                setRoom(roomData);

                await joinChatRoom(roomId, memberId);

                const messageData = await getChatMessages(roomId);
                setMessages(messageData);

                const socket = new WebSocket(
                    `ws://localhost:8080/ws/chat?roomId=${roomId}&memberId=${memberId}`
                );

                socketRef.current = socket;

                socket.onopen = () => {
                    console.log("websocket connected");
                };

                socket.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    setMessages((prev) => [...prev, data]);
                };

                socket.onclose = () => {
                    console.log("websocket closed");
                };

                socket.onerror = (event) => {
                    console.error("websocket error", event);
                };
            } catch (err) {
                console.error(err);
                setError(err.message || "채팅방 초기화 실패");
            } finally {
                setLoading(false);
            }
        };

        init();

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [roomId]);

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [messages]);

    const sendMessage = () => {
        if (!content.trim()) return;

        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            alert("웹소켓 연결이 아직 열리지 않았습니다.");
            return;
        }

        socketRef.current.send(
            JSON.stringify({
                content,
            })
        );

        setContent("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    if (loading) {
        return <div style={{padding: 20}}>채팅방 불러오는 중...</div>;
    }

    if (error) {
        return (
            <div style={{padding: 20}}>
                <p style={{color: "red"}}>{error}</p>
                <Link to="/chat">채팅방 목록으로 돌아가기</Link>
            </div>
        );
    }

    return (
        <div style={{maxWidth: 900, margin: "20px auto", padding: 20}}>
            <div style={{marginBottom: 16}}>
                <Link to="/chat">← 채팅방 목록</Link>
            </div>

            <h2 style={{marginBottom: 16}}>
                {room?.roomName || `Room #${roomId}`}
            </h2>

            <div
                style={{
                    border: "1px solid #ddd",
                    height: 400,
                    overflowY: "auto",
                    padding: 16,
                    marginBottom: 12,
                    borderRadius: 8,
                }}
            >
                {messages.length === 0 ? (
                    <p>아직 메시지가 없습니다.</p>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={`${msg.messageId ?? idx}-${idx}`}
                            style={{
                                marginBottom: 12,
                                paddingBottom: 8,
                                borderBottom: "1px solid #f1f1f1",
                            }}
                        >
                            <div style={{fontWeight: "bold"}}>
                                {msg.nickname} ({msg.senderId})
                            </div>
                            <div>{msg.content}</div>
                            {msg.createdAt && (
                                <div style={{fontSize: 12, color: "#666", marginTop: 4}}>
                                    {msg.createdAt}
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={messageEndRef}/>
            </div>

            <div style={{display: "flex", gap: 8}}>
                <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="메시지 입력"
                    style={{flex: 1, padding: 12}}
                />
                <button onClick={sendMessage}>전송</button>
            </div>
        </div>
    );
}