import React, { useState, useMemo } from 'react';
import { Search, X, Plus, Pencil, Trash2 } from 'lucide-react';
import { FOOD_DB } from '../../data/food_db';
import { useCustomFoodStore } from '../../store/useCustomFoodStore';
import { Food } from '../../types';
import { FoodForm } from './FoodForm';

const CATEGORIES = [
  { id: 'all', name: '전체' },
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

const FoodManager: React.FC = () => {
  const { customFoods, addCustomFood, updateCustomFood, removeCustomFood } = useCustomFoodStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const allFoods = useMemo(() => [...customFoods, ...FOOD_DB], [customFoods]);

  const filtered = useMemo(() => {
    return allFoods.filter((food) => {
      const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'all' || food.cat === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allFoods, searchTerm, activeCategory]);

  const handleSave = (data: Omit<Food, 'id' | 'isCustom'>) => {
    if (editingFood) {
      updateCustomFood(editingFood.id, data);
    } else {
      addCustomFood(data);
    }
    setShowForm(false);
    setEditingFood(null);
  };

  const handleEdit = (food: Food) => {
    setEditingFood(food);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      removeCustomFood(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingFood(null);
  };

  if (showForm) {
    return (
      <div className="flex flex-col h-full bg-white">
        <FoodForm
          initialData={editingFood ?? undefined}
          onSave={handleSave}
          onCancel={handleCancelForm}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* 헤더 */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[22px] font-black text-gray-900 tracking-tight">음식 관리</h2>
            <span className="text-[13px] text-gray-400 font-medium">
              기본 {FOOD_DB.length}개 · 내 음식 {customFoods.length}개
            </span>
          </div>
          <button
            onClick={() => { setEditingFood(null); setShowForm(true); }}
            className="flex items-center gap-1.5 bg-[#3182F6] text-white px-4 py-2.5 rounded-2xl font-bold text-[14px] shadow-[0_4px_14px_rgba(49,130,246,0.35)] active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            추가
          </button>
        </div>

        {/* 검색 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="음식 이름 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-9 pr-10 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3182F6]/30 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex overflow-x-auto px-5 pb-3 gap-2 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-[13px] font-bold transition-colors ${
              activeCategory === cat.id
                ? 'bg-[#3182F6] text-white shadow-sm'
                : 'bg-white border border-slate-100 text-gray-500'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 음식 목록 */}
      <div className="flex-1 overflow-y-auto px-5 pb-24 space-y-2">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl mb-4">🔍</span>
            <p className="text-gray-400 font-medium">검색 결과가 없습니다</p>
          </div>
        )}

        {/* 내 음식 섹션 */}
        {customFoods.length > 0 && (activeCategory === 'all' || filtered.some(f => f.isCustom)) && searchTerm === '' && activeCategory === 'all' && (
          <p className="text-[12px] font-bold text-gray-400 pt-2 pb-1 ml-1">내가 추가한 음식</p>
        )}

        {filtered.map((food) => (
          <div
            key={food.id}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl w-10 text-center">{food.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800 text-[15px] truncate">{food.name}</span>
                  {food.isCustom && (
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 bg-[#3182F6]/10 text-[#3182F6] rounded-full">
                      내 음식
                    </span>
                  )}
                </div>
                <div className="text-[12px] text-gray-400 font-medium mt-0.5">
                  {food.baseAmount}{food.unit} · 탄수화물 <span className="font-bold text-gray-600">{food.carbPer}g</span>
                  {food.note ? ` · ${food.note}` : ''}
                </div>
              </div>

              {food.isCustom && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(food)}
                    className="p-2 text-gray-400 hover:text-[#3182F6] hover:bg-[#3182F6]/5 rounded-xl transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(food.id)}
                    className={`p-2 rounded-xl transition-colors ${
                      deleteConfirm === food.id
                        ? 'text-white bg-red-500'
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {deleteConfirm === food.id && (
              <div className="mt-3 flex items-center justify-between bg-red-50 rounded-xl px-3 py-2">
                <span className="text-[12px] font-bold text-red-600">한 번 더 누르면 삭제됩니다</span>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="text-[12px] font-bold text-gray-400"
                >
                  취소
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoodManager;
