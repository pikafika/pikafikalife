# CLAUDE.md — PikafikaLife 개발 가이드

## 프로젝트 개요

PikafikaLife(피카피카 라이프)는 1형 당뇨 환자를 위한 정밀 인슐린 계산 및 건강 관리 플랫폼이다.
**인슐린 투여 오류는 생명에 직결된다.** 모든 계산 변경, 설정 수정, 데이터 저장 결정은 임상적 위험을 수반한다.

- **서비스 URL**: https://pikafika.vercel.app (Vercel — 프론트엔드 + API 통합)
- **스택**: React 18 + TypeScript 5 + Zustand + Firebase Firestore + Gemini AI + Vite
- **배포**: Vercel 서버리스 (`api/*`) + Firebase Hosting (프론트엔드)

---

## 의료 안전 하드 규칙 (RULE-MED-*)

아래 규칙은 절대 불변이다. 위반 시 PR 머지 불가.

| 규칙 | 내용 |
|------|------|
| **MED-1** | `calcIOB.ts` / `useInsulinCalc.ts` 수정 시 `/healthcare-reviewer` 필수 (머지 블록) |
| **MED-2** | Bilinear IOB 상수(peak=DIA×0.35, pre-peak/post-peak 비율)는 OpenAPS/Loop 임상 근거값. 변경 시 동료 심사 문헌 링크 + healthcare-reviewer 서명 필요 |
| **MED-3** | UserSettings 안전 범위는 불변: ICR 1–100 g/u, ISF 1–500 mg/dL, targetBG 60–200 mg/dL, DIA 1–8시간. 범위를 넓히려면 의학적 근거 필수 |
| **MED-4** | `currentBG < 70` 저혈당 경고 배너는 Calculator Step 3에서 항상 표시. 조건부 숨김 금지 |
| **MED-5** | 인슐린 투여량은 `Math.round(x * 100) / 100` 소수점 2자리 반올림. truncate / floor 금지 |
| **MED-6** | 교정 인슐린은 반드시 `Math.max(0, rawCorrInsulin)`으로 클램핑. 음수 용량 표시/적용 금지 |

---

## 아키텍처 맵

```
src/
  App.tsx                        — 루트: 오버레이 상태 머신 (5개 오버레이)
  features/
    calculator/Calculator.tsx    — 4단계 투여 마법사 (BG → 탄수화물 → 용량 → 저장)
    calculator/AIAnalysisOverlay.tsx  — Gemini Vision 음식/라벨 스캔
    dashboard/Dashboard.tsx      — 홈: 통계, 인사이트 스토리, 트렌드 차트
    dashboard/AIReportOverlay.tsx     — Gemini 코칭 리포트
    care/SugarBeeChat.tsx        — 채팅 UI (현재 목업, Gemini 연결 TODO)
    family/FamilyView.tsx        — 가족 타임라인
    family/FamilyManagementOverlay.tsx — 초대 코드 표시 + 가입 (가입 TODO)
    history/History.tsx          — 기록 목록
    settings/Settings.tsx        — ICR/ISF/targetBG/DIA 폼 + 백업
    foods/FoodManager.tsx        — 커스텀 음식 CRUD
  hooks/
    useInsulinCalc.ts            — [CRITICAL] 핵심 투여량 계산 (ICR + ISF + IOB)
    useCloudSync.ts              — 로그인 시 Firestore 동기화 + 마이그레이션
  utils/
    calcIOB.ts                   — [CRITICAL] Bilinear IOB 감쇠 모델
    calcIOB.test.ts              — 단위 테스트 5개 (항상 통과 유지)
    permissions.ts               — isAdmin 가드 (하드코딩된 UID 목록)
  store/
    useAuthStore.ts              — Firebase 인증 + 로그아웃 시 전체 스토어 초기화
    useHistoryStore.ts           — LogEntry[] (Firestore 동기화)
    useUserStore.ts              — UserSettings (ICR, ISF, targetBG, DIA)
    useAIStore.ts                — InsightStory[], 코칭 히스토리, isGenerating
    useCustomFoodStore.ts        — 커스텀 음식 (localStorage 전용)
  services/
    firebase.ts                  — Firebase 초기화 + 미설정 시 graceful 저하
    syncService.ts               — getOrCreateFamily, saveLog, subscribeLogs
    geminiService.ts             — /api/gemini fetch 래퍼 (vision, insights, coaching)
    logService.ts                — 개발 활동 로그
  types/index.ts                 — Food, LogEntry, UserSettings 인터페이스

api/
  gemini.ts                      — Vercel 서버리스: Gemini REST API 라우터
                                   타입: vision (음식/라벨), insights, coaching

firestore.rules                  — Firestore 보안 규칙 (수정 시 이중 리뷰 필수)
```

