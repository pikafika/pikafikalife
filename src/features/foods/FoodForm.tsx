import React, { useState } from 'react';
import { X } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { FloppyDiskIcon } from '@hugeicons/core-free-icons';
import { Food } from '../../types';

const CATEGORIES = [
  { id: 'rice', name: '밥류' },
  { id: 'noodle', name: '면류' },
  { id: 'snack', name: '분식' },
  { id: 'bread', name: '빵/과자' },
  { id: 'fruit', name: '과일' },
  { id: 'drink', name: '음료' },
  { id: 'side', name: '반찬' },
  { id: 'cvs', name: '편의점' },
  { id: 'frozen', name: '냉동' },
];

interface FoodFormProps {
  initialData?: Food;
  onSave: (data: Omit<Food, 'id' | 'isCustom'>) => void;
  onCancel: () => void;
}

export const FoodForm: React.FC<FoodFormProps> = ({ initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    emoji: initialData?.emoji ?? '🍽️',
    name: initialData?.name ?? '',
    cat: initialData?.cat ?? 'rice',
    carbPer: initialData?.carbPer?.toString() ?? '',
    baseAmount: initialData?.baseAmount?.toString() ?? '1',
    unit: initialData?.unit ?? '인분',
    note: initialData?.note ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = '음식 이름을 입력해 주세요';
    const carb = parseFloat(form.carbPer);
    if (isNaN(carb) || carb < 0) next.carbPer = '올바른 탄수화물 값을 입력해 주세요';
    const amount = parseFloat(form.baseAmount);
    if (isNaN(amount) || amount <= 0) next.baseAmount = '올바른 기준량을 입력해 주세요';
    if (!form.unit.trim()) next.unit = '단위를 입력해 주세요';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      emoji: form.emoji,
      name: form.name.trim(),
      cat: form.cat,
      carbPer: parseFloat(form.carbPer),
      baseAmount: parseFloat(form.baseAmount),
      unit: form.unit.trim(),
      note: form.note.trim(),
    });
  };

  const field = (label: string, key: keyof typeof form, inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label className="text-[13px] font-bold text-gray-500 mb-1 block">{label}</label>
      <input
        {...inputProps}
        value={form[key]}
        onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
        className="w-full px-4 py-3 bg-[#FAFAFB] border-2 border-slate-100 rounded-2xl focus:border-[#3182F6] focus:outline-none font-bold text-slate-800 transition-all"
      />
      {errors[key] && <p className="text-red-500 text-[12px] mt-1 ml-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="text-[18px] font-black text-gray-900">
          {initialData ? '음식 수정' : '음식 추가'}
        </h2>
        <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {/* 이모지 + 이름 */}
        <div className="flex gap-3">
          <div>
            <label className="text-[13px] font-bold text-gray-500 mb-1 block">이모지</label>
            <input
              value={form.emoji}
              onChange={(e) => setForm((prev) => ({ ...prev, emoji: e.target.value }))}
              className="w-16 text-center text-2xl px-2 py-3 bg-[#FAFAFB] border-2 border-slate-100 rounded-2xl focus:border-[#3182F6] focus:outline-none transition-all"
              maxLength={2}
            />
          </div>
          <div className="flex-1">
            {field('음식 이름', 'name', { placeholder: '예: 현미밥 (공기)' })}
          </div>
        </div>

        {/* 카테고리 */}
        <div>
          <label className="text-[13px] font-bold text-gray-500 mb-2 block">카테고리</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setForm((prev) => ({ ...prev, cat: cat.id }))}
                className={`px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
                  form.cat === cat.id
                    ? 'bg-[#3182F6] text-white'
                    : 'bg-[#FAFAFB] border border-slate-200 text-gray-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 탄수화물 */}
        {field('1회 제공량당 탄수화물 (g)', 'carbPer', {
          type: 'number',
          placeholder: '예: 65',
          inputMode: 'decimal',
        })}

        {/* 기준량 + 단위 */}
        <div className="flex gap-3">
          <div className="flex-1">
            {field('기준량', 'baseAmount', { type: 'number', placeholder: '1', inputMode: 'decimal' })}
          </div>
          <div className="flex-1">
            {field('단위', 'unit', { placeholder: '예: 공기, 개, g' })}
          </div>
        </div>

        {/* 메모 */}
        <div>
          <label className="text-[13px] font-bold text-gray-500 mb-1 block">메모 (선택)</label>
          <input
            value={form.note}
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            placeholder="예: 200g 기준"
            className="w-full px-4 py-3 bg-[#FAFAFB] border-2 border-slate-100 rounded-2xl focus:border-[#3182F6] focus:outline-none font-bold text-slate-800 transition-all"
          />
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="px-5 pb-6 pt-3 border-t border-slate-100">
        <button
          onClick={handleSubmit}
          className="w-full bg-[#3182F6] text-white py-[18px] rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(49,130,246,0.3)] active:scale-95 transition-all"
        >
          <HugeiconsIcon icon={FloppyDiskIcon} size={20} />
          {initialData ? '수정 저장' : '음식 추가'}
        </button>
      </div>
    </div>
  );
};
