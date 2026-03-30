# 강사 카드 생성기(Instructor Card Generator) - 개발 계획서

본 문서는 `PRD.md`에 명시된 요구사항을 바탕으로 수립된 `instructor-card-generator` 프로젝트의 상세 개발 계획(Phase 1 ~ Phase 5)입니다.

## 1. 기술 스택 및 환경
- **프레임워크:** Next.js (App Router 방식), React, TypeScript
- **UI/UX:** Tailwind CSS, shadcn/ui
- **인증:** NextAuth.js (Google OAuth2 + `@teamjcurve.com` 도메인 제한)
- **AI 데이터 추출:** Anthropic Claude API (자연어 처리 및 JSON 구조화)
- **PDF 렌더링:** Playwright + `@sparticuz/chromium` (Vercel Serverless 환경)
- **스토리지:** Google Drive API v3 (팀 드라이브 연동)
- **플랫폼:** Vercel 배포

## 2. 개발 단계별 상세 일정 및 목표 (총 2주)

### Phase 1: 기반 설정 및 인증 (Day 1~2)
- [ ] **프로젝트 초기화:** `npx create-next-app`으로 Next.js 프로젝트 생성, Tailwind CSS, TypeScript 설정, 폴더 구조(src/app, src/components, src/lib) 세팅
- [ ] **UI 구성요소 준비:** shadcn/ui 초기화 및 Button, Input, Card 등 필수 컴포넌트 추가 (`npx shadcn-ui@latest init`)
- [ ] **Google OAuth 연동:** 구글 클라우드 콘솔에서 OAuth Credentials 생성 후 NextAuth.js 연동. 로그인 도메인 `@teamjcurve.com` 검증 로직 구현

### Phase 2: 파일 업로드 로직 및 AI 추출 기능 (Day 3~5)
- [ ] **파일 파서 라이브러리 연동:** PPTX, DOCX, PDF 각 형식에서 텍스트를 추출하기 위한 라이브러리(예: `pdf-parse`, `mammoth`, `textract` 등) 검토 및 적용
- [ ] **Claude API 연동:** 추출된 텍스트 원본을 Anthropic Claude API에 전송 후 PRD에 명시된 강사 데이터 구조(성명, 직함, 경력, 학위 등)를 담은 JSON으로 응답받도록 프롬프트 최적화
- [ ] **에러 핸들링 및 Fallback:** 텍스트 추출에 실패하거나 API 할당량 초과 시 사용자가 수동으로 폼을 작성할 수 있도록 예외처리 병행

### Phase 3: 편집 폼 및 템플릿 실시간 미리보기 (Day 6~9)
- [ ] **좌/우 뷰포트 레이아웃 구성:** 좌측에는 편집 폼, 우측에는 미리보기를 배치하는 반응형 레이아웃 개발
- [ ] **데이터 바인딩:** AI가 추출한 JSON 팩토리 데이터를 React State(Context 혹은 Zustand)로 연결해 입력폼 변경 즉시 미리보기 레이아웃 갱신
- [ ] **표준 템플릿 마크업 작성:** A4 사이즈(210mm × 297mm) CSS 기반 템플릿 마크업 (헤더 파란 로고, 나눔고딕 등 폰트 지정, 지정된 섹션 배치)
- [ ] **사진 크롭 기능:** 강사 프로필 사진 업로드 및 크롭(`react-image-crop` 등) 적용하여 최적 비율로 배치

### Phase 4: Serverless PDF 생성 및 Google Drive 모듈 연동 (Day 10~12)
- [ ] **PDF 변환 API 생성:** 클라이언트에서 전송된 최종 HTML 렌더 결과물(또는 상태 객체)을 넘겨받아 Playwright가 Headless 모드로 띄운 뒤 PDF 생성을 수행하는 `/api/generate-pdf` 구축
- [ ] **Google Drive API 커넥션:** Service Account (GCP) Credentials을 사용해 지정된 강사카드 폴더 ID에 권한(Write)을 획득
- [ ] **업로드 프로세스 통합:** PDF 생성 완료 직후 `drive.files.create`를 호출해 Drive 전송 완료 후 WebLink URL을 리턴하고 프론트엔드 화면에 공유 링크 표시 (덮어쓰기 금지 정책 적용)

### Phase 5: QA 모니터링 및 Vercel 실배포 (Day 13~14)
- [ ] **E2E 테스트 수행:** 실제 샘플 PPTX/DOCX을 업로드하여 Parsing → Preview → PDF 다운로드 → Drive Link 확인의 전체 Flow 점검
- [ ] **Vercel 실 서비스 배포:** Vercel에 환경변수(Env) 할당 후 Production Build 배포
- [ ] **보안 및 최적화 점검:** Vercel 함수 실행 시간 (timeout 제한 이슈) 대응, `@teamjcurve.com` 검증 등 QA 진행

## 3. 핵심 리스크 대응 방안
- **Vercel Serverless 용량 및 실행 시간 제한 (10s/60s):** Chrome 바이너리 크기로 인해 배포 제한이 생길 수 있으므로 `@sparticuz/chromium` 또는 puppeteer-core 조합을 사용하고 Vercel Pro Function 설정 필요함을 인지.
- **AI 부정확성에 대한 UX 보완:** Claude API의 환각(Hallucination) 현상을 고려해 강사가 수동 보정하도록 UX 유도 (저장 전 최종 Confirm 모달 등).

---
위 계획이 확정되면 Phase 1의 프로젝트 셋업 작업(Next.js 초기화 및 Auth 설정)을 진행하게 됩니다.
