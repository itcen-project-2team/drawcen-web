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
  user: initialState.user, // { id, nickname, email } 형태
  isLoggedIn: initialState.isLoggedIn, // 로그인 여부

  // 유저 정보 설정 (로그인 시)
  setUser: (userData) => {
    console.log('setUser 호출됨, 받은 데이터:', userData);
    const user = userData; // 서버에서 받은 전체 데이터 저장 (id, nickname, email)
    console.log('저장할 user 객체:', user);
    set({ user, isLoggedIn: true });
    saveUserToStorage(user, true);
    console.log('localStorage에 저장 완료');
  },

  // 로그아웃
  deleteUser: () => {
    set({ user: null, isLoggedIn: false });
    saveUserToStorage(null, false);
    localStorage.removeItem('drawcen_user');
  },
}));

export default useUserStore; 