import React, { useState, useEffect } from 'react';
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

  // 오버레이 열릴 때 스크롤 차단
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col overflow-hidden shadow-2xl w-full max-w-[500px] mx-auto border-x border-gray-100 animate-in fade-in duration-500">
      {/* Top Header & Indicator */}
      <div className="px-4 pt-6 pb-3 bg-white z-50 flex flex-col shrink-0 border-b border-gray-100 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={twMerge("w-10 h-10 rounded-xl flex items-center justify-center text-[20px] shadow-sm", currentStory.color)}>
              {currentStory.icon}
            </div>
            <div>
              <div className="text-text-main text-[16px] font-black tracking-tight">{currentStory.title}</div>
              <div className="text-text-muted text-[10px] font-black uppercase opacity-60 tracking-wider">Health Insight Archive</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-black text-brand-500 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-100">
              {currentIndex + 1} / {stories.length}
            </span>
            <button 
              onClick={onClose} 
              className="p-2 text-text-main bg-white border border-gray-100 rounded-xl active:scale-90 transition-all shadow-sm"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-[100px] bg-white/50 px-4">
        <div className="py-8 animate-in slide-in-from-bottom-4 duration-500">
          {/* Main Visual */}
          <div className={twMerge("w-full aspect-video rounded-lg flex items-center justify-center text-[72px] mb-8 shadow-lds", currentStory.color)}>
            {currentStory.icon}
          </div>

          <div className="space-y-6">
            <div className="inline-block px-3 py-1 rounded-sm bg-gray-50 text-gray-400 text-[11px] font-bold uppercase tracking-wider">
              {currentStory.content.subtitle}
            </div>
            
            <h2 className="text-[24px] font-bold text-text-main leading-tight tracking-tight">
              {currentStory.label}
            </h2>

            <p className="text-[15px] font-medium text-text-sub leading-relaxed border-l-3 border-brand-500 pl-4 bg-brand-50/50 py-5 rounded-r-md">
              {currentStory.content.description}
            </p>

            {/* Tips Section */}
            <div className="bg-gray-50 rounded-md p-6 border border-gray-100">
              <h4 className="text-[14px] font-bold text-text-main mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-sm bg-brand-500 flex items-center justify-center">
                  <HugeiconsIcon icon={BookOpen01Icon} size={14} color="white" strokeWidth={3} />
                </div>
                오늘의 꿀팁
              </h4>
              <ul className="space-y-3">
                {currentStory.content.tips.map((tip, i) => (
                  <li key={i} className="text-[13px] font-bold text-text-sub flex items-start gap-3 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 text-[11px] text-brand-600 border border-brand-100 shadow-sm mt-0.5">
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
                <h4 className="text-[16px] font-bold text-text-main">
                  {currentStory.content.deepDive.title}
                </h4>
                <div className="text-[14px] font-medium text-text-sub leading-relaxed whitespace-pre-line border-t border-gray-50 pt-4">
                  {currentStory.content.deepDive.body}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 bg-white border-t border-gray-100 z-[110]">
        <div className="flex gap-3">
          <button 
            onClick={handlePrev}
            className={twMerge(
              "flex-1 lds-button-secondary py-3.5 text-[14px] flex items-center justify-center gap-2",
              currentIndex === 0 && "opacity-20 cursor-not-allowed"
            )}
            disabled={currentIndex === 0}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={18} strokeWidth={3} />
            이전
          </button>
          <button 
            onClick={handleNext}
            className="flex-[2] lds-button-primary py-3.5 text-[14px] flex items-center justify-center gap-2"
          >
            {currentIndex < stories.length - 1 ? (
              <>
                다음 아티클
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={3} />
              </>
            ) : (
              '완료'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
