import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Example from "../pages/example/Example";

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Example />} />
      {/* 다른 라우트도 여기에 추가 */}
    </Routes>
  </BrowserRouter>
);

export default AppRouter; 