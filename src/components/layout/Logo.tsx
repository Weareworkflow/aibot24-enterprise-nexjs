"use client";


import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2 transition-colors duration-300", className)}>

      {showText && (
        <span className="font-headline text-2xl font-bold text-foreground tracking-tighter flex items-center transition-colors">
          AI<span className="text-secondary italic">Bot</span>24 <span className="text-secondary font-black uppercase text-[11px] tracking-[0.25em] ml-3 border-l-2 pl-3 border-border h-6 flex items-center self-center">Enterprise</span>
        </span>
      )}
    </div>
  );
}