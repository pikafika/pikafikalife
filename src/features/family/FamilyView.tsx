import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  UserGroupIcon, 
  PlayIcon, 
  StickyNote01Icon, 
  Share01Icon,
  Message01Icon,
  Clock01Icon
} from '@hugeicons/core-free-icons';
import { twMerge } from 'tailwind-merge';
import { useHistoryStore } from '../../store/useHistoryStore';

export const FamilyView: React.FC = () => {
  const { logs } = useHistoryStore();
  const recentLogs = logs.slice(0, 5);

  return (
    <div className="flex flex-col space-y-8 pb-32 pt-2">
      {/* 가족 대시보드 요약 */}
      <section className="px-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[22px] font-bold text-text-main">가족 대시보드</h2>
          <button className="p-3 bg-brand-50 text-brand-500 rounded-sm active:scale-95 transition-all outline-none border border-brand-100">
            <HugeiconsIcon icon={Share01Icon} size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-lds border border-gray-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-md bg-gray-50 flex items-center justify-center text-[24px] mb-3 border border-gray-100">👨‍👩‍👧</div>
            <span className="text-[12px] font-bold text-text-muted mb-1">연결된 가족</span>
            <span className="text-[18px] font-bold text-text-main">3명</span>
          </div>
          <div className="bg-brand-500 p-6 rounded-lg shadow-lds flex flex-col items-center text-center text-white">
            <div className="w-12 h-12 rounded-md bg-white/20 flex items-center justify-center text-[24px] mb-3">❤️</div>
            <span className="text-[12px] font-bold opacity-80 mb-1">응원 전달</span>
            <span className="text-[18px] font-bold">12개</span>
          </div>
        </div>
      </section>

      {/* 실시간 타임라인 */}
      <section className="px-2">
        <h3 className="text-[15px] font-bold text-text-main mb-6 flex items-center gap-2">
          <HugeiconsIcon icon={Clock01Icon} size={20} className="text-brand-500" strokeWidth={2.5} />
          자녀 실시간 상태
        </h3>
        
        <div className="space-y-6 relative ml-4 border-l border-gray-100 pl-8">
          {recentLogs.map((log, i) => (
            <div key={log.id} className="relative group">
              {/* Dot */}
              <div className="absolute -left-[36.5px] top-1 w-4 h-4 rounded-full bg-white border-4 border-brand-500 z-10"></div>
              
              <div className="bg-white p-5 rounded-lg shadow-lds border border-gray-100 overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-[14px] font-bold text-text-main">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className={twMerge(
                    "px-2 py-1 rounded-sm text-[11px] font-bold border",
                    log.currentBG < 70 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-brand-50 text-brand-600 border-brand-100'
                  )}>
                    {log.currentBG} mg/dL
                  </div>
                </div>
                <p className="text-[14px] font-medium text-text-sub leading-relaxed mb-4">
                  {log.totalCarbs > 0 ? `${log.totalCarbs}g의 탄수화물을 섭취하고 ${log.totalInsulin}단위를 투여했어요.` : '혈당을 측정했어요.'}
                </p>
                
                {/* 응원 남기기 */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-gray-50 text-brand-600 py-2.5 rounded-sm text-[12px] font-bold hover:bg-brand-50 transition-colors border border-gray-100">응원 보내기</button>
                  <button className="flex-1 bg-gray-50 text-gray-600 py-2.5 rounded-sm text-[12px] font-bold hover:bg-gray-100 transition-colors border border-gray-100">기록 공유</button>
                </div>
              </div>
            </div>
          ))}
          {recentLogs.length === 0 && (
            <div className="text-center py-10 -ml-8">
              <p className="text-text-muted font-bold text-[13px]">아직 기록된 상태가 없어요 ☘️</p>
            </div>
          )}
        </div>
      </section>

      {/* 부모 교육 센터 */}
      <section className="px-2">
        <h3 className="text-[15px] font-bold text-text-main mb-4 flex items-center gap-2">
          <HugeiconsIcon icon={StickyNote01Icon} size={20} className="text-brand-500" strokeWidth={2.5} />
          가족 건강 가이드
        </h3>
        <div className="bg-gray-900 p-6 rounded-lg flex flex-col gap-5 border border-gray-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-md bg-white/10 flex items-center justify-center text-[28px] border border-white/10">🎓</div>
            <div>
              <div className="text-[15px] font-bold text-white mb-1">오늘의 부모 교육</div>
              <div className="text-[12px] font-medium text-gray-400">사춘기 아이와 당뇨 관리 대화법</div>
            </div>
          </div>
          <button className="w-full bg-brand-500 py-3.5 rounded-sm text-[14px] font-bold text-white active:scale-95 transition-all">강의 시청하기</button>
        </div>
      </section>
    </div>
  );
};
