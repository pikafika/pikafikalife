---
description: PikafikaLife 빌드 → 커밋 → GitHub push (Vercel 자동 배포)
---

# Deploy — PikafikaLife 배포

다음 순서로 배포를 진행한다:

1. `npm run build` — 빌드 검증. 실패 시 즉시 중단하고 에러 내용 보고
2. `git status`로 미커밋 변경사항 확인
3. 변경사항이 있으면 해당 파일만 `git add` 후 적절한 메시지로 `git commit`
4. `git push origin main` — Vercel GitHub 연동으로 자동 배포 (~23초)
5. 배포 완료 URL 보고: https://pikafika.vercel.app

> Firebase Hosting은 사용하지 않는다. Vercel이 프론트엔드 + api/gemini.ts 서버리스 함수를 모두 서빙한다.
