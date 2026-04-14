import { create } from 'zustand';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

/**
 * 구글 로그인 및 사용자 인증 상태를 관리하는 스토어
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user, loading: false }),

  login: async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null });
    } catch (error) {
      console.error('Logout Error:', error);
    }
  },
}));

// 초기 인증 상태 감시자 설정 (auth 객체가 존재할 때만)
if (auth) {
  onAuthStateChanged(auth, (user) => {
    useAuthStore.getState().setUser(user);
  });
}
