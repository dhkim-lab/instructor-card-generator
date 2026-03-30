# Instructor Card Generator — 개선 스펙 v1.0

> 작성일: 2026-03-27
> QA 분석 결과 기반, 배포 전 개선 사항 정리

---

## 개선 영역 총 8개

| # | 영역 | 우선순위 | 난이도 | 관련 파일 |
|---|------|---------|--------|----------|
| 1 | 미리보기-PDF 렌더링 통일 | 🔴 P0 | 높음 | card-preview.tsx, pdf-template.ts |
| 2 | 내용 잘림 수정 (동적 페이지) | 🔴 P0 | 중간 | card-preview.tsx, pdf-template.ts |
| 3 | 편집 UX (섹션 정렬 + Undo) | 🟠 P1 | 중간 | editor 컴포넌트 전체 |
| 4 | 프로필 사진 Fallback | 🟠 P1 | 낮음 | pdf-template.ts, upload/route.ts |
| 5 | 강사 데이터 저장/재사용 | 🟠 P1 | 중간 | 신규 모듈 필요 |
| 6 | 입력 소스 확장 (Notion, 복합) | 🟡 P2 | 높음 | upload/route.ts |
| 7 | 버전 관리 (동일 강사 이력) | 🟡 P2 | 낮음 | generate-pdf/route.ts |
| 8 | 토큰 효율성 | 🟡 P2 | 낮음 | upload/route.ts |

---

## 1. 미리보기-PDF 렌더링 통일 (P0)

### 현재 문제
- `card-preview.tsx`는 React + Tailwind로 렌더링
- `pdf-template.ts`는 순수 HTML/CSS 문자열로 렌더링
- 두 렌더링 결과가 불일치 → "미리보기에서 괜찮은데 PDF가 다르다"

### 개선 방안
**동일 HTML 기반 통합 렌더링**

1. `pdf-template.ts`의 HTML을 **단일 진실 공급원(Single Source of Truth)**으로 설정
2. `card-preview.tsx`에서 해당 HTML을 `<iframe srcDoc={html}>` 방식으로 렌더링
3. 편집 시 React state 변경 → HTML 재생성 → iframe 갱신

```
[편집 폼] → [InstructorData state] → [generateTemplate(data)] → [HTML 문자열]
                                                                      ↓
                                                         ┌─────────────┼─────────────┐
                                                         ↓                           ↓
                                                   [iframe 미리보기]          [Playwright PDF]
```

### 구현 포인트
- `generateTemplate()` 함수를 공용 유틸로 분리
- iframe 내 스크롤 허용, 줌 컨트롤 추가 (미리보기용)
- A4 비율 유지: `width: 210mm` 기준 스케일링
- 폰트 로딩: 미리보기에서도 동일 웹폰트(@font-face) 사용 보장

### 예상 작업량
- 2~3일

---

## 2. 내용 잘림 수정 — 동적 페이지 분배 (P0)

### 현재 문제
- `card-preview.tsx` 259라인: `overflow: "hidden"` → 내용 잘림
- 하드코딩 2페이지 분할 (page1=profile+education+experiences, page2=나머지)
- 경력이 많은 강사는 1페이지에서 잘리고, 경력이 적은 강사는 2페이지가 텅 빔

### 개선 방안
**CSS `break-inside: avoid` + `@page` 규칙 활용**

```css
@page {
  size: A4;
  margin: 18mm 15mm 16mm 15mm;
}

.section {
  break-inside: avoid;
  page-break-inside: avoid;
}

.section-row {
  break-inside: avoid;  /* 테이블 행 단위 분리 방지 */
}
```

- `overflow: hidden` 제거
- 페이지 수를 하드코딩하지 않고, CSS가 자연스럽게 페이지를 나눔
- 2페이지 이후에도 헤더/푸터가 자동 반복되도록 Playwright `headerTemplate`/`footerTemplate` 활용

### 예상 작업량
- 1일 (개선 1번과 병행 시)

---

## 3. 편집 UX — 섹션 드래그 정렬 + Undo (P1)

### 현재 상태
- AI 추출 순서 그대로 고정 표시
- 수정 실수 시 되돌리기 불가

### 개선 방안

#### 3-A. 섹션 드래그 정렬
- 라이브러리: `@dnd-kit/core` (React 드래그앤드롭, 가볍고 접근성 좋음)
- 각 섹션(education, experiences, projects, exhibitions, extras, lectureHistory)을 드래그 가능한 블록으로 래핑
- 섹션별 표시/숨김 토글 (눈 아이콘)
- 순서 변경 시 미리보기 즉시 반영

