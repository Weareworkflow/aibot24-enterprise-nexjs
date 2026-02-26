
"use client";

import { useUIStore } from "@/lib/store";
import {
  Settings,
  HelpCircle,
  MoreVertical,
  Zap
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { translations } from "@/lib/translations";

export function PortalMenu() {
  const { tenantId, domain, language } = useUIStore();
  const router = useRouter();
  const t = translations[language].nav;

  const portalName = domain
    ? domain.split('.')[0].toUpperCase()
    : (tenantId ? t.active_portal : t.anonymous);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-muted/50 border border-border hover:bg-muted transition-all flex items-center justify-center">
          <MoreVertical className="h-5 w-5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2 rounded-[2rem] border-none shadow-2xl bg-popover text-popover-foreground animate-in fade-in zoom-in-95 duration-200" align="end" sideOffset={10}>
        <DropdownMenuLabel className="px-4 py-4">
          <div className="space-y-1">
            <h2 className="text-sm font-black uppercase tracking-widest text-foreground">{portalName}</h2>
            <p className="text-[10px] font-bold text-muted-foreground lowercase tracking-tight truncate">{domain || "bitrix24.enterprise"}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-muted/50 mx-2 h-px" />

        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem
            className="h-12 px-4 rounded-2xl gap-3 cursor-pointer focus:bg-muted group"
            onClick={() => router.push('/settings')}
          >
            <div className="h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center group-focus:bg-background transition-colors">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-foreground">{t.settings}</span>
          </DropdownMenuItem>


          <DropdownMenuItem
            className="h-12 px-4 rounded-2xl gap-3 cursor-pointer focus:bg-muted group"
            onClick={() => router.push('/help')}
          >
            <div className="h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center group-focus:bg-background transition-colors">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-foreground">{t.help}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
