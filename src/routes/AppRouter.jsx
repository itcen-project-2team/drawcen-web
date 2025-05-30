import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GameRoom from "../pages/gameroom/GameRoom";
import LandingPage from '../pages/landingpage/LandingPage';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/room/:roomCode" element={<GameRoom/>} />
      <Route path="/" element={<LandingPage />} />
      {/* 다른 라우트도 여기에 추가 */}
    </Routes>
  </BrowserRouter>
);

export default AppRouter; 