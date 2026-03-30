"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink, Download, FilePlus2, Copy } from "lucide-react";
import { toast } from "sonner";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  driveLink: string;
  fileName: string;
}

export function SuccessModal({ isOpen, onClose, driveLink, fileName }: SuccessModalProps) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(driveLink);
    toast.success("링크가 클립보드에 복사되었습니다.");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center py-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-zinc-900">
            강사카드가 생성되었습니다
          </DialogTitle>
          <DialogDescription className="text-zinc-500 pt-2 font-medium">
            {fileName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-6">
          <Button 
            className="w-full h-12 gap-2 bg-[#3346FF] hover:bg-[#2838cc]"
            onClick={() => window.open(driveLink, "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
            Google Drive에서 열기
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 gap-2" onClick={handleCopyLink}>
              <Copy className="h-4 w-4" />
              링크 복사
            </Button>
            <Button variant="outline" className="h-12 gap-2" onClick={() => window.location.href = "/"}>
              <FilePlus2 className="h-4 w-4" />
              새 카드 만들기
            </Button>
          </div>
        </div>

        <DialogFooter className="sm:justify-center text-xs text-zinc-400 font-medium">
          PDF는 지정된 팀 드라이브 폴더에 자동으로 저장되었습니다.
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
