import { useMemo } from 'react';
import { useUserStore } from '../store/useUserStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { calculateRemainingIOB } from '../utils/calcIOB';

/**
 * 인슐린 계산 로직을 담당하는 커스텀 훅
 */
export const useInsulinCalc = (currentBG: number, totalCarbs: number) => {
  const { settings } = useUserStore();
  const { logs } = useHistoryStore();

  // 현재 시점의 총 IOB(잔존 인슐린) 계산
  const currentIOB = useMemo(() => {
    const now = new Date();
    const diaMs = settings.dia * 60 * 60 * 1000;
    
    return logs
      .filter((log) => {
        // 인슐린 투여 기록이고, DIA 시간 내의 기록만 필터링
        return log.totalInsulin > 0 && (now.getTime() - log.timestamp) < diaMs;
      })
      .reduce((acc, log) => {
        const remaining = calculateRemainingIOB(
          log.totalInsulin,
          new Date(log.timestamp),
          now,
          settings.dia
        );
        return acc + remaining;
      }, 0);
  }, [logs, settings.dia]);

  // 식사 인슐린 계산: 탄수화물 / ICR
  const mealInsulin = totalCarbs > 0 ? totalCarbs / settings.icr : 0;

  // 교정 인슐린 계산: (현재 혈당 - 목표 혈당) / ISF - 현재 IOB
  // 결과가 음수이면 0으로 처리 (안전성)
  const rawCorrInsulin = (currentBG - settings.targetBG) / settings.isf - currentIOB;
  const corrInsulin = Math.max(0, rawCorrInsulin);

  // 총 인슐린 = 식사 인슐린 + 교정 인슐린
  const totalInsulin = mealInsulin + corrInsulin;

  return {
    mealInsulin: Math.round(mealInsulin * 100) / 100,
    corrInsulin: Math.round(corrInsulin * 100) / 100,
    totalInsulin: Math.round(totalInsulin * 100) / 100,
    currentIOB: Math.round(currentIOB * 100) / 100,
    settings,
  };
};
