
"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative w-10 h-10 flex-shrink-0">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <path
            d="M85 65C85 73.2843 78.2843 80 70 80H60L45 92V80H40C23.4315 80 10 66.5685 10 50C10 33.4315 23.4315 20 40 20C41.7303 20 43.4253 20.1465 45.071 20.4304C50.2115 11.836 59.4267 6 70 6C86.5685 6 100 19.4315 100 36C100 45.8924 95.2033 54.6652 87.8282 60.1068C87.9413 61.705 88 63.3241 88 65"
            fill="url(#paint0_linear)"
            opacity="0.2"
          />
          <path
            d="M75 50C75 63.8071 63.8071 75 50 75C46.5 75 43.2 74.3 40.2 73L30 80V70.5C23.8 66.5 20 59.2 20 51C20 37.1929 31.1929 26 45 26C46.8 26 48.5 26.2 50.2 26.6C54.8 19.8 62.8 15.5 71.8 15.5C86.2 15.5 98 27.3 98 41.7C98 48.2 95.6 54.2 91.6 58.8C91.9 60.2 92 61.6 92 63C92 71.3 85.3 78 77 78H75V50Z"
            fill="url(#paint1_linear)"
          />
          <rect x="38" y="42" width="24" height="18" rx="6" fill="white" />
          <circle cx="42" cy="42" r="1.5" fill="white" />
          <circle cx="58" cy="42" r="1.5" fill="white" />
          <circle cx="45" cy="51" r="2.5" fill="#2FC6F6">
            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="55" cy="51" r="2.5" fill="#2FC6F6">
            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
          </circle>
          <path d="M47 56C47 56 48.5 57.5 50 57.5C51.5 57.5 53 56 53 56" stroke="#2FC6F6" strokeWidth="1" strokeLinecap="round" />
          <path d="M28 45L24 52H29L25 59" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M72 35L76 42H71L75 49" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          
          <defs>
            <linearGradient id="paint0_linear" x1="10" y1="50" x2="100" y2="50" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2FC6F6" />
              <stop offset="1" stopColor="#1B75BB" />
            </linearGradient>
            <linearGradient id="paint1_linear" x1="20" y1="47.5" x2="98" y2="47.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#41E0F0" />
              <stop offset="1" stopColor="#2FC6F6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <span className="font-headline text-2xl font-bold text-primary tracking-tighter flex items-center">
          AI<span className="text-secondary italic">Bot</span>24 <span className="text-secondary font-black uppercase text-[10px] tracking-[0.3em] ml-3 border-l-2 pl-3 border-slate-300 h-6 flex items-center self-center">Enterprise</span>
        </span>
      )}
    </div>
  );
}