### 현재 미구현 항목 (TODO)
- `syncService.ts` `joinFamilyByCode()`: 스텁, 즉시 반환
- `SugarBeeChat.tsx`: 로컬 키워드 매칭 목업 (Gemini 미연결)
- `FamilyView.tsx`: 연결된 가족 수 / 응원 수 하드코딩
- E2E 테스트 스위트 없음
- CI/CD 파이프라인 없음

---

## 디자인 시스템 규칙 (LDS)

- **브랜드 컬러**: `brand-500` = `#06C755`
- **아이콘**: Hugeicons만 사용 — `@hugeicons/react` + `@hugeicons/core-free-icons`  
  strokeWidth는 2.0 또는 2.5 통일
- **모서리**: `rounded-lg` (카드), `rounded-sm` (버튼/입력)
- **그림자**: 플로팅 카드는 `shadow-lds`
- **타이포**: 헤딩 `font-bold`, 본문 `font-medium`
- **금지**: `text-blue-*`, `rounded-3xl/4xl`, 무거운 그라디언트, glassmorphism
- **컴포넌트 우선**: 날것의 Tailwind보다 `src/components/ui/` (Button, Card, Input) 사용

---

## 의무 에이전트 게이트

아래 변경 유형은 지정된 에이전트 리뷰 없이 머지할 수 없다.

| 변경 유형 | 필수 에이전트 | 순서 |
|----------|-------------|------|
| `calcIOB.ts` / `useInsulinCalc.ts` 수정 | `/tdd-guide` + `/healthcare-reviewer` | tdd-guide 먼저, healthcare-reviewer는 구현 후 |
| `firestore.rules` / Firestore 컬렉션 추가 | `/database-reviewer` + `/security-reviewer` | 병렬 실행 |
| `api/` 신규 엔드포인트 | `/security-reviewer` | 구현 후 |
| 신규 React 컴포넌트 / 훅 | `/typescript-reviewer` | 구현 후 |
| `api/gemini.ts` 프롬프트 변경 | `/healthcare-reviewer` + `/security-reviewer` | 병렬 실행 |
| `useAuthStore.ts` 변경 | `/security-reviewer` | 구현 후 |
| UserSettings 안전 범위 변경 | `/healthcare-reviewer` | **하드 블록 — 머지 불가** |
| 신규 npm 패키지 추가 | `/security-reviewer` | 추가 전 |

---

## 기능 타입별 에이전트 워크플로우

### A. 신규 기능 (표준)
```
/planner → /code-architect → /tdd-guide → 구현 → /typescript-reviewer → /code-reviewer
(Firebase/API 포함 시 /security-reviewer 추가)
```

### B. 의료 계산 코드 수정 (강화)
```
/tdd-guide (버그 재현 테스트 먼저 — MANDATORY)
→ 구현
→ /healthcare-reviewer (저혈당/과다투여 위험 검토 — MANDATORY)
→ /typescript-reviewer
→ npm test 전체 통과 확인
```

### C. Firebase / Firestore 변경
```
/database-reviewer + /security-reviewer 동시 실행 → 둘 다 통과 후 머지
```

