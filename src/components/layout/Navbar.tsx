
"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Logo } from "./Logo";
import { useUIStore } from "@/lib/store";
import { PortalMenu } from "./PortalMenu";
import { translations } from "@/lib/translations";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const { searchQuery, setSearchQuery, language, appConfig } = useUIStore();
  const t = translations[language].nav;

  // Global Theme Sync
  useEffect(() => {
    if (appConfig?.theme) {
      setTheme(appConfig.theme);
    }
  }, [appConfig?.theme, setTheme]);

  return (
    <nav className="border-b bg-card text-card-foreground border-border/60 z-50 h-14 flex items-center shadow-sm transition-colors duration-300">
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
              placeholder={t.search}
              className="w-full h-9 pl-10 bg-muted/50 border-none rounded-xl text-[11px] focus-visible:ring-1 focus-visible:ring-secondary/30 transition-all font-medium text-foreground placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">


          <div className="flex items-center gap-2">
            <PortalMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
