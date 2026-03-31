import { InstructorData } from "./schemas";

// Contact-related section titles to exclude
const CONTACT_SECTION_TITLES = [
  "연락처", "연락처 정보", "contact", "contacts", "contact info",
  "이메일", "전화", "전화번호", "phone", "email", "sns", "소셜미디어",
  "linkedin", "링크드인",
];

function isContactSection(title: string): boolean {
  const lower = title.toLowerCase().trim();
  return CONTACT_SECTION_TITLES.some((t) => lower.includes(t));
}

const LOGO_BASE64 = "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";

export function getInstructorCardHtml(data: InstructorData): string {
  // --- Constants and Heuristics ---
  const PAGE_HEIGHT_PX = 1123;
  const MARGIN_TOP_PX = 106; // 28mm
  const MARGIN_BOTTOM_PX = 83; // 22mm
  const CONTENT_MAX_PX = PAGE_HEIGHT_PX - MARGIN_TOP_PX - MARGIN_BOTTOM_PX;

  // Refined Estimations
  const CHARS_PER_LINE = 55;
  const ESTIMATED_LINE_H = 18;
  const BASE_ROW_H = 34; // base row padding/overhead

  const estimateTextHeight = (text: string | undefined) => {
    if (!text) return 0;
    const lines = Math.ceil(text.length / CHARS_PER_LINE) || 1;
    return lines * ESTIMATED_LINE_H;
  };

  const HEIGHTS = {
    HEADER_BAR: 100, 
    PROFILE_SECTION: 180,
    SECTION_TITLE: 45,
    EXPERIENCE_ROW_BASE: 40,
    EDUCATION_ITEM: 30,
    PROJECT_ITEM_BASE: 55,
    BULLET_ITEM_BASE: 26,
    LECTURE_ROW_BASE: 38,
    TABLE_HEADER: 35,
    SPACING: 26,
  };

  // --- Utility Functions ---
  const wrapPage = (content: string, pageNum: number, total: number) => `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="header-left">TEAM J-CURVE</div>
        <div class="header-right">팀제이커브 강사 프로필</div>
      </div>
      <div class="page-content">
        ${content}
      </div>
      <div class="page-footer">
        <div class="footer-left">(주) 팀제이커브 | <span class="confidential">CONFIDENTIAL</span></div>
        <div class="footer-right">${pageNum} / ${total}</div>
      </div>
    </div>
  `;

  // --- Pagination Logic (Rule-Based Partitioning) ---
  const pages: string[] = [];
  let currentPageHtml = "";
  let currentY = 0;

  const flushPage = () => {
    if (currentPageHtml.trim()) {
      pages.push(currentPageHtml);
      currentPageHtml = "";
      currentY = 0;
    }
  };

  // --- Page 1: Profile + Major Career + Top Lecture History ---
  // A4 fixed bar & Profile
  currentPageHtml += `
    <div class="blue-bar">
      <img src="data:image/png;base64,${LOGO_BASE64}" alt="TEAM J-CURVE" />
    </div>
    <section class="profile">
      <div class="profile-image">
        ${data.profileImageUrl 
          ? `<img src="${data.profileImageUrl}" />` 
          : `<span class="placeholder-text">Instructor<br>Profile</span>`}
      </div>
      <div class="profile-info">
        <div class="profile-name">${data.name || "강사 성함"}</div>
        <div class="profile-title">${data.title || "직함 / 전문 분야"}</div>
        <div class="profile-summary">${data.summary || ""}</div>
      </div>
    </section>
  `;
  currentY += HEIGHTS.HEADER_BAR + HEIGHTS.PROFILE_SECTION + HEIGHTS.SPACING;

  // Major Career (Always on Page 1)
  if (data.experiences && data.experiences.length > 0) {
    let tableHtml = `<section class="section"><h3 class="section-title">주요 경력</h3><table class="exp-table"><thead><tr><th style="width: 25%;">기간</th><th>소속 및 직위</th></tr></thead><tbody>`;
    currentY += HEIGHTS.SECTION_TITLE + HEIGHTS.TABLE_HEADER;

    data.experiences.forEach((exp) => {
      tableHtml += `<tr><td class="cell-period">${exp.period}</td><td class="cell-content"><span class="emp">${exp.company}</span> <span class="divider">|</span> ${exp.position}</td></tr>`;
      currentY += HEIGHTS.EXPERIENCE_ROW_BASE;
    });
    tableHtml += `</tbody></table></section>`;
    currentPageHtml += tableHtml;
    currentY += HEIGHTS.SPACING;
  }

  // Slice Lecture History to fit remaining space on Page 1
  let lectureStartIndex = 0;
  if (data.lectureHistory && data.lectureHistory.length > 0) {
    let tableHtml = `<section class="section"><h3 class="section-title">대표 강의 이력</h3><table class="exp-table"><thead><tr><th style="width: 22%;">기간</th><th>강의 내용</th></tr></thead><tbody>`;
    currentY += HEIGHTS.SECTION_TITLE + HEIGHTS.TABLE_HEADER;

    for (let i = 0; i < data.lectureHistory.length; i++) {
      const item = data.lectureHistory[i];
      const textH = estimateTextHeight(item.content);
      const rowHeight = Math.max(HEIGHTS.LECTURE_ROW_BASE, textH + 16);

      if (currentY + rowHeight > CONTENT_MAX_PX - 20) { // Keep some buffer
        break; // Stop adding to Page 1
      }
      tableHtml += `<tr><td class="cell-period">${item.period}</td><td class="cell-content">${item.content}</td></tr>`;
      currentY += rowHeight;
      lectureStartIndex = i + 1;
    }
    tableHtml += `</tbody></table></section>`;
    currentPageHtml += tableHtml;
  }
  flushPage(); // End of Page 1

  // --- Page 2: Education + Projects + Supplemental Info ---
  currentY = 0;
  currentPageHtml = "";

  // Education
  if (data.education && data.education.length > 0) {
    let eduHtml = `<section class="section"><h3 class="section-title">학력 및 강의 분야</h3>`;
    currentY += HEIGHTS.SECTION_TITLE;
    data.education.forEach(edu => {
      eduHtml += `<div class="list-item"><strong>${edu.school}</strong> <span>${[edu.major, edu.degree, edu.status].filter(Boolean).join(' ')}</span></div>`;
      currentY += HEIGHTS.EDUCATION_ITEM;
    });
    eduHtml += `</section>`;
    currentPageHtml += eduHtml;
    currentY += HEIGHTS.SPACING;
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    let projHtml = `<section class="section"><h3 class="section-title">주요 프로젝트 및 작품</h3>`;
    currentY += HEIGHTS.SECTION_TITLE;
    data.projects.forEach(proj => {
      const descH = estimateTextHeight(proj.description);
      projHtml += `
        <div class="project-item">
          <div class="project-header"><h4>${proj.name}</h4><span>${proj.period}</span></div>
          <p class="project-desc">${proj.description || ""}</p>
        </div>
      `;
      currentY += HEIGHTS.PROJECT_ITEM_BASE + descH;
    });
    projHtml += `</section>`;
    currentPageHtml += projHtml;
    currentY += HEIGHTS.SPACING;
  }

  // Other Supplemental Sections
  const otherSections = [
    { title: "전시 / 심사 이력", items: data.exhibitions?.map(e => e.value) || [] },
    { title: "기타 이력", items: data.extras?.map(e => e.value) || [] },
    ...(data.customSections || []).filter(s => !isContactSection(s.title))
  ];

  otherSections.forEach(sec => {
    if (sec.items.length === 0) return;
    let secHtml = `<section class="section"><h3 class="section-title">${sec.title}</h3>`;
    currentY += HEIGHTS.SECTION_TITLE;
    sec.items.forEach(item => {
      secHtml += `<div class="bullet-item"><span class="bullet">•</span><span>${item}</span></div>`;
      currentY += Math.max(HEIGHTS.BULLET_ITEM_BASE, estimateTextHeight(item) + 8);
    });
    secHtml += `</section>`;
    currentPageHtml += secHtml;
    currentY += HEIGHTS.SPACING;
  });
  flushPage(); // End of Page 2

  // --- Page 3+: Remaining Lecture History overflow ---
  if (data.lectureHistory && lectureStartIndex < data.lectureHistory.length) {
    currentY = 0;
    currentPageHtml = "";
    
    let tableHtml = `<section class="section"><h3 class="section-title">추가 강의 이력</h3><table class="exp-table"><thead><tr><th style="width: 22%;">기간</th><th>강의 내용</th></tr></thead><tbody>`;
    currentY += HEIGHTS.SECTION_TITLE + HEIGHTS.TABLE_HEADER;

    for (let i = lectureStartIndex; i < data.lectureHistory.length; i++) {
        const item = data.lectureHistory[i];
        const textH = estimateTextHeight(item.content);
        const rowHeight = Math.max(HEIGHTS.LECTURE_ROW_BASE, textH + 16);

        if (currentY + rowHeight > CONTENT_MAX_PX) {
          tableHtml += `</tbody></table></section>`;
          currentPageHtml += tableHtml;
          flushPage();
          tableHtml = `<section class="section"><table class="exp-table"><thead><tr><th style="width: 22%;">기간</th><th>강의 내용</th></tr></thead><tbody>`;
          currentY += HEIGHTS.TABLE_HEADER;
        }
        tableHtml += `<tr><td class="cell-period">${item.period}</td><td class="cell-content">${item.content}</td></tr>`;
        currentY += rowHeight;
    }
    tableHtml += `</tbody></table></section>`;
    currentPageHtml += tableHtml;
    flushPage();
  }

  const finalPagesHtml = pages.map((content, i) => wrapPage(content, i + 1, pages.length)).join('');

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Nanum Gothic', sans-serif; color: #18181b; background: white; -webkit-print-color-adjust: exact; }
    
    .page-wrapper {
      width: 210mm;
      height: 297mm;
      padding: 0;
      margin: 0 auto;
      background: white;
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      page-break-after: always;
    }
    
    /* Gap between pages ONLY for web preview, hidden in print */
    @media screen {
      .page-wrapper { margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    }
    
    .page-header {
      height: 28mm;
      padding: 10mm 12mm 4mm 12mm;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 2px solid #f4f4f5;
    }
    .header-left { font-size: 11px; color: #3346FF; font-weight: 900; letter-spacing: -0.05em; }
    .header-right { font-size: 8px; color: #a1a1aa; font-weight: 500; }

    .page-footer {
      height: 22mm;
      padding: 0 12mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-left { font-size: 9px; color: #a1a1aa; font-weight: bold; text-transform: uppercase; }
    .footer-right { font-size: 9px; color: #a1a1aa; font-weight: bold; }
    .confidential { color: #3346FF; }

    .page-content {
      flex: 1;
      padding: 5mm 12mm 0 12mm; /* Added 5mm top padding to separate from header */
    }

    .blue-bar { 
      width: 100%; 
      height: 22mm; /* Reduced from 26mm */
      background-color: #3346FF; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      margin-bottom: 6mm; 
      overflow: hidden;
    }
    .blue-bar img { 
      max-height: 60%; /* Slightly smaller for better proportions */
      width: auto;
      object-fit: contain;
    }

    .section { margin-bottom: 7mm; }
    .section-title { font-size: 15px; font-weight: bold; color: #0a0a2e; border-left: 4px solid #3346FF; padding-left: 10px; margin-bottom: 4mm; }
    
    .profile { display: flex; gap: 6mm; align-items: flex-start; margin-bottom: 7mm; }
    .profile-image { width: 32mm; height: 40mm; background-color: #f4f4f5; border: 1px solid #e4e4e7; flex-shrink: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .profile-image img { width: 100%; height: 100%; object-fit: cover; }
    .placeholder-text { font-size: 8px; font-weight: bold; color: #d4d4d8; text-align: center; }
    .profile-name { font-size: 26px; font-weight: bold; color: #0a0a2e; }
    .profile-title { color: #3346FF; font-weight: 600; font-size: 13px; }
    .profile-summary { color: #52525b; font-size: 12px; margin-top: 2mm; line-height: 1.6; }

    .exp-table { width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed; }
    .exp-table thead tr { background-color: #0a0a2e; color: white; text-align: left; }
    .exp-table th { padding: 8px 10px; font-size: 13px; }
    .exp-table td { padding: 9px 10px; vertical-align: top; border-bottom: 2px solid #f8f9fa; word-wrap: break-word; overflow-wrap: break-word; }
    .cell-period { color: #71717a; font-weight: 500; }
    .cell-content { color: #27272a; line-height: 1.5; }
    .emp { font-weight: bold; }
    .divider { color: #d1d5db; margin: 0 4px; }

    .list-item { display: flex; gap: 8px; margin-bottom: 4px; line-height: 1.6; font-size: 12px; }
    .bullet-item { display: flex; gap: 6px; margin-bottom: 4px; line-height: 1.6; font-size: 12px; }
    .bullet { color: #3346FF; }
    
    .project-item { margin-bottom: 8px; }
    .project-header { display: flex; justify-content: space-between; align-items: baseline; }
    .project-header h4 { font-size: 14px; color: #18181b; }
    .project-header span { font-size: 11px; color: #a1a1aa; }
    .project-desc { font-size: 12px; color: #52525b; margin-top: 2px; line-height: 1.5; }

    @media print {
      body { background: white; }
      .page-wrapper { margin: 0; box-shadow: none; border: none; }
    }
  </style>
</head>
<body>
  ${finalPagesHtml}
</body>
</html>
  `;
}
