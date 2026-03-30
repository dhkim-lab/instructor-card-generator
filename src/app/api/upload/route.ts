import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { extractText } from "unpdf";
import mammoth from "mammoth";
import JSZip from "jszip";
import { parseStringPromise } from "xml2js";
import sharp from "sharp";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    console.log("Processing file:", file.name, "size:", file.size);
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";
    if (file.name.endsWith(".pdf")) {
      console.log("Analyzing PDF...");
      const result = await extractText(new Uint8Array(buffer));
      text = Array.isArray(result.text) ? result.text.join("\n") : String(result.text);
    } else if (file.name.endsWith(".docx")) {
      console.log("Analyzing DOCX...");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (file.name.endsWith(".pptx")) {
      console.log("Analyzing PPTX...");
      text = await parsePptx(buffer);
    } else {
      return NextResponse.json(
        { error: "지원하지 않는 파일 형식입니다." },
        { status: 400 }
      );
    }

    // Extract profile image using smart detection
    let profileImageUrl = "";
    if (file.name.endsWith(".pptx")) {
      profileImageUrl = await extractProfileImageSmart(buffer, "pptx");
    } else if (file.name.endsWith(".docx")) {
      profileImageUrl = await extractProfileImageSmart(buffer, "docx");
    }

    console.log("Text length:", text.length, "Profile image:", profileImageUrl ? "found" : "none");
    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: "파일에서 텍스트를 추출할 수 없습니다." },
        { status: 400 }
      );
    }

    // Extract data with AI (with retry)
    const extractedData = await extractWithAIRetry(text);
    if (profileImageUrl) {
      extractedData.profileImageUrl = profileImageUrl;
    }
    return NextResponse.json(extractedData);
  } catch (error) {
    console.error("Upload error details:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// ─── Smart Profile Photo Detection ───────────────────────────────

interface ImageCandidate {
  path: string;
  data: Buffer;
  width: number;
  height: number;
  aspectRatio: number;
  size: number;
  score: number;
}

async function extractProfileImageSmart(buffer: Buffer, fileType: "pptx" | "docx"): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(buffer);
    const mediaPrefix = fileType === "pptx" ? "ppt/media/" : "word/media/";
    const imageFiles = Object.keys(zip.files).filter(
      (name) => name.startsWith(mediaPrefix) && /\.(png|jpg|jpeg|gif|bmp)$/i.test(name)
    );
    if (imageFiles.length === 0) return "";

    // Score each image
    const candidates: ImageCandidate[] = [];
    for (const imgPath of imageFiles) {
      try {
        const imgBuffer = Buffer.from(await zip.files[imgPath].async("arraybuffer"));
        const metadata = await sharp(imgBuffer).metadata();
        const w = metadata.width || 0;
        const h = metadata.height || 0;
        if (w < 50 || h < 50) continue; // too small, likely icon

        const aspectRatio = w / h;
        let score = 0;

        // 1. Portrait aspect ratio (0.6~0.85) = high score for profile photo
        if (aspectRatio >= 0.55 && aspectRatio <= 0.9) score += 40;
        // Square-ish (0.9~1.1) = moderate
        else if (aspectRatio >= 0.9 && aspectRatio <= 1.1) score += 20;
        // Very wide = likely banner/logo
        else if (aspectRatio > 1.5) score -= 20;

        // 2. Reasonable size for profile photo (100~1000px width)
        if (w >= 100 && w <= 1200 && h >= 120 && h <= 1500) score += 20;
        // Too large = likely background or banner
        if (w > 1500 || h > 1500) score -= 10;

        // 3. File size heuristic: profile photos are typically 10KB~500KB
        const fileSize = imgBuffer.length;
        if (fileSize >= 10000 && fileSize <= 500000) score += 15;
        if (fileSize < 5000) score -= 10; // likely icon
        if (fileSize > 1000000) score -= 10; // likely high-res background

        // 4. File naming hints
        const lowerPath = imgPath.toLowerCase();
        if (lowerPath.includes("image1") || lowerPath.includes("image2")) score += 5;
        // Later images are less likely to be profile
        const imageNum = parseInt(lowerPath.match(/image(\d+)/)?.[1] || "0");
        if (imageNum > 5) score -= 5 * (imageNum - 5);

        candidates.push({ path: imgPath, data: imgBuffer, width: w, height: h, aspectRatio, size: fileSize, score });
      } catch {
        continue;
      }
    }

    if (candidates.length === 0) return "";

    // Sort by score descending
    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0];
    console.log(`Profile photo selected: ${best.path} (score: ${best.score}, ${best.width}x${best.height}, ratio: ${best.aspectRatio.toFixed(2)})`);

    const ext = best.path.split(".").pop()?.toLowerCase() || "png";
    const mimeType = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
    return `data:${mimeType};base64,${best.data.toString("base64")}`;
  } catch (e) {
    console.error("Failed to extract profile image:", e);
    return "";
  }
}

