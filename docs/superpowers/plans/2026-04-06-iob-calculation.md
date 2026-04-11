# IOB(잔존 인슐린) 계산 로직 구현 및 테스트 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 잔존 인슐린(IOB)을 계산하는 핵심 비즈니스 로직을 구현하고 Vitest 단위 테스트로 검증합니다.

**Architecture:** 선형 감소 모델(Linear Decay Model)을 사용하여 `calculateRemainingIOB` 함수를 `src/utils/calcIOB.ts`에 구현합니다. `remainingPercent = (diaHours - diffHours) / diaHours` 공식을 따르며, 결과는 소수점 둘째 자리까지 반올림합니다.

**Tech Stack:** TypeScript, Vitest

---

### Task 1: 테스트 환경 설정 및 실패하는 테스트 작성

**Files:**
- Create: `src/utils/calcIOB.test.ts`
- Create: `src/utils/calcIOB.ts` (Empty export)

- [ ] **Step 1: `src/utils/calcIOB.ts`에 빈 함수 정의**

```typescript
export const calculateRemainingIOB = (
  previousInsulin: number,
  administeredTime: Date,
  currentTime: Date,
  diaHours: number
): number => {
  return 0; // Minimal implementation
};
```

- [ ] **Step 2: `src/utils/calcIOB.test.ts`에 실패하는 테스트 작성**

```typescript
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
});
```

- [ ] **Step 3: 테스트 실행 및 실패 확인**

Run: `npm test src/utils/calcIOB.test.ts`
Expected: FAIL (1st test passes by luck/zero but 2nd test fails)

### Task 2: IOB 계산 로직 구현 및 테스트 통과

**Files:**
- Modify: `src/utils/calcIOB.ts`

- [ ] **Step 1: `calculateRemainingIOB` 로직 구현**

```typescript
export const calculateRemainingIOB = (
  previousInsulin: number,
  administeredTime: Date,
  currentTime: Date,
  diaHours: number
): number => {
  const diffMs = currentTime.getTime() - administeredTime.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 0) return previousInsulin;
  if (diffHours >= diaHours) return 0;

  const remainingPercent = (diaHours - diffHours) / diaHours;
  const remainingInsulin = previousInsulin * remainingPercent;

  return Math.round(remainingInsulin * 100) / 100;
};
```

- [ ] **Step 2: 테스트 실행 및 통과 확인**

Run: `npm test src/utils/calcIOB.test.ts`
Expected: PASS

### Task 3: 추가 엣지 케이스 테스트 및 검증

**Files:**
- Modify: `src/utils/calcIOB.test.ts`

- [ ] **Step 1: 추가 테스트 케이스 작성 (활성 시간 이후, 소수점 반올림 등)**

```typescript
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
```

- [ ] **Step 2: 최종 테스트 실행 및 통과 확인**

Run: `npm test src/utils/calcIOB.test.ts`
Expected: PASS
