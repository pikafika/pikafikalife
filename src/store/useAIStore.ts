import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { InsightStory, INSIGHTS_DATA } from '../data/insights_db';

interface AIState {
  insights: InsightStory[];
  coachingHistory: string[];
  lastUpdate: number;
  isGenerating: boolean;
  
  setInsights: (newInsights: InsightStory[]) => void;
  addCoachingHistory: (coaching: string) => void;
  setGenerating: (status: boolean) => void;
  updateRefreshTime: () => void;
  resetAIState: () => void;
}

/**
 * AI 분석 결과 및 오늘의 인사이트 상태를 관리하는 스토어
 */
export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      insights: INSIGHTS_DATA, // 초기값으로 기본 데이터 설정
      coachingHistory: [],
      lastUpdate: 0,
      isGenerating: false,

      setInsights: (newInsights) =>
        set((state) => {
          const isValidInsight = (i: unknown): i is InsightStory =>
            !!i &&
            typeof (i as InsightStory).icon === 'string' &&
            typeof (i as InsightStory).color === 'string' &&
            typeof (i as InsightStory).label === 'string' &&
            !!(i as InsightStory).content?.description;
          const validNew = Array.isArray(newInsights) ? newInsights.filter(isValidInsight) : [];
          const existingIds = new Set(state.insights.map(i => i.id));
          const filteredNew = validNew.filter(i => !existingIds.has(i.id));
          const merged = [...filteredNew, ...state.insights];
          return { insights: merged.slice(0, 50) };
        }),
      addCoachingHistory: (coaching) => 
        set((state) => ({ 
          coachingHistory: [coaching, ...state.coachingHistory].slice(0, 10) // 최근 10개만 유지
        })),
      setGenerating: (status) => set({ isGenerating: status }),
      updateRefreshTime: () => set({ lastUpdate: Date.now() }),
      resetAIState: () => set({ 
        insights: INSIGHTS_DATA, 
        coachingHistory: [], 
        lastUpdate: 0, 
        isGenerating: false 
      }),
    }),
    {
      name: 'pika-ai-storage-v5', // v5: AI 인사이트 유효성 검사 추가, 오염 데이터 초기화
    }
  )
);
