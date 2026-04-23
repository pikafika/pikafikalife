import React, { useMemo, useState } from 'react';
import { useHistoryStore } from '../../store/useHistoryStore';
import TrendChart from './TrendChart';
import { DailyInsight } from './DailyInsight';
import { useAIStore } from '../../store/useAIStore';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  CheckmarkBadge01Icon, 
  ZapIcon, 
  DropletIcon, 
  ChartLineData01Icon,
  InformationCircleIcon,
  AiChat01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon
} from '@hugeicons/core-free-icons';
import { twMerge } from 'tailwind-merge';
import { useAuthStore } from '../../store/useAuthStore';
import { useCloudSync } from '../../hooks/useCloudSync';
import { SeedingCard } from '../../components/SeedingCard';
import { isAdmin } from '../../utils/permissions';

interface DashboardProps {
  onOpenAIReport: () => void;
  onOpenStory: (index: number) => void;
  onOpenFamilyMgmt: () => void;
}

const BGStatusDetail: React.FC<{ bg: number; isOpen: boolean; onToggle: () => void }> = ({ bg, isOpen, onToggle }) => {
  const getStatus = (bgValue: number) => {
    if (bgValue < 70) return { 
      label: '저혈당 주의가 필요해요', 
      color: 'bg-warm-50 text-warm-600 border-warm-100',
      reason: '혈당이 70mg/dL 미만으로 떨어졌습니다. 이는 에너지가 부족하여 어지러움이나 식은땀을 유발할 수 있는 수치입니다.',
      action: '즉시 단순당(포도당 사탕 3~4개 또는 오렌지 주스 반 컵) 15g을 섭취하고 15분 뒤 재측정하세요.'
    };
    if (bgValue > 180) return { 
      label: '관리가 필요한 수치예요', 
      color: 'bg-orange-50 text-orange-600 border-orange-100',
      reason: '혈당이 목표 범위인 180mg/dL를 초과했습니다. 높은 혈당이 지속되면 피로감을 느끼거나 장기적으로 혈관 건강에 영향을 줄 수 있습니다.',
      action: '인슐린 교정 용량이 필요한지 확인하고, 충분한 수분을 섭취하며 활동량을 조절해 보세요.'
    };
    return { 
      label: '오늘도 잘하고 있어요!', 
      color: 'bg-brand-50 text-brand-600 border-brand-100',
      reason: '현재 혈당이 목표 범위(70~180mg/dL) 내에 안전하게 머물고 있습니다. 이는 합병증 예방 및 일상 컨디션 유지에 최적의 상태입니다.',
      action: '현재의 식단과 활동 리듬을 잘 유지해 주세요. 당신의 꾸준함이 빛을 발하고 있어요!'
    };
  };

  const status = getStatus(bg);

  return (
    <div className="w-full flex flex-col items-center">
      <button 
        onClick={onToggle}
        className={twMerge('px-5 py-2 rounded-full text-[13px] font-black border flex items-center gap-2 transition-all active:scale-95 shadow-sm', status.color)}
      >
        {status.label}
        <HugeiconsIcon icon={isOpen ? ArrowUp01Icon : ArrowDown01Icon} size={14} strokeWidth={3} />
      </button>
      
      {isOpen && (
        <div className="mt-4 w-full bg-slate-50/80 rounded-3xl p-5 text-left border border-slate-100 animate-in slide-in-from-top-2 duration-300">
          <div className="mb-3">
            <h5 className="text-[12px] font-black text-text-main mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
              근거 및 상태 설명
            </h5>
            <p className="text-[13px] font-bold text-text-sub leading-relaxed">
              {status.reason}
            </p>
          </div>
          <div className="pt-3 border-t border-white">
            <h5 className="text-[12px] font-black text-brand-600 mb-1 flex items-center gap-1.5">
              💡 추천 조치
            </h5>
            <p className="text-[13px] font-bold text-text-muted leading-relaxed">
              {status.action}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ onOpenAIReport, onOpenStory, onOpenFamilyMgmt }) => {
  useCloudSync(); // 로그인 시 데이터 동기화 시작
  
  const { logs } = useHistoryStore();
  const { insights } = useAIStore();
  const { user, login, logout } = useAuthStore();
  
  const [isSeeAllOpen, setIsSeeAllOpen] = useState(false);
  const [isBGExplanationOpen, setIsBGExplanationOpen] = useState(false);

  const { todayLogs, stats, lastBG, streakCount } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const safeLogs = Array.isArray(logs) ? logs : [];
    const filtered = safeLogs.filter((log) => log && log.timestamp >= todayTime);
    
    const totalCarbs = filtered.reduce((acc, curr) => acc + (curr.totalCarbs || 0), 0);
    const totalInsulin = filtered.reduce((acc, curr) => acc + (curr.totalInsulin || 0), 0);
    const avgBG = filtered.length > 0 
      ? Math.round(filtered.reduce((acc, curr) => acc + curr.currentBG, 0) / filtered.length)
      : 0;

    const last = filtered.length > 0 
      ? filtered.sort((a, b) => b.timestamp - a.timestamp)[0] 
      : null;

    return {
      todayLogs: filtered,
      stats: { totalCarbs, totalInsulin, avgBG },
      lastBG: last ? last.currentBG : null,
      streakCount: 5, // Mock streak count
    };
  }, [logs]);

  const coachingMessage = useMemo(() => {
    if (todayLogs.length === 0) return "오늘의 첫 기록으로 활기찬 우주 여행을 시작해볼까요? 💪";
    if (lastBG && lastBG < 70) return "최근 혈당이 낮아졌어요. 에너지 보충을 위해 사탕이나 주스가 필요해요! 🍬";
    if (stats.avgBG > 180) return "최근 며칠간 평균 혈당이 다소 높아요. 활동량을 조금만 늘려볼까요? 🏃‍♂️";
    
    return "지난 주에 비해 혈당 안정도가 15% 향상되었어요. 아주 훌륭한 패턴이에요! ✨";
  }, [todayLogs.length, lastBG, stats.avgBG]);

  return (
    <div className="flex flex-col space-y-8 pb-20">
      {/* 헤더 & 프로필 */}
      <section className="px-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[26px] font-black text-text-main leading-tight transition-all">
              {user ? (
                <>안녕하세요, <br /> {user?.displayName || '사용자'}님!</>
              ) : (
                <>데이터를 안전하게 <br /> 동기화해 보세요</>
              )}
            </h2>
            <span className="text-[14px] text-text-muted font-bold mt-1 block">
              {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
            </span>
          </div>
          
          {user ? (
            <button 
              onClick={logout}
              className="relative group"
            >
              <img 
                src={user.photoURL || ''} 
                alt="Profile" 
                className="w-14 h-14 rounded-3xl border-2 border-brand-100 shadow-md group-hover:scale-105 transition-all"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-500 rounded-full border-2 border-white flex items-center justify-center">
                <HugeiconsIcon icon={CheckmarkBadge01Icon} size={12} color="white" strokeWidth={3} />
              </div>
            </button>
          ) : (
            <button 
              onClick={login}
              className="bg-brand-500 text-white px-5 py-3 rounded-2xl font-black text-[13px] shadow-lg shadow-brand-500/30 active:scale-95 transition-all flex items-center gap-2"
            >
              <HugeiconsIcon icon={ZapIcon} size={16} strokeWidth={3} />
              구글 로그인
            </button>
          )}
        </div>

        {/* 가족 공유 안내 (로그인 시 노출) */}
        {user && (
          <div 
            onClick={onOpenFamilyMgmt}
            className="mb-6 p-4 bg-brand-50 rounded-3xl border border-brand-100 flex items-center justify-between group cursor-pointer hover:bg-brand-100 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white border border-brand-200 flex items-center justify-center">
                <span className="text-[20px]">🏠</span>
              </div>
              <div>
                <h4 className="text-[14px] font-black text-brand-700">우리 가족 공유 중</h4>
                <p className="text-[11px] font-bold text-brand-400">함께 관리하는 기록 {logs.length}개</p>
              </div>
            </div>
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="text-brand-300" strokeWidth={3} />
          </div>
        )}

        <div className="bg-white rounded-5xl p-8 shadow-premium border border-slate-50 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-300 via-brand-500 to-brand-300"></div>
          <span className="text-[15px] font-bold text-text-sub mb-3">현재 혈당 수치</span>
          <div className="flex items-center justify-center space-x-2 mb-6">
            <span className="text-[64px] font-black text-text-main tracking-tighter leading-none">{lastBG || '--'}</span>
            <span className="text-[18px] font-bold text-text-muted self-end mb-2">mg/dL</span>
          </div>
          {lastBG ? (
            <BGStatusDetail 
              bg={lastBG} 
              isOpen={isBGExplanationOpen} 
              onToggle={() => setIsBGExplanationOpen(!isBGExplanationOpen)} 
            />
          ) : (
            <div className="px-4 py-1.5 rounded-full text-[13px] font-bold border bg-slate-50 text-slate-400 border-slate-100 italic">
              측정 기록이 아직 없어요
            </div>
          )}
        </div>
      </section>

      {/* 데일리 인사이트 (스토리 스타일) */}
      <DailyInsight onSelectStory={onOpenStory} onSeeAll={() => setIsSeeAllOpen(true)} />

      {/* AI 데이터 리포트 스타일 코칭 */}
      <section className="px-2">
        <div className="bg-gradient-to-br from-brand-50 to-soft-blue/20 rounded-4xl p-6 border border-brand-100/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <HugeiconsIcon icon={AiChat01Icon} size={80} />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <HugeiconsIcon icon={CheckmarkBadge01Icon} size={16} color="white" strokeWidth={3} />
            </div>
            <h4 className="font-black text-[15px] text-brand-600">AI 데이터 분석 코칭</h4>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-white shadow-soft">
            <p className="text-[15px] leading-relaxed text-text-main font-bold">
              "{coachingMessage}"
            </p>
            <button 
              onClick={onOpenAIReport}
              className="flex items-center gap-1.5 text-[12px] font-black text-brand-500 mt-4 ml-auto"
            >
              리포트 상세히 보기
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={3} />
            </button>
          </div>
        </div>
      </section>

      {/* 게이미피케이션: 나의 우주 여행 (아바타 성장) */}
      <section className="px-2">
        <div className="bg-gradient-to-br from-slate-900 to-brand-900 rounded-5xl p-8 relative overflow-hidden shadow-premium group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full blur-3xl -mr-10 -mt-10 animate-pulse"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-brand-500/20 text-brand-400 border border-brand-500/30 px-3 py-1 rounded-full text-[12px] font-black">
                LEVEL 4
              </span>
              <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-[12px] font-black flex items-center gap-1">
                <HugeiconsIcon icon={ZapIcon} size={12} strokeWidth={3} />
                연속 {streakCount}일째!
              </span>
            </div>

            <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 ring-4 ring-white/10 group-hover:scale-110 transition-all duration-700 relative">
              <span className="text-[48px] animate-bounce-slow">🚀</span>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center text-[16px] shadow-lg">
                👨‍🚀
              </div>
            </div>
            
            <h3 className="text-white text-[18px] font-black mb-1">나의 우주 여행</h3>
            <p className="text-brand-200 text-[13px] font-bold mb-6">지구에서 달로 이동 중!</p>
            
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/10 mb-3 shadow-inner">
              <div className="h-full bg-gradient-to-r from-brand-600 to-brand-400 w-[65%] rounded-full shadow-[0_0_15px_rgba(78,145,255,0.6)]"></div>
            </div>
            <div className="flex justify-between w-full text-[11px] font-black text-white/50 px-1 mb-6">
              <span>지구</span>
              <span>달 (앞으로 3일 남음)</span>
            </div>

            <div className="bg-white/5 px-4 py-3 rounded-2xl flex items-center gap-3 border border-white/10">
              <HugeiconsIcon icon={InformationCircleIcon} size={16} className="text-brand-400" />
              <p className="text-[12px] font-bold text-white/70 leading-tight">
                기록을 멈추지 마세요! 성실한 기록이 <br />여행의 원동력이 됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 요약 통계 그리드 */}
      <section className="px-2">
        <h3 className="text-[18px] font-black text-text-main mb-4 flex items-center gap-2">
          <HugeiconsIcon icon={ChartLineData01Icon} size={20} className="text-brand-500" />
          오늘의 건강 리포트
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <StatCard
            label="총 탄수화물"
            value={stats.totalCarbs}
            unit="g"
            icon={<HugeiconsIcon icon={DropletIcon} size={20} className="text-warm-500" />}
            bgColor="bg-soft-yellow"
          />
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="총 인슐린"
              value={stats.totalInsulin.toFixed(1)}
              unit="u"
              icon={<HugeiconsIcon icon={CheckmarkBadge01Icon} size={18} className="text-brand-500" />}
              bgColor="bg-soft-blue"
            />
            <StatCard
              label="평균 혈당"
              value={stats.avgBG}
              unit="mg/dL"
              icon={<HugeiconsIcon icon={ZapIcon} size={18} className="text-brand-500" />}
              bgColor="bg-soft-purple"
            />
          </div>
        </div>
      </section>

      {/* 추이 차트 */}
      <section className="bg-white rounded-5xl p-6 shadow-premium border border-slate-50 mx-2 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[18px] font-black text-text-main">혈당 변화 추이</h3>
          <span className="text-[12px] font-bold text-brand-500 bg-brand-50 px-2 py-0.5 rounded-lg">LIVE</span>
        </div>
        <TrendChart />
      </section>

      {/* 테스트용 데이터 생성 카드 (관리자 권한) */}
      {isAdmin(user) && <SeedingCard />}

      {/* Insight Hub (See All Overlay) */}
      {isSeeAllOpen && (
        <div className="fixed inset-0 z-[120] bg-white flex flex-col animate-in slide-in-from-bottom duration-500">
          <header className="p-6 flex items-center justify-between border-b border-slate-50 bg-white sticky top-0">
            <h3 className="text-[20px] font-black text-text-main">건강 인사이트 허브</h3>
            <button onClick={() => setIsSeeAllOpen(false)} className="p-2 bg-slate-50 rounded-2xl">
              <HugeiconsIcon icon={Cancel01Icon} size={24} strokeWidth={2.5} />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <p className="text-[14px] font-bold text-text-muted mb-4">
              총 {insights.length}개의 전문 지식이 준비되어 있습니다.
            </p>
            {insights.map((insight, index) => (
              <button 
                key={`${insight.id}-${index}`}
                onClick={() => {
                  setIsSeeAllOpen(false);
                  onOpenStory(index);
                }}
                className="w-full flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-[32px] shadow-sm active:scale-[0.98] transition-all hover:shadow-premium group"
              >
                <div className={twMerge("w-14 h-14 rounded-2xl flex items-center justify-center text-[24px] shrink-0", insight.color)}>
                  {typeof insight.icon === 'string' ? insight.icon : insight.icon}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <span className="text-[11px] font-black text-brand-500 uppercase tracking-widest">{insight.title}</span>
                  <h4 className="text-[16px] font-bold text-text-main truncate group-hover:text-brand-600 transition-colors">
                    {insight.label}
                  </h4>
                  <p className="text-[13px] font-medium text-text-muted mt-1 truncate">
                    {insight.content.description}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors">
                  <HugeiconsIcon icon={ArrowRight01Icon} size={20} strokeWidth={3} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 로컬 오버레이 렌더링 제거 (App.tsx로 이동함) */}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; unit: string; icon: React.ReactNode; bgColor: string }> = ({ label, value, unit, icon, bgColor }) => (
  <div className={twMerge("flex flex-col p-5 rounded-4xl border border-white shadow-soft transition-all hover:shadow-premium duration-300", bgColor)}>
    <div className="flex items-center gap-2 mb-3">
      <div className="p-2 rounded-xl bg-white/80 shadow-sm">
        {icon}
      </div>
      <span className="text-[14px] font-bold text-text-sub">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-[28px] font-black text-text-main leading-none">{value}</span>
      <span className="text-[14px] font-bold text-text-muted">{unit}</span>
    </div>
  </div>
);

export default Dashboard;