### D. AI (Gemini) 통합 변경
```
/healthcare-reviewer + /security-reviewer 동시 실행
(healthcare: 프롬프트 의료 안전성 / security: PHI 노출·주입 공격)
→ 둘 다 통과 후 머지
```

### E. UI/UX 컴포넌트
```
구현 (LDS 규칙 준수) → /typescript-reviewer
렌더 과다 의심 시 /performance-optimizer 추가
```

### 에이전트 선택 결정 트리
```
calcIOB.ts / useInsulinCalc.ts 수정?
  → tdd-guide(선) + healthcare-reviewer(후) + typescript-reviewer

firestore.rules / Firestore 컬렉션 추가?
  → database-reviewer + security-reviewer (병렬)

api/gemini.ts 프롬프트/핸들러 변경?
  → healthcare-reviewer + security-reviewer (병렬)

신규 React 컴포넌트/훅?
  → typescript-reviewer

신규 API 엔드포인트?
  → security-reviewer

UserSettings 범위 변경?
  → healthcare-reviewer (머지 블록)

완전 신규 기능?
  → planner → code-architect → tdd-guide → 구현 → 리뷰어들

버그 수정 (의료 계산)?
  → tdd-guide(버그 재현 테스트 먼저) → 수정 → healthcare-reviewer
```

---

## 5대 핵심 기능 로드맵

### 1. SugarBeeChat → Gemini 실제 연결
수정 파일: `api/gemini.ts` (type:"chat" 추가), `geminiService.ts` (chat() 메서드), `useAIStore.ts` (chatMessages 상태), `SugarBeeChat.tsx` (getBeeResponse 교체), `types/index.ts` (ChatMessage 인터페이스)

에이전트 순서:
1. `/security-reviewer` + `/healthcare-reviewer` 병렬 (PHI + 의료 면책 시스템 프롬프트)
2. `/code-architect "SugarBeeChat Gemini 연결 블루프린트"`
3. `/tdd-guide` → GeminiService.chat() 단위 테스트
4. 구현
5. `/typescript-reviewer` + `/healthcare-reviewer` (최종 프롬프트 검토) 병렬

핵심 제약: 푸시 알림에 BG 수치 노출 금지(PHI), 메시지 20회 상한, 구체적 인슐린 용량 추천 거부 프롬프트 필수

### 2. 가족 초대 시스템 구현
수정 파일: `syncService.ts` (joinFamilyByCode 실 구현), `firestore.rules` (초대코드 가입 규칙), `FamilyManagementOverlay.tsx` ("연결하기" 버튼)

에이전트 순서:
1. `/architect` (초대코드 Firestore 조회 방식 — Cloud Function vs 클라이언트 쿼리)
2. `/security-reviewer` (6자리 코드 무차별 대입 대응)
3. `/database-reviewer` (inviteCode 인덱스, 트랜잭션 원자성)
4. `/tdd-guide` → joinFamilyByCode 단위 테스트 4케이스
5. 구현
6. `/security-reviewer` + `/database-reviewer` 병렬 (최종 rules 검토)
7. `/e2e-runner "가족 초대 E2E"`

### 3. E2E 테스트 스위트 구축
현재: calcIOB.test.ts 5개 단위 테스트만 존재. Playwright 미설치.

에이전트 순서:
1. `/planner "E2E 테스트 전략 — Firebase 에뮬레이터 vs MSW 목 전략"`
2. `/code-architect "Playwright 설정 + Page Object 구조"`
3. `/e2e-runner "인슐린 계산 전체 흐름 E2E"` (최우선)
4. `/e2e-runner "저혈당 경고 E2E (BG < 70)"` (의료 안전)
5. `/e2e-runner "IOB 이월 계산 E2E"` (의료 정확성)
6. `/healthcare-reviewer "E2E 테스트 의료 안전 커버리지 검토"`

