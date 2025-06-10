import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

// 환경변수에서 API URL 가져오기
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map(); // 구독 관리
    this.currentRoomCode = null;
    this.currentGameId = null;
    this.isConnected = false;
    this.onErrorCallback = null;
  }

  // 에러 콜백 설정
  setErrorCallback(callback) {
    this.onErrorCallback = callback;
  }

  // WebSocket 연결
  connect({ retryOnAuthError = true } = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('🔌 WebSocket 연결 시작', { retryOnAuthError });
        
        // ✅ WebSocket 연결 전 토큰 상태 사전 검증
        if (retryOnAuthError) {
          try {
            await validateTokenBeforeWebSocket();
          } catch (tokenError) {
            console.error('❌ 사전 토큰 검증 실패');
            if (this.onErrorCallback) {
              this.onErrorCallback('로그인이 만료되었습니다. 다시 로그인해주세요.');
            }
            reject(tokenError);
            return;
          }
        }
        
        let isResolved = false;
        const socket = new SockJS(`${API_BASE_URL}/ws`);
        
        // 연결 타임아웃 설정 (10초)
        const connectionTimeout = setTimeout(() => {
          if (!isResolved) {
            console.warn('⏰ WebSocket 연결 타임아웃 (10초)');
            isResolved = true;
            if (this.onErrorCallback) this.onErrorCallback('WebSocket 연결 타임아웃');
            reject(new Error('WebSocket 연결 타임아웃'));
          }
        }, 10000);

        // ✅ SockJS 이벤트 핸드셰이크 설정
        socket.onopen = () => {
          console.log('✅ SockJS HTTP 핸드셰이크 성공');
        };

        socket.onerror = async (error) => {
          console.error('❌ SockJS 에러:', error);
          clearTimeout(connectionTimeout);
          if (!isResolved) {
            isResolved = true;
            if (this.onErrorCallback) this.onErrorCallback('WebSocket 연결 실패');
            reject(error);
          }
        };

        socket.onclose = (event) => {
          console.log('🔌 SockJS 연결 종료:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
          });
          clearTimeout(connectionTimeout);
        };
      
        this.client = new Client({
          webSocketFactory: () => socket,
          debug: (str) => {
            console.log('STOMP Debug:', str);
          },
          reconnectDelay: 0,
          onConnect: (frame) => {
            console.log('✅ WebSocket 연결 성공:', frame);
            clearTimeout(connectionTimeout);
            if (!isResolved) {
              isResolved = true;
              this.isConnected = true;
              resolve();
            }
          },
          onStompError: async (frame) => {
            console.error('❌ WebSocket 연결 실패(onStompError):', frame);
            clearTimeout(connectionTimeout);
            this.isConnected = false;

            if (!isResolved) {
              isResolved = true;
              if (this.onErrorCallback) this.onErrorCallback('WebSocket 연결 실패');
              reject(frame);
            }
          },
          onWebSocketError: async (error) => {
            console.error('❌ 웹소켓 자체 에러(onWebSocketError):', error);
            clearTimeout(connectionTimeout);
          },
          onDisconnect: () => {
            console.log('🔌 WebSocket 연결 해제');
            this.isConnected = false;
          }
        });

        this.client.activate();

      } catch (outerError) {
        console.error('❌ WebSocket 연결 중 예외:', outerError);
        if (this.onErrorCallback) this.onErrorCallback('WebSocket 연결 실패');
        reject(outerError);
      }
    });
  }

  // WebSocket 연결 해제
  disconnect() {
    if (this.client) {
      // 모든 구독 해제
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      
      this.client.deactivate();
      this.isConnected = false;
      this.currentRoomCode = null;
      this.currentGameId = null;
    }
  }

  // 토픽 구독 (범용)
  subscribeToTopic(topic, callback) {
    if (!this.client || !this.isConnected) {
      console.error('WebSocket이 연결되지 않았습니다.');
      return null;
    }

    // 기존 구독이 있으면 해제
    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic).unsubscribe();
    }

    const subscription = this.client.subscribe(topic, (message) => {
      try {
        const payload = JSON.parse(message.body);
        console.log(`${topic} 메시지 수신:`, payload);
        
        if (callback) {
          callback(payload);
        }
      } catch (error) {
        console.error(`${topic} 메시지 파싱 오류:`, error);
        // 원시 메시지로 콜백 호출
        if (callback) {
          callback(message.body);
        }
      }
    });

    this.subscriptions.set(topic, subscription);
    console.log(`토픽 구독: ${topic}`);
    return subscription;
  }

  // 토픽 구독 해제
  unsubscribeFromTopic(topic) {
    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic).unsubscribe();
      this.subscriptions.delete(topic);
      console.log(`토픽 구독 해제: ${topic}`);
    }
  }

  // 방 구독
  subscribeToRoom(roomCode, callback) {
    this.currentRoomCode = roomCode;
    return this.subscribeToTopic(`/topic/room/${roomCode}`, callback);
  }

  // 메시지 전송 (범용)
  sendMessage(destination, body) {
    if (!this.client || !this.isConnected) {
      console.error('WebSocket이 연결되지 않았습니다.');
      return false;
    }

    try {
      const messageBody = typeof body === 'string' ? body : JSON.stringify(body);
      
      this.client.publish({
        destination: destination,
        body: messageBody
      });
      
      console.log(`메시지 전송 [${destination}]:`, body);
      return true;
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      return false;
    }
  }

  // 방 참여
  joinRoom(roomCode) {
    return this.sendMessage('/app/room/join', { 
      roomCode: parseInt(roomCode) 
    });
  }

  // 방 나가기
  leaveRoom() {
    const success = this.sendMessage('/app/room/leave', {});
    
    if (success) {
      // 방 관련 구독 해제
      if (this.currentRoomCode) {
        this.unsubscribeFromTopic(`/topic/room/${this.currentRoomCode}`);
        this.currentRoomCode = null;
      }
    }
    
    return success;
  }

  // 게임 시작
  startGame(roomCode) {
    return this.sendMessage('/app/game/start', { 
      roomCode: parseInt(roomCode) 
    });
  }

  // 채팅 전송
  sendChat(gameId, message) {
    if (!gameId) {
      console.error('gameId가 필요합니다.');
      return false;
    }
    
    return this.sendMessage(`/app/game/${gameId}/chat`, message);
  }

  // 그림 데이터 전송
  sendDraw(gameId, drawData) {
    console.log('🔗 WebSocket sendDraw 호출:', { gameId, drawData });

    if (!gameId) {
      console.error('❌ sendDraw: gameId가 필요합니다.');
      return false;
    }
    
    if (!this.client || !this.isConnected) {
      console.error('❌ sendDraw: WebSocket이 연결되지 않았습니다.', {
        hasClient: !!this.client,
        isConnected: this.isConnected
      });
      return false;
    }

    if (!drawData.turnId) {
      console.error('❌ sendDraw: turnId가 필요합니다.', drawData);
      return false;
    }

    // 지우기나 되돌리기 명령이 아닌 경우 points 체크
    if (drawData.color !== "CLEAR_CANVAS" && drawData.color !== "UNDO_CANVAS" && (!drawData.points || drawData.points.length === 0)) {
      console.error('❌ sendDraw: 그림 데이터가 유효하지 않습니다:', drawData);
      return false;
    }
    
    const destination = `/app/game/${gameId}/draw`;
    console.log('📤 그림 데이터 전송:', { destination, drawData });
    
    const result = this.sendMessage(destination, drawData);
    console.log('📤 sendDraw 결과:', result ? '✅ 성공' : '❌ 실패');
    
    return result;
  }

  // 현재 연결 상태 확인 *** 이 메서드가 누락되어 있었습니다! ***
  isWebSocketConnected() {
    return this.isConnected && this.client && this.client.connected;
  }

  // 활성 구독 목록 조회
  getActiveSubscriptions() {
    return Array.from(this.subscriptions.keys());
  }

  // 게임 관련 구독만 정리하는 메서드
  cleanupGameSubscriptions() {
    console.log('🧹 게임 관련 구독 정리 시작');
    
    const gameTopics = [];
    this.subscriptions.forEach((subscription, topic) => {
      if (topic.includes('/topic/game/') || 
          topic.includes('/user/topic/game/') || 
          topic.includes('/user/queue/errors')) {
        gameTopics.push(topic);
      }
    });
    
    gameTopics.forEach(topic => {
      this.unsubscribeFromTopic(topic);
      console.log(`🗑️ 게임 구독 해제: ${topic}`);
    });
    
    this.currentGameId = null;
    console.log('✅ 게임 관련 구독 정리 완료');
  }

  // 방 관련 구독만 정리하는 메서드  
  cleanupRoomSubscriptions() {
    console.log('🧹 방 관련 구독 정리 시작');
    
    const roomTopics = [];
    this.subscriptions.forEach((subscription, topic) => {
      if (topic.includes('/topic/room/')) {
        roomTopics.push(topic);
      }
    });
    
    roomTopics.forEach(topic => {
      this.unsubscribeFromTopic(topic);
      console.log(`🗑️ 방 구독 해제: ${topic}`);
    });
    
    this.currentRoomCode = null;
    console.log('✅ 방 관련 구독 정리 완료');
  }

  // 레거시 메서드들 (하위 호환성)
  subscribeToGame(gameId) {
    console.warn('subscribeToGame은 deprecated입니다. subscribeToTopic을 사용하세요.');
    // 기본적인 게임 구독만 처리
    this.subscribeToTopic(`/topic/game/${gameId}`, (message) => {
      console.log('게임 메시지 (레거시):', message);
    });
  }
}

