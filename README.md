# 팀제이커브 강사카드 생성기

강사의 이력서 파일(PDF/PPTX/DOCX)을 업로드하면 AI가 자동으로 정보를 추출하고, 편집 후 팀제이커브 브랜드 강사카드 PDF를 Google Drive에 저장하는 내부 도구입니다.

> **접근 제한:** `@teamjcurve.com` Google 계정으로만 로그인 가능합니다.

---

## 주요 기능

- **파일 업로드 & AI 추출** — PDF, PPTX, DOCX 업로드 시 Claude AI가 강사 정보를 자동 파싱
- **스마트 프로필 사진 인식** — 이미지 비율·크기 등 휴리스틱으로 프로필 사진 자동 선택
- **동적 섹션** — 고정 항목에 맞지 않는 정보는 AI가 커스텀 섹션으로 자동 생성
- **실시간 미리보기** — 편집 내용이 A4 카드 미리보기에 즉시 반영, 멀티페이지 지원
- **PDF 생성** — Playwright(headless Chrome)로 인쇄 품질 PDF 생성
- **Google Drive 저장** — 서비스 계정을 통해 지정 Drive 폴더에 자동 업로드
- **로컬 다운로드** — Drive 저장 없이 PDF를 직접 다운로드 가능

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) + TypeScript |
| 인증 | NextAuth.js v4 + Google OAuth (도메인 제한) |
| AI | Anthropic Claude API (claude-sonnet) |
| PDF 생성 | Playwright Core + @sparticuz/chromium |
| 파일 파싱 | unpdf (PDF), JSZip (PPTX), mammoth (DOCX) |
| 이미지 처리 | sharp |
| Google Drive | googleapis (서비스 계정 JWT) |
| UI | shadcn/ui + Tailwind CSS v4 |
| 폼 | react-hook-form + zod |

---

## 사전 준비

### 1. Google OAuth 앱 설정

1. [Google Cloud Console](https://console.cloud.google.com) → 프로젝트 생성 (또는 기존 사용)
2. **API 및 서비스 → OAuth 동의 화면** 설정
   - 사용자 유형: 내부 (또는 외부 + 테스트 사용자 추가)
3. **사용자 인증 정보 → OAuth 2.0 클라이언트 ID** 생성
   - 유형: 웹 애플리케이션
   - 승인된 리디렉션 URI: `http://localhost:3000/api/auth/callback/google`
4. **클라이언트 ID**와 **클라이언트 보안 비밀번호** 복사

### 2. Google 서비스 계정 설정 (Drive 업로드용)

1. **API 및 서비스 → 서비스 계정** → 새 서비스 계정 생성
2. **키 탭 → 키 추가 → JSON** 다운로드
3. JSON에서 `client_email`과 `private_key` 값을 추출
4. Google Drive에서 저장할 폴더를 열고 → 공유 → 위 서비스 계정 이메일을 **편집자**로 추가

### 3. Anthropic API 키

- [Anthropic Console](https://console.anthropic.com) → API Keys → 새 키 생성

---

## 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```env
# NextAuth
NEXTAUTH_SECRET=랜덤_32자_문자열  # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (로그인)
GOOGLE_CLIENT_ID=your_oauth_client_id
GOOGLE_CLIENT_SECRET=your_oauth_client_secret

# Google 서비스 계정 (Drive 업로드)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"

# Google Drive 저장 폴더 ID
# 폴더 URL: https://drive.google.com/drive/folders/{FOLDER_ID}
GOOGLE_DRIVE_FOLDER_ID=your_folder_id

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-...
```

> `GOOGLE_PRIVATE_KEY` 값의 줄바꿈은 반드시 `\n`으로 표기하고 전체를 큰따옴표로 감싸야 합니다.

---

## 로컬 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속 → `@teamjcurve.com` Google 계정으로 로그인

---

## 사용 방법

1. **로그인** — 우상단 Google 로그인 버튼 클릭 (teamjcurve.com 계정 필수)
2. **파일 업로드** — 강사 이력서 파일(PDF/PPTX/DOCX) 업로드 또는 드래그 앤 드롭
   - AI가 자동으로 정보를 추출하고 에디터로 이동
   - 또는 "빈 템플릿으로 시작하기" 클릭
3. **내용 편집** — 좌측 폼에서 프로필 정보, 학력, 경력, 프로젝트 등 수정
   - 우측 미리보기에 실시간 반영
4. **저장/다운로드**
   - **Drive 저장**: Google Drive 지정 폴더에 자동 업로드 → 링크 제공
   - **PDF 다운로드**: 로컬로 직접 저장

파일명 규칙: `[팀제이커브] 강사프로필_강사명_YYYYMMDD.pdf`

---

## 접근 제한

`src/lib/auth.ts`에서 `@teamjcurve.com` 도메인만 허용:

```typescript
async signIn({ user }) {
  if (user.email?.endsWith("@teamjcurve.com")) {
    return true;
  }
  return false;
}
```

다른 도메인으로 로그인 시도 시 자동 거부됩니다.

---

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                  # 홈 (파일 업로드)
│   ├── editor/page.tsx           # 강사카드 에디터
│   └── api/
│       ├── upload/route.ts       # 파일 파싱 + AI 추출
│       ├── generate-pdf/route.ts # PDF 생성 + Drive 업로드
│       └── auth/[...nextauth]/   # NextAuth 핸들러
├── components/
│   └── editor/
│       ├── instructor-form.tsx   # 좌측 편집 폼
│       ├── card-preview.tsx      # 우측 A4 미리보기
│       └── success-modal.tsx     # Drive 저장 완료 모달
└── lib/
    ├── auth.ts                   # NextAuth 설정 (도메인 제한)
    ├── pdf-template.ts           # 강사카드 HTML 템플릿
    └── schemas.ts                # Zod 데이터 스키마
```

---

## 배포 (Vercel)

1. Vercel에 프로젝트 연결
2. 환경 변수 설정 (위 `.env` 항목 모두)
3. `NEXTAUTH_URL`을 실제 배포 URL로 변경
4. Google OAuth 콘솔에서 리디렉션 URI에 `https://your-domain/api/auth/callback/google` 추가
5. 배포 후 Drive 폴더에 서비스 계정 공유 확인

> Vercel 환경에서는 `@sparticuz/chromium`이 자동으로 사용됩니다. 로컬에서는 `/Applications/Google Chrome.app`이 감지되면 로컬 Chrome을 사용합니다.
