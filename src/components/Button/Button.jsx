import React from "react";
import styles from "./Button.module.css";

/* 버튼 컴포넌트 예시 */
const Button = ({ children, onClick, type = "button", className = "", ...rest }) => {
  return (
    <button
      type={type}
      className={`${styles.button} ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button; 