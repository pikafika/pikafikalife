import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Home11Icon, Calculator01Icon, Time01Icon, Settings01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenCalculator?: () => void;
}

const SIDE_ITEMS = [
  { id: 'home', label: '오늘', icon: Home11Icon },
  { id: 'history', label: '기록', icon: Time01Icon },
];

const SIDE_ITEMS_RIGHT = [
  { id: 'family', label: '가족', icon: UserGroupIcon },
  { id: 'settings', label: '설정', icon: Settings01Icon },
];

export default function BottomNav({ activeTab, onTabChange, onOpenCalculator }: BottomNavProps) {

  return (
    <nav 
      className="fixed left-0 right-0 max-w-[500px] mx-auto bg-white/80 backdrop-blur-xl border-t border-slate-50 h-[80px] flex justify-around items-center z-50 pb-safe shadow-soft overflow-visible transition-all duration-300 ease-out"
      style={{ bottom: 'var(--viewport-bottom-offset, 0px)' }}
    >
      {/* 왼쪽 2개 */}
      {SIDE_ITEMS.map(({ id, label, icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1.5 cursor-pointer transition-all ${
              isActive ? 'text-brand-500' : 'text-text-muted hover:text-text-sub'
            }`}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className={`transition-all duration-300 ${isActive ? 'scale-110' : ''}`}>
              <HugeiconsIcon icon={icon} size={24} color="currentColor" strokeWidth={isActive ? 2.5 : 1.5} />
            </div>
            <span className={`text-[12px] transition-all duration-300 ${isActive ? 'font-bold' : 'font-medium'}`}>
              {label}
            </span>
          </button>
        );
      })}

      {/* 가운데 FAB — 계산기 (Antigravity Orb) */}
      <button
        onClick={() => onOpenCalculator?.()}
        className="flex flex-col items-center flex-1 -translate-y-6 cursor-pointer group"
        aria-label="계산기"
      >
        <div
          className="w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all duration-500 group-active:scale-90 bg-gradient-to-br from-brand-400 to-brand-600 shadow-brand-500/30"
          style={{ boxShadow: '0 8px 20px rgba(49,130,246,0.35)' }}
        >
          <HugeiconsIcon icon={Calculator01Icon} size={28} color="white" strokeWidth={2.5} />
        </div>
        <span className="text-[12px] mt-2 font-bold transition-all duration-300 text-text-muted group-hover:text-brand-500">
          계산기
        </span>
      </button>

      {/* 오른쪽 2개 */}
      {SIDE_ITEMS_RIGHT.map(({ id, label, icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1.5 cursor-pointer transition-all ${
              isActive ? 'text-brand-500' : 'text-text-muted hover:text-text-sub'
            }`}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className={`transition-all duration-300 ${isActive ? 'scale-110' : ''}`}>
              <HugeiconsIcon icon={icon} size={24} color="currentColor" strokeWidth={isActive ? 2.5 : 1.5} />
            </div>
            <span className={`text-[12px] transition-all duration-300 ${isActive ? 'font-bold' : 'font-medium'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
