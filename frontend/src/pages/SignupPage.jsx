import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {signup} from "../api/authApi";

export default function SignupPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        username: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setLoading(true);

        try {
            await signup({
                email: form.email.trim(),
                username: form.username.trim(),
                password: form.password,
            });
            navigate("/login");
        } catch (err) {
            setErrorMessage(err.message || "회원가입 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-shell">
            <section className="auth-card" aria-labelledby="signup-title">
                <Link className="back-link" to="/chat">채팅방 목록</Link>
                <p className="eyebrow">Account</p>
                <h1 id="signup-title">회원가입</h1>
                <p className="page-description">닉네임을 정하고 채팅방에서 대화를 시작하세요.</p>

                <form onSubmit={handleSubmit} className="form">
                    <label className="field">
                        <span>이메일</span>
                        <input
                            type="email"
                            name="email"
                            placeholder="name@example.com"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                        />
                    </label>

                    <label className="field">
                        <span>닉네임</span>
                        <input
                            type="text"
                            name="username"
                            placeholder="표시할 이름"
                            value={form.username}
                            onChange={handleChange}
                            maxLength={10}
                            autoComplete="nickname"
                        />
                    </label>

                    <label className="field">
                        <span>비밀번호</span>
                        <input
                            type="password"
                            name="password"
                            placeholder="비밀번호"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                        />
                    </label>

                    {errorMessage && <p className="inline-error">{errorMessage}</p>}

                    <button type="submit" className="button primary full-width" disabled={loading}>
                        {loading ? "가입 중" : "회원가입"}
                    </button>
                </form>

                <p className="auth-link">
                    이미 계정이 있다면 <Link to="/login">로그인</Link>
                </p>
            </section>
        </main>
    );
}
