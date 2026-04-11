import React from 'react';
import { Activity } from 'lucide-react';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const getTitle = () => {
    switch (activeTab) {
      case 'home': return '오늘';
      case 'calculator': return '인슐린 계산기';
      case 'history': return '나의 기록';
      case 'family': return '가족 공유';
      case 'settings': return '설정';
      default: return '오늘';
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-background font-sans text-text-main antialiased">
      <div className="flex flex-col w-full max-w-[500px] bg-white min-h-screen relative shadow-premium border-x border-slate-50">
        <header className="sticky top-0 z-50 flex items-center justify-between h-[64px] px-6 bg-white bg-opacity-80 backdrop-blur-xl">
          <div className="flex items-center">
            <h1 className="text-[22px] font-black text-text-main tracking-tight flex items-center gap-2">
              <span className="w-2 h-6 bg-brand-500 rounded-full"></span>
              {getTitle()}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-[100px] bg-background">
          <div className="p-6 space-y-6">
            {children}
          </div>
        </main>

        <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  );
}
