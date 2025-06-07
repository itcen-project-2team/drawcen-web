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

  // 메시지 버퍼링을 위한 상태 (턴ID 기반 매칭)
  const [pendingTurnData, setPendingTurnData] = useState(new Map());
  
  // WebSocket 연결 상태 관리
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const maxRetryAttempts = 5;

  // 중복 메시지 방지를 위한 최근 메시지 추적
  const [recentMessages, setRecentMessages] = useState(new Set());

  // ref를 항상 최신 상태로 동기화
  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // 중복 메시지 확인 함수
  const isDuplicateMessage = useCallback((messageContent, messageType) => {
    const messageKey = `${messageType}:${messageContent}`;
    if (recentMessages.has(messageKey)) {
      console.log('🚫 중복 메시지 감지:', messageKey);
      return true;
    }
    
    // 최근 메시지에 추가
    setRecentMessages(prev => {
      const newSet = new Set(prev);
      newSet.add(messageKey);
      
      // 50개 이상이면 오래된 것부터 제거
      if (newSet.size > 50) {
        const oldestKey = newSet.values().next().value;
        newSet.delete(oldestKey);
      }
      
      return newSet;
    });
    
    return false;
  }, [recentMessages]);

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

  // 게임 종료 시 리소스 정리 함수 (handleGameMessage보다 먼저 정의)
  const cleanupGameResources = useCallback(() => {
    console.log('🧹 게임 리소스 정리 시작');
    
    try {
      // 상태 초기화
      setPendingTurnData(new Map());
      setTimePercent(100);
      setRemainingSeconds(0);
      setIsCurrentDrawer(false);
      setQuizWord("");
      
      console.log('✅ 게임 리소스 정리 완료');
      
    } catch (error) {
      console.error('❌ 게임 리소스 정리 중 오류:', error);
    }
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
          
          // 출제자 닉네임 찾기
          const drawerPlayer = playersRef.current.find(player => player.id === drawerId);
          const drawerName = drawerPlayer ? drawerPlayer.nickname : `참가자 ${drawerId}`;
          
          setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'system',
            message: `🎨 새로운 턴이 시작되었습니다! 출제자: ${drawerName}`,
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
            message: `출제 단어: "${quizWord}"`,
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

          // 정답 메시지인지 확인 (CORRECT 타입으로 따로 처리되므로 CHAT에서는 무시)
          const correctMessagePattern = /님이 정답을 맞추셨습니다|정답입니다|맞추셨습니다/;
          if (correctMessagePattern.test(data)) {
            console.log('💡 정답 메시지는 CORRECT 타입으로 별도 처리되므로 CHAT에서 무시');
            return;
          }

          // 중복 메시지 확인
          if (isDuplicateMessage(data, 'chat')) {
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
          // const correctMessage = `🎉 ${playerName}님이 정답을 맞추셨습니다!`;
          

          // setMessages(prev => [...prev, {
          //   id: Date.now(),
          //   type: 'correct',
          //   // message: correctMessage,
          //   timestamp: new Date(),
          //   memberId
          // }]);
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

          console.log('⏰ 턴 종료 처리 시작');

          // 점수 업데이트
          setPlayers(prev => prev.map(player => {
            const memberScore = finishMembers.find(m => m.memberId === player.id);
            if (memberScore) {
              return { ...player, score: memberScore.score };
            }
            return player;
          }));
          
          // 턴 관련 상태 초기화
          setPlayers(prev => prev.map(player => ({ ...player, isDrawing: false })));
          setIsCurrentDrawer(false);
          setQuizWord("");
          setTimePercent(100);
          setRemainingSeconds(0);
          
          // 펜딩 턴 데이터 정리
          setPendingTurnData(new Map());
          
          setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'system',
            message: '⏰ 턴이 종료되었습니다. 점수가 업데이트되었습니다.',
            timestamp: new Date()
          }]);
          
          console.log('✅ 턴 종료 처리 완료');
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

          console.log('🏁 게임 종료 처리 시작');

          // 점수 업데이트
          setPlayers(prev => prev.map(player => {
            const memberScore = gameFinishMembers.find(m => m.memberId === player.id);
            if (memberScore) {
              return { ...player, score: memberScore.score };
            }
            return player;
          }));
          
          // 우승자 계산
          const sortedPlayers = gameFinishMembers.sort((a, b) => b.score - a.score);
          const winner = sortedPlayers[0];
          const winnerPlayer = playersRef.current.find(p => p.id === winner?.memberId);
          const winnerName = winnerPlayer ? winnerPlayer.nickname : `참가자 ${winner?.memberId}`;
          
          // 게임 종료 메시지 추가
          setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'system',
            message: `🎊 게임이 종료되었습니다! 🏆 우승자: ${winnerName}님 (${winner?.score}점)`,
            timestamp: new Date()
          }]);
          
          console.log('🏆 우승자:', winnerName, '점수:', winner?.score);
          
          // 3초 후 정리 및 메인 페이지 이동
          setTimeout(async () => {
            console.log('🔄 메인 페이지 이동 준비');
            
            // WebSocket 연결 해제
            try {
              if (webSocketService.isWebSocketConnected()) {
                console.log('🔌 게임 종료 - WebSocket 연결 해제 시작');
                webSocketService.unsubscribeFromTopic(`/topic/game/${gameId}`);
                webSocketService.unsubscribeFromTopic(`/user/topic/game/${gameId}`);
                webSocketService.unsubscribeFromTopic(`/topic/game/${gameId}/chat`);
                webSocketService.unsubscribeFromTopic('/user/queue/errors');
                webSocketService.disconnect();
                console.log('✅ 게임 종료 - WebSocket 연결 해제 완료');
              }
              setIsWebSocketConnected(false);
              setConnectionAttempts(0);
            } catch (error) {
              console.error('❌ WebSocket 연결 해제 중 오류:', error);
            }
            
            // 게임 상태 정리
            cleanupGameResources();
            
            // 메인 페이지로 이동
            console.log('🏠 메인 페이지로 이동');
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
        // 서버로부터 닉네임 정보를 받거나, 현재 사용자의 닉네임 사용
        const nickname = message.nickname || currentUserRef.current?.nickname || currentUserRef.current?.id || '익명';
        
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'chat',
          message: message.data,
          nickname: nickname,
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

  // WebSocket 연결 함수 (useEffect보다 먼저 정의)
  const stompConnect = useCallback(async () => {
    if (!gameId) return;
    
    try {
      console.log('🔌 WebSocket 연결 시작');
      
      // WebSocket 연결
      await webSocketService.connect();
      setIsWebSocketConnected(true);
      setConnectionAttempts(0);
      
      console.log('✅ WebSocket 연결 성공');

      // 게임 관련 토픽 구독
      webSocketService.subscribeToTopic(`/topic/game/${gameId}`, (message) => {
        console.log('📨 [/topic/game] 메시지 수신:', message);
        handleGameMessage(message);
      });
      
      webSocketService.subscribeToTopic(`/user/topic/game/${gameId}`, (message) => {
        console.log('🎯 [/user/topic/game] 메시지 수신 (출제자 전용):', message);
        handleGameMessage(message);
      });
      
      webSocketService.subscribeToTopic(`/topic/game/${gameId}/chat`, (message) => {
        console.log('💬 [/topic/game/chat] 메시지 수신:', message);
        handleChatMessage(message);
      });
      
      webSocketService.subscribeToTopic('/user/queue/errors', (message) => {
        console.log('🚨 [/user/queue/errors] 메시지 수신:', message);
        handleErrorMessage(message);
      });

      console.log('✅ 모든 게임 토픽 구독 완료');
      
    } catch (error) {
      console.error('❌ WebSocket 연결 실패:', error);
      setIsWebSocketConnected(false);
      
      // 재연결 시도
      if (connectionAttempts < maxRetryAttempts) {
        setConnectionAttempts(prev => prev + 1);
        const retryDelay = Math.min(1000 * Math.pow(2, connectionAttempts), 10000);
        console.log(`🔄 ${retryDelay}ms 후 재연결 시도...`);
        
        setTimeout(() => {
          stompConnect();
        }, retryDelay);
      } else {
        console.error('❌ 최대 재연결 시도 횟수 초과');
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'error',
          message: '🚨 서버와의 연결이 끊어졌습니다. 페이지를 새로고침해주세요.',
          timestamp: new Date()
        }]);
      }
    }
  }, [gameId, connectionAttempts, maxRetryAttempts, handleGameMessage, handleChatMessage, handleErrorMessage]);

  // WebSocket 연결 해제 함수 (useEffect보다 먼저 정의)
  const stompDisconnect = useCallback(async () => {
    try {
      console.log('🔌 WebSocket 연결 해제 시작');
      
      if (webSocketService.isWebSocketConnected()) {
        // 구독 해제
        webSocketService.unsubscribeFromTopic(`/topic/game/${gameId}`);
        webSocketService.unsubscribeFromTopic(`/user/topic/game/${gameId}`);
        webSocketService.unsubscribeFromTopic(`/topic/game/${gameId}/chat`);
        webSocketService.unsubscribeFromTopic('/user/queue/errors');
        
        // 연결 해제
        webSocketService.disconnect();
        console.log('✅ WebSocket 연결 해제 완료');
      }
      
      setIsWebSocketConnected(false);
      setConnectionAttempts(0);
      
    } catch (error) {
      console.error('❌ WebSocket 연결 해제 중 오류:', error);
    }
  }, [gameId]);

  // WebSocket 연결 관리 (단순화된 버전)
  useEffect(() => {
    if (!gameId) return;
    
    console.log('🎮 GameRoom 마운트 - WebSocket 연결 시작');
    stompConnect();
    
    // 브라우저 종료/페이지 이탈 시 WebSocket 정리
    const handleBeforeUnload = (event) => {
      console.log('🚪 페이지 이탈 감지 - WebSocket 정리');
      try {
        if (webSocketService.isWebSocketConnected()) {
          // 동기적으로 빠르게 정리 (브라우저가 페이지를 닫기 전)
          webSocketService.unsubscribeFromTopic(`/topic/game/${gameId}`);
          webSocketService.unsubscribeFromTopic(`/user/topic/game/${gameId}`);
          webSocketService.unsubscribeFromTopic(`/topic/game/${gameId}/chat`);
          webSocketService.unsubscribeFromTopic('/user/queue/errors');
          webSocketService.disconnect();
          console.log('✅ 페이지 이탈 시 WebSocket 정리 완료');
        }
      } catch (error) {
        console.error('❌ 페이지 이탈 시 정리 중 오류:', error);
      }
    };

    // 페이지 가시성 변경 시 처리 (탭 변경, 최소화 등)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('📱 페이지가 숨겨짐 (탭 변경/최소화)');
        // 필요시 연결 상태 확인 로직 추가
      } else {
        console.log('👁️ 페이지가 다시 보임');
        // 연결 상태 확인 및 재연결 로직
        if (!webSocketService.isWebSocketConnected()) {
          console.log('🔄 연결이 끊어져 있어 재연결 시도');
          stompConnect();
        }
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      console.log('🧹 GameRoom 언마운트 - WebSocket 정리');
      
      // 이벤트 리스너 제거
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // WebSocket 정리
      stompDisconnect();
      cleanupGameResources();
    };
  }, [gameId, stompConnect, stompDisconnect, cleanupGameResources]);

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
          <div className={styles.connectionStatus}>
            <span className={`${styles.statusIndicator} ${isWebSocketConnected ? styles.connected : styles.disconnected}`}>
              {isWebSocketConnected ? '🟢 연결됨' : '🔴 연결끊김'}
            </span>
            {!isWebSocketConnected && connectionAttempts > 0 && (
              <span className={styles.retryInfo}>
                재연결 시도: {connectionAttempts}/{maxRetryAttempts}
              </span>
            )}
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