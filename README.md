# 🩵 PikafikaLife (피카피카 라이프)

**1형 당뇨인을 위한 스마트 건강 도우미 및 정밀 인슐린 계산기**

PikafikaLife는 1형 당뇨인들이 일상에서 혈당을 더 정밀하게 관리하고, AI의 따뜻한 코칭과 함께 건강한 생활 패턴을 만들어갈 수 있도록 돕는 프리미엄 건강 관리 플랫폼입니다.

---

## ✨ 핵심 프리미엄 기능

### 1. 🧬 정밀 인슐린 계산기 (Step-by-step Flow)
- **3단계 정밀 계산**: 현재 혈당 측정 → 음식 탄수화물 합산 → 최적 투여 용량 제안으로 이어지는 직관적인 프로세스를 제공합니다.
- **개인화 설정**: 사용자의 인슐린 민감도(ISF), 당탄비(I:C)를 기반으로 오차 없는 보정 용량을 계산합니다.
- **음식 데이터베이스**: 자주 먹는 음식의 탄수화물 함량을 즉시 검색하고 합산할 수 있습니다.

### 2. 📱 심리스 오버레이 UX (Full-screen Overlay System)
- **방해 없는 경험**: 기존 레이아웃을 해치지 않고 화면 전체를 덮는 프리미엄 오버레이 방식을 적용하여, 계산기나 리포트를 볼 때 몰입감을 극대화했습니다.
- **스티키 카테고리**: 긴 음식 목록을 탐색할 때도 카테고리 탭이 상단에 고정되어 편리한 전환이 가능합니다.

### 3. 🤖 AI 인사이트 & 코칭 (Gemini 1.5 Flash)
- **오늘의 스토리**: 단순 숫자를 넘어 AI가 분석한 오늘의 건강 이야기를 카드 형태로 제공합니다.
- **정밀 리포트**: 최근 7일간의 혈당 트렌드를 분석하여 행동 지침과 격려가 담긴 개인화된 리포트를 생성합니다.

### 4. ☁️ 실시간 클라우드 동기화 (Firebase)
- **안전한 보안**: Google Authentication을 통해 데이터를 보호하며, 모든 기록은 Firestore를 통해 실시간으로 기기 간 동기화됩니다.
- **가족 공유**: 가족 그룹 기능을 통해 소중한 사람의 혈당 상태를 실시간으로 확인하고 케어할 수 있습니다.

---

## 🛠 Tech Stack

- **Frontend**: `React 18`, `TypeScript`, `Vite`
- **Styling**: `Tailwind CSS`, `Framer Motion` (Animations)
- **State**: `Zustand`
- **Backend/BAAS**: `Firebase` (Auth, Firestore, Hosting)
- **AI Engine**: `Google Gemini 1.5 Flash`
- **Icons**: `Hugeicons` (Premium Icon Pack)

---

## 📦 시작하기

### 로컬 개발 환경 설정
1. 저장소 클론
   ```bash
   git clone https://github.com/pikafika/pikafikalife.git
   cd PikafikaLife
   ```
2. 의존성 설치
   ```bash
   npm install
   ```
3. 환경 변수 설정
   `.env` 파일을 생성하고 다음 항목을 입력합니다.
   ```env
   VITE_GEMINI_API_KEY=발급받은_키
   VITE_FIREBASE_API_KEY=발급받은_키
   ...
   ```
4. 실행
   ```bash
   npm run dev
   ```

---

## 🌐 라이브 서비스
실제 서비스 중인 주소에서 프리미엄 경험을 시작해 보세요.
👉 [https://pikafikalife.web.app](https://pikafikalife.web.app)

---
© 2026 Pikafika. All rights reserved.
