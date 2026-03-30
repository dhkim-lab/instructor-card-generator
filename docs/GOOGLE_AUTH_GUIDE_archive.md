# Google OAuth & NextAuth 설정 가이드

본 가이드는 강사 카드 생성기에서 Google 로그인을 구현하기 위해 필요한 환경 변수(`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)를 발급받는 방법을 설명합니다.

---

## 1. Google Cloud Console 프로젝트 생성 및 설정

1. **[Google Cloud Console](https://console.cloud.google.com/)**에 접속하여 로그인합니다.
2. 상단 프로젝트 선택 메뉴에서 **[새 프로젝트(New Project)]**를 클릭하여 프로젝트를 생성합니다. (예: `Instructor Card Generator`)
3. **[API 및 서비스 > OAuth 동의 화면]** 메뉴로 이동합니다.
   - **User Type**: `Internal` (팀제이커브 워크스페이스 전용인 경우) 또는 `External`을 선택하고 **[만들기]**를 클릭합니다.
   - **앱 정보**: 앱 이름, 사용자 지원 이메일 등을 입력하고 저장합니다.
4. **[API 및 서비스 > 사용자 인증 정보]** 메뉴로 이동합니다.
   - **[+ 사용자 인증 정보 만들기] > [OAuth 클라이언트 ID]**를 선택합니다.
   - **애플리케이션 유형**: `웹 애플리케이션`
   - **이름**: `Instructor Card Web`
   - **승인된 리디렉션 URI**: 다음 주소를 추가합니다.
     - `http://localhost:3000/api/auth/callback/google` (로컬 테스트용)
     - `https://dhkim-lab.vercel.app/api/auth/callback/google` (실제 배포 주소)
5. 생성이 완료되거나 클라이언트 ID를 클릭하면 **Client ID**와 **Client Secret**을 확인할 수 있습니다.

---

## 2. `.env` 파일 작성법

발급받은 값들을 `.env` 파일에 다음과 같이 입력하세요.

```bash
# 발급받은 클라이언트 ID
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com

# 발급받은 클라이언트 보안 비밀번호
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx

# NextAuth 암호화 키 (아무 무작위 문자열이나 입력하세요)
# 터미널에서 'openssl rand -base64 32'를 실행하여 생성하는 것을 권장합니다.
NEXTAUTH_SECRET=pS/I5mR3X...your_random_secret...

# 앱의 메인 URL
# 로컬 개발 시에는 아래 주소 고정입니다.
NEXTAUTH_URL=http://localhost:3000
```

---

## 팁: NEXTAUTH_SECRET 생성 방법
맥 터미널(Terminal)에서 아래 명령어를 입력하면 안전한 문자열을 즉시 얻을 수 있습니다:
```bash
openssl rand -base64 32
```
나온 결과값을 그대로 복사해서 `NEXTAUTH_SECRET`에 붙여넣으시면 됩니다.