```typescript
interface SectionOrder {
  id: string;        // 'education' | 'experiences' | 'projects' | ...
  visible: boolean;
  label: string;     // 한국어 표시명
}
```

#### 3-B. Undo/Redo
- `useReducer` + 히스토리 스택으로 구현
- 최대 20단계 히스토리
- Ctrl+Z / Ctrl+Shift+Z 키바인드

```typescript
interface EditorState {
  data: InstructorData;
  sectionOrder: SectionOrder[];
}

interface HistoryState {
  past: EditorState[];
  present: EditorState;
  future: EditorState[];
}
```

### 예상 작업량
- 2일

---

## 4. 프로필 사진 Fallback (P1)

### 현재 문제
- 프로필 사진 없으면 "Instructor Profile" 텍스트만 표시 → 허전함
- 업로드 파일에서 이미지 추출 시 로고/배경이 먼저 잡히면 엉뚱한 사진 사용

### 개선 방안

#### 4-A. 사진 없을 때 Fallback
- 이름 기반 이니셜 아바타 생성 (예: "김도희" → "김" 원형 배경)
- 컬러: 이름 해시값 기반 pastel 컬러 자동 할당
- SVG로 생성 → base64 인라인

```typescript
function generateInitialAvatar(name: string): string {
  const initial = name.charAt(0);
  const hue = hashCode(name) % 360;
  return `data:image/svg+xml;base64,...`;
}
```

#### 4-B. 이미지 추출 고도화
- **크기 필터링**: 200×200px 미만 이미지 제외 (로고/아이콘 필터)
- **비율 필터링**: 가로세로 비율 0.5~2.0 범위만 허용 (배너/장식 제외)
- **위치 힌트**: PPTX에서 첫 슬라이드의 가장 큰 이미지 우선
- **사용자 확인**: 추출된 이미지를 편집 화면에서 보여주고 "이 사진이 맞나요?" 확인 단계

### 예상 작업량
- 1일

---

## 5. 강사 데이터 저장/재사용 (P1)

### 현재 상태
- 매번 파일 업로드 → AI 추출 → 편집 → PDF 생성의 전체 흐름 반복
- 같은 강사 프로필 약간 수정해서 다시 뽑으려면 처음부터 다시

### 개선 방안

#### 5-A. 저장소 선택지
| 방식 | 장점 | 단점 |
|------|------|------|
| Google Sheets | 팀 공유 쉬움, 비개발자 접근 가능 | 구조 변경 시 시트 수정 필요 |
| Google Drive JSON | 기존 Drive 연동 활용 | 검색/필터 불편 |
| Vercel KV (Redis) | 빠른 접근, TTL 관리 | 비용 발생, 데이터 이관 필요 |

**권장: Google Drive JSON** — 기존 Drive 연동 재활용, 별도 인프라 불필요

#### 5-B. 흐름
```
[신규 강사]
  파일 업로드 → AI 추출 → 편집 → 저장(JSON) + PDF 생성

[기존 강사 수정]
  강사 목록에서 선택 → JSON 로드 → 편집 → 저장(JSON 업데이트) + PDF 재생성
```

#### 5-C. UI 추가 요소
- 메인 화면에 "기존 강사 불러오기" 버튼
- 강사 목록 (이름, 직함, 최종 수정일) — Drive에서 JSON 파일 목록 조회
- 불러오기 시 편집 화면으로 바로 이동

### 예상 작업량
- 2~3일

---

## 6. 입력 소스 확장 (P2)

### 현재 지원
- PDF, DOCX, PPTX 파일 업로드만 가능

### 추가 지원 대상

#### 6-A. Notion 페이지
- Notion API (`@notionhq/client`) 연동
- 페이지 URL 입력 → 블록 데이터 재귀 추출 → 텍스트 조합 → Claude 구조화
- 필요: Notion Integration Token (팀 워크스페이스 설정)

```typescript
// 흐름
notionPageUrl → extractNotionBlocks(pageId) → plainText → claudeExtract(text) → InstructorData
```

#### 6-B. 복합 소스 합치기 (Notion + 파일)
> 사용자 피드백: "노션이랑 파일이 같이 들어오는 경우도 있음, 합쳐서 제작도 되면 좋겠음"

- **멀티 소스 업로드 UI**: 파일 드래그 영역 + Notion URL 입력 필드 동시 제공
- 각 소스에서 추출한 텍스트를 **하나로 합쳐서** Claude에 전송
- Claude 프롬프트에 "여러 출처에서 수집한 정보입니다. 중복 제거하고 가장 최신/상세한 정보를 우선하세요" 지시 추가
- 합치기 전략:

