import React from "react";
import bg from "../../assets/background.png";
import styles from "./Background.module.css";

const Background = ({ children }) => (
  <div className={styles.background} style={{ backgroundImage: `url(${bg})` }}>
    {children}
  </div>
);

export default Background; 