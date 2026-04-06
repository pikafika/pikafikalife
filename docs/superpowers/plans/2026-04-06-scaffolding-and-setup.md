# 프로젝트 스캐폴딩 및 환경 설정 구현 계획서

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vite + React + TypeScript 환경을 구축하고, Tailwind CSS 및 기본 폴더 구조를 설정하여 TDD가 가능한 개발 환경을 준비합니다.

**Architecture:** Vite를 빌드 도구로 사용하며, React(TypeScript) 프레임워크와 Tailwind CSS 스타일링 라이브러리를 통합합니다. Zustand를 상태 관리에, Vitest를 테스트 도구로 사용합니다.

**Tech Stack:** Vite, React, TypeScript, Tailwind CSS, Zustand, Vitest, Lucide React, Recharts, clsx, tailwind-merge.

---

### Task 1: Git 초기화 및 기존 파일 정리

**Files:**
- Modify: `.gitignore`
- Rename: `index.html` -> `index.vanilla.html`
- Rename: `style.css` -> `style.vanilla.css`

- [ ] **Step 1: Git 저장소 초기화**

Run: `git init`

- [ ] **Step 2: 기본 .gitignore 작성**

Create `.gitignore`:
```text
node_modules
dist
.DS_Store
*.local
```

- [ ] **Step 3: 기존 파일 백업 (충돌 방지)**

Run: `mv index.html index.vanilla.html`
Run: `mv style.css style.vanilla.css`

- [ ] **Step 4: 커밋**

Run: `git add . && git commit -m "chore: initial commit and backup existing files"`

---

### Task 2: Vite 프로젝트 구성 및 종속성 설치

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`

- [ ] **Step 1: package.json 초기화 및 필수 라이브러리 설치**

Run: `npm init -y`
Run: `npm install react react-dom zustand lucide-react recharts clsx tailwind-merge`
Run: `npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom vitest @testing-library/react @testing-library/jest-dom jsdom tailwindcss autoprefixer postcss`

- [ ] **Step 2: tsconfig.json 작성**

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ScriptHost", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: vite.config.ts 및 Vitest 설정**

Create `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

- [ ] **Step 4: 커밋**

Run: `git add package.json tsconfig.json vite.config.ts && git commit -m "chore: setup vite, typescript, and vitest"`

---

### Task 3: Tailwind CSS 및 폴더 구조 설정

**Files:**
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `src/index.css`
- Create: 여러 폴더

- [ ] **Step 1: Tailwind CSS 초기화 및 설정**

Run: `npx tailwindcss init -p`
Modify `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0891B2",
        cta: "#059669",
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: 기본 index.css 작성**

Create `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: 폴더 구조 생성**

Run: `mkdir -p src/components src/features src/hooks src/store src/types src/utils src/data src/test`

- [ ] **Step 4: 커밋**

Run: `git add tailwind.config.js postcss.config.js src/index.css && git commit -m "chore: setup tailwind and folder structure"`

---

### Task 4: 기본 React 진입점 및 TDD 검증

**Files:**
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/App.test.tsx`
- Create: `src/test/setup.ts`

- [ ] **Step 1: index.html 작성**

Create `index.html`:
```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>인슐린 계산기</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: test/setup.ts 작성**

Create `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 3: App.test.tsx 작성 (TDD 시작)**

Create `src/App.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react';
import App from './App';
import { expect, test } from 'vitest';

test('renders app title', () => {
  render(<App />);
  expect(screen.getByText(/인슐린 계산기/i)).toBeInTheDocument();
});
```

- [ ] **Step 4: 테스트 실패 확인**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL (App.tsx 없음)

- [ ] **Step 5: App.tsx 및 main.tsx 작성**

Create `src/App.tsx`:
```tsx
function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <h1 className="text-3xl font-bold text-primary">인슐린 계산기</h1>
    </div>
  );
}
export default App;
```

Create `src/main.tsx`:
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 6: 테스트 성공 확인 및 커밋**

Run: `npx vitest run src/App.test.tsx`
Expected: PASS
Run: `git add . && git commit -m "feat: initial react entry point and verified with test"`
