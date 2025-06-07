import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

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
  connect() {
    return new Promise((resolve, reject) => {
      const socket = new SockJS('http://localhost:8080/ws');
      
      // JWT 토큰을 localStorage에서 가져오기
      const token = localStorage.getItem('token');
      
      this.client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          // JWT 토큰을 헤더에 포함 (사용자 인증을 위해)
          'Authorization': token ? `Bearer ${token}` : '',
        },
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: 5000,
        onConnect: (frame) => {
          console.log('WebSocket 연결 성공:', frame);
          console.log('인증 토큰 포함됨:', !!token);
          this.isConnected = true;
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

export default new WebSocketService(); 