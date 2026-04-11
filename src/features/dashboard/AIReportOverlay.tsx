import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Cancel01Icon, 
  LeftToRightListDashIcon, 
  ZapIcon, 
  TargetIcon, 
  InformationCircleIcon, 
  CheckmarkBadge01Icon,
  AiChat01Icon,
  ArrowRight01Icon,
  Analytics01Icon
} from '@hugeicons/core-free-icons';
import { twMerge } from 'tailwind-merge';

interface AIReportOverlayProps {
  onClose: () => void;
  stats: {
    totalCarbs: number;
    totalInsulin: number;
    avgBG: number;
  };
  lastBG: number | null;
}

export const AIReportOverlay: React.FC<AIReportOverlayProps> = ({ onClose, stats, lastBG }) => {
  // Mock data for sophisticated analysis
  const stabilityScore = 85;
  const tirValue = 72; // Time In Range %

  return (
    <div className="fixed inset-0 z-[130] bg-white flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
      {/* Premium Header */}
      <header className="p-6 flex items-center justify-between border-b border-slate-50 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <HugeiconsIcon icon={AiChat01Icon} size={20} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-[18px] font-black text-text-main">AI 정밀 분석 리포트</h3>
            <span className="text-[11px] font-bold text-brand-500 bg-brand-50 px-2 py-0.5 rounded-md uppercase">Beta Analysis</span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 bg-slate-50 rounded-2xl active:scale-90 transition-all">
          <HugeiconsIcon icon={Cancel01Icon} size={24} strokeWidth={2.5} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-32">
        {/* Core Score Section */}
        <section className="bg-gradient-to-br from-slate-900 to-brand-900 rounded-[40px] p-8 text-center relative overflow-hidden shadow-premium">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
          <p className="text-brand-200 text-[14px] font-bold mb-2">오늘의 혈당 안정도 점수</p>
          <div className="relative inline-block">
            <span className="text-[84px] font-black text-white leading-none tracking-tighter">{stabilityScore}</span>
            <span className="text-brand-400 font-black text-[24px] absolute -top-2 -right-6">pts</span>
          </div>
          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
              <span className="text-white/60 text-[11px] block font-bold">목표 범위 내(TIR)</span>
              <span className="text-white text-[16px] font-black">{tirValue}%</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
              <span className="text-white/60 text-[11px] block font-bold">평균 혈당</span>
              <span className="text-white text-[16px] font-black">{stats.avgBG} mg/dL</span>
            </div>
          </div>
        </section>

        {/* AI 패턴 인사이트 */}
        <section className="space-y-4">
          <h4 className="text-[17px] font-black text-text-main flex items-center gap-2">
            <HugeiconsIcon icon={Analytics01Icon} size={20} className="text-brand-500" />
            주요 혈당 패턴 분석
          </h4>
          
          <div className="space-y-3">
            <PatternCard 
              type="positive"
              title="오전 시간대 안정성 높음"
              description="최근 3일간 오전 9시~12시 사이의 혈당 변동폭이 매우 낮습니다. 아침 식단 구성이 매우 적절합니다."
            />
            <PatternCard 
              type="warning"
              title="저녁 탄수화물 민감도 확인"
              description="오후 7시 이후 혈당이 급격히 상승하는 경향이 있습니다. 저녁 식단에서 정제 탄수화물을 15% 줄여보는 것을 권장합니다."
            />
          </div>
        </section>

        {/* 구체적인 액션 아이템 */}
        <section className="bg-soft-blue/20 rounded-4xl p-6 border border-brand-100/50">
          <div className="flex items-center gap-2 mb-4">
            <HugeiconsIcon icon={TargetIcon} size={20} className="text-brand-600" />
            <h4 className="font-black text-[16px] text-brand-700">추천 행동 지침</h4>
          </div>
          <ul className="space-y-4">
            <ActionItem 
              icon="🏃‍♂️"
              text="저녁 식후 20분 가벼운 산책 (혈당 피크 억제)"
            />
            <ActionItem 
              icon="🥛"
              text="취침 전 단백질 위주의 간식 섭취 (새벽 저혈당 방지)"
            />
            <ActionItem 
              icon="💧"
              text="충분한 수분 섭취 (혈당 농도 조절 원활)"
            />
          </ul>
        </section>

        {/* 법적 고지 */}
        <div className="flex gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <HugeiconsIcon icon={InformationCircleIcon} size={16} className="text-slate-400 shrink-0" />
          <p className="text-[11px] font-bold text-slate-400 leading-tight">
            본 리포트는 인공지능 분석 결과로, 의료적 판단의 참고 자료로만 활용하시기 바랍니다. 
            변경 사항이 있을 시 주치의와 상의하세요.
          </p>
        </div>
      </div>

      {/* Close Button Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-50 z-30">
        <button 
          onClick={onClose}
          className="w-full bg-brand-500 text-white py-5 rounded-3xl font-black text-[16px] shadow-lg shadow-brand-500/30 active:scale-95 transition-all"
        >
          리포트 닫기
        </button>
      </div>
    </div>
  );
};

const PatternCard: React.FC<{ type: 'positive' | 'warning', title: string, description: string }> = ({ type, title, description }) => (
  <div className={twMerge(
    "p-5 rounded-3xl border shadow-soft",
    type === 'positive' ? "bg-white border-brand-100" : "bg-white border-orange-100"
  )}>
    <div className="flex items-center gap-2 mb-2">
      <div className={twMerge(
        "w-2 h-2 rounded-full",
        type === 'positive' ? "bg-brand-500" : "bg-orange-500"
      )}></div>
      <h5 className="font-black text-[14px] text-text-main">{title}</h5>
    </div>
    <p className="text-[13px] font-bold text-text-sub leading-relaxed">{description}</p>
  </div>
);

const ActionItem: React.FC<{ icon: string, text: string }> = ({ icon, text }) => (
  <li className="flex items-center gap-3 bg-white/80 p-3 rounded-2xl border border-white shadow-sm">
    <span className="text-[20px]">{icon}</span>
    <span className="text-[13px] font-black text-text-sub">{text}</span>
  </li>
);
