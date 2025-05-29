import React, { useState } from "react";
import Background from "../../components/Background/Background";
import PlayerList from "./PlayerList";
import Canvas from "./Canvas";
import ChatBox from "./ChatBox";
import styles from "./GameRoom.module.css";
import avatar from "../../assets/default-avatar.png"; 

const GameRoom = () => {
  const [players] = useState([
    { id: 1, nickname: "승준짱", score: -50, avatar: "/avatar.png" },
    { id: 2, nickname: "채원짱", score: 100, avatar: "/avatar2.png" },
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
        <div className={styles.leftSection}>
          {/* 방 정보 등 필요시 추가 */}
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
    </Background>
  );
};

export default GameRoom; 