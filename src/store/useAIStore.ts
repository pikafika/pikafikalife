import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { InsightStory } from '../data/insights_db';

interface AIState {
  insights: InsightStory[];
  coachingHistory: string[];
  lastUpdate: number;
  isGenerating: boolean;
  
  setInsights: (insights: InsightStory[]) => void;
  addCoachingHistory: (coaching: string) => void;
  setGenerating: (status: boolean) => void;
  updateRefreshTime: () => void;
}

/**
 * AI 분석 결과 및 오늘의 인사이트 상태를 관리하는 스토어
 */
export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      insights: [],
      coachingHistory: [],
      lastUpdate: 0,
      isGenerating: false,

      setInsights: (insights) => set({ insights }),
      addCoachingHistory: (coaching) => 
        set((state) => ({ 
          coachingHistory: [coaching, ...state.coachingHistory].slice(0, 10) // 최근 10개만 유지
        })),
      setGenerating: (status) => set({ isGenerating: status }),
      updateRefreshTime: () => set({ lastUpdate: Date.now() }),
    }),
    {
      name: 'pika-ai-storage-v2', // 데이터 구조 변경으로 인한 초기화 (icon 직렬화 문제 해결)
    }
  )
);
