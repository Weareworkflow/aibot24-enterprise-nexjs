"use client";

import Link from "next/link";
import { Mic2, Plus, Bell, MoreVertical, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

// Nota: En una app real, usaríamos un Context o un State manager para compartir la búsqueda.
// Para este prototipo, simulamos el comportamiento visual.
export function Navbar() {
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState("");

  return (
    <nav className="border-b bg-white border-border/60 sticky top-0 z-50 h-12 flex items-center shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between gap-4">
        {/* LOGO AREA */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
            <div className="bg-primary p-1.5 rounded-lg shadow-sm">
              <Mic2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-headline text-lg font-bold text-[#333] hidden sm:inline tracking-tight">
              AI<span className="text-secondary">Bot</span>24
            </span>
          </Link>
        </div>

        {/* SEARCH BAR - PROPORTIONAL & CENTERED */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-secondary transition-colors" />
            <Input 
              placeholder="Buscar agentes, tareas o comandos..." 
              className="w-full h-8 pl-9 bg-[#F0F3F5] border-none rounded-md text-[11px] focus-visible:ring-1 focus-visible:ring-secondary/30 transition-all"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </div>

        {/* ACTIONS AREA */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/agents/new"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-black uppercase transition-all tracking-wider mr-2",
              pathname === "/agents/new" 
                ? "bg-primary/5 text-primary" 
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Nuevo Agente</span>
          </Link>

          <div className="flex items-center gap-1.5 border-l pl-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md bg-[#F8FAFC] text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md bg-[#F8FAFC] text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
