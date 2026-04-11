import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Search01Icon, 
  PlusSignIcon, 
  MinusSignIcon, 
  Cancel01Icon, 
  Camera01Icon,
  FilterIcon,
  Dish01Icon,
  ChefHatIcon
} from '@hugeicons/core-free-icons';
import { FOOD_DB } from '../../data/food_db';
import { useCustomFoodStore } from '../../store/useCustomFoodStore';
import { Food } from '../../types';
import { twMerge } from 'tailwind-merge';

interface SelectedFood extends Food {
  count: number;
}

interface FoodSearchProps {
  onFoodsChange: (foods: SelectedFood[]) => void;
  selectedFoods: SelectedFood[];
}

const CATEGORIES = [
  { id: 'all', name: '전체', icon: <HugeiconsIcon icon={FilterIcon} size={16} /> },
  { id: 'rice', name: '밥류', icon: '🍚' },
  { id: 'noodle', name: '면류', icon: '🍜' },
  { id: 'snack', name: '분식', icon: '🍢' },
  { id: 'bread', name: '빵/과자', icon: '🥐' },
  { id: 'fruit', name: '과일', icon: '🍎' },
  { id: 'drink', name: '음료', icon: '🥤' },
  { id: 'side', name: '반찬', icon: '🥗' },
  { id: 'cvs', name: '편의점', icon: '🏪' },
];

