import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Cancel01Icon, 
  Camera01Icon, 
  CheckmarkBadge01Icon,
  AiChat02Icon,
  ZapIcon,
  PlusSignIcon,
  MinusSignIcon,
  InformationCircleIcon
} from '@hugeicons/core-free-icons';
import { Food } from '../../types';
import { twMerge } from 'tailwind-merge';

interface AIAnalysisOverlayProps {
  onClose: () => void;
  onAddFoods: (foods: Food[]) => void;
}

type Step = 'capture' | 'processing' | 'review';

export const AIAnalysisOverlay: React.FC<AIAnalysisOverlayProps> = ({ onClose, onAddFoods }) => {
  const [step, setStep] = useState<Step>('capture');
  const [detectedItems, setDetectedItems] = useState([
    { id: '1', name: '현미밥', amount: 150, unit: 'g', carbs: 45, icon: '🍚' },
    { id: '2', name: '닭가슴살 샐러드', amount: 200, unit: 'g', carbs: 8, icon: '🥗' },
    { id: '3', name: '오리엔탈 드레싱', amount: 30, unit: 'g', carbs: 5, icon: '🍯' },
  ]);

  const totalCarbs = detectedItems.reduce((acc, item) => acc + item.carbs, 0);

  const startAnalysis = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('review');
    }, 2500);
  };

  const handleUpdateAmount = (id: string, delta: number) => {
    setDetectedItems(prev => prev.map(item => {
      if (item.id === id) {
        const newAmount = Math.max(10, item.amount + delta);
        const ratio = newAmount / item.amount;
        return { ...item, amount: newAmount, carbs: Math.round(item.carbs * ratio) };
      }
      return item;
    }));
  };

  const handleComplete = () => {
    const newFoods: Food[] = detectedItems.map(item => ({
      id: `ai_${Date.now()}_${item.id}`,
      name: item.name,
      emoji: item.icon,
      carbPer: item.carbs,
      baseAmount: 1,
      unit: '인분',
      cat: 'ai',
      note: `AI 분석 결과 (${item.amount}${item.unit})`
    }));
    onAddFoods(newFoods);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black flex flex-col">
      {/* 상단 헤더 */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between text-white bg-gradient-to-b from-black/50 to-transparent absolute top-0 left-0 right-0 z-50">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
          <HugeiconsIcon icon={Cancel01Icon} size={24} />
        </button>
        <h2 className="text-[17px] font-black tracking-tight">AI 식단 분석</h2>
        <div className="w-10"></div>
      </div>

      {step === 'capture' && (
        <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-900">
          {/* 카메라 프리뷰 가상 영역 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white/30 rounded-4xl flex flex-col items-center justify-center gap-4">
              <HugeiconsIcon icon={Camera01Icon} size={48} className="text-white/20" />
              <p className="text-white/40 font-bold text-[13px]">음식을 화면 중앙에 맞춰주세요</p>
            </div>
          </div>

          <div className="mt-auto p-12 flex flex-col items-center gap-8 bg-gradient-to-t from-black to-transparent">
            <p className="text-white/80 text-center font-bold text-[14px] leading-relaxed">
              사진을 찍으면 AI가 자동으로 <br /> 재료와 탄수화물량을 계산해 드려요
            </p>
            <button 
              onClick={startAnalysis}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-2xl shadow-white/20"
            >
              <div className="w-16 h-16 border-4 border-slate-900 rounded-full"></div>
            </button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="flex-1 flex flex-col items-center justify-center bg-white p-12 text-center">
          <div className="relative mb-10">
            <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center animate-pulse">
              <HugeiconsIcon icon={ZapIcon} size={40} className="text-brand-500" />
            </div>
            <div className="absolute inset-0 border-4 border-brand-500/20 rounded-full border-t-brand-500 animate-spin"></div>
          </div>
          <h3 className="text-[22px] font-black text-text-main mb-3">AI 분석 중...</h3>
          <p className="text-text-muted font-bold text-[14px] leading-relaxed">
            사진 속 재료들을 꼼꼼하게 확인하고 있어요 <br />
            잠시만 기다려 주세요!
          </p>
        </div>
      )}

      {step === 'review' && (
        <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden animate-in fade-in duration-500">
          <div className="bg-brand-500 p-8 pt-20 rounded-b-[40px] shadow-lg text-white">
            <div className="flex items-center gap-2 mb-2 opacity-80">
              <HugeiconsIcon icon={AiChat02Icon} size={16} />
              <span className="text-[12px] font-black">AI 분석 결과</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] font-black">{totalCarbs}</span>
              <span className="text-[16px] font-black opacity-80">g 탄수화물 감지됨</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-soft space-y-5">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-[15px] font-black text-text-main">분석된 재료 목록</h4>
                <div className="text-[11px] font-bold text-brand-500 bg-brand-50 px-2 py-1 rounded-md">수정 가능</div>
              </div>

              {detectedItems.map(item => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-4">
                    <span className="text-[24px]">{item.icon}</span>
                    <div>
                      <div className="text-[14px] font-black text-text-main">{item.name}</div>
                      <div className="text-[11px] font-bold text-text-muted">{item.amount}{item.unit} · {item.carbs}g</div>
                    </div>
                  </div>
                  <div className="flex items-center bg-slate-50 rounded-xl p-1 gap-3">
                    <button onClick={() => handleUpdateAmount(item.id, -10)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-text-sub shadow-sm">
                      <HugeiconsIcon icon={MinusSignIcon} size={14} strokeWidth={3} />
                    </button>
                    <span className="text-[13px] font-black w-8 text-center">{item.amount}</span>
                    <button onClick={() => handleUpdateAmount(item.id, 10)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-brand-500 shadow-sm">
                      <HugeiconsIcon icon={PlusSignIcon} size={14} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}

              <button className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[13px] font-bold text-text-muted flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                <HugeiconsIcon icon={PlusSignIcon} size={16} />
                AI가 놓친 재료 직접 추가하기
              </button>
            </div>

            <div className="bg-warm-50 p-5 rounded-2xl border border-warm-100 flex items-start gap-4">
              <HugeiconsIcon icon={InformationCircleIcon} className="text-warm-500 mt-0.5" size={20} />
              <div className="space-y-1">
                <p className="text-[13px] font-black text-warm-700">팁: 숨겨진 당분을 확인하세요</p>
                <p className="text-[11px] font-medium text-warm-600 leading-relaxed">
                  소스가 듬뿍 들어간 요리는 사진으로 보이는 것보다 설탕이나 올리고당이 더 많을 수 있어요.
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white border-t border-slate-100">
            <button 
              onClick={handleComplete}
              className="w-full py-5 bg-brand-500 text-white rounded-2xl text-[16px] font-black shadow-xl shadow-brand-500/20 active:scale-95 transition-all"
            >
              식사 구성에 반영하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
