import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GameRoom from "../pages/gameroom/GameRoom";
import LandingPage from '../pages/landingpage/LandingPage';
import Main from '../pages/main/Main';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/room" element={<GameRoom/>} /> // 여기 경로 설정으로 라우팅 설정
      <Route path="/main" element={<Main />} />
      <Route path="/" element={<LandingPage />} />
      {/* 다른 라우트도 여기에 추가 */}
    </Routes>
  </BrowserRouter>
);

export default AppRouter; 