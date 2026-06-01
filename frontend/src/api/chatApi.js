import {API_BASE_URL} from "../config";

async function getErrorMessage(response, fallbackMessage) {
    try {
        const data = await response.json();
        return data.message || fallbackMessage;
    } catch {
        return fallbackMessage;
    }
}

export async function getChatRooms() {
    const response = await fetch(`${API_BASE_URL}/api/chat-rooms`);
    if (!response.ok) {
        throw new Error(await getErrorMessage(response, "채팅방 목록 조회 실패"));
    }
    return response.json();
}

export async function getChatRoom(roomId) {
    const response = await fetch(`${API_BASE_URL}/api/chat-rooms/${roomId}`);
    if (!response.ok) {
        throw new Error(await getErrorMessage(response, "채팅방 조회 실패"));
    }
    return response.json();
}

export async function createChatRoom({ roomName, roomType }) {
    const response = await fetch(`${API_BASE_URL}/api/chat-rooms`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomName, roomType }),
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response, "채팅방 생성 실패"));
    }

    return response.json();
}

export async function joinChatRoom(roomId, memberId) {
    const response = await fetch(`${API_BASE_URL}/api/chat-rooms/${roomId}/participants`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId }),
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response, "채팅방 참가 실패"));
    }
}

export async function getChatMessages(roomId) {
    const response = await fetch(`${API_BASE_URL}/api/chat-rooms/${roomId}/messages`);
    if (!response.ok) {
        throw new Error(await getErrorMessage(response, "메시지 조회 실패"));
    }
    return response.json();
}
