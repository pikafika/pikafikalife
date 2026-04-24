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
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login Error:', error);
      
      // 사용자에게 더 친절한 피드백 제공
      if (error.code === 'auth/requests-from-referer-are-blocked') {
        alert('현재 도메인(localhost 등)이 Firebase 콘솔의 "승인된 도메인"에 등록되지 않았습니다. Firebase 콘솔 > Authentication > Settings에서 도메인을 추가해 주세요.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        // 사용자가 창을 닫은 경우는 별도 처리 불필요
      } else {
        alert(`로그인 중 오류가 발생했습니다: ${error.message}`);
      }
      
      throw error;
    }
  },

  logout: async () => {
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
