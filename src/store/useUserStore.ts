import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSettings } from '../types';

interface UserState {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

/**
 * 사용자 설정을 관리하는 전역 스토어
 */
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      settings: {
        icr: 10,
        isf: 50,
        targetBG: 120,
        dia: 4,
        warningThreshold: 10,
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      resetSettings: () => set({
        settings: {
          icr: 10,
          isf: 50,
          targetBG: 120,
          dia: 4,
          warningThreshold: 10,
        }
      }),
    }),
    {
      name: 'user-settings-storage', // localStorage 저장 시 사용할 키 이름
    }
  )
);
