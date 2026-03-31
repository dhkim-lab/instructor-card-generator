"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { InstructorData } from "@/lib/schemas";
import { getInstructorCardHtml } from "@/lib/pdf-template";

interface CardPreviewProps {
  data: InstructorData;
  scale?: number;
}

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

export function CardPreview({ data, scale = 0.6 }: CardPreviewProps) {
  const previewHtml = useMemo(() => getInstructorCardHtml(data), [data]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState(1);

  // We detect total pages by counting .page-wrapper elements in the generated HTML
  // This is much more robust than measuring scroll height.
  useEffect(() => {
    const pageMatches = previewHtml.match(/class="page-wrapper"/g);
    setTotalPages(pageMatches ? pageMatches.length : 1);
  }, [previewHtml]);

  return (
    <div className="flex flex-col gap-8 items-center py-8">
      <div 
        className="flex flex-col gap-6"
        style={{
          width: `${A4_WIDTH_PX * scale}px`,
          transformOrigin: "top center",
        }}
      >
        <div className="text-center mb-2">
          <span className="text-sm font-bold text-zinc-500">
            실시간 미리보기 ({totalPages} 페이지)
          </span>
        </div>

        {/* 
          Since getInstructorCardHtml now returns multiple A4 pages sequentially, 
          we render them in a single iframe container.
          We set the height to exactly match the total pages.
        */}
        <div
          ref={containerRef}
          className="bg-zinc-200 shadow-inner overflow-hidden relative border border-zinc-300"
          style={{
            width: `${A4_WIDTH_PX * scale}px`,
            height: `${A4_HEIGHT_PX * totalPages * scale + (totalPages - 1) * 20 * scale}px`,
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              width: `${A4_WIDTH_PX}px`,
              height: `${A4_HEIGHT_PX * totalPages + (totalPages - 1) * 20}px`,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <iframe
              srcDoc={previewHtml}
              title="강사카드 미리보기"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                background: "transparent",
              }}
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>
      
      <div className="text-zinc-400 text-xs text-center max-w-md">
        * 미리보기의 페이지 분할은 실제 PDF와 동일하게 적용됩니다.<br/>
        문서가 길어지면 자동으로 다음 페이지가 생성됩니다.
      </div>
    </div>
  );
}
