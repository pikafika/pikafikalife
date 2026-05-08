import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
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

  const isValid = name.trim().length > 0 && parseFloat(carbs) > 0;

  const handleSave = () => {
    if (!isValid) return;

    const newFood: Food = {
      id: `manual_${Date.now()}`,
      name: name.trim(),
      emoji: '🍲',
      carbPer: parseFloat(carbs),
      baseAmount: 1,
      unit: '인분',
      cat: 'custom',
      isCustom: true,
      note: ingredients.join(', ') + (memo ? ` (${memo})` : ''),
    };

    onAdd(newFood);
    onClose();
  };

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 mx-auto w-full max-w-[500px] z-[10001] bg-white flex flex-col animate-in slide-in-from-right duration-300 border-x border-gray-100 shadow-2xl">
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-3 bg-white shrink-0 border-b border-gray-100 flex items-center gap-3">
        <button
          onClick={onClose}
          className="p-2 text-text-main bg-white border border-gray-100 rounded-xl active:scale-90 transition-all shadow-sm shrink-0"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} strokeWidth={2.5} />
        </button>
        <div>
          <h2 className="text-[18px] font-black text-text-main flex items-center gap-2">
            <span className="w-1 h-5 bg-brand-500 rounded-full" />
            직접 입력하기
          </h2>
          <p className="text-[12px] font-bold text-text-muted">상세한 정보를 입력해 더 정확하게 계산해요</p>
        </div>
      </div>

      {/* 스크롤 가능한 폼 영역 */}
      <div className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-6 space-y-7 pb-[100px]">
        {/* 음식 이름 */}
        <div className="space-y-2">
          <label className="text-[14px] font-black text-text-sub flex items-center gap-2 px-1">
            <HugeiconsIcon icon={ChefHatIcon} size={16} className="text-brand-500" strokeWidth={2.5} />
            음식 이름
          </label>
          <input
            type="text"
            placeholder="예: 집밥 (된장찌개와 밥)"
            className="w-full bg-slate-50 rounded-lg py-4 px-5 focus:outline-none focus:ring-4 focus:ring-brand-50 focus:bg-white border border-slate-100 font-bold text-base transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* 포함된 재료 */}
        <div className="space-y-2">
          <label className="text-[14px] font-black text-text-sub flex items-center gap-2 px-1">
            <HugeiconsIcon icon={AiChat02Icon} size={16} className="text-brand-500" strokeWidth={2.5} />
            포함된 재료
            <span className="text-[11px] font-bold text-text-muted ml-auto">선택사항</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="예: 현미밥 150g"
              className="flex-1 min-w-0 bg-slate-50 rounded-lg py-4 px-5 focus:outline-none focus:ring-4 focus:ring-brand-50 focus:bg-white border border-slate-100 font-bold text-base transition-all"
              value={currentIngredient}
              onChange={(e) => setCurrentIngredient(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
            />
            <button
              onClick={handleAddIngredient}
              className="bg-brand-500 text-white px-5 rounded-lg flex items-center justify-center shadow-sm shadow-brand-500/20 active:scale-95 transition-transform shrink-0 self-stretch"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={20} strokeWidth={3} />
            </button>
          </div>
          {ingredients.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {ingredients.map((ing, i) => (
                <div key={i} className="bg-brand-50 text-brand-600 px-4 py-2 rounded-sm text-[13px] font-black flex items-center gap-2 border border-brand-100 animate-in zoom-in duration-200">
                  {ing}
                  <button onClick={() => handleRemoveIngredient(i)}>
                    <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={3} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-text-muted px-1 font-medium pt-1">재료를 추가하면 더 정확한 AI 코칭을 받을 수 있어요.</p>
          )}
        </div>

        {/* 탄수화물량 */}
        <div className="space-y-2">
          <label className="text-[14px] font-black text-text-sub flex items-center gap-2 px-1">
            <HugeiconsIcon icon={CheckmarkBadge01Icon} size={16} className="text-brand-500" strokeWidth={2.5} />
            예상 탄수화물 (당질)
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              className="w-full bg-slate-50 rounded-lg py-4 px-5 focus:outline-none focus:ring-4 focus:ring-brand-50 focus:bg-white border border-slate-100 font-bold text-[18px] text-right pr-12 transition-all"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-text-sub">g</span>
          </div>
          <p className="text-[11px] font-bold text-brand-500 px-1">정확한 값이 없으면 대략적인 값을 입력해 주세요</p>
        </div>

        {/* 특이사항 */}
        <div className="space-y-2">
          <label className="text-[14px] font-black text-text-sub flex items-center gap-2 px-1">
            <HugeiconsIcon icon={NoteIcon} size={16} className="text-brand-500" strokeWidth={2.5} />
            기타 특이사항
            <span className="text-[11px] font-bold text-text-muted ml-auto">선택사항</span>
          </label>
          <textarea
            placeholder="예: 소스가 달아요, 평소보다 짜게 먹었어요 등"
            className="w-full bg-slate-50 rounded-lg py-4 px-5 focus:outline-none focus:ring-4 focus:ring-brand-50 focus:bg-white border border-slate-100 font-bold text-base min-h-[96px] resize-none transition-all"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
      </div>

      {/* 고정 하단 CTA */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-4 bg-white border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={!isValid}
          className={twMerge(
            "w-full py-4 rounded-sm text-[16px] font-black transition-all",
            isValid
              ? "bg-brand-500 text-white shadow-sm shadow-brand-500/20 active:scale-95"
              : "bg-slate-100 text-slate-300 cursor-not-allowed"
          )}
        >
          기록에 추가하기
        </button>
      </div>
    </div>
  );
};
