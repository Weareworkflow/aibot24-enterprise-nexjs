"use client";

import Link from "next/link";
import { Mic2, LayoutDashboard, Plus, Bell, MoreVertical } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white border-border/60 sticky top-0 z-50 h-14 flex items-center shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg shadow-sm">
              <Mic2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-headline text-lg font-bold text-[#333] hidden sm:inline tracking-tight">
              AI<span className="text-secondary">Bot</span>24
            </span>
          </Link>
          
          <div className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-black uppercase transition-all tracking-wider",
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
                "flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-black uppercase transition-all tracking-wider",
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

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-2xl bg-[#F8FAFC] text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-2xl bg-[#F8FAFC] text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
