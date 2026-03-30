# 환경 설정 가이드 — Google OAuth & Drive API

> 통합 문서: GOOGLE_AUTH_GUIDE.md + GOOGLE_DRIVE_SETUP_GUIDE.md (2026-03-27)

---

## Part 1. Google OAuth & NextAuth 설정

강사 카드 생성기에서 Google 로그인을 구현하기 위해 필요한 환경 변수(`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)를 발급받는 방법.

### 1-1. Google Cloud Console 프로젝트 생성

1. **[Google Cloud Console](https://console.cloud.google.com/)**에 접속하여 로그인
2. 상단 프로젝트 선택 메뉴에서 **[새 프로젝트]** 클릭하여 프로젝트 생성 (예: `Instructor Card Generator`)
3. **[API 및 서비스 > OAuth 동의 화면]** 메뉴 이동
   - **User Type**: `Internal` (팀제이커브 워크스페이스 전용) 또는 `External` 선택 후 **[만들기]** 클릭
   - **앱 정보**: 앱 이름, 사용자 지원 이메일 등 입력 후 저장
4. **[API 및 서비스 > 사용자 인증 정보]** 메뉴 이동
   - **[+ 사용자 인증 정보 만들기] > [OAuth 클라이언트 ID]** 선택
   - **애플리케이션 유형**: `웹 애플리케이션`
   - **이름**: `Instructor Card Web`
   - **승인된 리디렉션 URI** 추가:
     - `http://localhost:3000/api/auth/callback/google` (로컬 테스트용)
     - `https://dhkim-lab.vercel.app/api/auth/callback/google` (실제 배포 주소)
5. 생성 완료 후 **Client ID**와 **Client Secret** 확인

### 1-2. OAuth .env 항목

```bash
# 발급받은 클라이언트 ID
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com

# 발급받은 클라이언트 보안 비밀번호
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx

# NextAuth 암호화 키 (openssl rand -base64 32 으로 생성 권장)
NEXTAUTH_SECRET=pS/I5mR3X...your_random_secret...

# 앱의 메인 URL (로컬 개발 시 고정)
NEXTAUTH_URL=http://localhost:3000
```

**팁**: NEXTAUTH_SECRET 생성 → `openssl rand -base64 32` 실행 후 결과값 복사

---

## Part 2. Google Drive API & 서비스 계정 설정

PDF 파일을 Google Drive에 자동 업로드하기 위한 환경 변수(`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_DRIVE_FOLDER_ID`) 설정.

### 2-1. Google Drive API 활성화

1. **[Google Cloud Console](https://console.cloud.google.com/)** 접속
2. 프로젝트(예: `Instructor Card Generator`) 선택 확인
3. 상단 검색창에 **"Google Drive API"** 검색 → **[활성화(Enable)]** 클릭

### 2-2. 서비스 계정 생성 및 키 발급

1. **[IAM 및 관리자 > 서비스 계정]** 메뉴 이동
2. **[+ 서비스 계정 만들기]** 클릭
   - **이름**: `drive-uploader`
   - **설명**: `Instructor Card Generator PDF Uploader`
3. **[만들기 및 계속하기]** → 역할 선택 없이 **[완료]**
4. 생성된 서비스 계정 **이메일 주소** 복사 (예: `drive-uploader@...iam.gserviceaccount.com`)
   → `.env`의 `GOOGLE_SERVICE_ACCOUNT_EMAIL`
5. 서비스 계정 클릭 → **[키(Keys)]** 탭
6. **[키 추가] > [새 키 만들기]** → **JSON** 형식 → **[만들기]**
7. 다운로드된 JSON에서 확인:
   - `client_email`: 위 이메일과 동일
   - `private_key`: `-----BEGIN PRIVATE KEY-----\n...` 문자열
   → `.env`의 `GOOGLE_PRIVATE_KEY`에 따옴표(`"`) 포함하여 붙여넣기

### 2-3. Google Drive 폴더 공유 (필수)

서비스 계정은 일반 사용자가 아니므로 업로드 폴더에서 직접 권한을 부여해야 한다.

1. Google Drive에서 PDF 저장 폴더 생성 또는 선택
2. **[공유]** 메뉴 열기
3. 서비스 계정 이메일 입력 → **[에디터(Editor)]** 권한 부여 후 전송
4. 폴더 URL에서 ID 복사
   - URL 예: `https://drive.google.com/drive/u/0/folders/1A2B3C4D5E6F7G8H9I0J`
   - `1A2B3C4D5E6F7G8H9I0J` → `GOOGLE_DRIVE_FOLDER_ID`

### 2-4. Drive .env 항목

```bash
# 서비스 계정 이메일
GOOGLE_SERVICE_ACCOUNT_EMAIL=drive-uploader@project-id.iam.gserviceaccount.com

# 서비스 계정 개인 키 (줄바꿈 \n 포함, 반드시 큰따옴표로 감싸기)
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQE...[생략]...\n-----END PRIVATE KEY-----\n"

# PDF 저장 폴더 ID
GOOGLE_DRIVE_FOLDER_ID=1A2B3C4D5E6F7G8H9I0J
```

---

## 전체 .env 체크리스트

| 변수 | 출처 | 설명 |
|------|------|------|
| `GOOGLE_CLIENT_ID` | OAuth 클라이언트 | Google 로그인용 |
| `GOOGLE_CLIENT_SECRET` | OAuth 클라이언트 | Google 로그인용 |
| `NEXTAUTH_SECRET` | 직접 생성 | 세션 암호화 키 |
| `NEXTAUTH_URL` | 직접 입력 | 앱 URL |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | 서비스 계정 JSON | Drive 업로드용 |
| `GOOGLE_PRIVATE_KEY` | 서비스 계정 JSON | Drive 업로드용 |
| `GOOGLE_DRIVE_FOLDER_ID` | Drive 폴더 URL | PDF 저장 위치 |

## 주의사항
- `GOOGLE_PRIVATE_KEY` 입력 시 JSON 파일의 `\n` 문자를 그대로 유지
- 폴더 공유를 잊으면 `404 File Not Found` 또는 `Permission Denied` 오류 발생
- Vercel 배포 시 Environment Variables에 동일하게 등록 필요
