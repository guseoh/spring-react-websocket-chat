import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {createChatRoom, getChatRooms} from "../api/chatApi";

export default function ChatRoomListPage() {
    const navigate = useNavigate();

    const [rooms, setRooms] = useState([]);
    const [roomName, setRoomName] = useState("");
    const [roomType, setRoomType] = useState("DIRECT");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [createError, setCreateError] = useState("");
    const [creating, setCreating] = useState(false);

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

        const trimmedRoomName = roomName.trim();
        if (!trimmedRoomName) {
            setCreateError("채팅방 이름을 입력해주세요.");
            return;
        }

        try {
            setCreating(true);
            setCreateError("");
            const createdRoom = await createChatRoom({
                roomName: trimmedRoomName,
                roomType,
            });

            setRoomName("");
            setRoomType("DIRECT");
            navigate(`/chat/${createdRoom.roomId}`);
        } catch (err) {
            setCreateError(err.message || "채팅방 생성 실패");
        } finally {
            setCreating(false);
        }
    };

    return (
        <main className="app-shell">
            <header className="app-header">
                <div>
                    <p className="eyebrow">Pure WebSocket Chat</p>
                    <h1>채팅방</h1>
                    <p className="page-description">참여할 방을 고르거나 새 대화를 시작하세요.</p>
                </div>

                <nav className="header-actions" aria-label="계정 메뉴">
                    <button type="button" className="button ghost" onClick={() => navigate("/login")}>
                        로그인
                    </button>
                    <button type="button" className="button secondary" onClick={() => navigate("/signup")}>
                        회원가입
                    </button>
                </nav>
            </header>

            <section className="create-room-panel" aria-labelledby="create-room-title">
                <div>
                    <h2 id="create-room-title">새 채팅방 만들기</h2>
                    <p>방 이름과 타입만 정하면 바로 입장할 수 있습니다.</p>
                </div>

                <form className="create-room-form" onSubmit={handleCreateRoom}>
                    <label className="field field-grow">
                        <span>방 이름</span>
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="예: 프로젝트 회의방"
                            maxLength={40}
                        />
                    </label>

                    <label className="field compact-field">
                        <span>타입</span>
                        <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                            <option value="DIRECT">DIRECT</option>
                            <option value="GROUP">GROUP</option>
                        </select>
                    </label>

                    <button type="submit" className="button primary" disabled={creating}>
                        {creating ? "생성 중" : "방 생성"}
                    </button>
                </form>

                {createError && <p className="inline-error">{createError}</p>}
            </section>

            <section className="section-header" aria-live="polite">
                <div>
                    <h2>참여 가능한 방</h2>
                    <p>{loading ? "방 목록을 확인하는 중입니다." : `${rooms.length}개의 방이 있습니다.`}</p>
                </div>
                <button type="button" className="button ghost" onClick={fetchRooms} disabled={loading}>
                    새로고침
                </button>
            </section>

            {loading && (
                <div className="state-panel">
                    <div className="spinner" aria-hidden="true"/>
                    <strong>채팅방을 불러오는 중입니다.</strong>
                    <p>잠시만 기다려주세요.</p>
                </div>
            )}

            {!loading && error && (
                <div className="state-panel error-panel">
                    <strong>채팅방 목록을 불러오지 못했습니다.</strong>
                    <p>{error}</p>
                    <button type="button" className="button secondary" onClick={fetchRooms}>
                        다시 시도
                    </button>
                </div>
            )}

            {!loading && !error && rooms.length === 0 && (
                <div className="state-panel">
                    <strong>아직 생성된 채팅방이 없습니다.</strong>
                    <p>위 입력창에서 첫 번째 방을 만들어보세요.</p>
                </div>
            )}

            {!loading && !error && rooms.length > 0 && (
                <ul className="room-list">
                    {rooms.map((room) => (
                        <li className="room-item" key={room.roomId}>
                            <div className="room-main">
                                <span className="room-type">{room.roomType || "ROOM"}</span>
                                <h3>{room.roomName}</h3>
                                <p>Room #{room.roomId}</p>
                            </div>
                            <button
                                type="button"
                                className="button primary"
                                onClick={() => navigate(`/chat/${room.roomId}`)}
                            >
                                입장
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
