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
    
    // --- API Token Efficiency (효율화): Truncate text to avoid excessive token costs ---
    if (text.length > 15000) {
      console.log(`Truncating text from ${text.length} to 15,000 characters for token efficiency.`);
      text = text.substring(0, 15000) + "... [최적화를 위해 일부 생략됨]";
    }

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

async function extractWithAIRetry(text: string, maxRetries = 2) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await extractWithAI(text);
    } catch (error: any) {
      const status = error?.status || error?.code;
      const isRetryable = status === 529 || status === 500 || status === 503;
      console.warn(`AI attempt ${attempt}/${maxRetries} failed: ${status}`);
      if (!isRetryable || attempt === maxRetries) throw error;
      await new Promise((r) => setTimeout(r, 2000)); // Fixed 2s delay
    }
  }
  throw new Error("AI extraction failed");
}

async function extractWithAI(text: string) {
  // --- Token Efficiency (효율화): Concise Instruction & Schema ---
  const prompt = `강사 프로필 텍스트를 분석하여 아래 JSON 스키마로 정보를 추출하세요. JSON으로만 응답하세요.
Schema:
{
  "name": "성함", "title": "핵심분야(한/영)", "summary": "1~2문장 요약",
  "education": [{ "degree": "학위", "school": "학교", "major": "전공", "status": "졸업/수료" }],
  "experiences": [{ "period": "YYYY.MM-YYYY.MM", "company": "기관", "position": "직무" }],
  "projects": [{ "name": "프로젝트명", "period": "기간", "description": "설명" }],
  "exhibitions": ["전시 텍스트"], "extras": ["기타 경력"],
  "lectureHistory": [{ "period": "기간", "content": "강의명" }],
  "customSections": [{ "title": "섹션명", "items": ["항목"] }]
}
Rules:
1. 이름(name)은 한국어 우선. 2. 날짜는 'YYYY.MM' 유지. 3. 연락처 정보(번호, 이메일, SNS) 절대 제외. 4. 고정 항목 외 정보는 customSections.
텍스트:
${text}`;

  const message = await anthropic.messages.create({
    model: "claude-3-5-haiku-latest", // Use Haiku for faster & cheaper processing
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0]?.type === "text" ? message.content[0].text : "";

  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("Invalid output format");
  }
}
