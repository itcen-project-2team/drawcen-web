import React, { useState, useEffect } from "react";
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
  const [players, setPlayers] = useState([
    { id: 1, nickname: "승준짱", score: -50, avatar: avatar, isDrawing: true },
    { id: 2, nickname: "채원짱", score: 100, avatar: avatar, isDrawing: false },
  ]);
  const [messages] = useState([
    { id: 1, nickname: "승준짱", message: "안녕하세요!" },
    { id: 2, nickname: "채원짱", message: "반가워요!" },
  ]);
  const [isQuizMaster] = useState(true);
  const [answer] = useState("사과");
  
  // 턴 정보 상태
  const [turnInfo, setTurnInfo] = useState({
    startTime: null, // 서울 시간 기준 시작시간 (ISO string)
    endTime: null,   // 서울 시간 기준 종료시간 (ISO string)
    currentDrawerId: 1 // 현재 그리는 사람 ID
  });
  
  // 실시간 타이머 계산
  const [timePercent, setTimePercent] = useState(100);

  // 백엔드에서 턴 정보를 받는 예시 함수
  const handleTurnUpdate = (turnData) => {
    // 백엔드에서 받는 데이터 예시:
    // {
    //   startTime: "2024-01-15T14:30:00+09:00", // 서울 시간
    //   endTime: "2024-01-15T14:32:00+09:00",   // 서울 시간 (2분 후)
    //   currentDrawerId: 1
    // }
    setTurnInfo(turnData);
    
    // 플레이어 그리기 상태 업데이트
    setPlayers(prev => prev.map(player => ({
      ...player,
      isDrawing: player.id === turnData.currentDrawerId
    })));
  };

  // 실시간 타이머 업데이트
  useEffect(() => {
    if (!turnInfo.startTime || !turnInfo.endTime) {
      setTimePercent(100);
      return;
    }

    const updateTimer = () => {
      // 서울 시간 기준으로 현재 시간 계산
      const now = new Date();
      const startTime = new Date(turnInfo.startTime);
      const endTime = new Date(turnInfo.endTime);
      
      // 전체 턴 시간 (밀리초)
      const totalDuration = endTime.getTime() - startTime.getTime();
      
      // 경과 시간 (밀리초)
      const elapsed = now.getTime() - startTime.getTime();
      
      // 남은 시간 비율 계산 (0~100)
      const remaining = Math.max(0, totalDuration - elapsed);
      const percent = Math.max(0, (remaining / totalDuration) * 100);
      
      // 20ms 간격을 위해 소수점 1자리까지 유지
      setTimePercent(Math.max(0, Number(percent.toFixed(1))));
      
      // 턴이 끝났으면 타이머 정리
      if (percent <= 0) {
        console.log('턴 종료!');
        // 여기서 백엔드에 턴 종료 알림 또는 다음 턴 요청
      }
    };

    // 즉시 실행
    updateTimer();

    // 20ms마다 업데이트 (부드러운 애니메이션)
    const interval = setInterval(updateTimer, 20);

    return () => clearInterval(interval);
  }, [turnInfo.startTime, turnInfo.endTime]);

  // 컴포넌트 마운트 시 백엔드에서 현재 턴 정보 가져오기 (예시)
  useEffect(() => {
    // 실제로는 WebSocket이나 API 호출
    // fetchCurrentTurn().then(handleTurnUpdate);
    
    // 테스트용 가짜 데이터
    const now = new Date();
    const testTurnData = {
      startTime: now.toISOString(), // 현재 시간
      endTime: new Date(now.getTime() + 60000).toISOString(), // 2분 후
      currentDrawerId: 1
    };
    handleTurnUpdate(testTurnData);
  }, []);

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