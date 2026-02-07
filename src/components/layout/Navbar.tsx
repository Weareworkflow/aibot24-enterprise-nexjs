
"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Logo } from "./Logo";
import { useUIStore } from "@/lib/store";
import { PortalMenu } from "./PortalMenu";

export function Navbar() {
  const pathname = usePathname();
  const { searchQuery, setSearchQuery } = useUIStore();

  return (
    <nav className="border-b bg-card text-card-foreground border-border/60 sticky top-0 z-50 h-14 flex items-center shadow-sm transition-colors duration-300">
      <div className="w-full px-4 md:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 flex-shrink-0">
          <Link href="/" className="transition-opacity hover:opacity-90">
            <Logo />
          </Link>
        </div>

        <div className="flex-1 max-w-xl mx-4 hidden sm:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-secondary transition-colors" />
            <Input 
              placeholder="Buscar agentes, roles o empresas..." 
              className="w-full h-9 pl-10 bg-muted/50 border-none rounded-xl text-[11px] focus-visible:ring-1 focus-visible:ring-secondary/30 transition-all font-medium text-foreground placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <Link
            href="/agents/new"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all tracking-wider shadow-sm",
              "bg-secondary text-secondary-foreground hover:bg-secondary/90",
              pathname === "/agents/new" && "ring-2 ring-secondary/20"
            )}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden lg:inline">Nuevo Agente</span>
          </Link>

          <div className="flex items-center gap-2">
            <PortalMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
