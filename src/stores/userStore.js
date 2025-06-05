import { create } from "zustand";

// localStorage에서 사용자 상태 불러오기
const loadUserFromStorage = () => {
  try {
    const stored = localStorage.getItem('drawcen_user');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
};

// localStorage에 사용자 상태 저장
const saveUserToStorage = (user) => {
  try {
    localStorage.setItem('drawcen_user', JSON.stringify(user));
  } catch (error) {
    // 저장 실패 시 무시
  }
};

const removeUserFromStorage = () => {
  try {
    localStorage.removeItem('drawcen_user');
  } catch (error) {
    // 제거 실패 시 무시
  }
};

// 초기 상태 로드
const initialState = loadUserFromStorage();

const useUserStore = create((set, get) => ({
  user: initialState,
  isLoggedIn: !!initialState,

  // 유저 정보 설정 (로그인 시)
  setUser: (userData) => {
    const user = userData;
    saveUserToStorage(user);
    set({ user, isLoggedIn: true });
  },

  // 로그아웃
  deleteUser: () => {
    removeUserFromStorage();
    
    set({ 
      user: null, 
      isLoggedIn: false 
    });
  },

  updateUser: (updates) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, ...updates };
      saveUserToStorage(updatedUser);
      set({ user: updatedUser });
    }
  }
}));

export default useUserStore; 