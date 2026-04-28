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
import { AIAnalysisOverlay } from './AIAnalysisOverlay';
import { ManualFoodEntry } from './ManualFoodEntry';
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
  const [showAI, setShowAI] = useState(false);
  const [showManual, setShowManual] = useState(false);

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
    <div className="fixed inset-0 z-[9999] bg-slate-50/80 backdrop-blur-xl flex flex-col overflow-hidden shadow-2xl h-[100dvh] w-full max-w-[500px] mx-auto border-x border-white/20">
      {/* 헤더 / 상단 단계 표시 - 높이 축소 */}
    <div className="px-4 pt-4 pb-3 glass-morphism z-50 flex flex-col shrink-0 border-b border-gray-100/50 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <h1 className="text-[18px] font-black text-text-main tracking-tight flex items-center gap-2">
              <span className="w-1 h-5 bg-brand-500 rounded-full shadow-lg shadow-brand-500/30"></span>
              {steps.find(s => s.id === step)?.title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100/50 p-1.5 rounded-xl px-3 border border-white/40">
              {steps.map((s) => (
                <div
                  key={s.id}
                  className={twMerge(
                    "h-1.5 rounded-full transition-all duration-700",
                    step === s.id ? "bg-brand-500 w-4 shadow-md shadow-brand-500/20" : (step > s.id ? "bg-brand-200 w-1.5" : "bg-gray-200 w-1.5")
                  )}
                />
              ))}
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-text-main bg-white border border-gray-100 rounded-xl active:scale-90 transition-all shadow-sm"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* 단계별 UI - 메인 영역 */}
      <div className="flex-1 px-4 pb-[92px] relative overflow-hidden">
        {step === 1 && (
          <div className="h-full flex flex-col transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
            {/* 혈당 수치 카드 - 상단 여백 12px(mt-3), 남은 높이 전체 채우기(flex-1) */}
            <div className="flex-1 flex flex-col justify-center text-center bg-white mt-3 rounded-xl border border-gray-100 shadow-premium relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-full -mr-12 -mt-12 opacity-30 blur-2xl"></div>
              <label className="text-text-sub font-black mb-1 block text-[12px] uppercase tracking-wider opacity-60">현재 혈당 수치</label>
              <div className="flex items-baseline justify-center gap-2">
                <div className="text-[60px] font-black text-brand-500 tracking-tighter leading-none">
                  {bgInput || <span className="text-gray-100">0</span>}
                </div>
                <span className="text-[18px] font-black text-text-muted">mg/dL</span>
              </div>
            </div>

            {/* 숫자 키패드 - 간격 8px(gap-2), 고정 높이, 하단 12px 여백 */}
            <div className="grid grid-cols-3 gap-2 w-full mt-4 mb-3 shrink-0">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'].map((key, i) => (
                <button
                  key={i}
                  disabled={key === ''}
                  onClick={() => handleKeypadClick(key)}
                  className={twMerge(
                    "w-full h-[64px] flex items-center justify-center rounded-lg text-2xl font-black transition-all active:scale-95 border",
                    key === '' ? "invisible" : "bg-white text-text-main border-slate-100 shadow-sm hover:border-brand-200",
                    key === 'delete' ? "text-brand-500 bg-brand-50 border-brand-100 shadow-brand-500/5" : ""
                  )}
                >
                  {key === 'delete' ? <HugeiconsIcon icon={ArrowLeft01Icon} size={24} strokeWidth={3} /> : key}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="h-full flex flex-col transition-all duration-500 animate-in fade-in -mx-4">
            <div className="px-4 mb-6 pt-4 shrink-0">
              <div className="bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 p-8 rounded-[36px] shadow-xl shadow-brand-500/30 flex justify-between items-center text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform duration-1000"></div>
                
                <div className="relative z-10">
                  <div className="text-[11px] font-black opacity-70 mb-1.5 tracking-widest uppercase">Current BG</div>
                  <div className="text-[28px] font-black">{currentBG} <span className="text-[13px] opacity-80">mg/dL</span></div>
                </div>
                
                <div className="h-10 w-[1px] bg-white/20"></div>

                <div className="text-right relative z-10">
                  <div className="text-[11px] font-black opacity-70 mb-1.5 tracking-widest uppercase">Carbs Total</div>
                  <div className="text-[32px] font-black leading-none">{totalCarbs.toFixed(1)} <span className="text-[14px] opacity-80">g</span></div>
                </div>
              </div>
            </div>
            
            {/* 탄수화물 리스트는 항상 스크롤 허용 */}
            <div className="flex-1 overflow-y-auto px-4 no-scrollbar pb-6">
              <FoodSearch 
                selectedFoods={selectedFoods} 
                onFoodsChange={setSelectedFoods} 
                onOpenAI={() => setShowAI(true)}
                onOpenManual={() => setShowManual(true)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white rounded-[40px] p-10 shadow-premium border border-gray-100 mb-8 flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-500 to-soft-blue"></div>
              <div className="text-text-sub font-black text-[15px] mb-6 tracking-tight">권장 인슐린 투여량</div>
              <div className="flex items-baseline justify-center gap-1.5 mb-10">
                <div className="text-[80px] font-black text-brand-500 tracking-tighter leading-none animate-in zoom-in duration-700">
                  {totalInsulin.toFixed(1)}
                </div>
                <span className="text-[24px] font-black text-brand-300">u</span>
              </div>

              <div className="w-full space-y-6 border-t border-slate-50 pt-10">
                <DetailRow
                  label="식사 인슐린"
                  value={mealInsulin.toFixed(1)}
                  unit="u"
                  color="bg-brand-500"
                />
                <DetailRow
                  label="교정 인슐린"
                  value={corrInsulin.toFixed(1)}
                  unit="u"
                  color="bg-warm-500"
                />
                <div className="flex justify-between items-center bg-slate-50/80 backdrop-blur-sm p-5 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-3 text-text-sub text-[13px] font-black">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <HugeiconsIcon icon={InformationCircleIcon} size={16} className="text-brand-500" strokeWidth={2.5} />
                    </div>
                    잔류 인슐린(IOB) 반영
                  </div>
                  <div className="font-black text-text-main text-[16px]">-{currentIOB.toFixed(1)} <span className="text-[12px] opacity-60">u</span></div>
                </div>
              </div>
            </div>

            {currentBG < 70 && (
              <div className="bg-warm-50 border border-warm-100 p-5 rounded-3xl flex items-start gap-4 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-warm-100 flex items-center justify-center shrink-0">
                  <HugeiconsIcon icon={Alert01Icon} className="text-warm-600" size={20} strokeWidth={3} />
                </div>
                <div>
                  <div className="font-black text-warm-800 text-[14px] mb-0.5">저혈당 주의 🚨</div>
                  <div className="text-warm-600 text-[12px] font-bold leading-relaxed">
                    수치가 낮습니다. 투여 전 저혈당 간식을 챙겨드세요.
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 pb-20">
              <div className="flex items-center gap-2 px-1">
                <HugeiconsIcon icon={CheckmarkBadge01Icon} size={16} className="text-brand-500" />
                <span className="text-text-sub font-black text-[14px]">참고 메모</span>
              </div>
              <textarea
                className="w-full bg-white border border-gray-100 rounded-[32px] p-6 focus:ring-4 focus:ring-brand-50 focus:border-brand-500 outline-none transition-all shadow-premium text-[14px] font-bold min-h-[120px]"
                placeholder="식사 종류나 컨디션 등 기록하고 싶은 내용을 적어주세요."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 4 && lastSavedLog && (
          <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-700">
            <div className="flex flex-col items-center text-center mt-4 mb-10">
              <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center mb-6 shadow-md">
                <HugeiconsIcon icon={CheckmarkBadge01Icon} size={32} color="white" strokeWidth={3} />
              </div>
              <h2 className="text-[24px] font-bold text-text-main leading-tight mb-2">
                기록이 완료되었습니다!
              </h2>
              <p className="text-text-muted font-bold text-[13px]">
                데이터가 안전하게 저장되었어요 🚀
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-10">
              <ResultMiniCard label="현재 혈당" value={lastSavedLog.currentBG} unit="mg/dL" />
              <ResultMiniCard label="탄수화물" value={lastSavedLog.totalCarbs.toFixed(1)} unit="g" />
              <ResultMiniCard label="투여 용량" value={lastSavedLog.totalInsulin.toFixed(1)} unit="u" isAccent />
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center">
                  <HugeiconsIcon icon={ZapIcon} size={14} color="white" />
                </div>
                <h4 className="font-bold text-[14px] text-brand-600">AI 코어 브리핑</h4>
              </div>
              
              {useAIStore.getState().isGenerating ? (
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded-full w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded-full w-full animate-pulse"></div>
                </div>
              ) : (
                <p className="text-[13px] font-medium text-text-main leading-relaxed">
                  {useAIStore.getState().insights[0]?.content.description || "데이터를 분석하여 더 나은 관리를 도와드릴게요."}
                </p>
              )}
            </div>
            
            <div className="mt-auto pt-10 space-y-3">
              <button
                onClick={() => onTabChange?.('home')}
                className="lds-button-primary w-full"
              >
                대시보드로 돌아가기
              </button>
              <button
                onClick={handleReset}
                className="lds-button-secondary w-full text-[13px]"
              >
                한 번 더 기록하기
              </button>
            </div>
          </div>
        )}
      </div>

      {showAI && (
        <AIAnalysisOverlay 
          onClose={() => setShowAI(false)} 
          onAddFoods={(foods) => setSelectedFoods(prev => [...prev, ...foods.map(f => ({ ...f, count: 1 }))])}
        />
      )}

      {showManual && (
        <ManualFoodEntry 
          onClose={() => setShowManual(false)} 
          onAdd={(food) => setSelectedFoods(prev => [...prev, { ...food, count: 1 }])}
        />
      )}

      {step < 4 && (
        <div 
          className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-4 bg-gradient-to-t from-white via-white to-transparent z-50"
        >
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 lds-button-secondary py-3.5 flex items-center justify-center gap-2"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={18} strokeWidth={2.5} />
                이전
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={step === 1 && !bgInput}
                className={twMerge(
                  "flex-[2.5] lds-button-primary py-3.5 flex items-center justify-center gap-2",
                  step === 1 && !bgInput ? "bg-gray-200 shadow-none cursor-not-allowed" : ""
                )}
              >
                {step === 2 ? '결과 확인' : '다음'}
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={2.5} />
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="flex-[2.5] lds-button-primary py-3.5 flex items-center justify-center gap-2"
              >
                <HugeiconsIcon icon={FloppyDiskIcon} size={18} strokeWidth={2.5} />
                기록 저장
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
    "flex flex-col items-center p-3 rounded-md border",
    isAccent ? "bg-brand-50 border-brand-100" : "bg-white border-gray-100 shadow-sm"
  )}>
    <span className="text-[10px] font-bold text-text-muted mb-1">{label}</span>
    <div className="flex items-baseline gap-0.5">
      <span className={twMerge("text-[15px] font-bold", isAccent ? "text-brand-500" : "text-text-main")}>{value}</span>
      <span className="text-[10px] font-bold text-text-muted">{unit}</span>
    </div>
  </div>
);

const DetailRow: React.FC<{ label: string; value: string; unit: string; color: string }> = ({ label, value, unit, color }) => (
  <div className="flex justify-between items-center group">
    <div className="flex items-center gap-3">
      <div className={twMerge("w-1 h-5 rounded-full", color)} />
      <span className="text-[14px] font-bold text-text-sub">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-[18px] font-bold text-text-main">{value}</span>
      <span className="text-[12px] font-bold text-text-muted">{unit}</span>
    </div>
  </div>
);
