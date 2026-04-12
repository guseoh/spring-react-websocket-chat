import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api/authApi";

export default function SignupPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        nickname: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
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
            await signup(form);
            alert("회원가입이 완료되었습니다.");
            navigate("/login");
        } catch (err) {
            setErrorMessage(err.message || "회원가입 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="card">
                <h1>회원가입</h1>

                <form onSubmit={handleSubmit} className="form">
                    <input
                        type="email"
                        name="email"
                        placeholder="이메일"
                        value={form.email}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="nickname"
                        placeholder="닉네임"
                        value={form.nickname}
                        onChange={handleChange}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="비밀번호"
                        value={form.password}
                        onChange={handleChange}
                    />

                    {errorMessage && <p className="error-text">{errorMessage}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? "가입 중..." : "회원가입"}
                    </button>
                </form>
            </div>
        </div>
    );
}