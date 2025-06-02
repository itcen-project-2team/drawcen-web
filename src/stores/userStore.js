import { create } from "zustand";

// localStorage에서 사용자 상태 불러오기
const loadUserFromStorage = () => {
  try {
    const storedUser = localStorage.getItem('drawcen_user');
    return storedUser ? JSON.parse(storedUser) : { user: null, isLoggedIn: false };
  } catch (error) {
    console.error('사용자 상태 로드 실패:', error);
    return { user: null, isLoggedIn: false };
  }
};

// localStorage에 사용자 상태 저장
const saveUserToStorage = (user, isLoggedIn) => {
  try {
    localStorage.setItem('drawcen_user', JSON.stringify({ user, isLoggedIn }));
  } catch (error) {
    console.error('사용자 상태 저장 실패:', error);
  }
};

// 초기 상태 로드
const initialState = loadUserFromStorage();

const useUserStore = create((set) => ({
  user: initialState.user, // 로그인한 유저 정보
  isLoggedIn: initialState.isLoggedIn, // 로그인 여부

  // 유저 정보 설정 (로그인 시)
  setUser: (user) => {
    set({ user, isLoggedIn: true });
    saveUserToStorage(user, true);
  },

  // 로그아웃
  logout: () => {
    set({ user: null, isLoggedIn: false });
    saveUserToStorage(null, false);
    localStorage.removeItem('drawcen_user');
  },
}));

export default useUserStore; 