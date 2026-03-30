"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
}

export function FileUploadZone({ onFileSelect, isUploading }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <Card
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all duration-200 outline-none",
        isDragging
          ? "border-[#3346FF] bg-[#3346FF]/5"
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50",
        isUploading && "pointer-events-none opacity-60"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById("file-upload")?.click()}
    >
      <input
        id="file-upload"
        type="file"
        className="hidden"
        accept=".pptx,.docx,.pdf"
        onChange={handleFileChange}
      />

      <div className="flex flex-col items-center space-y-4 text-center">
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full transition-colors duration-200",
            isDragging ? "bg-[#3346FF] text-white" : "bg-zinc-100 text-zinc-400"
          )}
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <Upload className="h-8 w-8" />
          )}
        </div>
        <div className="space-y-2">
          <p className="text-xl font-semibold text-zinc-900">
            강사 프로필 파일을 드래그하거나 클릭하여 업로드
          </p>
          <p className="text-sm text-zinc-500">
            PPTX · DOCX · PDF 형식을 지원합니다
          </p>
        </div>
      </div>
    </Card>
  );
}