// 토큰 재발급 함수 (refresh token은 HttpOnly 쿠키에 있음)
async function refreshAccessToken() {
  console.log('🔄 토큰 재발급 요청 시작');
  
  // refresh token은 쿠키로 자동 전송됨
  const response = await fetch(`${API_BASE_URL}/api/auth/oauth2/refresh`, {
    method: 'POST',
    credentials: 'include', // 꼭 필요!
  });
  
  console.log('🔄 토큰 재발급 응답:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ 토큰 재발급 실패 응답:', errorText);
    throw new Error(`토큰 재발급 실패: ${response.status} ${errorText}`);
  }
  
  console.log('✅ 토큰 재발급 성공');
  
  // 서버가 빈 응답 본문을 보내므로 JSON 파싱하지 않음
  return { success: true };
}

// 토큰 상태 사전 검증 함수
async function validateTokenBeforeWebSocket() {
  console.log('🔍 WebSocket 연결 전 토큰 상태 검증 시작');
  
  try {
    // 인증이 필요한 API 호출로 토큰 상태 확인
    const response = await fetch(`${API_BASE_URL}/api/member`, {
      method: 'GET',
      credentials: 'include',
    });
    
    console.log('🔍 토큰 검증 응답:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (response.ok) {
      console.log('✅ 토큰 상태 정상 - WebSocket 연결 진행');
      return true;
    }
    
    // 401 에러인 경우 토큰 재발급 시도
    if (response.status === 401) {
      console.warn('⚠️ 토큰 만료 감지 - 재발급 시도');
      const responseText = await response.text();
      
      try {
        const errorData = JSON.parse(responseText);
        if (errorData?.code === 40101) {
          console.log('🎯 40101 토큰 만료 확인');
        }
      } catch (e) {
        // JSON 파싱 실패 시 무시
      }
      
      // 토큰 재발급 시도
      await refreshAccessToken();
      console.log('✅ 토큰 재발급 완료 - WebSocket 연결 진행');
      return true;
    }
    
    throw new Error(`토큰 검증 실패: ${response.status}`);
    
  } catch (error) {
    console.error('❌ 토큰 검증 중 오류:', error);
    throw error;
  }
}

export default new WebSocketService(); 