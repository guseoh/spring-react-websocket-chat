import {useEffect, useRef, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {getChatMessages, getChatRoom, joinChatRoom} from "../api/chatApi";
import {DEFAULT_MEMBER_ID, WS_BASE_URL} from "../config";

const SOCKET_STATUS = {
    CONNECTING: "CONNECTING",
    OPEN: "OPEN",
    CLOSED: "CLOSED",
    ERROR: "ERROR",
};

const CONNECTION_LABEL = {
    [SOCKET_STATUS.CONNECTING]: "연결 중",
    [SOCKET_STATUS.OPEN]: "연결됨",
    [SOCKET_STATUS.CLOSED]: "연결 종료",
    [SOCKET_STATUS.ERROR]: "연결 오류",
};

function createChatSocketUrl(roomId, memberId) {
    const url = new URL("/ws/chat", WS_BASE_URL);
    url.searchParams.set("roomId", roomId);
    url.searchParams.set("memberId", memberId);
    return url.toString();
}

function isSystemMessage(message) {
    return message.type && message.type !== "TALK";
}

export default function ChatRoomPage() {
    const {roomId} = useParams();
    const memberId = DEFAULT_MEMBER_ID;

    const [room, setRoom] = useState(null);
    const [content, setContent] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [socketStatus, setSocketStatus] = useState(SOCKET_STATUS.CLOSED);
    const [socketError, setSocketError] = useState("");
    const socketRef = useRef(null);
    const messageEndRef = useRef(null);

    useEffect(() => {
        let cancelled = false;

        const closeSocket = () => {
            const socket = socketRef.current;
            if (!socket) {
                return;
            }

            socket.onopen = null;
            socket.onmessage = null;
            socket.onerror = null;
            socket.onclose = null;

            if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
                socket.close(1000, "채팅방 화면 종료");
            }

            socketRef.current = null;
        };

        const init = async () => {
            closeSocket();

            try {
                setLoading(true);
                setError("");
                setSocketError("");
                setSocketStatus(SOCKET_STATUS.CONNECTING);

                const roomData = await getChatRoom(roomId);
                await joinChatRoom(roomId, memberId);
                const messageData = await getChatMessages(roomId);

                if (cancelled) {
                    return;
                }

                setRoom(roomData);
                setMessages(messageData);

                const socket = new WebSocket(createChatSocketUrl(roomId, memberId));

                socketRef.current = socket;

                socket.onopen = () => {
                    if (cancelled) return;
                    setSocketStatus(SOCKET_STATUS.OPEN);
                    setSocketError("");
                };

                socket.onmessage = (event) => {
                    if (cancelled) return;

                    let data;
                    try {
                        data = JSON.parse(event.data);
                    } catch {
                        setSocketError("서버 메시지를 해석하지 못했습니다.");
                        return;
                    }

                    if (data.type === "ERROR") {
                        setSocketError(data.content || "메시지 처리 중 오류가 발생했습니다.");
                        return;
                    }

                    setMessages((prev) => [...prev, data]);
                };

                socket.onclose = (event) => {
                    if (cancelled) return;
                    setSocketStatus(event.code === 1000 ? SOCKET_STATUS.CLOSED : SOCKET_STATUS.ERROR);
                    if (event.code !== 1000) {
                        setSocketError("웹소켓 연결이 종료되었습니다.");
                    }
                };

                socket.onerror = () => {
                    if (cancelled) return;
                    setSocketStatus(SOCKET_STATUS.ERROR);
                    setSocketError("웹소켓 연결 중 오류가 발생했습니다.");
                };
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "채팅방 초기화 실패");
                    setSocketStatus(SOCKET_STATUS.ERROR);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        init();

        return () => {
            cancelled = true;
            closeSocket();
        };
    }, [roomId, memberId]);

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [messages]);

    const sendMessage = () => {
        const trimmedContent = content.trim();
        if (!trimmedContent) return;

        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            setSocketError("웹소켓 연결이 아직 열리지 않았습니다.");
            return;
        }

        socketRef.current.send(
            JSON.stringify({
                type: "TALK",
                content: trimmedContent,
            })
        );

        setContent("");
        setSocketError("");
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

            <div style={{fontSize: 14, marginBottom: 12, color: socketStatus === SOCKET_STATUS.OPEN ? "#2f7d32" : "#9a5b00"}}>
                {CONNECTION_LABEL[socketStatus]}
                {socketError && <span style={{marginLeft: 8, color: "red"}}>{socketError}</span>}
            </div>

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
                            key={`${msg.messageId ?? msg.createdAt ?? idx}-${idx}`}
                            style={{
                                marginBottom: 12,
                                paddingBottom: 8,
                                borderBottom: "1px solid #f1f1f1",
                                color: isSystemMessage(msg) ? "#666" : "inherit",
                            }}
                        >
                            <div style={{fontWeight: "bold"}}>
                                {isSystemMessage(msg) ? "시스템" : `${msg.username || "알 수 없음"} (${msg.senderId})`}
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
                <button onClick={sendMessage} disabled={socketStatus !== SOCKET_STATUS.OPEN}>
                    전송
                </button>
            </div>
        </div>
    );
}
