import { create } from 'zustand';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { useHistoryStore } from './useHistoryStore';
import { useAIStore } from './useAIStore';
import { useCustomFoodStore } from './useCustomFoodStore';
import { useUserStore } from './useUserStore';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

/**
 * 모든 스토어의 상태를 초기화하는 유틸리티 함수
 */
const clearAllStores = () => {
  useHistoryStore.getState().clearLogs();
  useAIStore.getState().resetAIState();
  useCustomFoodStore.getState().clearCustomFoods();
  useUserStore.getState().resetSettings();
};

/**
 * 구글 로그인 및 사용자 인증 상태를 관리하는 스토어
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => {
    set({ user, loading: false });
    // 사용자가 로그아웃 상태(null)가 되면 모든 스토어 초기화
    if (!user) {
      clearAllStores();
    }
  },

  login: async () => {
    if (!auth || !googleProvider) throw new Error('Firebase가 초기화되지 않았습니다.');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'auth/popup-closed-by-user') return;

      let userMessage = '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
      if (firebaseError.code === 'auth/requests-from-referer-are-blocked') {
        userMessage = '이 도메인은 로그인이 허용되지 않습니다. 관리자에게 문의해 주세요.';
      } else if (firebaseError.code === 'auth/network-request-failed') {
        userMessage = '네트워크 연결을 확인해 주세요.';
      }

      throw new Error(userMessage);
    }
  },

  logout: async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      set({ user: null });
      clearAllStores(); // 로그아웃 시 명시적으로 한 번 더 호출
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