Gemini 목 전략: Playwright `route.fulfill()`로 `POST /api/gemini` 인터셉트

### 4. GitHub Actions CI/CD
현재: .github/ 없음, 수동 배포.

파이프라인: PR → `tsc --noEmit` + `npm test` + E2E; main 머지 → Firebase + Vercel 배포

에이전트 순서:
1. `/planner "CI/CD 파이프라인 — Vercel Preview + Firebase 에뮬레이터"`
2. `/architect "GitHub Secrets 관리 — fork PR에서 GEMINI_API_KEY 미노출 구성"`
3. `/security-reviewer "pull_request vs pull_request_target fork 안전성"` (critical)
4. `/code-architect "pr.yml + deploy.yml 구조"`
5. 구현 → `/security-reviewer` 최종

핵심 위험: `GEMINI_API_KEY`는 fork PR 빌드에서 절대 노출 금지

### 5. 가족 혈당 기록 시 푸시 알림 (FCM)
현재: FCM 미초기화, 서비스 워커 없음.

에이전트 순서:
1. `/planner "FCM 아키텍처 — Cloud Function vs Vercel Cron, iOS 권한 처리"`
2. `/architect "FCM 토큰 저장 전략, 알림 팬아웃 구조"`
3. `/healthcare-reviewer "잠금화면 알림 PHI 검토"` → BG 값은 앱 열어야만 표시
4. `/security-reviewer "FCM 토큰 Firestore 규칙"`
5. `/database-reviewer "fcmTokens/{uid}/tokens/{deviceId} 스키마 + TTL"`
6. `/code-architect "전체 블루프린트: 서비스 워커, 토큰 훅, Cloud Function"`
7. 구현 → `/typescript-reviewer` + `/security-reviewer` 병렬
8. `/e2e-runner "알림 E2E — 두 브라우저 컨텍스트"`

---

## 환경변수

**프론트엔드 (VITE_ 접두사, 공개)**
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

**백엔드 (Vercel 환경변수, 서버 전용 — VITE_에 절대 넣지 말 것)**
```
GEMINI_API_KEY      — api/gemini.ts에서만 process.env로 사용
ALLOWED_ORIGIN      — CORS 허용 출처
```

**GEMINI_API_KEY는 절대로 VITE_* 변수에 넣어선 안 된다.** 프로덕션은 반드시 api/gemini.ts를 통해 라우팅된다.

---

## 개발 명령어

```bash
npm run dev      # 로컬 개발 서버 :5173 (Gemini 프록시 포함)
npm run build    # tsc + vite build
npm run test     # vitest (calcIOB.test.ts — 항상 통과 유지)
npm run preview  # 프로덕션 빌드 미리보기
```

---

## 배포 트리거

사용자가 아래 문장 중 하나를 입력하거나 `/deploy`를 입력하면 즉시 배포 시퀀스를 실행한다:
- "배포 진행해 줘" / "배포해 줘" / "배포 실행해 줘" / "배포 해줘"

**배포 시퀀스 (순서대로 실행)**:
1. `npm run build` — 실패 시 즉시 중단하고 에러 보고
2. 미커밋 변경사항이 있으면 `git add <변경 파일>` + `git commit`
3. `git push origin main` — Vercel이 GitHub 연동으로 자동 배포 (~23초)
4. 배포 완료 URL 보고: https://pikafika.vercel.app

> Firebase Hosting(`pikafikalife.web.app`)은 사용하지 않는다.
> Vercel만이 `api/gemini.ts` 서버리스 함수를 포함한 전체 앱을 서빙한다.

---

## 세션 저장 규칙

세션 요약을 저장할 때는 반드시 프로젝트 내 아래 경로를 사용한다:

```
logs/sessions/YYYY-MM-DD-session.md
```

- `~/.claude/session-data/` 에는 저장하지 않는다.
- 사용자가 "세션 저장해 줘" 또는 유사한 문장을 입력하면 위 경로에 저장한다.
