"use client";

import { useState, useEffect, useRef } from "react";
import { InstructorForm } from "@/components/editor/instructor-form";
import { CardPreview } from "@/components/editor/card-preview";
import { SuccessModal } from "@/components/editor/success-modal";
import { InstructorData } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { FileDown, ChevronLeft, Save, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const DEFAULT_DATA: InstructorData = {
  name: "",
  title: "",
  summary: "",
  education: [{ degree: "", school: "", major: "", status: "" }],
  experiences: [{ period: "", company: "", position: "" }],
  projects: [],
  exhibitions: [],
  extras: [],
  lectureHistory: [],
  customSections: [],
};

export default function EditorPage() {
  const [data, setData] = useState<InstructorData>(DEFAULT_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [driveLink, setDriveLink] = useState("");
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedData = localStorage.getItem("extractedInstructorData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setData({ ...DEFAULT_DATA, ...parsed });
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const handleFormChange = (formData: Partial<InstructorData>) => {
    setData((prev) => ({ ...prev, ...formData }));
  };

  // Handle scaling of the A4 preview to fit the container
  useEffect(() => {
    const updateScale = () => {
      if (!previewContainerRef.current) return;
      const containerWidth = previewContainerRef.current.clientWidth - 80;
      const a4Width = 794; // A4 width in px at 96dpi
      const scale = Math.min(containerWidth / a4Width, 0.85);
      setPreviewScale(scale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("PDF 생성 중 오류가 발생했습니다.");
      
      const result = await response.json();
      setDriveLink(result.driveLink);
      setIsSuccessOpen(true);
      toast.success("PDF가 성공적으로 생성되었습니다!");
    } catch (error) {
      console.error(error);
      toast.error("PDF 생성에 실패했습니다. 환경 변수와 권한을 확인해 주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch("/api/generate-pdf?download=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("PDF 다운로드 실패");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentFileName;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF가 다운로드되었습니다!");
    } catch (error) {
      console.error(error);
      toast.error("PDF 다운로드에 실패했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const currentFileName = `[팀제이커브] 강사프로필_${data.name || "신규강사"}_${dateStr}.pdf`;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top Bar */}
      <div className="h-14 border-b bg-white flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="h-4 w-4" /> 뒤로
            </Button>
          </Link>
          <div className="h-4 w-px bg-zinc-200" />
          <h2 className="text-sm font-semibold text-zinc-600">
            강사카드 편집: <span className="text-zinc-900">{data.name || "신규 강사"}</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
          >
            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            PDF 다운로드
          </Button>
          <Button
            className="bg-[#3346FF] hover:bg-[#2838cc] gap-2"
            size="sm"
            onClick={handleGeneratePDF}
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            Drive 저장
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[450px] lg:w-[500px] flex-shrink-0 h-full" suppressHydrationWarning>
          {isLoaded ? (
            <InstructorForm key="loaded" initialData={data} onChange={handleFormChange} />
          ) : (
            <div className="flex flex-col h-full bg-zinc-50 border-r overflow-hidden" />
          )}
        </div>

        <div 
          ref={previewContainerRef}
          className="flex-1 bg-zinc-100/50 overflow-auto flex justify-center p-10 pattern-dots"
        >
          <div className="h-fit" suppressHydrationWarning>
            <CardPreview data={data} scale={previewScale} />
          </div>
        </div>
      </div>

      <SuccessModal 
        isOpen={isSuccessOpen} 
        onClose={() => setIsSuccessOpen(false)} 
        driveLink={driveLink}
        fileName={currentFileName}
      />
    </div>
  );
}
