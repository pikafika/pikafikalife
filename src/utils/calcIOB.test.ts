import { describe, it, expect } from 'vitest';
import { calculateRemainingIOB } from './calcIOB';

// DIA=4h → peakHours = 4 * 0.35 = 1.4h
// Pre-peak:  iobFraction = 1 - (t / 1.4) * 0.5
// Post-peak: iobFraction = 0.5 * (4 - t) / (4 - 1.4) = 0.5 * (4 - t) / 2.6

describe('calculateRemainingIOB (bilinear model)', () => {
  it('투여 직후(0분 후)에는 투여량 전체가 남아있어야 함', () => {
    const administeredTime = new Date('2024-04-06T10:00:00');
    const currentTime = new Date('2024-04-06T10:00:00');
    const result = calculateRemainingIOB(5, administeredTime, currentTime, 4);
    expect(result).toBe(5);
  });

  it('피크 이전(1시간 후)에는 bilinear 모델로 감소한 양이 남아있어야 함 (DIA 4시간 기준)', () => {
    const administeredTime = new Date('2024-04-06T10:00:00');
    const currentTime = new Date('2024-04-06T11:00:00');
    // peakHours = 1.4, t = 1 < 1.4
    // iobFraction = 1 - (1 / 1.4) * 0.5 = 1 - 0.3571 = 0.6429
    // 4 * 0.6429 = 2.5714... → 2.57
    const result = calculateRemainingIOB(4, administeredTime, currentTime, 4);
    expect(result).toBe(2.57);
  });

  it('피크 이후(1.5시간 후)에는 bilinear 후반 구간으로 감소한 양이 남아있어야 함', () => {
    const administeredTime = new Date('2024-04-06T10:00:00');
    const currentTime = new Date('2024-04-06T11:30:00');
    // t = 1.5 > 1.4 (post-peak)
    // iobFraction = 0.5 * (4 - 1.5) / 2.6 = 0.5 * 2.5 / 2.6 = 0.4808
    // 5 * 0.4808 = 2.404 → 2.40
    const result = calculateRemainingIOB(5, administeredTime, currentTime, 4);
    expect(result).toBe(2.40);
  });

  it('활성 시간(DIA) 이후에는 0이 남아야 함', () => {
    const administeredTime = new Date('2024-04-06T10:00:00');
    const currentTime = new Date('2024-04-06T15:00:00');
    const result = calculateRemainingIOB(5, administeredTime, currentTime, 4);
    expect(result).toBe(0);
  });

  it('투여 시간 이전이면 전체 용량을 반환해야 함', () => {
    const administeredTime = new Date('2024-04-06T12:00:00');
    const currentTime = new Date('2024-04-06T10:00:00');
    const result = calculateRemainingIOB(3, administeredTime, currentTime, 4);
    expect(result).toBe(3);
  });
});
