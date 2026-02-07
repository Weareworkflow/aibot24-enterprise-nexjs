
"use client";

import { useUIStore } from "@/lib/store";
import { 
  Settings, 
  HelpCircle, 
  Building2,
  ChevronDown
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

export function PortalMenu() {
  const { tenantId, domain } = useUIStore();
  const router = useRouter();
  
  // Extraemos el nombre del portal del dominio (ej: workflowteams.bitrix24.es -> WORKFLOWTEAMS)
  const portalName = domain 
    ? domain.split('.')[0].toUpperCase() 
    : (tenantId ? "PORTAL ACTIVO" : "SESIÓN ANÓNIMA");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-3 px-3 pill-rounded hover:bg-slate-100 transition-all border-none group">
          <div className="h-7 w-7 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 leading-none mb-1">Portal</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight leading-none">{portalName}</span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-data-[state=open]:rotate-180 transition-transform" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2 rounded-[2rem] border-none shadow-2xl bg-white animate-in fade-in zoom-in-95 duration-200" align="end" sideOffset={10}>
        <DropdownMenuLabel className="px-4 py-4">
          <div className="space-y-1">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">{portalName}</h2>
            <p className="text-[10px] font-bold text-slate-400 lowercase tracking-tight truncate">{domain || "bitrix24.enterprise"}</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-slate-50 mx-2 h-px" />
        
        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem 
            className="h-12 px-4 rounded-2xl gap-3 cursor-pointer focus:bg-slate-50 group"
            onClick={() => router.push('/')}
          >
            <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center group-focus:bg-white transition-colors">
              <Settings className="h-4 w-4 text-slate-500" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">Configuración</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="h-12 px-4 rounded-2xl gap-3 cursor-pointer focus:bg-slate-50 group"
            onClick={() => router.push('/help')}
          >
            <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center group-focus:bg-white transition-colors">
              <HelpCircle className="h-4 w-4 text-slate-500" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">Ayuda</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
