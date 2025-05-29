import { create } from "zustand";

const useUserStore = create((set) => ({
  user: null, // 로그인한 유저 정보
  isLoggedIn: false, // 로그인 여부

  // 유저 정보 설정 (로그인 시)
  setUser: (user) => set({ user, isLoggedIn: true }),

  // 로그아웃
  logout: () => set({ user: null, isLoggedIn: false }),
}));

export default useUserStore; 