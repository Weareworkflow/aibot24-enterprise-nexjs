"use client";

import Link from "next/link";
import { Mic2, LayoutDashboard, Plus, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white border-border/60 sticky top-0 z-50 h-12 flex items-center">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-primary p-1 rounded">
              <Mic2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-headline text-md font-bold text-[#333] hidden sm:inline">
              AI<span className="text-primary">Voice</span>24
            </span>
          </Link>
          
          <div className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-black uppercase transition-all",
                pathname === "/dashboard" 
                  ? "bg-primary/5 text-primary" 
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </Link>
            <Link
              href="/agents/new"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-black uppercase transition-all",
                pathname === "/agents/new" 
                  ? "bg-primary/5 text-primary" 
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <Plus className="h-3.5 w-3.5" />
              Nuevo
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
          <div className="h-4 w-px bg-border mx-1" />
          <Button variant="ghost" className="gap-2 px-1 hover:bg-transparent h-8">
            <div className="h-6 w-6 rounded-sm bg-primary/20 flex items-center justify-center text-primary font-black text-[10px]">
              JD
            </div>
            <span className="text-[11px] font-bold text-[#333] hidden md:inline">J. Pérez</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
