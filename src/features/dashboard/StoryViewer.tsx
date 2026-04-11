import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, ArrowRight01Icon, ArrowLeft01Icon, BookOpen01Icon } from '@hugeicons/core-free-icons';
import { twMerge } from 'tailwind-merge';

export interface StoryContent {
  id: number;
  title: string;
  label: string;
  color: string;
  icon: React.ReactNode;
  content: {
    subtitle: string;
    description: string;
    tips: string[];
    deepDive?: {
      title: string;
      body: string;
    };
  };
}

interface StoryViewerProps {
  stories: StoryContent[];
  initialIndex: number;
  onClose: () => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ stories, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentStory = stories[currentIndex];

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center animate-in fade-in duration-300">
      <div className="relative w-full max-w-[500px] h-full bg-white overflow-hidden shadow-2xl flex flex-col">
        {/* Top Header & Indicator */}
        <div className="absolute top-0 left-0 right-0 h-[100px] px-6 flex items-center justify-between z-[110] bg-white border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className={twMerge("w-10 h-10 rounded-2xl flex items-center justify-center text-[20px]", currentStory.color)}>
              {currentStory.icon}
            </div>
            <div>
              <div className="text-text-main text-[16px] font-black">{currentStory.title}</div>
              <div className="text-text-muted text-[12px] font-bold">건강 지식 아티클</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-black text-brand-500 bg-brand-50 px-3 py-1 rounded-full">
              {currentIndex + 1} / {stories.length}
            </span>
            <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors p-2">
              <HugeiconsIcon icon={Cancel01Icon} size={24} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar pt-[100px] pb-[100px] bg-white px-6">
          <div className="py-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Main Visual */}
            <div className={twMerge("w-full aspect-video rounded-5xl flex items-center justify-center text-[84px] mb-8 shadow-premium", currentStory.color)}>
              {currentStory.icon}
            </div>

            <div className="space-y-6">
              <div className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[12px] font-black uppercase tracking-widest">
                {currentStory.content.subtitle}
              </div>
              
              <h2 className="text-[28px] font-black text-text-main leading-tight">
                {currentStory.label}
              </h2>

              <p className="text-[16px] font-bold text-text-sub leading-relaxed border-l-4 border-brand-500 pl-4 bg-brand-50/30 py-4 rounded-r-2xl">
                {currentStory.content.description}
              </p>

              {/* Tips Section */}
              <div className="bg-slate-50/80 rounded-4xl p-6 border border-slate-100">
                <h4 className="text-[15px] font-black text-text-main mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-brand-500 flex items-center justify-center">
                    <HugeiconsIcon icon={BookOpen01Icon} size={14} color="white" strokeWidth={3} />
                  </div>
                  한 눈에 보는 꿀팁
                </h4>
                <ul className="space-y-3">
                  {currentStory.content.tips.map((tip, i) => (
                    <li key={i} className="text-[14px] font-bold text-text-sub flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 text-[12px] text-brand-600 border border-brand-100 shadow-sm">
                        {i + 1}
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Detailed Deep Dive */}
              {currentStory.content.deepDive && (
                <div className="space-y-4 pt-4">
                  <h4 className="text-[18px] font-black text-text-main">
                    {currentStory.content.deepDive.title}
                  </h4>
                  <div className="text-[15px] font-medium text-text-sub leading-relaxed whitespace-pre-line bg-white/50 border-t border-slate-100 pt-4">
                    {currentStory.content.deepDive.body}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-50 flex gap-4 z-[110]">
          <button 
            onClick={handlePrev}
            className={twMerge(
              "flex-1 py-5 rounded-3xl font-black text-[16px] flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-100 text-text-muted hover:bg-slate-50",
              currentIndex === 0 && "opacity-20 cursor-not-allowed"
            )}
            disabled={currentIndex === 0}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} strokeWidth={3} />
            이전
          </button>
          <button 
            onClick={handleNext}
            className="flex-[2] bg-brand-500 text-white py-5 rounded-3xl font-black text-[16px] shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {currentIndex < stories.length - 1 ? (
              <>
                다음 아티클 읽기
                <HugeiconsIcon icon={ArrowRight01Icon} size={20} strokeWidth={3} />
              </>
            ) : (
              '지식 습득 완료!'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