export const FoodSearch: React.FC<FoodSearchProps> = ({ onFoodsChange, selectedFoods }) => {
  const { customFoods } = useCustomFoodStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const allFoods = useMemo(() => [...customFoods, ...FOOD_DB], [customFoods]);

  const filteredFoods = useMemo(() => {
    return allFoods.filter((food) => {
      const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'all' || food.cat === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allFoods, searchTerm, activeCategory]);

  const handleFoodToggle = (food: Food) => {
    const isAlreadySelected = selectedFoods.find((f) => f.id === food.id);
    if (isAlreadySelected) {
      onFoodsChange(selectedFoods.filter((f) => f.id !== food.id));
    } else {
      onFoodsChange([...selectedFoods, { ...food, count: 1 }]);
    }
  };

  const handleCountChange = (id: string, delta: number) => {
    onFoodsChange(
      selectedFoods.map((f) => {
        if (f.id === id) {
          return { ...f, count: Math.max(0.5, f.count + delta) };
        }
        return f;
      }).filter(f => f.count > 0)
    );
  };

  const handleRemoveFood = (id: string) => {
    onFoodsChange(selectedFoods.filter((f) => f.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-t-[48px] overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.03)] border-t border-slate-50">
      {/* 검색 및 AI 버튼 섹션 */}
      <div className="p-6 pb-4 space-y-4">
        {/* AI 분석 버튼 (Premium Placeholder) */}
        <button className="w-full bg-gradient-to-r from-brand-50 via-soft-blue to-brand-50 rounded-3xl p-4 flex items-center justify-between border border-brand-100/50 group active:scale-95 transition-all shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-brand-500/20 shadow-lg">
              <HugeiconsIcon icon={Camera01Icon} size={22} className="text-brand-500" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <div className="text-[15px] font-black text-brand-600">AI 사진으로 분석하기</div>
              <div className="text-[12px] font-bold text-brand-400">카메라로 식단을 바로 인식해요</div>
            </div>
          </div>
          <div className="bg-brand-500 text-white px-3 py-1.5 rounded-xl text-[11px] font-black">신규</div>
        </button>

        {/* 검색창 */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-500 transition-colors">
            <HugeiconsIcon icon={Search01Icon} size={20} strokeWidth={2.5} />
          </div>
          <input
            type="text"
            placeholder="어떤 음식을 드시나요?"
            className="w-full bg-slate-50/50 rounded-3xl py-4 pl-12 pr-12 focus:outline-none focus:ring-4 focus:ring-brand-50/50 focus:bg-white border border-slate-100 transition-all font-bold text-[15px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-sub"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex overflow-x-auto px-6 pb-4 gap-2.5 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={twMerge(
              "whitespace-nowrap px-4 py-2.5 rounded-2xl text-[14px] font-black transition-all flex items-center gap-2",
              activeCategory === cat.id
                ? 'bg-brand-500 text-white shadow-brand-500/30 shadow-lg scale-105'
                : 'bg-slate-50 text-text-sub hover:bg-slate-100 border border-slate-100'
            )}
          >
            <span>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        {/* 오늘의 레시피 조합 (선택된 음식) */}
        {selectedFoods.length > 0 && (
          <div className="mb-8 mt-2 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-4 px-1">
              <HugeiconsIcon icon={ChefHatIcon} size={18} className="text-brand-500" strokeWidth={2.5} />
              <h3 className="text-[15px] font-black text-text-main">식사 구성 미리보기</h3>
            </div>
            <div className="flex flex-col gap-3">
              {selectedFoods.map((food) => (
                <div key={food.id} className="flex items-center justify-between bg-white border border-slate-50 p-4 rounded-3xl shadow-soft">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[24px]">
                      {food.emoji}
                    </div>
                    <div>
                      <div className="font-black text-text-main text-[15px]">{food.name}</div>
                      <div className="text-[13px] text-brand-500 font-bold">
                        {(food.carbPer * food.count).toFixed(1)}g 탄수화물
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-50 rounded-2xl overflow-hidden p-1 border border-slate-100/50">
                      <button
                        onClick={() => handleCountChange(food.id, -0.5)}
                        className="w-8 h-8 rounded-xl hover:bg-white text-text-sub flex items-center justify-center transition-all bg-white/40 shadow-sm"
                      >
                        <HugeiconsIcon icon={MinusSignIcon} size={16} strokeWidth={3} />
                      </button>
                      <span className="w-10 text-center font-black text-[15px] text-text-main">{food.count}</span>
                      <button
                        onClick={() => handleCountChange(food.id, 0.5)}
                        className="w-8 h-8 rounded-xl hover:bg-white text-brand-500 flex items-center justify-center transition-all bg-white/40 shadow-sm"
                      >
                        <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 음식 검색 결과 */}
        <div className="flex items-center gap-2 mb-4 px-1">
          <HugeiconsIcon icon={Dish01Icon} size={18} className="text-brand-500" strokeWidth={2.5} />
          <h3 className="text-[15px] font-black text-text-main">음식 선택하기</h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {filteredFoods.map((food) => {
            const isSelected = selectedFoods.some((f) => f.id === food.id);
            return (
              <button
                key={food.id}
                onClick={() => handleFoodToggle(food)}
                className={twMerge(
                  "flex items-center justify-between p-5 rounded-3xl transition-all duration-300 border text-left active:scale-95 group",
                  isSelected
                    ? 'bg-brand-500 border-brand-500 shadow-brand-500/20 shadow-xl translate-x-1'
                    : 'bg-white border-slate-50 hover:border-brand-200 shadow-soft'
                )}
              >
                <div className="flex items-center gap-5">
                  <div className={twMerge(
                    "w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-[28px] transition-colors",
                    isSelected ? "bg-white/20" : "bg-slate-50 group-hover:bg-brand-50"
                  )}>
                    {food.emoji}
                  </div>
                  <div>
                    <div className={twMerge(
                      "text-[16px] font-black transition-colors",
                      isSelected ? 'text-white' : 'text-text-main'
                    )}>
                      {food.name}
                    </div>
                    <div className={twMerge(
                      "text-[12px] font-bold opacity-70",
                      isSelected ? 'text-sky-50' : 'text-text-muted'
                    )}>
                      {food.baseAmount}{food.unit} 당 {food.carbPer}g
                    </div>
                  </div>
                </div>
                <div className={twMerge(
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                  isSelected ? "bg-white text-brand-500 shadow-lg" : "bg-slate-50 text-slate-300 group-hover:text-brand-500 group-hover:bg-brand-50"
                )}>
                  <HugeiconsIcon icon={isSelected ? Cancel01Icon : PlusSignIcon} size={20} strokeWidth={3} />
                </div>
              </button>
            );
          })}
          {filteredFoods.length === 0 && (
            <div className="text-center py-16 bg-slate-50/50 rounded-4xl border border-dashed border-slate-200">
              <p className="text-text-muted font-bold">음식을 찾을 수 없어요 🥘 <br /> <span className="text-[12px] opacity-60">직접 추가하거나 다른 이름으로 검색해보세요</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
