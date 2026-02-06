
"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AIAgent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, User, Briefcase, Building2, Palette } from "lucide-react";

interface IdentitySectionProps {
  agent: AIAgent;
  onUpdate: (field: string, value: any, title?: string) => void;
}

const ASSISTANT_COLORS = [
  "#1B75BB", "#41E0F0", "#2FC6F6", "#22c55e", "#10b981", 
  "#3b82f6", "#ef4444", "#f97316", "#a855f7", "#06b6d4", 
  "#ec4899", "#84cc16", "#78350f", "#1e293b", "#475569", "#94a3b8"
];

export function IdentitySection({ agent, onUpdate }: IdentitySectionProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-secondary" />
            <Label className="text-[10px] font-black uppercase text-slate-800 tracking-[0.2em]">Nombre de la Unidad</Label>
          </div>
          <Input 
            value={agent.name} 
            onChange={(e) => onUpdate('name', e.target.value)} 
            className="h-12 text-sm font-bold bg-slate-50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-secondary/30 px-4" 
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-secondary" />
            <Label className="text-[10px] font-black uppercase text-slate-800 tracking-[0.2em]">Rol / Cargo</Label>
          </div>
          <Input 
            value={agent.role} 
            onChange={(e) => onUpdate('role', e.target.value)} 
            className="h-12 text-sm font-bold bg-slate-50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-secondary/30 px-4" 
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-secondary" />
            <Label className="text-[10px] font-black uppercase text-slate-800 tracking-[0.2em]">Empresa / Marca</Label>
          </div>
          <Input 
            value={agent.company} 
            onChange={(e) => onUpdate('company', e.target.value)} 
            className="h-12 text-sm font-bold bg-slate-50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-secondary/30 px-4" 
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-4 w-4 text-secondary" />
          <Label className="text-[10px] font-black uppercase text-slate-800 tracking-[0.2em]">Identidad Visual (Bitrix Skin)</Label>
        </div>
        <div className="flex flex-wrap gap-3">
          {ASSISTANT_COLORS.map(c => (
            <button 
              key={c} 
              onClick={() => onUpdate('color', c)} 
              className={cn(
                "h-8 w-8 rounded-full border shadow-sm transition-all hover:scale-110 flex items-center justify-center relative", 
                agent.color === c && "ring-2 ring-secondary ring-offset-2 scale-110"
              )} 
              style={{ backgroundColor: c }}
            >
              {agent.color === c && <Check className="h-4 w-4 text-white drop-shadow-md" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
