"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUploadZone } from "@/components/upload/file-upload-zone";
import { Button } from "@/components/ui/button";
import { FilePlus2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    toast.info(`${file.name} 파일을 분석 중입니다...`);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("파일 분석에 실패했습니다.");

      const data = await response.json();
      // Store data in session storage or state management and redirect
      // For now, just logging and redirecting to editor
      console.log("Extracted data:", data);
      localStorage.setItem("extractedInstructorData", JSON.stringify(data));
      router.push("/editor");
    } catch (error) {
      console.error(error);
      toast.error("파일 분석 중 오류가 발생했습니다. 직접 입력을 시도해 보세요.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartEmpty = () => {
    localStorage.removeItem("extractedInstructorData");
    router.push("/editor");
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 lg:p-12 transition-all">
      <div className="w-full max-w-4xl space-y-12">
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#3346FF]/10 px-4 py-1.5 text-sm font-semibold text-[#3346FF]">
            <Sparkles className="h-4 w-4" />
            AI 기반 강사 프로필 자동 생성
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            강사 카드 제작을 시작하세요
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-600">
            기존에 보유하신 PPTX, DOCX 또는 PDF 파일을 업로드하면 AI가 핵심 정보를
            자동으로 추출하여 팀제이커브 표준 템플릿에 맞춰 드립니다.
          </p>
        </div>

        <FileUploadZone onFileSelect={handleFileSelect} isUploading={isUploading} />

        <div className="flex flex-col items-center gap-6">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-zinc-200"></div>
            </div>
            <div className="relative flex justify-center text-sm font-medium uppercase">
              <span className="bg-slate-50/50 px-4 text-zinc-500">또는 직접 입력하기</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="h-14 gap-2 rounded-full border-zinc-200 px-8 text-base font-medium hover:bg-white hover:text-[#3346FF] hover:border-[#3346FF]/50 transition-all"
            onClick={handleStartEmpty}
          >
            <FilePlus2 className="h-5 w-5" />
            빈 템플릿으로 시작하기
          </Button>
        </div>
      </div>
    </div>
  );
}
