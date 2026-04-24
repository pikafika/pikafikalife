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
    <div className="fixed top-0 bottom-0 left-0 right-0 mx-auto w-full max-w-[500px] z-[9999] bg-white flex flex-col animate-in fade-in duration-500 overflow-hidden shadow-2xl border-x border-gray-100">
      {/* Top Header & Indicator */}
      <div className="absolute top-0 left-0 right-0 h-[80px] px-6 flex items-center justify-between z-[110] bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={twMerge("w-10 h-10 rounded-md flex items-center justify-center text-[20px]", currentStory.color)}>
            {currentStory.icon}
          </div>
          <div>
            <div className="text-text-main text-[15px] font-bold">{currentStory.title}</div>
            <div className="text-text-muted text-[11px] font-bold">건강 라이프 아카이브</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[12px] font-bold text-brand-500 border border-brand-100 px-3 py-1 rounded-sm">
            {currentIndex + 1} / {stories.length}
          </span>
          <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors p-2">
            <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pt-[80px] pb-[100px] bg-white px-6">
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
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 flex gap-3 z-[110]">
        <button 
          onClick={handlePrev}
          className={twMerge(
            "flex-1 lds-button-secondary py-4 text-[14px] flex items-center justify-center gap-2",
            currentIndex === 0 && "opacity-20 cursor-not-allowed"
          )}
          disabled={currentIndex === 0}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} strokeWidth={3} />
          이전
        </button>
        <button 
          onClick={handleNext}
          className="flex-[2] lds-button-primary py-4 text-[14px] flex items-center justify-center gap-2"
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
  );
};
