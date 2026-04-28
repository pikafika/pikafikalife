import React, { useMemo, useState, useEffect } from 'react';
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
  ArrowUp01Icon,
  Alert01Icon
} from '@hugeicons/core-free-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { SeedingCard } from '../../components/SeedingCard';
import { twMerge } from 'tailwind-merge';
import { isAdmin } from '../../utils/permissions';
import { useCloudSync } from '../../hooks/useCloudSync';

interface DashboardProps {
  onOpenAIReport: () => void;
  onOpenStory: (index: number) => void;
  onOpenInsightHub: () => void;
  onOpenFamilyMgmt: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  onOpenAIReport, 
  onOpenStory, 
  onOpenInsightHub,
  onOpenFamilyMgmt 
}) => {
  useCloudSync(); // 로그인 시 데이터 동기화 시작
  
  const { logs } = useHistoryStore();
  const { insights } = useAIStore();
  const { user } = useAuthStore();
  
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
        <div className="flex items-center justify-between mb-6 pt-4">
          <div>
            <h2 className="text-[22px] font-bold text-text-main leading-tight tracking-tight">
              {user ? (
                <>안녕하세요! <br /> <span className="text-brand-500">{user?.displayName || '사용자'}</span>님</>
              ) : (
                <>피카피카 라이프에 <br /> 오신 것을 환영해요</>
              )}
            </h2>
            <span className="text-[13px] text-text-muted font-medium mt-1.5 block">
              {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
            </span>
          </div>
        </div>

        {/* 가족 공유 안내 */}
        {user && (
          <div 
            onClick={onOpenFamilyMgmt}
            className="mb-6 p-4 bg-white rounded-md border border-gray-100 flex items-center justify-between group cursor-pointer hover:bg-gray-50 transition-all shadow-lds"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-brand-50 flex items-center justify-center">
                <span className="text-[18px]">🏠</span>
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-text-main">우리 가족 공유 중</h4>
                <p className="text-[11px] font-medium text-text-sub">기록 {logs.length}개 공유됨</p>
              </div>
            </div>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="text-gray-300" strokeWidth={3} />
          </div>
        )}

        <div className="bg-white rounded-lg p-8 shadow-lds border border-gray-100 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-500"></div>
          <span className="text-[14px] font-bold text-text-sub mb-3">현재 혈당 수치</span>
          <div className="flex items-center justify-center space-x-1 mb-6">
            <span className="text-[56px] font-bold text-text-main tracking-tighter leading-none">{lastBG || '--'}</span>
            <span className="text-[16px] font-bold text-text-muted self-end mb-2">mg/dL</span>
          </div>
          {lastBG ? (
            <BGStatusDetail 
              bg={lastBG} 
              isOpen={isBGExplanationOpen} 
              onToggle={() => setIsBGExplanationOpen(!isBGExplanationOpen)} 
            />
          ) : (
            <div className="px-4 py-1 rounded-full text-[12px] font-medium border bg-gray-50 text-gray-400 border-gray-100 italic">
              측정 기록이 없습니다
            </div>
          )}
        </div>
      </section>

      {/* 데일리 인사이트 (스토리 스타일) */}
      <DailyInsight onSelectStory={onOpenStory} onSeeAll={onOpenInsightHub} />

      {/* AI 데이터 리포트 스타일 코칭 */}
      <section className="px-2">
        <div className="bg-brand-50 rounded-lg p-6 border border-brand-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <HugeiconsIcon icon={AiChat01Icon} size={80} />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center">
              <HugeiconsIcon icon={CheckmarkBadge01Icon} size={14} color="white" strokeWidth={3} />
            </div>
            <h4 className="font-bold text-[14px] text-brand-600">AI 데이터 코칭</h4>
          </div>
          <div className="bg-white rounded-md p-5 border border-white/60 shadow-sm">
            <p className="text-[14px] leading-relaxed text-text-main font-bold">
              "{coachingMessage}"
            </p>
            <button 
              onClick={onOpenAIReport}
              className="flex items-center gap-1 text-[11px] font-bold text-brand-500 mt-4 ml-auto"
            >
              상세 리포트 보기
              <HugeiconsIcon icon={ArrowRight01Icon} size={12} strokeWidth={3} />
            </button>
          </div>
        </div>
      </section>

      {/* 게이미피케이션: 나의 우주 여행 */}
      <section className="px-2">
        <div className="bg-gray-900 rounded-lg p-8 relative overflow-hidden shadow-lds group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full text-[11px] font-bold">
                LEVEL 4
              </span>
              <span className="bg-brand-500/20 text-brand-400 border border-brand-500/30 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
                <HugeiconsIcon icon={ZapIcon} size={10} strokeWidth={3} />
                연속 {streakCount}일!
              </span>
            </div>

            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10 transition-all duration-700 relative">
              <span className="text-[40px]">🚀</span>
            </div>
            
            <h3 className="text-white text-[17px] font-bold mb-1">나의 관리 여정</h3>
            <p className="text-brand-300 text-[12px] font-medium mb-6">지구에서 달로 여행 중</p>
            
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-brand-500 w-[65%] rounded-full shadow-[0_0_10px_rgba(6,199,85,0.4)]"></div>
            </div>
            <div className="flex justify-between w-full text-[10px] font-bold text-white/40 px-1 mb-6">
              <span>지구</span>
              <span>달 (3일 남음)</span>
            </div>

            <div className="bg-white/5 px-4 py-3 rounded-md flex items-center gap-3 border border-white/10">
              <HugeiconsIcon icon={InformationCircleIcon} size={14} className="text-brand-400" />
              <p className="text-[11px] font-medium text-white/60 leading-tight">
                꾸준한 기록이 여행의 원동력이 됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 요약 통계 그리드 */}
      <section className="px-2">
        <h3 className="text-[16px] font-bold text-text-main mb-4 flex items-center gap-2">
          <HugeiconsIcon icon={ChartLineData01Icon} size={18} className="text-brand-500" />
          오늘의 건강 리포트
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <StatCard
            label="총 탄수화물"
            value={stats.totalCarbs}
            unit="g"
            icon={<HugeiconsIcon icon={DropletIcon} size={18} className="text-warm-500" />}
            bgColor="bg-gray-50"
          />
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="총 인슐린"
              value={stats.totalInsulin.toFixed(1)}
              unit="u"
              icon={<HugeiconsIcon icon={CheckmarkBadge01Icon} size={16} className="text-brand-500" />}
              bgColor="bg-gray-50"
            />
            <StatCard
              label="평균 혈당"
              value={stats.avgBG}
              unit="mg/dL"
              icon={<HugeiconsIcon icon={ZapIcon} size={16} className="text-brand-500" />}
              bgColor="bg-gray-50"
            />
          </div>
        </div>
      </section>

      {/* 추이 차트 */}
      <section className="bg-white rounded-lg p-6 shadow-lds border border-gray-100 mx-2 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[16px] font-bold text-text-main">혈당 변화 추이</h3>
          <span className="text-[10px] font-bold text-brand-500 border border-brand-200 px-2 py-0.5 rounded-sm">LIVE</span>
        </div>
        <TrendChart />
      </section>

      {/* 테스트용 데이터 생성 카드 */}
      {isAdmin(user) && <SeedingCard />}
    </div>
  );
};

