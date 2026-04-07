import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createChatRoom, getChatRooms } from "../api/chatApi";

export default function ChatRoomListPage() {
    const navigate = useNavigate();

    const [rooms, setRooms] = useState([]);
    const [roomName, setRoomName] = useState("");
    const [roomType, setRoomType] = useState("DIRECT");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchRooms = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getChatRooms();
            setRooms(data);
        } catch (err) {
            setError(err.message || "채팅방 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleCreateRoom = async (e) => {
        e.preventDefault();

        if (!roomName.trim()) {
            alert("채팅방 이름을 입력해주세요.");
            return;
        }

        try {
            const createdRoom = await createChatRoom({
                roomName,
                roomType,
            });

            setRoomName("");
            setRoomType("DIRECT");

            navigate(`/chat/${createdRoom.roomId}`);
        } catch (err) {
            alert(err.message || "채팅방 생성 실패");
        }
    };

    const handleEnterRoom = (roomId) => {
        navigate(`/chat/${roomId}`);
    };

    const handleLogin = () => {
        navigate("/login");
    };

    const handleSignup = () => {
        navigate("/signup");
    };

    return (
        <div style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                }}
            >
                <h1 style={{ textAlign: "center", marginBottom: 24 }}>채팅방 목록</h1>

                <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={handleLogin}>
                        로그인
                    </button>
                    <button type="button" onClick={handleSignup}>
                        회원가입
                    </button>
                </div>
            </div>

            <form onSubmit={handleCreateRoom} style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", gap: 8 }}>
                    <input
                        type="text"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="채팅방 이름"
                        style={{ flex: 1, padding: 10 }}
                    />

                    <select
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                        style={{ padding: 10 }}
                    >
                        <option value="DIRECT">DIRECT</option>
                        <option value="GROUP">GROUP</option>
                    </select>

                    <button type="submit">방 생성</button>
                </div>
            </form>

            {loading && <p>불러오는 중...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {!loading && rooms.length === 0 && <p>생성된 채팅방이 없습니다.</p>}

            <ul style={{ listStyle: "none", padding: 0 }}>
                {rooms.map((room) => (
                    <li
                        key={room.roomId}
                        style={{
                            border: "1px solid #ddd",
                            padding: 16,
                            marginBottom: 12,
                            borderRadius: 8,
                        }}
                    >
                        <div style={{ marginBottom: 8 }}>
                            <strong>{room.roomName}</strong>
                        </div>
                        <div style={{ marginBottom: 8 }}>타입: {room.roomType}</div>
                        <button onClick={() => handleEnterRoom(room.roomId)}>입장</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}