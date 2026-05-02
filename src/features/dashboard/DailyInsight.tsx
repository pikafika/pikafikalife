import React, { useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { AiChat01Icon } from '@hugeicons/core-free-icons';
import { useAIStore } from '../../store/useAIStore';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useUserStore } from '../../store/useUserStore';
import { getGeminiService } from '../../services/geminiService';
import { INSIGHTS_DATA } from '../../data/insights_db';

interface DailyInsightProps {
  onSelectStory: (index: number) => void;
  onSeeAll: () => void;
}

export const DailyInsight: React.FC<DailyInsightProps> = ({ onSelectStory, onSeeAll }) => {
  const { insights, isGenerating } = useAIStore();

  // 매일 자정 기준으로 새로운 4개의 팁을 로테이션으로 선정 (로컬에서만 계산)
  const displayInsights = useMemo(() => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    const sourceData = Array.isArray(insights) && insights.length > 0 ? insights : INSIGHTS_DATA;
    
    const shuffled = [...sourceData].sort((a, b) => {
      const hashA = (a.id * seed) % 100;
      const hashB = (b.id * seed) % 100;
      return hashA - hashB;
    });
    
    return shuffled.slice(0, 4);
  }, [insights]);

  return (
    <div className="flex flex-col mb-8">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <h3 className="text-[16px] font-bold text-text-main">건강 인사이트 허브</h3>
          {isGenerating && (
            <div className="flex items-center gap-1 bg-brand-50 px-2 py-0.5 rounded-sm animate-pulse">
              <HugeiconsIcon icon={AiChat01Icon} size={10} className="text-brand-500" />
              <span className="text-[9px] font-bold text-brand-600 uppercase">AI Generating...</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {/* 새로고침(AI 호출) 버튼 제거됨 */}
          <button 
            onClick={onSeeAll}
            className="text-[12px] font-bold text-brand-500 border border-brand-100 px-3 py-1 rounded-sm active:bg-brand-50 transition-all"
          >
            전체보기
          </button>
        </div>
      </div>
      
      <div className="flex overflow-x-auto gap-4 no-scrollbar pb-2 px-2">
        {displayInsights.map((insight, index) => {
          if (!insight) return null;
          return (
            <button 
              key={`${insight.id}-${index}`} 
              onClick={() => onSelectStory(index)}
              className="flex flex-col items-center gap-2 group shrink-0 transition-all outline-none"
            >
              <div className={`w-[64px] h-[64px] rounded-full p-[2px] border border-brand-500 group-active:scale-95 transition-all`}>
                <div className={`w-full h-full rounded-full ${insight.color || 'bg-gray-100'} flex items-center justify-center text-[22px]`}>
                  {insight.icon}
                </div>
              </div>
              <div className="flex flex-col items-center tracking-tight">
                <span className="text-[10px] font-bold text-brand-500 uppercase mb-0.5 tracking-wider">{insight.title}</span>
                <span className="text-[11px] font-medium text-text-main w-[70px] truncate text-center leading-tight">
                  {insight.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
