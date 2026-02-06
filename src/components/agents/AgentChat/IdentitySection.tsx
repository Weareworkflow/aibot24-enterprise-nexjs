
"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AIAgent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface IdentitySectionProps {
  agent: AIAgent;
  onUpdate: (field: string, value: any, title?: string) => void;
}

const ASSISTANT_COLORS = [
  "#ef4444", "#22c55e", "#10b981", "#3b82f6", "#1e3a8a", 
  "#a855f7", "#06b6d4", "#ec4899", "#84cc16", "#78350f", 
  "#2563eb", "#fef08a", "#f97316", "#475569", "#94a3b8", "#1e293b"
];

export function IdentitySection({ agent, onUpdate }: IdentitySectionProps) {
  return (
    <div className="space-y-4">
      {[
        { key: 'name', label: 'Nombre' },
        { key: 'role', label: 'Rol' },
        { key: 'company', label: 'Empresa' }
      ].map(field => (
        <div key={field.key} className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{field.label}</Label>
          <Input 
            value={(agent as any)[field.key]} 
            onChange={(e) => onUpdate(field.key, e.target.value)} 
            className="h-10 text-sm font-bold bg-slate-50" 
          />
        </div>
      ))}
      <div className="pt-4">
        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block mb-3">Identidad Visual</Label>
        <div className="flex flex-wrap gap-2.5">
          {ASSISTANT_COLORS.map(c => (
            <button 
              key={c} 
              onClick={() => onUpdate('color', c)} 
              className={cn(
                "h-7 w-7 rounded-full border shadow-sm transition-transform hover:scale-110 flex items-center justify-center", 
                agent.color === c && "ring-2 ring-secondary ring-offset-2"
              )} 
              style={{ backgroundColor: c }}
            >
              {agent.color === c && <Check className="h-3 w-3 text-white" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
