import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlayIcon, Book02Icon, StarIcon, TikkaMasalaIcon } from '@hugeicons/core-free-icons';

import { INSIGHTS_DATA } from '../../data/insights_db';

interface DailyInsightProps {
  onSelectStory: (index: number) => void;
  onSeeAll: () => void;
}

export const DailyInsight: React.FC<DailyInsightProps> = ({ onSelectStory, onSeeAll }) => {
  return (
    <div className="flex flex-col mb-8">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-[17px] font-black text-text-main">오늘의 인사이트</h3>
        <button 
          onClick={onSeeAll}
          className="text-[13px] font-bold text-brand-500 bg-brand-50 px-3 py-1 rounded-full active:scale-95 transition-all"
        >
          전체보기
        </button>
      </div>
      
      <div className="flex overflow-x-auto gap-4 no-scrollbar pb-2 px-2">
        {INSIGHTS_DATA.map((insight, index) => (
          <button 
            key={insight.id} 
            onClick={() => onSelectStory(index)}
            className="flex flex-col items-center gap-2 group shrink-0 active:scale-95 transition-all outline-none"
          >
            <div className={`w-[72px] h-[72px] rounded-full p-[3px] border-2 border-brand-500 ring-2 ring-white ring-offset-0 group-hover:scale-105 transition-all`}>
              <div className={`w-full h-full rounded-full ${insight.color} flex items-center justify-center text-[24px] shadow-inner`}>
                {insight.icon}
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
