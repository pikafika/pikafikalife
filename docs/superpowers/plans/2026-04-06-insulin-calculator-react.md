# 인슐린 계산기 React 마이그레이션 구현 계획서

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 Vanilla JS 인슐린 계산기를 Vite + React + TypeScript 환경으로 마이그레이션하고, 잔존 인슐린(IOB) 계산 기능을 추가하여 안전성을 강화한다.

**Architecture:** 컴포넌트 기반 UI, Zustand를 통한 전역 상태 관리, Hook을 이용한 비즈니스 로직(IOB) 분리.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS, Zustand, Lucide React, Recharts.

---

### Task 1: 프로젝트 스캐폴딩 및 환경 설정

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.js`, `index.html`
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`

- [ ] **Step 1: Vite 프로젝트 생성 및 필수 라이브러리 설치**
```bash
# Vite 프로젝트 생성 (이미 폴더가 있으므로 수동 구성 권장)
npm init vite@latest . -- --template react-ts
npm install zustand lucide-react recharts clsx tailwind-merge
npm install -D tailwindcss autoprefixer postcss
npx tailwindcss init -p
```

- [ ] **Step 2: Tailwind CSS 설정**
`tailwind.config.js` 수정:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0891B2",
        secondary: "#22D3EE",
        cta: "#059669",
        background: "#ECFEFF",
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: 기본 폴더 구조 생성**
```bash
mkdir -p src/components src/features src/hooks src/store src/types src/utils src/data
```

---

### Task 2: 데이터 타입 정의 및 음식 DB 이관

**Files:**
- Create: `src/types/index.ts`
- Create: `src/data/food_db.ts`

- [ ] **Step 1: 전역 타입 정의**
`src/types/index.ts`:
```typescript
export interface Food {
  id: string;
  name: string;
  carbPer: number;
  baseAmount: number;
  unit: string;
  cat: string;
  emoji?: string;
  note?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  currentBG: number;
  totalCarbs: number;
  mealInsulin: number;
  corrInsulin: number;
  totalInsulin: number;
  iobAtTime: number;
  foods: { name: string; carbs: number }[];
  isEaten: boolean;
  memo?: string;
}

export interface UserSettings {
  icr: number;
  isf: number;
  targetBG: number;
  dia: number;
  warningThreshold: number;
}
```

- [ ] **Step 2: 기존 data.js 데이터를 food_db.ts로 변환**
(기존 FOOD_DB 배열을 `export const FOOD_DB: Food[] = [...]` 형식으로 복사)

---

### Task 3: IOB(잔존 인슐린) 계산 로직 구현 및 테스트

**Files:**
- Create: `src/utils/calcIOB.ts`
- Create: `src/utils/calcIOB.test.ts`

- [ ] **Step 1: 선형 감소 모델 기반 IOB 계산 함수 작성**
`src/utils/calcIOB.ts`:
```typescript
export const calculateRemainingIOB = (
  previousInsulin: number,
  administeredTime: string,
  currentTime: string,
  diaHours: number
): number => {
  const diffMs = new Date(currentTime).getTime() - new Date(administeredTime).getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  if (diffHours >= diaHours) return 0;
  if (diffHours <= 0) return previousInsulin;
  
  // 선형 감소 모델: (남은 시간 / 총 활성 시간) * 투여량
  const remainingPercent = (diaHours - diffHours) / diaHours;
  return Math.max(0, Math.round(previousInsulin * remainingPercent * 100) / 100);
};
```

---

### Task 4: Zustand 전역 상태 관리 구축

**Files:**
- Create: `src/store/useUserStore.ts`
- Create: `src/store/useHistoryStore.ts`

- [ ] **Step 1: 사용자 설정 스토어 작성 (Persistence 포함)**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSettings } from '../types';

interface UserStore {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      settings: { icr: 10, isf: 50, targetBG: 120, dia: 4, warningThreshold: 10 },
      updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),
    }),
    { name: 'insulin-user-settings' }
  )
);
```

---

### Task 5: 메인 레이아웃 및 네비게이션 구현

**Files:**
- Create: `src/components/Layout.tsx`
- Create: `src/components/BottomNav.tsx`

- [ ] **Step 1: 모바일 최적화 레이아웃 컴포넌트 작성**
- [ ] **Step 2: Lucide 아이콘을 이용한 바텀 네비게이션 작성**

---

### Task 6: 인슐린 계산기 기능 (Step 1~3)

**Files:**
- Create: `src/features/calculator/Calculator.tsx`
- Create: `src/features/calculator/FoodSearch.tsx`

- [ ] **Step 1: IOB가 반영된 계산 로직 훅 구현 (`useInsulinCalc`)**
- [ ] **Step 2: 혈당 입력 및 음식 선택 UI 구현**
- [ ] **Step 3: 최종 결과 표시 및 저장 기능 구현**

---

### Task 7: 대시보드 및 차트 구현

**Files:**
- Create: `src/features/dashboard/Dashboard.tsx`
- Create: `src/features/dashboard/TrendChart.tsx`

- [ ] **Step 1: Recharts를 이용한 오늘 혈당 추이 그래프 구현**
- [ ] **Step 2: 통계 카드 (총 탄수화물, 총 인슐린) 구현**

---

### Task 8: 설정 및 데이터 백업 기능

**Files:**
- Create: `src/features/settings/Settings.tsx`
- Create: `src/utils/backup.ts`

- [ ] **Step 1: 설정 입력 폼 구현 (DIA 설정 포함)**
- [ ] **Step 2: JSON 파일 내보내기/가져오기 기능 구현**
