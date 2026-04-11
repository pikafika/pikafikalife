import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Food } from '../types';

interface CustomFoodStore {
  customFoods: Food[];
  addCustomFood: (food: Omit<Food, 'id' | 'isCustom'>) => void;
  updateCustomFood: (id: string, updates: Partial<Omit<Food, 'id' | 'isCustom'>>) => void;
  removeCustomFood: (id: string) => void;
}

export const useCustomFoodStore = create<CustomFoodStore>()(
  persist(
    (set) => ({
      customFoods: [],
      addCustomFood: (food) =>
        set((state) => ({
          customFoods: [
            ...state.customFoods,
            { ...food, id: `custom_${Date.now()}`, isCustom: true },
          ],
        })),
      updateCustomFood: (id, updates) =>
        set((state) => ({
          customFoods: state.customFoods.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        })),
      removeCustomFood: (id) =>
        set((state) => ({
          customFoods: state.customFoods.filter((f) => f.id !== id),
        })),
    }),
    { name: 'custom-food-store' }
  )
);
