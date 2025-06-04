import axios from "axios";

// 기본 axios 인스턴스 생성
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // 환경변수 
  timeout: 10000, // 10초 타임아웃
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 예: 401 에러 처리 등
    if (error.response && error.response.status === 401) {
      // 로그아웃 처리 등
    }
    return Promise.reject(error);
  }
);

export default api; 