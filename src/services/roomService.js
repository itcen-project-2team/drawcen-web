import api from "../utils/api";

// 방 생성
export const createRoom = async (memberId) => {
  try {
    const response = await api.post("/api/room", {
      memberId: memberId
    });
    console.log('방 생성 성공:', response.data);
    return response.data; // { roomCode: number, ... }
  } catch (error) {
    console.error('방 생성 실패:', error);
    throw error;
  }
};

// 방 정보 조회
export const getRoomInfo = async (roomCode) => {
  try {
    const response = await api.get(`/api/room/${roomCode}`);
    console.log('방 정보 조회 성공:', response.data);
    return response.data; // RoomInfoResponse
  } catch (error) {
    console.error('방 정보 조회 실패:', error);
    throw error;
  }
}; 