
"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Logo } from "./Logo";
import { useUIStore } from "@/lib/store";

export function Navbar() {
  const pathname = usePathname();
  const { searchQuery, setSearchQuery } = useUIStore();

  return (
    <nav className="border-b bg-white border-border/60 sticky top-0 z-50 h-12 flex items-center shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 flex-shrink-0">
          <Link href="/" className="transition-opacity hover:opacity-90">
            <Logo />
          </Link>
        </div>

        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-secondary transition-colors" />
            <Input 
              placeholder="Buscar agentes, roles o empresas..." 
              className="w-full h-8 pl-9 bg-[#F0F3F5] border-none rounded-md text-[11px] focus-visible:ring-1 focus-visible:ring-secondary/30 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/agents/new"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-black uppercase transition-all tracking-wider",
              "bg-secondary/15 text-secondary hover:bg-secondary/25",
              pathname === "/agents/new" && "bg-secondary/30"
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Nuevo Agente</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
