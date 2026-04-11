/**
 * 음식 정보 인터페이스
 */
export interface Food {
  id: string;
  name: string;
  carbPer: number;
  baseAmount: number;
  unit: string;
  cat: string;
  emoji: string;
  note: string;
  isCustom?: boolean;
}

/**
 * 투여 및 식사 기록 인터페이스
 */
export interface LogEntry {
  id: string;
  timestamp: number;
  currentBG: number;
  totalCarbs: number;
  mealInsulin: number;
  corrInsulin: number;
  totalInsulin: number;
  iobAtTime: number;
  foods: {
    foodId: string;
    amount: number;
  }[];
  isEaten: boolean;
  memo: string;
}

/**
 * 사용자 개인 설정 인터페이스
 */
export interface UserSettings {
  icr: number; // 탄수화물 계수 (Insulin-to-Carb Ratio)
  isf: number; // 인슐린 민감도 지수 (Insulin Sensitivity Factor)
  targetBG: number; // 목표 혈당
  dia: number; // 인슐린 활성 시간 (Duration of Insulin Action)
  warningThreshold: number; // 경고 임계치 (예: 저혈당 경고)
}
