import { NextRequest, NextResponse } from "next/server";
import { getInstructorCardHtml } from "@/lib/pdf-template";
import { InstructorData } from "@/lib/schemas";
import playwright from "playwright-core";
import { google } from "googleapis";
import { Readable } from "stream";
import { existsSync } from "fs";

const LOCAL_CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const isLocal = existsSync(LOCAL_CHROME);

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const downloadOnly = url.searchParams.get("download") === "true";
    const data = (await req.json()) as InstructorData;
    const html = getInstructorCardHtml(data);

    // 1. Generate PDF using Playwright
    const pdfBuffer = await generatePdf(html);

    // 2. If download only, return PDF directly
    if (downloadOnly) {
      const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
      const fileName = `[팀제이커브] 강사프로필_${data.name || "신규강사"}_${dateStr}.pdf`;
      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        },
      });
    }

    // 3. Upload to Google Drive
    const driveLink = await uploadToGoogleDrive(pdfBuffer, data.name);

    return NextResponse.json({ driveLink });
  } catch (error) {
    console.error("PDF Generation error:", error);
    return NextResponse.json(
      { error: "PDF 생성 또는 Drive 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

async function generatePdf(html: string): Promise<Buffer> {
  let browser = null;
  try {
    if (isLocal) {
      browser = await playwright.chromium.launch({
        executablePath: LOCAL_CHROME,
        args: ["--no-sandbox", "--disable-gpu"],
        headless: true,
      });
    } else {
      const chromium = (await import("@sparticuz/chromium")).default;
      browser = await playwright.chromium.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    }

    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      displayHeaderFooter: false,
    });

    return Buffer.from(pdf);
  } finally {
    if (browser) await browser.close();
  }
}

async function uploadToGoogleDrive(pdfBuffer: Buffer, instructorName: string): Promise<string> {
  const auth = new google.auth.JWT();
  auth.fromJSON({
    type: "service_account",
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  });
  auth.scopes = ["https://www.googleapis.com/auth/drive"];

  const drive = google.drive({ version: "v3", auth });
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const fileName = `[팀제이커브] 강사프로필_${instructorName || "신규강사"}_${dateStr}.pdf`;

  const fileMetadata = {
    name: fileName,
    ...(folderId ? { parents: [folderId] } : {}),
  };

  const media = {
    mimeType: "application/pdf",
    body: Readable.from(pdfBuffer),
  };

  const response = await drive.files.create({
    auth: auth,
    requestBody: fileMetadata,
    media: media,
    fields: "id, webViewLink, webContentLink",
    supportsAllDrives: true,
  });

  const fileId = response.data.id;
  return response.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;
}
