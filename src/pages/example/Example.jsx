import React from "react";

const Example = () => {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Example Page</h1>
      <p>이 페이지는 라우팅 예시를 위한 Example 페이지입니다.</p>
      <button onClick={() => alert("버튼이 클릭되었습니다!")}>예시 버튼</button>
    </div>
  );
};

export default Example;
