import api from "../utils/api";
import handleApiError from "../utils/handleApiError";

// 로그인 상태 체크
export const checkLogIn = async () => {
  try {
    console.log('checkLogIn 요청 시작');
    console.log('API baseURL:', process.env.REACT_APP_API_URL);
    console.log('요청 URL:', `${process.env.REACT_APP_API_URL}/api/member`);
    const response = await api.get("/api/member");
    console.log('checkLogIn 성공:', response.data);
    return response.data;
  } catch (error) {
    // 401 등의 에러는 로그인하지 않은 상태로 간주 (조용히 처리)
    console.log('로그인 상태 아님:', error.response?.status);
    console.log('에러 상세:', error.response?.data);
    console.log('CORS 에러인지 확인:', error.message);
    console.log('전체 에러:', error);
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
    const response = await api.get("/api/auth/logout");
    return response.data;
  } catch (error) {
    console.error('로그아웃 요청 실패:', error);
    // 로그아웃은 실패해도 클라이언트 상태는 초기화해야 함
    return null;
  }
};