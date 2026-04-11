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
import { useHistoryStore } from '../../store/useHistoryStore';

export const FamilyView: React.FC = () => {
  const { logs } = useHistoryStore();
  const recentLogs = logs.slice(0, 5);

  return (
    <div className="flex flex-col space-y-8 pb-32">
      {/* 가족 대시보드 요약 */}
      <section className="px-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[24px] font-black text-text-main">가족 대시보드</h2>
          <button className="p-3 bg-brand-50 text-brand-500 rounded-2xl active:scale-95 transition-all outline-none">
            <HugeiconsIcon icon={Share01Icon} size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-4xl shadow-soft border border-slate-50 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-[24px] mb-3">👨‍👩‍👧</div>
            <span className="text-[13px] font-bold text-text-muted mb-1">연결된 가족</span>
            <span className="text-[18px] font-black text-text-main">3명</span>
          </div>
          <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-6 rounded-4xl shadow-brand-500/20 shadow-xl flex flex-col items-center text-center text-white">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-[24px] mb-3">❤️</div>
            <span className="text-[13px] font-bold opacity-80 mb-1">오늘의 응원</span>
            <span className="text-[18px] font-black">12개</span>
          </div>
        </div>
      </section>

      {/* 실시간 타임라인 */}
      <section className="px-2">
        <h3 className="text-[17px] font-black text-text-main mb-6 flex items-center gap-2">
          <HugeiconsIcon icon={Clock01Icon} size={20} className="text-brand-500" />
          아이의 실시간 상태
        </h3>
        
        <div className="space-y-6 relative ml-4 border-l-2 border-slate-100 pl-8">
          {recentLogs.map((log, i) => (
            <div key={log.id} className="relative group">
              {/* Dot */}
              <div className="absolute -left-[39px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-brand-500 z-10 group-hover:scale-125 transition-all"></div>
              
              <div className="bg-white p-5 rounded-3xl shadow-soft border border-slate-50 group-hover:shadow-premium transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-black text-text-main">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className={`px-3 py-1 rounded-full text-[11px] font-black ${
                    log.currentBG < 70 ? 'bg-warm-50 text-warm-600' : 'bg-brand-50 text-brand-600'
                  }`}>
                    {log.currentBG} mg/dL
                  </div>
                </div>
                <p className="text-[14px] font-bold text-text-sub leading-relaxed">
                  {log.totalCarbs > 0 ? `${log.totalCarbs}g의 탄수화물을 섭취하고 ${log.totalInsulin}u를 투여했어요.` : '혈당을 측정했어요.'}
                </p>
                
                {/* 응원 남기기 */}
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 bg-soft-blue text-brand-600 py-2 rounded-xl text-[12px] font-black hover:bg-brand-100 transition-colors">👍 잘하고 있어!</button>
                  <button className="flex-1 bg-soft-pink text-pink-600 py-2 rounded-xl text-[12px] font-black hover:bg-pink-100 transition-colors">💊 잊지마!</button>
                </div>
              </div>
            </div>
          ))}
          {recentLogs.length === 0 && (
            <div className="text-center py-10 -ml-8">
              <p className="text-text-muted font-bold text-[14px]">아직 기록된 상태가 없어요 ☘️</p>
            </div>
          )}
        </div>
      </section>

      {/* 가족 커뮤니티 인사이트 (Curation) */}
      <section className="px-2">
        <h3 className="text-[17px] font-black text-text-main mb-4 flex items-center gap-2">
          <HugeiconsIcon icon={StickyNote01Icon} size={20} className="text-brand-500" />
          가족을 위한 건강 팁
        </h3>
        <div className="bg-soft-purple/40 p-6 rounded-4xl border border-brand-100/30 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[28px]">🎓</div>
            <div>
              <div className="text-[15px] font-black text-brand-600">오늘의 부모 교육</div>
              <div className="text-[13px] font-bold text-brand-400">사춘기 아이와 당뇨 관리 대화법</div>
            </div>
          </div>
          <button className="w-full bg-white py-4 rounded-2xl text-[14px] font-black text-brand-500 shadow-soft active:scale-95 transition-all">강의 보러가기</button>
        </div>
      </section>
    </div>
  );
};
