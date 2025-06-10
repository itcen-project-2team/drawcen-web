import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GameRoom from "../pages/gameroom/GameRoom";
import LandingPage from '../pages/landingpage/LandingPage';
import Main from '../pages/main/Main';
import MusicControl from '../components/musicControl/MusicControl';
import useBGM from '../utils/useBGM';

// 음악 초기화 컴포넌트
const MusicProvider = ({ children }) => {
  // 배경음악 초기화
  useBGM();
  
  return (
    <>
      {children}
      {/* 전역 음악 컨트롤러 - 모든 페이지 좌측 하단에 표시 */}
      <MusicControl />
    </>
  );
};

const AppRouter = () => (
  <BrowserRouter>
    <MusicProvider>
      <Routes>
        <Route path="/room/:roomCode" element={<GameRoom/>} />
        <Route path="/game/:gameId" element={<GameRoom/>} />
        <Route path="/main" element={<Main />} />
        <Route path="/" element={<LandingPage />} />
        {/* 다른 라우트도 여기에 추가 */}
      </Routes>
    </MusicProvider>
  </BrowserRouter>
);

export default AppRouter; 