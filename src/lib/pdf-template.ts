import { InstructorData } from "./schemas";

export function getInstructorCardHtml(data: InstructorData): string {
  const educationHtml = data.education && data.education.length > 0 && data.education.some(e => e.school)
    ? `<section class="section">
        <h3 class="section-title">학력 및 강의 분야</h3>
        <div class="section-content">
          ${data.education.filter(e => e.school).map(edu => `
            <div class="list-item">
              <span style="font-weight: bold; color: #27272a;">${edu.school}</span>
              <span style="color: #71717a;">${edu.major} ${edu.degree} (${edu.status})</span>
            </div>
          `).join('')}
        </div>
      </section>` : '';

  const experiencesHtml = data.experiences && data.experiences.length > 0 && data.experiences.some(e => e.company)
    ? `<section class="section">
        <h3 class="section-title">주요 경력</h3>
        <div class="section-content">
          <table class="exp-table">
            <thead>
              <tr>
                <th style="width: 35%;">기간</th>
                <th>소속 및 직위</th>
              </tr>
            </thead>
            <tbody>
              ${data.experiences.filter(e => e.company).map(exp => `
                <tr>
                  <td style="color: #71717a; font-weight: 500;">${exp.period}</td>
                  <td>
                    <span style="font-weight: bold; color: #27272a;">${exp.company}</span>
                    <span style="color: #d1d5db; margin: 0 6px;">|</span>
                    <span style="color: #52525b;">${exp.position}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>` : '';

  const projectsHtml = data.projects && data.projects.length > 0
    ? `<section class="section">
        <h3 class="section-title">주요 프로젝트 및 작품</h3>
        <div class="section-content">
          ${data.projects.map(proj => `
            <div class="project-item">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <h4 style="font-weight: bold; color: #18181b; margin: 0; font-size: 14px;">${proj.name}</h4>
                <span style="font-size: 11px; color: #a1a1aa; font-weight: 500;">${proj.period}</span>
              </div>
              <p style="font-size: 12px; color: #52525b; line-height: 1.7; margin: 3px 0 0 0;">${proj.description}</p>
            </div>
          `).join('')}
        </div>
      </section>` : '';

  const exhibitionsHtml = data.exhibitions && data.exhibitions.length > 0 && data.exhibitions.some(e => e)
    ? `<section class="section">
        <h3 class="section-title">전시 / 심사 이력</h3>
        <div class="section-content">
          ${data.exhibitions.filter(e => e).map(item => `
            <div class="bullet-item">
              <span class="bullet">•</span>
              <span>${item}</span>
            </div>
          `).join('')}
        </div>
      </section>` : '';

  const extrasHtml = data.extras && data.extras.length > 0 && data.extras.some(e => e)
    ? `<section class="section">
        <h3 class="section-title">기타 이력</h3>
        <div class="section-content">
          ${data.extras.filter(e => e).map(item => `
            <div class="bullet-item">
              <span class="bullet">•</span>
              <span>${item}</span>
            </div>
          `).join('')}
        </div>
      </section>` : '';

  const lectureHtml = data.lectureHistory && data.lectureHistory.length > 0 && data.lectureHistory.some(e => e)
    ? `<section class="section">
        <h3 class="section-title">강의 이력</h3>
        <div class="section-content">
          ${data.lectureHistory.filter(e => e).map(item => `
            <div class="bullet-item">
              <span class="bullet">•</span>
              <span>${item}</span>
            </div>
          `).join('')}
        </div>
      </section>` : '';

  const customSectionsHtml = data.customSections && data.customSections.length > 0
    ? data.customSections.map(section => `
        <section class="section">
          <h3 class="section-title">${section.title}</h3>
          <div class="section-content">
            ${section.items.filter(e => e).map(item => `
              <div class="bullet-item">
                <span class="bullet">•</span>
                <span>${item}</span>
              </div>
            `).join('')}
          </div>
        </section>
      `).join('') : '';

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Nanum Gothic', sans-serif;
      color: #18181b;
      font-size: 13px;
      line-height: 1.6;
    }

    .blue-bar {
      width: 100%;
      height: 26mm;
      background-color: #3346FF;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 900;
      font-size: 22px;
      letter-spacing: -0.05em;
    }

    .content {
      padding: 6mm 0;
    }

    .section {
      margin-bottom: 7mm;
    }

    .section-title {
      font-size: 15px;
      font-weight: bold;
      color: #0a0a2e;
      border-left: 4px solid #3346FF;
      padding-left: 10px;
      line-height: 1;
      margin-bottom: 4mm;
      break-after: avoid;
      page-break-after: avoid;
    }

    .section-content {
      padding-left: 2mm;
    }

    /* Profile */
    .profile {
      display: flex;
      gap: 6mm;
      align-items: flex-start;
      margin-bottom: 7mm;
    }
    .profile-image {
      width: 32mm;
      height: 40mm;
      background-color: #f4f4f5;
      border: 1px solid #e4e4e7;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .profile-image img { width: 100%; height: 100%; object-fit: cover; }
    .profile-name { font-size: 26px; font-weight: bold; color: #0a0a2e; letter-spacing: -0.025em; }
    .profile-title { color: #3346FF; font-weight: 600; font-size: 13px; margin-top: 2px; }
    .profile-summary { color: #52525b; font-size: 12px; line-height: 1.7; margin-top: 2mm; }

    /* Table */
    .exp-table {
      width: 100%;
      font-size: 12px;
      border-collapse: collapse;
    }
    .exp-table thead tr {
      background-color: #0a0a2e;
      color: white;
      text-align: left;
    }
    .exp-table th { padding: 6px 10px; font-weight: 500; font-size: 12px; }
    .exp-table td { padding: 7px 10px; }
    .exp-table tbody tr {
      border-bottom: 1px solid #f4f4f5;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* Items */
    .list-item {
      display: flex;
      gap: 8px;
      margin-bottom: 4px;
      line-height: 1.6;
    }
    .bullet-item {
      color: #3f3f46;
      display: flex;
      gap: 6px;
      margin-bottom: 4px;
      line-height: 1.6;
      font-size: 12px;
    }
    .bullet { color: #3346FF; flex-shrink: 0; }
    .project-item {
      margin-bottom: 6px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="blue-bar">TEAM J-CURVE</div>

  <div class="content">
    <section class="profile">
      <div class="profile-image">
        ${data.profileImageUrl
          ? `<img src="${data.profileImageUrl}" />`
          : `<span style="font-size: 8px; font-weight: bold; color: #d4d4d8; text-align: center;">Instructor<br>Profile</span>`}
      </div>
      <div>
        <div class="profile-name">${data.name || "강사 성함"}</div>
        <div class="profile-title">${data.title || "직함 / 전문 분야"}</div>
        <div class="profile-summary">${data.summary || ""}</div>
      </div>
    </section>

    ${educationHtml}
    ${experiencesHtml}
    ${projectsHtml}
    ${exhibitionsHtml}
    ${extrasHtml}
    ${lectureHtml}
    ${customSectionsHtml}
  </div>
</body>
</html>
  `;
}
