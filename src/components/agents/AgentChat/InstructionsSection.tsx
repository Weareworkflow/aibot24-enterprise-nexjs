
"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AIAgent } from "@/lib/types";

interface InstructionsSectionProps {
  agent: AIAgent;
  onUpdate: (field: string, value: any, title?: string) => void;
}

export function InstructionsSection({ agent, onUpdate }: InstructionsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Objetivo</Label>
        <Textarea 
          value={agent.objective} 
          onChange={(e) => onUpdate('objective', e.target.value, 'Objetivo')} 
          className="min-h-[80px] text-sm bg-slate-50" 
          placeholder="Define el objetivo principal..."
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Tono de Voz</Label>
        <Textarea 
          value={agent.tone} 
          onChange={(e) => onUpdate('tone', e.target.value, 'Tono')} 
          className="min-h-[80px] text-sm bg-slate-50" 
          placeholder="Describe la personalidad..."
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Manual de Comportamiento Técnico</Label>
        <Textarea 
          value={agent.knowledge} 
          onChange={(e) => onUpdate('knowledge', e.target.value, 'Manual Técnico')} 
          className="min-h-[300px] font-mono text-sm bg-slate-50 leading-relaxed" 
          placeholder="Instrucciones detalladas de comportamiento..."
        />
      </div>
    </div>
  );
}
