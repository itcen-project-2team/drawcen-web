import axios from "axios";

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
        error.response?.data?.code === 40101) {
      
      // 재시도 횟수 초기화 및 증가
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      // 2번 초과 재시도 시 로그아웃 처리
      if (originalRequest._retryCount > 2) {
        // localStorage 정리
        try {
          localStorage.removeItem('drawcen_user');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        } catch (e) {
          // localStorage 정리 실패 시 무시
        }
        
        // 랜딩페이지로 리다이렉트
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
        
        return Promise.reject(error);
      }
      
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
        // 토큰 재발급 요청
        await api.post('/api/auth/oauth2/refresh');
        
        // 대기 중인 요청들 처리
        processQueue(null);
        isRefreshing = false;
        
        // 원래 요청 재시도
        return api(originalRequest);
        
      } catch (refreshError) {
        // 대기 중인 요청들 에러 처리
        processQueue(refreshError);
        isRefreshing = false;
        
        // 재발급 실패 시 로그아웃 처리
        // localStorage 정리
        try {
          localStorage.removeItem('drawcen_user');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        } catch (e) {
          // localStorage 정리 실패 시 무시
        }
        
        // 랜딩페이지로 리다이렉트 (현재 페이지가 랜딩페이지가 아닌 경우에만)
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // 다른 401 에러나 기타 에러는 그대로 전달
    if (error.response?.status === 401) {
      // localStorage 정리
      try {
        localStorage.removeItem('drawcen_user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      } catch (e) {
        // localStorage 정리 실패 시 무시
      }
      
      // 랜딩페이지로 리다이렉트 (현재 페이지가 랜딩페이지가 아닌 경우에만)
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 