import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  ArrowLeft01Icon, 
  ArrowRight01Icon, 
  Calculator01Icon, 
  FloppyDiskIcon, 
  InformationCircleIcon, 
  Alert01Icon,
  CheckmarkBadge01Icon,
  ZapIcon,
  Cancel01Icon
} from '@hugeicons/core-free-icons';
import { useEffect } from 'react';
import { FoodSearch } from './FoodSearch';
import { useInsulinCalc } from '../../hooks/useInsulinCalc';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useAIStore } from '../../store/useAIStore';
import { useUserStore } from '../../store/useUserStore';
import { getGeminiService } from '../../services/geminiService';
import { Food, LogEntry } from '../../types';
import { twMerge } from 'tailwind-merge';
import { useAuthStore } from '../../store/useAuthStore';

interface SelectedFood extends Food {
  count: number;
}

interface CalculatorProps {
  onClose?: () => void;
  onTabChange?: (tab: string) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ onClose, onTabChange }) => {
  useEffect(() => {
    // 오버레이 열릴 때 스크롤 차단
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  const [step, setStep] = useState(1);
  const [bgInput, setBgInput] = useState('');
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
  const [memo, setMemo] = useState('');
  const [lastSavedLog, setLastSavedLog] = useState<LogEntry | null>(null);

  const { addLog, logs } = useHistoryStore();
  const { setInsights, setGenerating } = useAIStore();
  const { settings } = useUserStore();
  const { user } = useAuthStore();

  const totalCarbs = useMemo(() => {
    return selectedFoods.reduce((acc, food) => acc + food.carbPer * food.count, 0);
  }, [selectedFoods]);

  const currentBG = parseInt(bgInput) || 0;
  const { mealInsulin, corrInsulin, totalInsulin, currentIOB } = useInsulinCalc(currentBG, totalCarbs);

  const handleNext = () => setStep((s) => Math.min(3, s + 1));
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const triggerAIRefresh = async (newLog: LogEntry) => {
    const service = getGeminiService();
    if (!service) return;

    setGenerating(true);
    try {
      // 방금 추가된 로그를 포함하여 새로운 인사이트 생성
      const newInsights = await service.generateDailyInsights([newLog, ...logs], settings);
      setInsights(newInsights);
    } catch (error) {
      console.error("AI Refresh Error:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = () => {
    // 임시 familyId (실제 서비스에서는 user 가입 시 부여됨)
    const familyId = user ? `fam_${user.uid}` : undefined;

    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      currentBG,
      totalCarbs,
      mealInsulin,
      corrInsulin,
      totalInsulin,
      iobAtTime: currentIOB,
      foods: selectedFoods.map(f => ({ foodId: f.id, amount: f.count })),
      isEaten: true,
      memo,
      author: user ? {
        uid: user.uid,
        displayName: user.displayName || '익명',
        photoURL: user.photoURL || ''
      } : undefined
    };

    addLog(newLog, familyId);
    setLastSavedLog(newLog); // 결과 페이지에서 보여줄 정보 저장
    triggerAIRefresh(newLog); // 비동기 AI 갱신 시작 (인자 추가)

    setStep(4); // 결과 페이지로 이동 (더 이상 초기화하지 않음)
  };

  const handleReset = () => {
    setStep(1);
    setBgInput('');
    setSelectedFoods([]);
    setMemo('');
    setLastSavedLog(null);
  };

  const handleKeypadClick = (val: string) => {
    if (val === 'delete') {
      setBgInput((prev) => prev.slice(0, -1));
    } else if (bgInput.length < 3) {
      setBgInput((prev) => prev + val);
    }
  };

  const steps = [
    { id: 1, title: '혈당 체크' },
    { id: 2, title: '탄수화물 계산' },
    { id: 3, title: '투여량 확인' },
    { id: 4, title: '기록 완료' },
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col overflow-hidden shadow-2xl border-x border-slate-50 h-[100dvh] w-full max-w-[500px] mx-auto">
      {/* 헤더 / 상단 단계 표시 - flex-shrink-0으로 상단 고정, z-50으로 최상위 보장 */}
      <div className="px-6 pt-4 pb-4 bg-white z-50 flex flex-col shrink-0 border-b border-slate-50 relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h1 className="text-[22px] font-black text-text-main tracking-tight flex items-center gap-2">
              <span className="w-2 h-6 bg-brand-500 rounded-full"></span>
              {steps.find(s => s.id === step)?.title}
            </h1>
            <span className="text-[12px] font-bold text-text-muted mt-0.5">인슐린 계산기</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100/50 p-1.5 rounded-full px-3">
              {steps.map((s) => (
                <div
                  key={s.id}
                  className={twMerge(
                    "h-1.5 rounded-full transition-all duration-500",
                    step === s.id ? "bg-brand-500 w-4" : (step > s.id ? "bg-brand-200 w-1.5" : "bg-slate-200 w-1.5")
                  )}
                />
              ))}
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-slate-50 rounded-2xl active:scale-90 transition-all"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={24} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* 단계별 UI - 스크롤 가능 영역 */}
      <div className="flex-1 overflow-y-auto px-6 pb-40 relative">
        {step === 1 && (
          <div className="flex-1 flex flex-col transition-all duration-500">
            <div className="text-center mb-10 mt-6 bg-white py-10 rounded-5xl border border-slate-50 shadow-soft relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 opacity-50 blur-2xl"></div>
              <label className="text-text-sub font-bold mb-4 block text-[15px]">현재 측정된 혈당 수치</label>
              <div className="flex items-baseline justify-center gap-2">
                <div className="text-[72px] font-black text-brand-500 tracking-tighter leading-none min-w-[100px]">
                  {bgInput || <span className="text-slate-100">0</span>}
                </div>
                <span className="text-[20px] font-bold text-text-muted">mg/dL</span>
              </div>
            </div>

            {/* 숫자 키패드 */}
            <div className="grid grid-cols-3 gap-4 flex-1 max-h-[420px]">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'].map((key, i) => (
                <button
                  key={i}
                  disabled={key === ''}
                  onClick={() => handleKeypadClick(key)}
                  className={twMerge(
                    "h-[72px] rounded-3xl text-2xl font-black transition-all active:scale-90 border",
                    key === '' ? "invisible" : "bg-white text-text-main border-slate-50 shadow-soft hover:shadow-premium hover:border-brand-100",
                    key === 'delete' ? "text-brand-500 bg-brand-50 border-brand-100" : ""
                  )}
                >
                  {key === 'delete' ? '←' : key}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="transition-all duration-500 -mx-6 overflow-visible">
            <div className="px-6 mb-6">
              <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-6 rounded-4xl shadow-brand-500/20 shadow-xl flex justify-between items-center text-white relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full -mb-8 -mr-8 blur-xl"></div>
                <div className="relative z-10">
                  <div className="text-[12px] font-bold opacity-80 mb-1">현재 혈당</div>
                  <div className="text-[22px] font-black">{currentBG} <span className="text-[14px]">mg/dL</span></div>
                </div>
                <div className="text-right relative z-10">
                  <div className="text-[12px] font-bold opacity-80 mb-1">총 탄수화물</div>
                  <div className="text-[28px] font-black leading-none">{totalCarbs.toFixed(1)} <span className="text-[16px]">g</span></div>
                </div>
              </div>
            </div>
            
            
            <FoodSearch selectedFoods={selectedFoods} onFoodsChange={setSelectedFoods} />
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col transition-all duration-500">
            <div className="bg-white rounded-5xl p-10 shadow-premium border border-slate-50 mb-8 flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 to-brand-600"></div>
              <div className="text-text-sub font-bold text-[15px] mb-4">권장 인슐린 투여량</div>
              <div className="flex items-baseline justify-center gap-1 mb-8">
                <div className="text-[80px] font-black text-brand-500 tracking-tighter leading-none transition-all pulse-animation">
                  {totalInsulin.toFixed(1)}
                </div>
                <span className="text-[24px] font-black text-brand-300">u</span>
              </div>

              <div className="w-full space-y-5 border-t border-slate-50 pt-8">
                <DetailRow
                  label="식사 인슐린"
                  value={mealInsulin.toFixed(1)}
                  unit="u"
                  color="bg-brand-400"
                />
                <DetailRow
                  label="교정 인슐린"
                  value={corrInsulin.toFixed(1)}
                  unit="u"
                  color="bg-warm-400"
                />
                <div className="flex justify-between items-center bg-soft-blue/50 p-4 rounded-3xl border border-brand-50">
                  <div className="flex items-center gap-2 text-brand-600 text-[14px] font-black">
                    <HugeiconsIcon icon={InformationCircleIcon} size={18} strokeWidth={2.5} />
                    잔류 인슐린(IOB) 반영
                  </div>
                  <div className="font-black text-brand-600 text-[16px]">-{currentIOB.toFixed(1)} <span className="text-[12px]">u</span></div>
                </div>
              </div>
            </div>

            {currentBG < 70 && (
              <div className="bg-warm-50 border border-warm-100 p-5 rounded-4xl flex items-start gap-4 mb-8 shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-warm-100 flex items-center justify-center shrink-0">
                  <HugeiconsIcon icon={Alert01Icon} className="text-warm-600" size={20} strokeWidth={3} />
                </div>
                <div>
                  <div className="font-black text-warm-800 text-[15px] mb-0.5">저혈당 경보 🚨</div>
                  <div className="text-warm-600 text-[13px] font-bold leading-relaxed">
                    수치가 많이 낮아요. 투여 전 사탕이나 주스를 먼저 챙겨드시는 건 어떨까요?
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <HugeiconsIcon icon={CheckmarkBadge01Icon} size={18} className="text-brand-500" />
                <span className="text-text-sub font-black text-[14px]">관리에 참고할 메모</span>
              </div>
              <textarea
                className="w-full bg-white border border-slate-100 rounded-3xl p-5 focus:ring-4 focus:ring-brand-50 focus:border-brand-200 outline-none transition-all shadow-soft text-[15px] font-medium"
                rows={3}
                placeholder="오늘 식사는 어떠셨나요? 특별한 점이 있다면 기록해 주세요."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 4 && lastSavedLog && (
          <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-700">
            <div className="flex flex-col items-center text-center mt-4 mb-10">
              <div className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-brand-500/20 pulse-animation">
                <HugeiconsIcon icon={CheckmarkBadge01Icon} size={40} color="white" strokeWidth={3} />
              </div>
              <h2 className="text-[28px] font-black text-text-main leading-tight mb-2">
                기록이 안전하게 <br /> 우주로 전송되었습니다!
              </h2>
              <p className="text-text-muted font-bold text-[14px]">
                우주 여행의 소중한 연료가 되었어요 🚀
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-10">
              <ResultMiniCard label="현재 혈당" value={lastSavedLog.currentBG} unit="mg/dL" />
              <ResultMiniCard label="탄수화물" value={lastSavedLog.totalCarbs.toFixed(1)} unit="g" />
              <ResultMiniCard label="투여 용량" value={lastSavedLog.totalInsulin.toFixed(1)} unit="u" isAccent />
            </div>

            <div className="bg-slate-50 rounded-4xl p-6 border border-slate-100 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center">
                  <HugeiconsIcon icon={ZapIcon} size={16} color="white" />
                </div>
                <h4 className="font-black text-[15px] text-brand-600">AI 코칭 메시지</h4>
              </div>
              
              {useAIStore.getState().isGenerating ? (
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded-full w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded-full w-full animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded-full w-1/2 animate-pulse"></div>
                </div>
              ) : (
                <p className="text-[14px] font-bold text-text-main leading-relaxed">
                  {useAIStore.getState().insights[0]?.content.description || "데이터를 분석하여 더 나은 관리를 도와드릴게요."}
                </p>
              )}
            </div>
            
            <div className="mt-auto pt-10 space-y-4">
              <button
                onClick={() => onTabChange?.('home')}
                className="w-full bg-brand-500 text-white font-black py-5 rounded-3xl shadow-lg shadow-brand-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                대시보드로 돌아가기
              </button>
              <button
                onClick={handleReset}
                className="w-full bg-white border border-slate-100 text-text-muted font-black py-4 rounded-3xl active:scale-95 transition-all text-[14px]"
              >
                한 번 더 기록하기
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 하단 네비게이션 버튼 (플로팅 스타일) - Step 4 미노출 */}
      {step < 4 && (
        <div 
          className="absolute bottom-0 left-0 right-0 px-6 pb-10 pt-6 bg-gradient-to-t from-white via-white/95 to-transparent z-50"
        >
          <div className="flex gap-4">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 bg-white border border-slate-100 text-text-main font-black py-5 rounded-3xl shadow-soft active:scale-90 transition-all flex items-center justify-center gap-2"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={20} strokeWidth={2.5} />
                이전
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={step === 1 && !bgInput}
                className={twMerge(
                  "flex-[2.5] py-5 rounded-3xl font-black text-white transition-all active:scale-90 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20",
                  step === 1 && !bgInput ? "bg-slate-200 shadow-none cursor-not-allowed" : "bg-brand-500 hover:bg-brand-600"
                )}
              >
                {step === 2 ? '결과 확인하기' : '다음 단계로'}
                <HugeiconsIcon icon={ArrowRight01Icon} size={20} strokeWidth={2.5} />
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="flex-[2.5] bg-brand-500 text-white font-black py-5 rounded-3xl shadow-lg shadow-brand-500/25 active:scale-90 transition-all flex items-center justify-center gap-2 hover:bg-brand-600"
              >
                <HugeiconsIcon icon={FloppyDiskIcon} size={20} strokeWidth={2.5} />
                이대로 저장할게요
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ResultMiniCard: React.FC<{ label: string; value: string | number; unit: string, isAccent?: boolean }> = ({ label, value, unit, isAccent }) => (
  <div className={twMerge(
    "flex flex-col items-center p-3 rounded-2xl border",
    isAccent ? "bg-brand-50 border-brand-100" : "bg-white border-slate-100 shadow-sm"
  )}>
    <span className="text-[10px] font-bold text-text-muted mb-1">{label}</span>
    <div className="flex items-baseline gap-0.5">
      <span className={twMerge("text-[16px] font-black", isAccent ? "text-brand-500" : "text-text-main")}>{value}</span>
      <span className="text-[10px] font-bold text-text-muted">{unit}</span>
    </div>
  </div>
);

const DetailRow: React.FC<{ label: string; value: string; unit: string; color: string }> = ({ label, value, unit, color }) => (
  <div className="flex justify-between items-center group">
    <div className="flex items-center gap-3">
      <div className={twMerge("w-1.5 h-6 rounded-full transition-all group-hover:h-8", color)} />
      <span className="text-[15px] font-bold text-text-sub">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-[20px] font-black text-text-main">{value}</span>
      <span className="text-[13px] font-bold text-text-muted">{unit}</span>
    </div>
  </div>
);
