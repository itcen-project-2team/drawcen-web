// 기본적인 웹소켓 서비스 예시

let socket = null;

// 웹소켓 서버 주소 (환경변수 또는 기본값)
const WS_URL = process.env.REACT_APP_WS_URL || "ws://localhost:4000/ws";

// 웹소켓 연결
export function connectSocket() {
  if (!socket || socket.readyState !== 1) {
    socket = new WebSocket(WS_URL);
  }
  return socket;
}

// 웹소켓 연결 해제
export function disconnectSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}

// 메시지 전송
export function sendMessage(message) {
  if (socket && socket.readyState === 1) {
    socket.send(JSON.stringify(message));
  }
}

// 메시지 수신 리스너 등록
export function addMessageListener(callback) {
  if (!socket) return;
  socket.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data);
      callback(data);
    } catch (e) {
      callback(event.data);
    }
  });
}

// 에러/닫힘 등 기타 이벤트 리스너도 필요시 추가 가능 