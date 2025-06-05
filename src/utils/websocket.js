import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.client = null;
    this.roomSubscription = null;
    this.errorSubscription = null;
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
  connect() {
    return new Promise((resolve, reject) => {
      const socket = new SockJS('http://localhost:8080/ws');
      this.client = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: 5000,
        onConnect: (frame) => {
          console.log('WebSocket 연결 성공:', frame);
          this.isConnected = true;
          
          // 에러 구독
          this.errorSubscription = this.client.subscribe('/user/queue/errors', (message) => {
            console.error('WebSocket 에러:', message.body);
            
            try {
              const errorData = JSON.parse(message.body);
              
              // 중복 참여 에러는 무시 (방 생성 후 자동 참여 시 발생 가능)
              if (errorData.message && errorData.message.includes('이미 참여중인 방')) {
                console.log('중복 참여 에러 무시:', errorData.message);
                return;
              }
              
              // 방 관련 에러는 콜백으로 알림
              if (errorData.message) {
                if (this.onErrorCallback) {
                  this.onErrorCallback(errorData.message);
                } else {
                  alert(`에러: ${errorData.message}`);
                }
              }
            } catch (parseError) {
              // JSON 파싱 실패 시 원본 메시지 표시
              console.error('에러 메시지 파싱 실패:', parseError);
              const errorMsg = message.body;
              if (this.onErrorCallback) {
                this.onErrorCallback(errorMsg);
              } else {
                alert(`에러: ${errorMsg}`);
              }
            }
          });
          
          resolve();
        },
        onStompError: (frame) => {
          console.error('WebSocket 연결 실패:', frame);
          this.isConnected = false;
          reject(frame);
        },
        onDisconnect: () => {
          console.log('WebSocket 연결 해제');
          this.isConnected = false;
        }
      });

      this.client.activate();
    });
  }

  // WebSocket 연결 해제
  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.isConnected = false;
      this.currentRoomCode = null;
      this.currentGameId = null;
    }
  }

  // 방 구독
  subscribeToRoom(roomCode, callback) {
    if (!this.client || !this.isConnected) {
      console.error('WebSocket이 연결되지 않았습니다.');
      return;
    }

    this.currentRoomCode = roomCode;
    
    if (this.roomSubscription) {
      this.roomSubscription.unsubscribe();
    }

    this.roomSubscription = this.client.subscribe(`/topic/room/${roomCode}`, (message) => {
      console.log('방 정보 수신:', message.body);
      const payload = JSON.parse(message.body);
      
      if (payload.type === 'GAME_STARTED') {
        this.currentGameId = payload.gameId;
        // 게임 관련 구독 추가
        this.subscribeToGame(payload.gameId);
      }
      
      if (callback) {
        callback(payload);
      }
    });
  }

  // 게임 구독
  subscribeToGame(gameId) {
    if (!this.client || !this.isConnected) return;

    // 게임 턴 메시지 구독
    this.client.subscribe(`/topic/game/${gameId}`, (message) => {
      console.log('게임 턴 메시지:', message.body);
    });

    // 개인 게임 메시지 구독
    this.client.subscribe(`/user/topic/game/${gameId}`, (message) => {
      console.log('개인 게임 메시지:', message.body);
    });

    // 채팅 메시지 구독
    this.client.subscribe(`/topic/game/${gameId}/chat`, (message) => {
      console.log('채팅 메시지:', message.body);
    });
  }

  // 방 참여
  joinRoom(roomCode) {
    if (!this.client || !this.isConnected) {
      console.error('WebSocket이 연결되지 않았습니다.');
      return;
    }

    this.client.publish({
      destination: '/app/room/join',
      body: JSON.stringify({ roomCode: parseInt(roomCode) })
    });
    console.log('방 참여 요청 전송:', roomCode);
  }

  // 방 나가기
  leaveRoom() {
    if (!this.client || !this.isConnected) {
      console.error('WebSocket이 연결되지 않았습니다.');
      return;
    }

    this.client.publish({
      destination: '/app/room/leave',
      body: JSON.stringify({})
    });
    console.log('방 나가기 요청 전송');

    if (this.roomSubscription) {
      this.roomSubscription.unsubscribe();
      this.roomSubscription = null;
    }
    this.currentRoomCode = null;
  }

  // 게임 시작
  startGame(roomCode) {
    if (!this.client || !this.isConnected) {
      console.error('WebSocket이 연결되지 않았습니다.');
      return;
    }

    this.client.publish({
      destination: '/app/game/start',
      body: JSON.stringify({ roomCode: parseInt(roomCode) })
    });
    console.log('게임 시작 요청 전송:', roomCode);
  }

  // 채팅 전송
  sendChat(gameId, message) {
    if (!this.client || !this.isConnected || !gameId) {
      console.error('채팅을 전송할 수 없습니다.');
      return;
    }

    this.client.publish({
      destination: `/app/game/${gameId}/chat`,
      body: message
    });
    console.log('채팅 전송:', message);
  }
}

export default new WebSocketService(); 