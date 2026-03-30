# Google Drive API & 서비스 계정 설정 가이드

본 가이드는 강사 카드 생성기에서 PDF 파일을 Google Drive에 자동으로 업로드하기 위해 필요한 환경 변수(`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_DRIVE_FOLDER_ID`)를 설정하는 방법을 설명합니다.

---

## 1. Google Drive API 활성화

1. **[Google Cloud Console](https://console.cloud.google.com/)**에 접속합니다.
2. 이전에 만든 프로젝트(예: `Instructor Card Generator`)가 선택되어 있는지 확인합니다.
3. 상단 검색창에 **"Google Drive API"**를 검색하여 선택한 후 **[활성화(Enable)]** 버튼을 클릭합니다.

---

## 2. 서비스 계정(Service Account) 생성 및 키 발급

1. **[IAM 및 관리자 > 서비스 계정]** 메뉴로 이동합니다.
2. 상단의 **[+ 서비스 계정 만들기]**를 클릭합니다.
   - **이름**: `drive-uploader` (또는 자유롭게 입력)
   - **설명**: `Instructor Card Generator PDF Uploader`
3. **[만들기 및 계속하기]**를 클릭하고, 역할(Role) 선택 없이 **[완료]**를 누릅니다.
4. 생성된 서비스 계정의 **이메일 주소**를 복사해 둡니다. (예: `drive-uploader@...iam.gserviceaccount.com`)
   - **이 값이 `.env`의 `GOOGLE_SERVICE_ACCOUNT_EMAIL`이 됩니다.**
5. 해당 서비스 계정을 클릭한 후 상단 탭에서 **[키(Keys)]**를 선택합니다.
6. **[키 추가] > [새 키 만들기]**를 클릭하고 **JSON** 형식을 선택하여 **[만들기]**를 누릅니다.
7. 다운로드된 JSON 파일을 열어 다음 정보를 확인합니다:
   - `client_email`: 위에서 복사한 이메일과 동일합니다.
   - `private_key`: `-----BEGIN PRIVATE KEY-----\n...`으로 시작하는 긴 문자열입니다.
   - **이 값을 `.env`의 `GOOGLE_PRIVATE_KEY`에 따옴표(`"`)를 포함하여 그대로 붙여넣습니다.**

---

## 3. Google Drive 폴더 공유 (필수!)

서비스 계정은 일반 사용자가 아니므로, **업로드할 폴더 측에서 권한을 주어야 합니다.**

1. Google Drive에서 PDF가 저장될 **폴더를 생성**하거나 선택합니다.
2. 해당 폴더의 **[공유]** 메뉴를 엽니다.
3. 위에서 복사한 **서비스 계정 이메일**을 입력하고 **[에디터(Editor)]** 권한을 부여한 뒤 전송합니다.
4. 해당 폴더의 URL에서 ID 부분을 복사합니다.
   - URL 예시: `https://drive.google.com/drive/u/0/folders/1A2B3C4D5E6F7G8H9I0J`
   - 여기서 `1A2B3C4D5E6F7G8H9I0J` 부분이 **`GOOGLE_DRIVE_FOLDER_ID`**가 됩니다.

---

## 4. `.env` 작성 예시

```bash
# 서비스 계정 이메일 (JSON의 client_email)
GOOGLE_SERVICE_ACCOUNT_EMAIL=drive-uploader@project-id.iam.gserviceaccount.com

# 서비스 계정 개인 키 (JSON의 private_key)
# 줄바꿈(\n)이 포함된 긴 문자열을 반드시 큰따옴표("")로 감싸주세요.
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwgg...[생략]...\n-----END PRIVATE KEY-----\n"

# PDF가 저장될 구글 드라이브 폴더 ID
GOOGLE_DRIVE_FOLDER_ID=1A2B3C4D5E6F7G8H9I0J
```

---

## ⚠️ 주의사항
- `GOOGLE_PRIVATE_KEY`를 입력할 때 JSON 파일에 있는 `\n` 문자를 그대로 유지해야 합니다.
- 폴더 공유를 잊으면 `404 File Not Found` 또는 `Permission Denied` 오류가 발생합니다.
