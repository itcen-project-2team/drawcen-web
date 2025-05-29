import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Example from "../pages/example/Example";

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Example />} /> // 여기 경로 설정으로 라우팅 설정
      {/* 다른 라우트도 여기에 추가 */}
    </Routes>
  </BrowserRouter>
);

export default AppRouter; 