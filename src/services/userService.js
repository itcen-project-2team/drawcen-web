import api from "../utils/api";
import handleApiError from "../utils/handleApiError";

// 로그인 상태 체크
export const checkLogIn = async () => {
  try {
    const response = await api.get("/api/member");
    return response.data;
  } catch (error) {
    // 401 등의 에러는 로그인하지 않은 상태로 간주 (조용히 처리)
    return null;
  }
};

// 현재 참여 중인 방 정보 조회
export const getCurrentRoom = async () => {
  try {
    console.log('현재 방 정보 조회 시작');
    const response = await api.get("/api/member/current-room");
    console.log('현재 방 정보 조회 성공:', response.data);
    return response.data; // { roomCode: number, participants: [...] } 또는 null
  } catch (error) {
    // 404는 참여 중인 방이 없음을 의미할 수 있음
    if (error.response?.status === 404) {
      console.log('참여 중인 방 없음');
      return null;
    }
    console.error('현재 방 정보 조회 실패:', error);
    
    // API가 없는 경우 대안: member 정보에서 현재 방 정보 추출 시도
    try {
      console.log('대안: member 정보에서 현재 방 정보 확인');
      const memberResponse = await api.get("/api/member");
      if (memberResponse.data && memberResponse.data.currentRoom) {
        console.log('member 정보에서 현재 방 정보 발견:', memberResponse.data.currentRoom);
        return memberResponse.data.currentRoom;
      }
    } catch (fallbackError) {
      console.log('member 정보에서도 현재 방 정보 없음');
    }
    
    return null;
  }
};

// 사용자 정보 가져오기 예시
export const getUser = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// 사용자 정보 수정 예시
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// 회원가입 예시
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/users/register", userData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// 카카오 OAuth 로그인
export const kakaoLogin = () => {
  // 환경변수에서 baseURL을 가져와서 사용
  const baseURL = process.env.REACT_APP_API_URL || '';
  window.location.href = `${baseURL}/oauth2/authorization/kakao`;
};

// 로그아웃
export const logout = async () => {
  try {
    const response = await api.delete("/api/auth/logout");
    return response.data;
  } catch (error) {
    // 로그아웃은 실패해도 클라이언트 상태는 초기화해야 함
    return null;
  }
};