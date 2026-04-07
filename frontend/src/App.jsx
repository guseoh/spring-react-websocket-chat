import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ChatRoomListPage from "./pages/ChatRoomListPage";
import ChatRoomPage from "./pages/ChatRoomPage";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/chat" replace />} />
                <Route path="/chat" element={<ChatRoomListPage />} />
                <Route path="/chat/:roomId" element={<ChatRoomPage />} />
            </Routes>
        </BrowserRouter>
    );
}