import React, { useEffect } from 'react';
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
  const { insights, setInsights, isGenerating, setGenerating } = useAIStore();
  const { logs } = useHistoryStore();
  const { settings } = useUserStore();

  // 최초 로드 시 데이터가 없으면 기본 데이터로 초기화하거나 AI 호출
  useEffect(() => {
    if (insights.length === 0) {
      setInsights(INSIGHTS_DATA);
    }
  }, []);

  const handleRefresh = async () => {
    const service = getGeminiService();
    if (!service || isGenerating) return;

    setGenerating(true);
    try {
      const newInsights = await service.generateDailyInsights(logs, settings);
      setInsights(newInsights);
    } catch (error) {
      console.error("Failed to refresh insights:", error);
    } finally {
      setGenerating(false);
    }
  };

  const displayInsights = Array.isArray(insights) && insights.length > 0 ? insights : INSIGHTS_DATA;

  return (
    <div className="flex flex-col mb-8">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <h3 className="text-[17px] font-black text-text-main">오늘의 인사이트</h3>
          {isGenerating && (
            <div className="flex items-center gap-1 bg-brand-50 px-2 py-0.5 rounded-md animate-pulse">
              <HugeiconsIcon icon={AiChat01Icon} size={12} className="text-brand-500" />
              <span className="text-[10px] font-bold text-brand-600">AI 생성 중...</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {!isGenerating && (
            <button 
              onClick={handleRefresh}
              className="text-[13px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full active:scale-95 transition-all"
            >
              새로고침
            </button>
          )}
          <button 
            onClick={onSeeAll}
            className="text-[13px] font-bold text-brand-500 bg-brand-50 px-3 py-1 rounded-full active:scale-95 transition-all"
          >
            전체보기
          </button>
        </div>
      </div>
      
      <div className="flex overflow-x-auto gap-4 no-scrollbar pb-2 px-2">
        {displayInsights.map((insight, index) => (
          <button 
            key={`${insight.id}-${index}`} 
            onClick={() => onSelectStory(index)}
            className="flex flex-col items-center gap-2 group shrink-0 active:scale-95 transition-all outline-none"
          >
            <div className={`w-[72px] h-[72px] rounded-full p-[3px] border-2 border-brand-500 ring-2 ring-white ring-offset-0 group-hover:scale-105 transition-all`}>
              <div className={`w-full h-full rounded-full ${insight.color} flex items-center justify-center text-[24px] shadow-inner`}>
                {typeof insight.icon === 'string' ? insight.icon : insight.icon}
              </div>
            </div>
            <div className="flex flex-col items-center tracking-tight">
              <span className="text-[11px] font-black opacity-60 mb-0.5">{insight.title}</span>
              <span className="text-[12px] font-bold text-text-main w-[85px] truncate text-center leading-tight">
                {insight.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
