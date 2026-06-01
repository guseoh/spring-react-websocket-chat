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

function isTalkMessage(message) {
    return !message.type || message.type === "TALK";
}

function formatTime(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
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
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (loading) {
        return (
            <main className="chat-shell">
                <div className="state-panel chat-state">
                    <div className="spinner" aria-hidden="true"/>
                    <strong>채팅방을 준비하고 있습니다.</strong>
                    <p>이전 메시지와 WebSocket 연결을 확인하는 중입니다.</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="chat-shell">
                <div className="state-panel error-panel chat-state">
                    <strong>채팅방을 열 수 없습니다.</strong>
                    <p>{error}</p>
                    <Link className="button secondary" to="/chat">채팅방 목록으로</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="chat-shell">
            <section className="chat-layout" aria-label="채팅방">
                <header className="chat-header">
                    <div>
                        <Link className="back-link" to="/chat">채팅방 목록</Link>
                        <h1>{room?.roomName || `Room #${roomId}`}</h1>
                        <p>Room #{roomId} · 내 ID {memberId}</p>
                    </div>

                    <div className={`connection-badge ${socketStatus.toLowerCase()}`}>
                        <span aria-hidden="true"/>
                        {CONNECTION_LABEL[socketStatus]}
                    </div>
                </header>

                {socketError && (
                    <div className="socket-alert" role="status">
                        {socketError}
                    </div>
                )}

                <div className="message-list" aria-live="polite">
                    {messages.length === 0 ? (
                        <div className="empty-chat">
                            <strong>아직 메시지가 없습니다.</strong>
                            <p>첫 메시지를 보내 대화를 시작하세요.</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const systemMessage = !isTalkMessage(msg);
                            const mine = isTalkMessage(msg) && Number(msg.senderId) === Number(memberId);
                            const itemClassName = [
                                "message-row",
                                systemMessage ? "system" : "",
                                mine ? "mine" : "other",
                            ].filter(Boolean).join(" ");

                            return (
                                <article className={itemClassName} key={`${msg.messageId ?? msg.createdAt ?? idx}-${idx}`}>
                                    {systemMessage ? (
                                        <div className="system-message">{msg.content}</div>
                                    ) : (
                                        <div className="message-bubble">
                                            <div className="message-meta">
                                                <span>{mine ? "나" : msg.username || "알 수 없음"}</span>
                                                {msg.createdAt && <time>{formatTime(msg.createdAt)}</time>}
                                            </div>
                                            <p>{msg.content}</p>
                                        </div>
                                    )}
                                </article>
                            );
                        })
                    )}
                    <div ref={messageEndRef}/>
                </div>

                <form className="message-composer" onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                }}>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="메시지를 입력하세요"
                        rows={1}
                        maxLength={500}
                    />
                    <button type="submit" className="button primary" disabled={socketStatus !== SOCKET_STATUS.OPEN || !content.trim()}>
                        전송
                    </button>
                </form>
            </section>
        </main>
    );
}
