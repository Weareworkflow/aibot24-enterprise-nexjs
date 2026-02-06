"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AIAgent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, User, Briefcase, Building2, Palette, Sparkles } from "lucide-react";

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
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center">
              <User className="h-4 w-4 text-slate-500" />
            </div>
            <Label className="text-[10px] font-black uppercase text-slate-600 tracking-[0.2em]">Nombre Operativo</Label>
          </div>
          <Input 
            value={agent.name} 
            onChange={(e) => onUpdate('name', e.target.value)} 
            className="h-14 text-sm font-bold bg-slate-50/50 border-slate-100 rounded-[1.5rem] focus-visible:ring-1 focus-visible:ring-secondary/20 px-6 transition-all hover:bg-white" 
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-slate-500" />
            </div>
            <Label className="text-[10px] font-black uppercase text-slate-600 tracking-[0.2em]">Rol / Especialidad</Label>
          </div>
          <Input 
            value={agent.role} 
            onChange={(e) => onUpdate('role', e.target.value)} 
            className="h-14 text-sm font-bold bg-slate-50/50 border-slate-100 rounded-[1.5rem] focus-visible:ring-1 focus-visible:ring-secondary/20 px-6 transition-all hover:bg-white" 
          />
        </div>
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-slate-500" />
            </div>
            <Label className="text-[10px] font-black uppercase text-slate-600 tracking-[0.2em]">Organización Representada</Label>
          </div>
          <Input 
            value={agent.company} 
            onChange={(e) => onUpdate('company', e.target.value)} 
            className="h-14 text-sm font-bold bg-slate-50/50 border-slate-100 rounded-[1.5rem] focus-visible:ring-1 focus-visible:ring-secondary/20 px-6 transition-all hover:bg-white" 
          />
        </div>
      </div>

      <div className="pt-8 border-t border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <Palette className="h-5 w-5 text-secondary" />
            </div>
            <Label className="text-[11px] font-black uppercase text-slate-700 tracking-[0.15em]">ADN Visual (Bitrix Skin)</Label>
          </div>
          <Sparkles className="h-4 w-4 text-secondary/40 animate-pulse" />
        </div>
        <div className="flex flex-wrap gap-4">
          {ASSISTANT_COLORS.map(c => (
            <button 
              key={c} 
              onClick={() => onUpdate('color', c)} 
              className={cn(
                "h-10 w-10 rounded-[1rem] border-2 shadow-sm transition-all hover:scale-125 flex items-center justify-center relative", 
                agent.color === c ? "border-secondary scale-125 ring-4 ring-secondary/10" : "border-white"
              )} 
              style={{ backgroundColor: c }}
            >
              {agent.color === c && <Check className="h-5 w-5 text-white drop-shadow-lg" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}