// --- Sub Components ---

const BGStatusDetail: React.FC<{ bg: number; isOpen: boolean; onToggle: () => void }> = ({ bg, isOpen, onToggle }) => {
  const status = useMemo(() => {
    if (bg < 70) return { label: '저혈당', color: 'text-warm-500', bg: 'bg-warm-50', icon: Alert01Icon, desc: '혈당이 너무 낮습니다. 즉시 15g의 단순당(주스, 사탕 등)을 섭취하고 15분 뒤 재측정하세요.' };
    if (bg <= 140) return { label: '정상 혈당', color: 'text-brand-500', bg: 'bg-brand-50', icon: CheckmarkBadge01Icon, desc: '정상 범위 내의 안정적인 혈당입니다. 아주 훌륭한 관리 상태입니다!' };
    if (bg <= 180) return { label: '약간 높음', color: 'text-orange-500', bg: 'bg-orange-50', icon: InformationCircleIcon, desc: '혈당이 다소 높은 편입니다. 추가 간식 섭취를 자제하고 가벼운 활동을 추천합니다.' };
    return { label: '고혈당', color: 'text-red-500', bg: 'bg-red-50', icon: ArrowUp01Icon, desc: '고혈당 상태입니다. 충분한 수분을 섭취하고, 필요 시 교정 인슐린 투여를 고려하세요.' };
  }, [bg]);

  return (
    <div className="w-full mt-2">
      <button 
        onClick={onToggle}
        className={twMerge("w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all", status.bg, isOpen ? "border-current/20 shadow-sm" : "border-transparent")}
      >
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={status.icon} size={16} className={status.color} />
          <span className={twMerge("text-[13px] font-bold", status.color)}>{status.label}</span>
        </div>
        <HugeiconsIcon icon={isOpen ? ArrowUp01Icon : ArrowDown01Icon} size={14} className="text-gray-400" />
      </button>
      {isOpen && (
        <div className="mt-2 p-4 bg-white border border-gray-100 rounded-xl animate-in slide-in-from-top-2 duration-300">
          <p className="text-[12px] font-medium text-text-sub leading-relaxed text-left">
            {status.desc}
          </p>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; unit: string; icon: React.ReactNode; bgColor: string }> = ({ label, value, unit, icon, bgColor }) => (
  <div className={twMerge("flex flex-col p-5 rounded-lg border border-gray-100 shadow-sm transition-all hover:shadow-lds duration-300", bgColor)}>
    <div className="flex items-center gap-2 mb-3">
      <div className="p-2 rounded-md bg-white shadow-sm border border-gray-50 text-brand-500">
        {icon}
      </div>
      <span className="text-[13px] font-bold text-text-sub">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-[24px] font-bold text-text-main leading-none">{value}</span>
      <span className="text-[13px] font-bold text-text-muted">{unit}</span>
    </div>
  </div>
);

export default Dashboard;
