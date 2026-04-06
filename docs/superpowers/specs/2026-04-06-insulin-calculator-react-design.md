# 🩵 인슐린 계산기 React 마이그레이션 디자인 문서

- **날짜**: 2026-04-06
- **상태**: 작성 중 (Draft)
- **주제**: Vanilla JS 기반 인슐린 계산기를 Vite + React + TypeScript로 전면 재구축 및 IOB 기능 추가

## 1. 배경 및 목표 (Background & Goals)
기존 Vanilla JS 프로젝트는 핵심 기능(계산, 음식 검색, 기록)이 잘 작동하지만, 코드의 유지보수성이 낮고 복잡한 상태 관리가 어렵습니다. 특히 '인슐린 중첩(Stacking)' 문제를 해결하기 위한 **잔존 인슐린(IOB)** 계산 기능이 부재합니다.
본 프로젝트의 목표는 글로벌 코딩 표준을 준수하는 현대적인 웹 앱으로 전환하고, 사용자의 안전을 최우선으로 하는 기능을 도입하는 것입니다.

## 2. 기술 스택 (Tech Stack)
- **프레임워크**: Vite + React 18+ (Functional Components, Hooks)
- **언어**: TypeScript (데이터 타입 안정성 확보)
- **스타일링**: Tailwind CSS (유틸리티 우선 스타일링)
- **상태 관리**: Zustand (가볍고 직관적인 전역 상태 관리)
- **아이콘**: Lucide React (SVG 벡터 아이콘)
- **차트**: Recharts (혈당/인슐린 추이 시각화)
- **데이터 저장**: Browser LocalStorage + JSON Export/Import

## 3. 핵심 기능 (Core Features)
### 3.1 스마트 인슐린 계산기 (with IOB)
- **ICR/ISF 기반 계산**: 탄수화물 당질지수와 교정계수를 반영한 정밀 계산.
- **IOB (Insulin on Board)**: 이전에 맞은 교정 인슐린이 아직 몸에 남아있는 양을 계산하여 '교정 인슐린' 결정 시 차감.
- **DIA (Duration of Insulin Action)**: 사용자별 인슐린 활성 시간(보통 3~5시간) 설정 가능.

### 3.2 음식 및 탄수화물 관리
- **한국 음식 DB**: 기존 150여 종의 데이터를 TS 형식으로 이관.
- **나만의 메뉴 추가**: 사용자가 커스텀 음식을 추가하고 관리하는 CRUD 기능.
- **수량 조절**: 0.5인분 단위의 정밀한 수량 선택 및 실시간 탄수화물 합산.

### 3.3 대시보드 및 기록
- **실시간 통계**: 오늘 총 탄수화물, 총 인슐린, 평균 혈당 표시.
- **추이 차트**: Recharts를 이용한 혈당 및 인슐린 투여 시각화 (오늘/7일/30일).
- **실제 식사 체크**: 계산 기록 중 실제 식사 여부를 체크하여 대시보드 반영.

## 4. 아키텍처 (Architecture)
### 4.1 디렉토리 구조
- `src/components/`: 재사용 가능한 UI 원자 (Button, Input, Badge)
- `src/features/`: 도메인별 복합 컴포넌트 (Calculator, Dashboard, History, Settings)
- `src/store/`: Zustand 스토어 (useUserStore, useHistoryStore)
- `src/hooks/`: 비즈니스 로직 훅 (useInsulinCalc, useIOB)
- `src/utils/`: 계산 엔진 (calcIOB.ts, formatters.ts)
- `src/data/`: 음식 DB 및 상수 정의

### 4.2 데이터 모델 (Data Models)
```typescript
interface Food {
  id: string;
  name: string;
  carbPer: number;
  baseAmount: number;
  unit: string;
  cat: string;
  emoji?: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  currentBG: number;
  totalCarbs: number;
  insulinDose: number;
  iobAtTime: number;
  foods: { name: string; carbs: number }[];
  isEaten: boolean;
  memo?: string;
}

interface UserSettings {
  icr: number;
  isf: number;
  targetBG: number;
  dia: number; // Duration of Insulin Action (hours)
  warningThreshold: number;
}
```

## 5. UI/UX 원칙 (Design System)
- **테마**: Cyan (#0891B2) & Health Green (#059669) 중심의 청결하고 전문적인 톤.
- **모바일 퍼스트**: 모든 조작을 한 손으로 가능하도록 설계. 터치 타겟 44px 이상 확보.
- **접근성**: WCAG AAA 준수 지향. 고대비 텍스트, 스크린 리더 지원용 ARIA 레이블.
- **피드백**: 저혈당(70 이하) 또는 과용량 투여 시 시각적/진동 경고 배너 표시.

## 6. 구현 로드맵 (Roadmap)
1. **Phase 1**: 프로젝트 스캐폴딩 (Vite, Tailwind, Zustand 설정) 및 타입 정의.
2. **Phase 2**: 핵심 계산 로직 및 IOB 엔진 구현 (Unit Test 포함).
3. **Phase 3**: 계산기 UI 및 음식 검색/선택 기능 개발.
4. **Phase 4**: 대시보드 차트 및 기록 관리 시스템 구축.
5. **Phase 5**: 개인 설정 및 데이터 백업/복구 기능 추가.
6. **Phase 6**: 기존 데이터 마이그레이션 스크립트 작성 및 최종 검수.
