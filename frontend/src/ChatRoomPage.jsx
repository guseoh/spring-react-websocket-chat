import { useEffect, useRef, useState } from "react";

export default function ChatRoomPage() {
    const roomId = 1;
    const memberId = 2;

    const [content, setContent] = useState("");
    const [messages, setMessages] = useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
        const socket = new WebSocket(
            `ws://localhost:8080/ws/chat?roomId=${roomId}&memberId=${memberId}`
        );

        socketRef.current = socket;

        socket.onopen = () => {
            console.log("connected");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages((prev) => [...prev, data]);
        };

        socket.onclose = () => {
            console.log("closed");
        };

        socket.onerror = (e) => {
            console.error(e);
        };

        return () => socket.close();
    }, [roomId, memberId]);

    const sendMessage = () => {
        if (!content.trim()) return;
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

        socketRef.current.send(
            JSON.stringify({
                content,
            })
        );

        setContent("");
    };

    return (
        <div>
            <h2>Room #{roomId}</h2>

            <div style={{ border: "1px solid #ddd", height: 300, overflowY: "auto", marginBottom: 12 }}>
                {messages.map((msg, idx) => (
                    <div key={idx}>
                        <strong>{msg.nickname}</strong>: {msg.content}
                    </div>
                ))}
            </div>

            <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="메시지 입력"
            />
            <button onClick={sendMessage}>전송</button>
        </div>
    );
}