// ─── PPTX Text Extraction ────────────────────────────────────────

async function parsePptx(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const slideFiles = Object.keys(zip.files)
    .filter((name) => name.startsWith("ppt/slides/slide"))
    .sort();

  let fullText = "";
  for (const slideFile of slideFiles) {
    const content = await zip.files[slideFile].async("string");
    const json = await parseStringPromise(content);
    const texts: string[] = [];
    const extractTextFromObj = (obj: any) => {
      if (!obj) return;
      if (typeof obj === "string") texts.push(obj);
      else if (Array.isArray(obj)) obj.forEach(extractTextFromObj);
      else if (typeof obj === "object") {
        for (const key in obj) {
          if (key === "a:t") {
            const val = obj[key];
            if (Array.isArray(val)) texts.push(...val);
            else texts.push(val);
          } else {
            extractTextFromObj(obj[key]);
          }
        }
      }
    };
    extractTextFromObj(json);
    fullText += texts.join(" ") + "\n";
  }
  return fullText;
}

// ─── AI Extraction with Retry ────────────────────────────────────

async function extractWithAIRetry(text: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await extractWithAI(text);
    } catch (error: any) {
      const status = error?.status || error?.code;
      const isRetryable = status === 529 || status === 500 || status === 503;
      console.warn(`AI extraction attempt ${attempt}/${maxRetries} failed (status: ${status})`);
      if (!isRetryable || attempt === maxRetries) throw error;
      // Exponential backoff: 2s, 4s, 8s
      await new Promise((r) => setTimeout(r, 2000 * Math.pow(2, attempt - 1)));
    }
  }
  throw new Error("AI extraction failed after retries");
}

async function extractWithAI(text: string) {
  const prompt = `당신은 팀제이커브(TEAM J-CURVE)의 강사 카드 생성을 돕는 도우미입니다.
제공된 강사 프로필 텍스트 파일 내용을 분석하여 아래 JSON 스키마에 맞춰 정보를 추출하세요.

[JSON 스키마]
{
  "name": "강사 성함",
  "title": "핵심 분야(예: AI 아티스트, 게임 기획자 등 영문 및 한글 조합)",
  "summary": "1~2문장의 전문성 요약 소개글",
  "education": [
    { "degree": "학위(학사, 석사 등)", "school": "학교명", "major": "전공", "status": "졸업/수료" }
  ],
  "experiences": [
    { "period": "YYYY.MM - YYYY.MM", "company": "소속/기관", "position": "직무/직함" }
  ],
  "projects": [
    { "name": "프로젝트/작품명", "period": "기간", "role": "역할", "description": "설명" }
  ],
  "exhibitions": ["전시 또는 심사 이력 텍스트 리스트"],
  "extras": ["앰배서더, 산학협력 등 기타 이력"],
  "lectureHistory": [
    { "period": "YYYY.MM 또는 YYYY.MM~MM 등 기간", "content": "강의명 및 기관명" }
  ],
  "customSections": [
    { "title": "섹션 제목", "items": ["항목1", "항목2"] }
  ]
}

[주의사항]
1. 반드시 JSON 형식으로만 응답하세요. 다른 부연 설명은 하지 마세요.
2. 텍스트에서 명확하게 확인되지 않는 정보는 추측하지 말고 빈 문자열이나 빈 배열로 두세요.
3. 날짜 형식은 가능한 한 'YYYY.MM' 형식을 유지해 주세요.
4. "name" 필드는 반드시 채워주세요. 한국어 이름(예: 홍길동, 심원문)을 우선 찾으세요.
5. **customSections**: 위의 고정 항목(학력, 경력, 프로젝트, 전시, 기타, 강의)에 해당하지 않는 정보가 있으면 적절한 섹션 제목을 직접 생성하여 customSections에 넣으세요.
   예: "수상 이력", "자격증 및 인증", "저서 및 출판", "미디어 출연", "봉사 활동", "연구 실적" 등
   고정 항목에 이미 포함된 내용은 customSections에 중복하지 마세요.
6. **연락처 정보는 절대 포함 금지**: 전화번호, 이메일 주소, LinkedIn URL, SNS 계정, 홈페이지 주소 등 개인 연락처 정보는 어떤 필드에도 넣지 마세요. "연락처" 섹션을 만들지 마세요.

[강사 프로필 원본 텍스트]
${text}
`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0]?.type === "text" ? message.content[0].text : "";

  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("Failed to parse AI response as JSON");
  }
}
