import axios from "axios";
import useUserStore from "../stores/userStore";

// 재발급 요청 중인지 확인하는 플래그
let isRefreshing = false;
// 재발급 중에 대기하는 요청들을 저장할 배열
let failedQueue = [];

// 대기 중인 요청들을 처리하는 함수
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// 완전한 로그아웃 처리 함수
const performCompleteLogout = async () => {
  try {
    // 1. localStorage 정리
    try {
      localStorage.removeItem('drawcen_user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } catch (e) {
      console.warn('localStorage 정리 실패:', e);
    }

    // 2. Zustand 스토어 초기화
    try {
      useUserStore.getState().deleteUser();
    } catch (e) {
      console.warn('Zustand 스토어 정리 실패:', e);
    }

    // 3. 서버 로그아웃 API 호출 (쿠키 정리) - 실패해도 무시
    try {
      await api.delete('/api/auth/logout');
      console.log('서버 로그아웃 성공');
    } catch (e) {
      console.warn('서버 로그아웃 실패 (무시):', e.message);
    }

    // 4. 랜딩페이지로 리다이렉트
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  } catch (error) {
    console.error('완전한 로그아웃 처리 중 오류:', error);
    // 최소한 리다이렉트는 수행
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  }
};

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
  async (error) => {
    const originalRequest = error.config;
    
    // 40101 에러 (ACCESS_TOKEN_EXPIRED) 처리
    if (error.response?.status === 401 && 
        error.response?.data?.code === 40101 &&
        !originalRequest.url?.includes('/api/auth/logout')) {
      
      if (isRefreshing) {
        // 이미 재발급 요청 중이면 대기
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          // 재발급 완료 후 원래 요청 재시도
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;

      try {
        console.log('토큰 재발급 시도 중...');
        
        // 토큰 재발급 요청
        await api.post('/api/auth/oauth2/refresh');
        
        console.log('토큰 재발급 성공');
        
        // 대기 중인 요청들 처리
        processQueue(null);
        isRefreshing = false;
        
        // 원래 요청 재시도
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('토큰 재발급 실패:', refreshError);
        
        // 대기 중인 요청들 에러 처리
        processQueue(refreshError);
        isRefreshing = false;
        
        // 재발급 실패 시 완전한 로그아웃 처리
        await performCompleteLogout();
        return Promise.reject(refreshError);
      }
    }

    // 40101을 제외한 401 에러는 완전한 로그아웃 처리
    if (error.response?.status === 401) {
      console.warn('401 인증 에러 발생:', originalRequest.url);
      await performCompleteLogout();
    }
    
    return Promise.reject(error);
  }
);

export default api; 