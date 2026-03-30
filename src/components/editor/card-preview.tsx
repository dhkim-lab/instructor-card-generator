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
const MARGIN_TOP_PX = 106; 
const MARGIN_BOTTOM_PX = 83;
const MARGIN_LR_PX = 45;

export function CardPreview({ data, scale = 0.6 }: CardPreviewProps) {
  const html = useMemo(() => getInstructorCardHtml(data), [data]);
  const previewHtml = html; // Simplify for now, we handles overlays in React
  const measureRef = useRef<HTMLIFrameElement>(null);
  const [totalPages, setTotalPages] = useState(1);

  // Measure content to determine page count
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const iframe = measureRef.current;
        if (!iframe?.contentDocument?.body) return;
        const scrollH = iframe.contentDocument.body.scrollHeight;
        const pages = Math.max(1, Math.ceil(scrollH / A4_HEIGHT_PX));
        setTotalPages(pages);
      } catch {
        // cross-origin or not ready
      }
    }, 400);
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
            {/* Header Overlay */}
            <div 
              style={{
                position: 'absolute', top: 0, left: 0, right: 0, 
                height: `${MARGIN_TOP_PX * scale}px`,
                padding: `${15 * scale}px ${MARGIN_LR_PX * scale}px ${8 * scale}px ${MARGIN_LR_PX * scale}px`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                borderBottom: '1px solid #f4f4f5', background: 'white', zIndex: 10,
                pointerEvents: 'none',
              }}
            >
              <span style={{ fontSize: `${11 * scale}px`, color: '#3346FF', fontWeight: 900, letterSpacing: '-0.05em' }}>TEAM J-CURVE</span>
              <span style={{ fontSize: `${7 * scale}px`, color: '#a1a1aa', fontWeight: 500 }}>팀제이커브 강사 프로필</span>
            </div>

            {/* Footer Overlay */}
            <div 
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, 
                height: `${MARGIN_BOTTOM_PX * scale}px`,
                padding: `0 ${MARGIN_LR_PX * scale}px`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'white', zIndex: 10,
                pointerEvents: 'none',
              }}
            >
              <span style={{ fontSize: `${8 * scale}px`, color: '#a1a1aa', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                (주) 팀제이커브 | <span style={{ color: '#3346FF' }}>CONFIDENTIAL</span>
              </span>
              <span style={{ fontSize: `${8 * scale}px`, color: '#a1a1aa', fontWeight: 'bold' }}>
                {pageIndex + 1} / {totalPages}
              </span>
            </div>

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
                onLoad={(e) => {
                  const doc = (e.target as HTMLIFrameElement).contentDocument;
                  if (doc) {
                    doc.body.style.margin = '0';
                    doc.body.style.padding = `${MARGIN_TOP_PX}px ${MARGIN_LR_PX}px ${MARGIN_BOTTOM_PX}px ${MARGIN_LR_PX}px`;
                  }
                }}
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
