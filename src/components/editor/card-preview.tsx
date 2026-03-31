"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { InstructorData } from "@/lib/schemas";
import { getInstructorCardHtml } from "@/lib/pdf-template";

interface CardPreviewProps {
  data: InstructorData;
  scale?: number;
}

// A4 dimensions in px (at 96dpi)
// 210mm x 297mm -> 794px x 1123px
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

// Matching PDF margins from route.ts (28mm, 22mm, 12mm)
// 28mm ≈ 106px, 22mm ≈ 83px, 12mm ≈ 45px
const MARGIN_BOTTOM_PX = 0;
const MARGIN_LR_PX = 0;
const CONTENT_HEIGHT_PX = A4_HEIGHT_PX;

export function CardPreview({ data, scale = 0.6 }: CardPreviewProps) {
  const previewHtml = useMemo(() => getInstructorCardHtml(data), [data]);
  const measureRef = useRef<HTMLIFrameElement>(null);
  const [totalPages, setTotalPages] = useState(1);

  // Measure real rendered scroll height to compute page count.
  // Do NOT inject any padding into the body here — the HTML template
  // already has left/right padding. The top/bottom space is handled
  // exclusively by Playwright margins (PDF) and the React overlays (preview).
  // Injecting extra padding here would corrupt the slice math.
  const measureHeight = () => {
    try {
      const iframe = measureRef.current;
      if (!iframe?.contentDocument?.body) return;
      const scrollH = iframe.contentDocument.body.scrollHeight;
      // Use CONTENT_HEIGHT_PX (area excluding margins) for correct pagination
      const pages = Math.max(1, Math.ceil(scrollH / CONTENT_HEIGHT_PX));
      setTotalPages(pages);
    } catch {
      // cross-origin or not ready
    }
  };

  useEffect(() => {
    const timer = setTimeout(measureHeight, 500);
    return () => clearTimeout(timer);
  }, [previewHtml]);

  return (
    <div className="flex flex-col gap-6 items-center">
      {/* Hidden iframe for measuring content height */}
      <iframe
        ref={measureRef}
        srcDoc={previewHtml}
        style={{ position: "absolute", left: "-9999px", width: `${A4_WIDTH_PX}px`, height: "1px", border: "none", visibility: "hidden" }}
        sandbox="allow-same-origin"
      />

      {Array.from({ length: totalPages }, (_, pageIndex) => (
        <div key={pageIndex}>
          <div className="text-center mb-2">
            <span className="text-xs text-zinc-400 font-medium">
              {pageIndex + 1} / {totalPages}
            </span>
          </div>
          <div
            className="bg-white shadow-2xl mx-auto overflow-hidden relative"
            style={{
              width: `${A4_WIDTH_PX * scale}px`,
              height: `${A4_HEIGHT_PX * scale}px`,
              borderRadius: "4px",
            }}
          >

            <div
              style={{
                width: `${A4_WIDTH_PX}px`,
                height: `${A4_HEIGHT_PX}px`,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                overflow: "hidden",
              }}
            >
              <iframe
                srcDoc={previewHtml}
                title={`강사카드 미리보기 ${pageIndex + 1}페이지`}
                style={{
                  width: `${A4_WIDTH_PX}px`,
                  height: `${A4_HEIGHT_PX * totalPages}px`,
                  border: "none",
                  background: "white",
                  marginTop: `-${pageIndex * A4_HEIGHT_PX}px`,
                }}
                onLoad={pageIndex === 0 ? measureHeight : undefined}
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
