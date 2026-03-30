"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import { LogOut, LogIn, User } from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <span className="text-xl font-bold text-[#3346FF] tracking-tight">
              TEAM J-CURVE
            </span>
            <div className="h-4 w-px bg-zinc-200 mx-2" />
            <span className="text-sm font-medium text-zinc-500">
              강사카드 생성기
            </span>
          </Link>
        </div>
        
        <nav className="flex items-center gap-4">
          {status === "authenticated" ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-50 rounded-full border border-zinc-100">
                <div className="h-6 w-6 rounded-full bg-[#3346FF]/10 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-[#3346FF]" />
                </div>
                <span className="text-xs font-semibold text-zinc-700">
                  {session.user?.name || session.user?.email?.split("@")[0]}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-zinc-500 hover:text-destructive gap-2 font-medium"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </Button>
            </div>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              className="bg-[#3346FF] hover:bg-[#2838cc] gap-2 font-medium"
              onClick={() => signIn("google")}
              disabled={status === "loading"}
            >
              <LogIn className="h-4 w-4" />
              로그인
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
