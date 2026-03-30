"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { InstructorData } from "@/lib/schemas";
import { getInstructorCardHtml } from "@/lib/pdf-template";

interface CardPreviewProps {
  data: InstructorData;
  scale?: number;
}

// A4 dimensions in px (at 96dpi)
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
const MARGIN_TOP_PX = 83; // ~22mm
const MARGIN_BOTTOM_PX = 60; // ~16mm
const MARGIN_LR_PX = 45; // ~12mm

export function CardPreview({ data, scale = 0.6 }: CardPreviewProps) {
  const html = useMemo(() => getInstructorCardHtml(data), [data]);
  const measureRef = useRef<HTMLIFrameElement>(null);
  const [totalPages, setTotalPages] = useState(1);

  const previewHtml = useMemo(() => {
    const headerHtml = `
      <div style="position: fixed; top: 0; left: 0; right: 0; height: ${MARGIN_TOP_PX}px; padding: 15px ${MARGIN_LR_PX}px 8px ${MARGIN_LR_PX}px; display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid #f4f4f5; background: white; z-index: 100; font-family: 'Nanum Gothic', sans-serif;">
        <span style="font-size: 11px; color: #3346FF; font-weight: 900; letter-spacing: -0.05em;">TEAM J-CURVE</span>
        <span style="font-size: 7px; color: #a1a1aa; font-weight: 500;">팀제이커브 강사 프로필</span>
      </div>
    `;

    const footerHtml = `
      <div style="position: fixed; bottom: 0; left: 0; right: 0; height: ${MARGIN_BOTTOM_PX}px; padding: 0 ${MARGIN_LR_PX}px; display: flex; justify-content: space-between; align-items: center; background: white; z-index: 100; font-family: 'Nanum Gothic', sans-serif;">
        <span style="font-size: 8px; color: #a1a1aa; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em;">
          (주) 팀제이커브 | <span style="color: #3346FF;">CONFIDENTIAL</span>
        </span>
      </div>
    `;

    return html.replace(
      '<body>',
      `<body style="margin: 0; padding: ${MARGIN_TOP_PX}px ${MARGIN_LR_PX}px ${MARGIN_BOTTOM_PX}px ${MARGIN_LR_PX}px;">${headerHtml}${footerHtml}`
    );
  }, [html]);

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
            className="bg-white shadow-2xl mx-auto overflow-hidden"
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
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
