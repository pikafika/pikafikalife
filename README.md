# 🩵 PikafikaLife (피카피카 라이프)

**1형 당뇨인을 위한 스마트 건강 도우미 및 인슐린 계산기**

PikafikaLife는 1형 당뇨인들이 일상에서 혈당을 더 정밀하게 관리하고, AI의 도움을 받아 건강한 생활 패턴을 만들어갈 수 있도록 돕는 웹 애플리케이션입니다.

![PikafikaLife Dashboard](https://pikafikalife.web.app/assets/index-BICgXjKV.css) <!-- 실제 스크린샷 링크가 있다면 교체 가능 -->

## 🚀 주요 기능

### 1. 정밀 인슐린 계산기
- 현재 혈당과 섭취 예정인 탄수화물 양을 입력하면 최적의 인슐린 용량을 계산해 줍니다.
- 사용자의 민감도(ISF), 당탄비(I:C) 설정을 기반으로 개인화된 결과를 제공합니다.

### 2. AI 데이터 분석 코칭 (Gemini AI 연동)
- 입력된 혈당 데이터를 기반으로 Google Gemini AI가 현재 상태를 분석하고 맞춤형 건강 코칭 메시지를 제공합니다.
- 오늘의 인사이트를 통해 식단 팁, 전문가 조언, 레시피 등을 추천받을 수 있습니다.

### 3. 실시간 클라우드 동기화 (Firebase 연동)
- **Google 로그인**을 통해 여러 기기에서 데이터를 안전하게 동기화할 수 있습니다.
- 브라우저를 닫아도 기록이 유지되며, 언제 어디서든 이전 기록을 확인할 수 있습니다.

### 4. 우리 가족 공유 기능
- 가족 구성원을 초대하여 혈당 기록을 실시간으로 공유하고 함께 관리할 수 있습니다.

### 5. 건강 리포트 및 트렌드 차트
- 일일 탄수화물 섭취량, 총 인슐린 투여량, 평균 혈당 등 주요 지표를 직관적으로 보여줍니다.
- 실시간 혈당 변화 추이를 차트로 확인할 수 있습니다.

## 🛠 Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS, Lucid-React Icons
- **State Management:** Zustand
- **Backend/Auth:** Firebase (Authentication, Firestore)
- **AI:** Google Generative AI (Gemini 2.0 Flash)
- **Charts:** Recharts

## 📦 설치 및 실행 방법

### 로컬 실행
1. 저장소를 클론합니다.
   ```bash
   git clone https://github.com/pikafika/pikafikalife.git
   cd PikafikaLife
   ```
2. 의존성을 설치합니다.
   ```bash
   npm install
   ```
3. `.env` 파일을 생성하고 필요한 API 키를 입력합니다.
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   ... (기타 Firebase 설정)
   ```
4. 개발 서버를 실행합니다.
   ```bash
   npm run dev
   ```

### 배포 방법 (Firebase Hosting)
```bash
npm run build
npx firebase-tools deploy
```

## 🌐 라이브 데모
[https://pikafikalife.web.app](https://pikafikalife.web.app)

---
© 2026 Pikafika. All rights reserved.
