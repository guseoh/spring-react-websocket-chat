const BASE_URL = "http://localhost:8080";

export async function signup(request) {
    const response = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "회원가입에 실패했습니다.");
    }

    return await response.json();
}

export async function login({ email, password }) {
    const response = await fetch(`${BASE_URL}/login`, {
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
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
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
    const response = await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("로그아웃에 실패했습니다.");
    }
}