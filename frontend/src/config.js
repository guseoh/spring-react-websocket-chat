const trimTrailingSlash = (value) => value.replace(/\/$/, "");

export const API_BASE_URL = trimTrailingSlash(
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
);

export const WS_BASE_URL = trimTrailingSlash(
    import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8080"
);

const configuredMemberId = Number(import.meta.env.VITE_DEFAULT_MEMBER_ID || 2);

export const DEFAULT_MEMBER_ID = Number.isFinite(configuredMemberId) ? configuredMemberId : 2;
