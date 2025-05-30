import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Background from "../../components/Background/Background";
import PlayerList from "./PlayerList";
import Canvas from "./Canvas";
import ChatBox from "./ChatBox";
import styles from "./GameRoom.module.css";
import logo from "../../assets/logo.png";
import avatar from "../../assets/default-avatar.png";

const GameRoom = () => {
  const { roomCode } = useParams();
  const [players] = useState([
    { id: 1, nickname: "승준짱", score: -50, avatar: avatar, isDrawing: true },
    { id: 2, nickname: "채원짱", score: 100, avatar: avatar, isDrawing: false },
  ]);
  const [messages] = useState([
    { id: 1, nickname: "승준짱", message: "안녕하세요!" },
    { id: 2, nickname: "채원짱", message: "반가워요!" },
  ]);
  const [isQuizMaster] = useState(true);
  const [answer] = useState("사과");
  const [timePercent] = useState(60);

  return (
    <Background>
      <div className={styles.gameRoom}>
        {/* 상단 헤더 */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <img src={logo} alt="DrawCen" />
          </div>
          <div className={styles.roomCode}>
            방코드: {roomCode}
          </div>
        </div>

        {/* 메인 게임 영역 */}
        <div className={styles.gameContent}>
          <div className={styles.leftSection}>
            <PlayerList players={players} />
          </div>
          <div className={styles.rightSection}>
            <div className={styles.canvasSection}>
              <Canvas isQuizMaster={isQuizMaster} answer={answer} timePercent={timePercent} />
            </div>
            <div className={styles.chatSection}>
              <ChatBox messages={messages} />
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
};

export default GameRoom; 