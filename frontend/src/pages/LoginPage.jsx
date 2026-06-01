import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {login} from "../api/authApi";

export default function LoginPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

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
            await login({
                email: form.email.trim(),
                password: form.password,
            });
            navigate("/chat");
        } catch (err) {
            setErrorMessage(err.message || "로그인 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-shell">
            <section className="auth-card" aria-labelledby="login-title">
                <Link className="back-link" to="/chat">채팅방 목록</Link>
                <p className="eyebrow">Account</p>
                <h1 id="login-title">로그인</h1>
                <p className="page-description">가입한 계정으로 대화에 참여하세요.</p>

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
                        <span>비밀번호</span>
                        <input
                            type="password"
                            name="password"
                            placeholder="비밀번호"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                        />
                    </label>

                    {errorMessage && <p className="inline-error">{errorMessage}</p>}

                    <button type="submit" className="button primary full-width" disabled={loading}>
                        {loading ? "로그인 중" : "로그인"}
                    </button>
                </form>

                <p className="auth-link">
                    계정이 없다면 <Link to="/signup">회원가입</Link>
                </p>
            </section>
        </main>
    );
}