```typescript
interface SourceInput {
  type: 'file' | 'notion' | 'linkedin';  // 향후 확장 가능
  content: string;                         // 추출된 텍스트
  label: string;                           // "이력서.pptx" 또는 "Notion: 김도희 프로필"
}

// 여러 소스를 하나의 프롬프트로
function mergeSourcesForExtraction(sources: SourceInput[]): string {
  return sources.map(s =>
    `--- 출처: ${s.label} (${s.type}) ---\n${s.content}`
  ).join('\n\n');
}
```

#### 6-C. LinkedIn URL (향후)
- 공개 프로필 스크래핑 또는 사용자가 PDF 내보내기 후 업로드 안내
- 법적 제약 고려 필요, 우선순위 낮음

### 예상 작업량
- Notion 기본 연동: 2일
- 복합 소스 합치기: 1일 추가
- LinkedIn: 별도 검토

---

## 7. 버전 관리 — 동일 강사 카드 이력 (P2)

### 현재 문제
- Drive에 같은 강사 이름으로 파일이 쌓이면 최신 버전 식별 어려움
- 기존 파일 존재 여부 확인 없이 무조건 신규 생성

### 개선 방안

#### 7-A. 파일명 자동 버전 넘버링
```
현재: [팀제이커브] 강사프로필_심원문_20260325.pdf
개선: [팀제이커브] 강사프로필_심원문_v3_20260327.pdf
```

- PDF 생성 전 Drive 폴더에서 동일 강사명 파일 검색
- 기존 파일이 있으면 가장 높은 버전 +1
- 이전 버전은 유지 (삭제하지 않음)

#### 7-B. 덮어쓰기 확인 UX
```
┌────────────────────────────────────────┐
│  ⚠️ 기존 버전 발견                      │
│                                        │
│  심원문 강사의 기존 프로필이 2건 있습니다:   │
│  • v1 (2026-03-20)                     │
│  • v2 (2026-03-25)                     │
│                                        │
│  [v3로 새로 생성]  [v2 덮어쓰기]  [취소]   │
└────────────────────────────────────────┘
```

#### 7-C. 구현
```typescript
async function findExistingVersions(instructorName: string, folderId: string) {
  const query = `name contains '강사프로필_${instructorName}' and '${folderId}' in parents`;
  const files = await drive.files.list({ q: query, orderBy: 'createdTime desc' });
  return files.data.files; // [{name, id, createdTime}, ...]
}
```

### 예상 작업량
- 0.5일

---

## 8. 토큰 효율성 (P2)

### 현재 상태
- Claude Sonnet (claude-sonnet-4-20250514) 사용
- 파일 텍스트 전문 전송, max_tokens 4096

### 개선 방안
- **모델 다운그레이드**: 구조화 추출은 Haiku로도 충분 → 비용 ~10배 절감
- **텍스트 전처리**: 불필요한 공백/줄바꿈/특수문자 제거 후 전송
- **tool_use 방식 전환**: JSON 프롬프트 대신 tool_use로 스키마 강제 → 파싱 에러 감소
- **캐싱**: 동일 파일 재업로드 시 해시 비교 → 이전 추출 결과 재사용 (개선 5번과 연동)

### 예상 작업량
- 0.5일

---

## 구현 순서 권장

```
Phase A (P0, 필수) — 3~4일
  └─ #1 미리보기-PDF 통일 + #2 내용 잘림 수정 (동시 진행)

Phase B (P1, 강력 권장) — 4~5일
  └─ #3 편집 UX (드래그+Undo)
  └─ #4 프로필 사진 Fallback
  └─ #5 강사 데이터 저장/재사용

Phase C (P2, 여유 있을 때) — 3~4일
  └─ #6 입력 소스 확장 (Notion + 복합)
  └─ #7 버전 관리
  └─ #8 토큰 효율성
```

**총 예상: ~11일 (풀타임 기준, 병렬 작업 시 단축 가능)**

---

## 배포 전 체크리스트

- [ ] Vercel Pro Plan Function timeout 설정 확인 (PDF 생성 60초 이상 가능)
- [ ] `@teamjcurve.com` 외 접근 차단 동작 확인
- [ ] Google Drive Service Account 권한 범위 최소화
- [ ] 에러 발생 시 사용자 친화적 메시지 표시
- [ ] 모바일 반응형 기본 대응 (편집 화면)
- [ ] Sentry 또는 Vercel Analytics 에러 트래킹 연동
