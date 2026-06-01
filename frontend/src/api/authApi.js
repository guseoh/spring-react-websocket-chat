import {API_BASE_URL} from "../config";

export async function signup(request) {
    const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const error = await readError(response, "회원가입에 실패했습니다.");
        throw new Error(error);
    }

    return await response.json();
}

export async function login({ email, password }) {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "include",
        body: new URLSearchParams({
            username: email,
            password: password,
        }),
    });

    if (!response.ok) {
        throw new Error("로그인에 실패했습니다.");
    }
}

export async function getMe() {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "GET",
        credentials: "include",
    });

    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        throw new Error("로그인 사용자 정보를 불러오지 못했습니다.");
    }

    return await response.json();
}

export async function logout() {
    const response = await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("로그아웃에 실패했습니다.");
    }
}

async function readError(response, fallbackMessage) {
    try {
        const data = await response.json();
        return data.message || fallbackMessage;
    } catch {
        return fallbackMessage;
    }
}
