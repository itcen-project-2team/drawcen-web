import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Background from "../../components/background/Background";
import PlayerList from "./PlayerList";
import Canvas from "./Canvas";
import ChatBox from "./ChatBox";
import styles from "./GameRoom.module.css";
import logo from "../../assets/logo.png";
import avatar from "../../assets/default-avatar.png";
import webSocketService from "../../utils/websocket";

const GameRoom = () => {
  const { roomCode, gameId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // 기본 상태
  const [players, setPlayers] = useState([]);
  const [currentRoomCode, setCurrentRoomCode] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  // players와 currentUser의 최신 값을 항상 참조하기 위한 ref
  const playersRef = useRef(players);
  const currentUserRef = useRef(currentUser);
  
  // 턴 관련 상태
  const [turnInfo, setTurnInfo] = useState({
    turnId: null,
    drawerId: null,
    startTime: null,
    endTime: null
  });
  
  // 출제자 전용 상태
  const [quizWord, setQuizWord] = useState("");
  const [isCurrentDrawer, setIsCurrentDrawer] = useState(false);
  
  // 타이머 상태
  const [timePercent, setTimePercent] = useState(100);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // ref를 항상 최신 상태로 동기화
  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // 게임 참가자 데이터 변환 함수
  const convertGameParticipants = useCallback((gameParticipants) => {
    return gameParticipants.map(participant => ({
      id: participant.memberId,
      nickname: participant.nickName || participant.memberName,
      score: participant.score || 0,
      avatar: avatar,
      isDrawing: false
    }));
  }, []);

  // 현재 사용자가 출제자인지 확인 (ref 사용)
  const checkIfCurrentDrawer = useCallback((drawerId) => {
    if (!currentUserRef.current) return false;
    return currentUserRef.current.id === drawerId || currentUserRef.current.memberId === drawerId;
  }, []);

  // WebSocket 게임 메시지 처리 (ref 사용으로 최신 상태 보장)
  const handleGameMessage = useCallback((message) => {
    console.log('🎮 게임 메시지 수신:', message);
    
    if (!message || typeof message !== 'object') {
      console.warn('❌ 잘못된 메시지 형식:', message);
      return;
    }

    const { type, data } = message;
    
    if (!type) {
      console.warn('❌ 메시지 타입이 없습니다:', message);
      return;
    }

    console.log(`📋 처리할 타입: ${type}`, data);

    try {
      console.log('📥 수신된 메시지 타입:', type, '데이터:', data);
      switch (type) {
        case 'TURN':
          if (!data || typeof data !== 'object') {
            console.error('❌ TURN 데이터가 잘못되었습니다:', data);
            return;
          }

          const { turnId, drawerId, startTime, endTime } = data;
          
          if (!turnId || !drawerId || !startTime || !endTime) {
            console.error('❌ TURN 데이터 필수 필드 누락:', data);
            return;
          }

          console.log('🎯 새 턴 시작:', { turnId, drawerId, startTime, endTime });
          
          console.log('🎯 turnInfo 설정 전:', turnInfo);
          setTurnInfo({ turnId, drawerId, startTime, endTime });
          console.log('🎯 turnInfo 설정 후 (비동기):', { turnId, drawerId, startTime, endTime });
          
          setPlayers(prev => prev.map(player => ({
            ...player,
            isDrawing: player.id === drawerId
          })));
          
          const isDrawer = checkIfCurrentDrawer(drawerId);
          setIsCurrentDrawer(isDrawer);
          
          setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'system',
            message: `🎨 새로운 턴이 시작되었습니다! 출제자: ${drawerId}`,
            timestamp: new Date()
          }]);
          
          console.log('턴 시작 출제자 확인:', { drawerId, currentUserId: currentUserRef.current?.id || currentUserRef.current?.memberId, isDrawer });
          break;

        case 'DRAWER':
          if (!data || typeof data !== 'object') {
            console.error('❌ DRAWER 데이터가 잘못되었습니다:', data);
            return;
          }

          const { quizWord, turnId: drawerTurnId } = data;
          
          if (!quizWord) {
            console.error('❌ DRAWER 데이터에 퀴즈 단어가 없습니다:', data);
            return;
          }

          console.log('📝 출제 정보 수신:', { quizWord, turnId: drawerTurnId });
          console.log('📝 현재 사용자 정보:', currentUserRef.current);
          
          setQuizWord(quizWord);
          setIsCurrentDrawer(true);
          
          console.log('🎯 출제자로 확정:', currentUserRef.current?.id || currentUserRef.current?.memberId);
          
          setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'drawer',
            message: `🎯 출제 단어: "${quizWord}"`,
            timestamp: new Date(),
            isDrawerOnly: true
          }]);
          
          console.log('📝 DRAWER 메시지 처리 완료');
          break;

        case 'CHAT':
          if (typeof data !== 'string') {
            console.error('❌ CHAT 데이터가 문자열이 아닙니다:', data);
            return;
          }

          setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'chat',
            message: data,
            timestamp: new Date()
          }]);
          break;

        case 'CORRECT':
          if (!data || typeof data !== 'object') {
            console.error('❌ CORRECT 데이터가 잘못되었습니다:', data);
            return;
          }

          const { memberId, turnId: correctTurnId, gameId: correctGameId } = data;
          
          if (!memberId) {
            console.error('❌ CORRECT 데이터에 memberId가 없습니다:', data);
            return;
          }

          // 최신 players 상태 사용
          const correctPlayer = playersRef.current.find(player => player.id === memberId);
          const playerName = correctPlayer ? correctPlayer.nickname : `참가자 ${memberId}`;
          
          setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'correct',
            message: `🎉 ${playerName}님이 정답을 맞추셨습니다!`,
            timestamp: new Date(),
            memberId
          }]);
          break;

        case 'FINISH':
          if (!data || typeof data !== 'object') {
            console.error('❌ FINISH 데이터가 잘못되었습니다:', data);
            return;
          }

          const { gameId: finishGameId, members: finishMembers } = data;
          
          if (!Array.isArray(finishMembers)) {
            console.error('❌ FINISH 데이터의 members가 배열이 아닙니다:', data);
            return;
          }

          setPlayers(prev => prev.map(player => {
            const memberScore = finishMembers.find(m => m.memberId === player.id);
            if (memberScore) {
              return { ...player, score: memberScore.score };
            }
            return player;
          }));
          
          setPlayers(prev => prev.map(player => ({ ...player, isDrawing: false })));
          setIsCurrentDrawer(false);
          setQuizWord("");
          setTimePercent(100);
          
          setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'system',
            message: '⏰ 턴이 종료되었습니다. 점수가 업데이트되었습니다.',
            timestamp: new Date()
          }]);
          break;

        case 'GAME_FINISH':
          if (!data || typeof data !== 'object') {
            console.error('❌ GAME_FINISH 데이터가 잘못되었습니다:', data);
            return;
          }

          const { gameId: gameFinishGameId, members: gameFinishMembers } = data;
          
          if (!Array.isArray(gameFinishMembers)) {
            console.error('❌ GAME_FINISH 데이터의 members가 배열이 아닙니다:', data);
            return;
          }

          setPlayers(prev => prev.map(player => {
            const memberScore = gameFinishMembers.find(m => m.memberId === player.id);
            if (memberScore) {
              return { ...player, score: memberScore.score };
            }
            return player;
          }));
          
          // 최신 players 상태 사용
          const sortedPlayers = gameFinishMembers.sort((a, b) => b.score - a.score);
          const winner = sortedPlayers[0];
          const winnerPlayer = playersRef.current.find(p => p.id === winner?.memberId);
          const winnerName = winnerPlayer ? winnerPlayer.nickname : `참가자 ${winner?.memberId}`;
          
          setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'system',
            message: `🎊 게임이 종료되었습니다! 🏆 우승자: ${winnerName}님 (${winner?.score}점)`,
            timestamp: new Date()
          }]);
          
          setTimeout(() => {
            navigate('/main');
          }, 3000);
          break;

        default:
          console.warn(`⚠️ 알 수 없는 메시지 타입: ${type}`, data);
      }
    } catch (error) {
      console.error(`❌ ${type} 타입 처리 중 오류:`, error);
    }
  }, [checkIfCurrentDrawer, navigate]);

  // 채팅 메시지 처리
  const handleChatMessage = useCallback((message) => {
    console.log('💬 채팅 전용 메시지 수신:', message);
    
    try {
      if (message && message.type === 'CHAT' && typeof message.data === 'string') {
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'chat',
          message: message.data,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('❌ 채팅 메시지 처리 중 오류:', error);
    }
  }, []);

  // 오류 메시지 처리
  const handleErrorMessage = useCallback((errorMessage) => {
    console.error('🚨 WebSocket 오류:', errorMessage);
    
    let errorText = '알 수 없는 오류가 발생했습니다.';
    
    try {
      if (typeof errorMessage === 'string') {
        errorText = errorMessage;
      } else if (errorMessage && typeof errorMessage === 'object') {
        errorText = errorMessage.message || errorMessage.error || JSON.stringify(errorMessage);
      }
    } catch (parseError) {
      console.error('❌ 오류 메시지 파싱 실패:', parseError);
    }
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'error',
      message: `🚨 ${errorText}`,
      timestamp: new Date()
    }]);
  }, []);

  // 채팅 전송 함수
  const handleSendChat = useCallback((chatMessage) => {
    if (!gameId || !chatMessage.trim()) return;
    
    try {
      webSocketService.sendChat(gameId, chatMessage);
    } catch (error) {
      console.error('채팅 전송 실패:', error);
    }
  }, [gameId]);

  // 컴포넌트 마운트 시 초기 설정
  useEffect(() => {
    console.log('GameRoom 마운트:', { roomCode, gameId });
    
    if (location.state?.gameData) {
      const gameData = location.state.gameData;
      console.log('게임 데이터 로드:', gameData);
      
      setCurrentRoomCode(gameData.roomCode);
      
      if (gameData.gameParticipants) {
        setPlayers(convertGameParticipants(gameData.gameParticipants));
      }
      
      if (gameData.currentUser) {
        console.log('🔍 currentUser 설정:', gameData.currentUser);
        setCurrentUser(gameData.currentUser);
      } else {
        console.error('❌ currentUser 정보가 없습니다!');
      }
    } else {
      console.error('❌ gameData가 없습니다!');
    }
  }, [roomCode, gameId, location.state, convertGameParticipants]);

  // WebSocket 구독 설정 (의존성 최소화)
  useEffect(() => {
    if (!gameId) return;

    const setupWebSocket = async () => {
      try {
        if (!webSocketService.isWebSocketConnected()) {
          await webSocketService.connect();
        }

        console.log('게임 토픽 구독 시작:', gameId);
        
        webSocketService.subscribeToTopic(`/topic/game/${gameId}`, (message) => {
          console.log('📨 [/topic/game] 메시지 수신:', message);
          handleGameMessage(message);
        });
        
        webSocketService.subscribeToTopic(`/user/topic/game/${gameId}`, (message) => {
          console.log('🎯 [/user/topic/game] 메시지 수신 (출제자 전용):', message);
          handleGameMessage(message);
        });
        
        webSocketService.subscribeToTopic(`/topic/game/${gameId}/chat`, (message) => {
          console.log('📨 [/topic/game/chat] 메시지 수신:', message);
          handleChatMessage(message);
        });
        
        webSocketService.subscribeToTopic('/user/queue/errors', (message) => {
          console.log('📨 [/user/queue/errors] 메시지 수신:', message);
          handleErrorMessage(message);
        });

        console.log('모든 게임 토픽 구독 완료');
        
      } catch (error) {
        console.error('WebSocket 설정 실패:', error);
      }
    };

    setupWebSocket();

    return () => {
      console.log('GameRoom 언마운트, 구독 해제');
      if (webSocketService.isWebSocketConnected()) {
        webSocketService.unsubscribeFromTopic(`/topic/game/${gameId}`);
        webSocketService.unsubscribeFromTopic(`/user/topic/game/${gameId}`);
        webSocketService.unsubscribeFromTopic(`/topic/game/${gameId}/chat`);
        webSocketService.unsubscribeFromTopic('/user/queue/errors');
      }
    };
  }, [gameId, handleGameMessage, handleChatMessage, handleErrorMessage]);

  // 실시간 타이머 업데이트
  useEffect(() => {
    console.log('⏱️ 타이머 useEffect 실행:', { 
      startTime: turnInfo.startTime, 
      endTime: turnInfo.endTime,
      hasStartTime: !!turnInfo.startTime,
      hasEndTime: !!turnInfo.endTime
    });

    if (!turnInfo.startTime || !turnInfo.endTime) {
      console.log('⏱️ 타이머 중단: startTime 또는 endTime이 없음');
      setTimePercent(100);
      setRemainingSeconds(0);
      return;
    }

    console.log('⏱️ 타이머 시작');

    const updateTimer = () => {
      const now = new Date();
      const startTime = new Date(turnInfo.startTime);
      const endTime = new Date(turnInfo.endTime);
      
      const totalDuration = endTime.getTime() - startTime.getTime();
      const elapsed = now.getTime() - startTime.getTime();
      const remaining = Math.max(0, totalDuration - elapsed);
      const percent = totalDuration > 0 ? Math.max(0, (remaining / totalDuration) * 100) : 0;
      const seconds = Math.max(0, Math.ceil(remaining / 1000));
      
      // 타이머 상태 로그 (처음 한 번만)
      if (!updateTimer.logged) {
        console.log('⏱️ 타이머 계산:', {
          totalDuration: totalDuration / 1000 + '초',
          elapsed: elapsed / 1000 + '초',
          remaining: remaining / 1000 + '초',
          percent: percent + '%',
          seconds: seconds + '초'
        });
        updateTimer.logged = true;
      }
      
      setTimePercent(percent);
      setRemainingSeconds(seconds);
      
      if (percent <= 0 && seconds <= 0) {
        console.log('⏱️ 턴 시간 종료');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);

    return () => {
      console.log('⏱️ 타이머 정리');
      clearInterval(interval);
    };
  }, [turnInfo.startTime, turnInfo.endTime]);

  return (
    <Background>
      <div className={styles.gameRoom}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <img src={logo} alt="DrawCen" />
          </div>
          <div className={styles.roomCode}>
            방번호: {currentRoomCode || roomCode || '로딩중...'}
          </div>
          {turnInfo.startTime && (
            <div className={styles.timerDisplay}>
              <span className={styles.timerLabel}>남은 시간:</span>
              <span className={styles.timerValue}>
                {Math.floor(remainingSeconds / 60)}:{(remainingSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        <div className={styles.gameContent}>
          <div className={styles.leftSection}>
            <PlayerList players={players} />
          </div>
          <div className={styles.rightSection}>
            <div className={styles.canvasSection}>
              <Canvas 
                isQuizMaster={isCurrentDrawer} 
                answer={quizWord} 
                timePercent={timePercent}
                gameId={gameId}
                turnInfo={turnInfo}
              />
            </div>
            <div className={styles.chatSection}>
              <ChatBox 
                messages={messages} 
                onSendMessage={handleSendChat}
                currentUser={currentUser}
              />
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
};

export default GameRoom;