import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Cancel01Icon, 
  CheckmarkBadge01Icon, 
  PlusSignIcon,
  AiChat02Icon,
  ChefHatIcon,
  NoteIcon
} from '@hugeicons/core-free-icons';
import { Food } from '../../types';
import { twMerge } from 'tailwind-merge';

interface ManualFoodEntryProps {
  onClose: () => void;
  onAdd: (food: Food) => void;
}

export const ManualFoodEntry: React.FC<ManualFoodEntryProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [carbs, setCarbs] = useState('');
  const [memo, setMemo] = useState('');

  const handleAddIngredient = () => {
    if (currentIngredient.trim()) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient('');
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name || !carbs) return;

    const newFood: Food = {
      id: `manual_${Date.now()}`,
      name,
      emoji: '🍲',
      carbPer: parseFloat(carbs),
      baseAmount: 1,
      unit: '인분',
      cat: 'custom',
      note: ingredients.join(', ') + (memo ? ` (${memo})` : '')
    };

    onAdd(newFood);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-end justify-center">
      <div className="w-full max-w-[500px] bg-white rounded-t-[40px] p-8 animate-in slide-in-from-bottom duration-500 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <h2 className="text-[20px] font-black text-text-main flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
              직접 입력하기
            </h2>
            <p className="text-[12px] font-bold text-text-muted">상세한 정보를 입력해 더 정확하게 계산해요</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-text-muted">
            <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="space-y-8">
          {/* 음식 이름 */}
          <div className="space-y-3">
            <label className="text-[14px] font-black text-text-sub flex items-center gap-2 px-1">
              <HugeiconsIcon icon={ChefHatIcon} size={16} className="text-brand-500" />
              음식 이름
            </label>
            <input
              type="text"
              placeholder="예: 집밥 (된장찌개와 밥)"
              className="w-full bg-slate-50 rounded-2xl py-4 px-5 focus:outline-none focus:ring-4 focus:ring-brand-50 border border-slate-100 font-bold text-[15px]"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* 재료 정보 */}
          <div className="space-y-3">
            <label className="text-[14px] font-black text-text-sub flex items-center gap-2 px-1">
              <HugeiconsIcon icon={AiChat02Icon} size={16} className="text-brand-500" />
              포함된 재료
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="예: 현미밥 150g"
                className="flex-1 bg-slate-50 rounded-2xl py-4 px-5 focus:outline-none focus:ring-4 focus:ring-brand-50 border border-slate-100 font-bold text-[15px]"
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
              />
              <button 
                onClick={handleAddIngredient}
                className="bg-brand-500 text-white w-[56px] h-[56px] rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 active:scale-90 transition-transform"
              >
                <HugeiconsIcon icon={PlusSignIcon} size={24} strokeWidth={3} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="bg-brand-50 text-brand-600 px-4 py-2 rounded-xl text-[13px] font-black flex items-center gap-2 border border-brand-100 animate-in zoom-in duration-300">
                  {ing}
                  <button onClick={() => handleRemoveIngredient(i)}>
                    <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={3} />
                  </button>
                </div>
              ))}
              {ingredients.length === 0 && (
                <p className="text-[12px] text-text-muted px-1 font-medium">재료를 추가하면 더 정확한 AI 코칭을 받을 수 있어요.</p>
              )}
            </div>
          </div>

          {/* 탄수화물량 */}
          <div className="space-y-3">
            <div className="flex justify-between items-end px-1">
              <label className="text-[14px] font-black text-text-sub flex items-center gap-2">
                <HugeiconsIcon icon={CheckmarkBadge01Icon} size={16} className="text-brand-500" />
                예상 탄수화물 (당질)
              </label>
              <span className="text-[11px] font-black text-brand-500">직접 계산이 어려우면 대략적인 값을 넣어주세요</span>
            </div>
            <div className="relative">
              <input
                type="number"
                placeholder="0"
                className="w-full bg-slate-50 rounded-2xl py-4 px-5 focus:outline-none focus:ring-4 focus:ring-brand-50 border border-slate-100 font-bold text-[18px] text-right pr-12"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-text-sub">g</span>
            </div>
          </div>

          {/* 특이사항 */}
          <div className="space-y-3">
            <label className="text-[14px] font-black text-text-sub flex items-center gap-2 px-1">
              <HugeiconsIcon icon={NoteIcon} size={16} className="text-brand-500" />
              기타 특이사항
            </label>
            <textarea
              placeholder="예: 소스가 달아요, 평소보다 짜게 먹었어요 등"
              className="w-full bg-slate-50 rounded-2xl py-4 px-5 focus:outline-none focus:ring-4 focus:ring-brand-50 border border-slate-100 font-bold text-[14px] min-h-[100px]"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!name || !carbs}
            className={twMerge(
              "w-full py-5 rounded-2xl text-[16px] font-black transition-all shadow-xl",
              name && carbs ? "bg-brand-500 text-white shadow-brand-500/20 active:scale-95" : "bg-slate-100 text-slate-300 cursor-not-allowed"
            )}
          >
            기록에 추가하기
          </button>
        </div>
      </div>
    </div>
  );
};
