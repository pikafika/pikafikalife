import { describe, it, expect } from 'vitest';
import { calculateRemainingIOB } from './calcIOB';

describe('calculateRemainingIOB', () => {
  it('투여 직후(0분 후)에는 투여량 전체가 남아있어야 함', () => {
    const administeredTime = new Date('2024-04-06T10:00:00');
    const currentTime = new Date('2024-04-06T10:00:00');
    const previousInsulin = 5;
    const diaHours = 4;

    const result = calculateRemainingIOB(previousInsulin, administeredTime, currentTime, diaHours);
    expect(result).toBe(5);
  });

  it('1시간 후에는 선형적으로 감소한 양이 남아있어야 함 (DIA 4시간 기준)', () => {
    const administeredTime = new Date('2024-04-06T10:00:00');
    const currentTime = new Date('2024-04-06T11:00:00');
    const previousInsulin = 4;
    const diaHours = 4;

    // (4 - 1) / 4 = 0.75. 4 * 0.75 = 3
    const result = calculateRemainingIOB(previousInsulin, administeredTime, currentTime, diaHours);
    expect(result).toBe(3);
  });

  it('활성 시간(DIA) 이후에는 0이 남아야 함', () => {
    const administeredTime = new Date('2024-04-06T10:00:00');
    const currentTime = new Date('2024-04-06T15:00:00'); // 5시간 후
    const previousInsulin = 5;
    const diaHours = 4;

    const result = calculateRemainingIOB(previousInsulin, administeredTime, currentTime, diaHours);
    expect(result).toBe(0);
  });

  it('결과는 소수점 둘째 자리까지 반올림되어야 함', () => {
    const administeredTime = new Date('2024-04-06T10:00:00');
    const currentTime = new Date('2024-04-06T11:30:00'); // 1.5시간 후
    const previousInsulin = 5;
    const diaHours = 4;

    // (4 - 1.5) / 4 = 2.5 / 4 = 0.625
    // 5 * 0.625 = 3.125 -> 반올림 3.13
    const result = calculateRemainingIOB(previousInsulin, administeredTime, currentTime, diaHours);
    expect(result).toBe(3.13);
  });
});
