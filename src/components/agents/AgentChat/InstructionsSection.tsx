
"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AIAgent } from "@/lib/types";
import { Info, Target, MessageCircle, FileCode, Zap, Sparkles } from "lucide-react";

interface InstructionsSectionProps {
  agent: AIAgent;
  onUpdate: (field: string, value: any, title?: string) => void;
}

export function InstructionsSection({ agent, onUpdate }: InstructionsSectionProps) {
  return (
    <div className="space-y-12">
      {/* 1. OBJETIVO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-secondary/10 flex items-center justify-center shadow-sm border border-secondary/5">
              <Target className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <Label className="text-[11px] font-black uppercase text-foreground tracking-[0.15em]">Objetivo Estratégico</Label>
              <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">Misión crítica del agente</p>
            </div>
          </div>
          <Zap className="h-4 w-4 text-secondary/40 animate-pulse" />
        </div>
        <Textarea 
          value={agent.objective} 
          onChange={(e) => onUpdate('objective', e.target.value, 'Objetivo')} 
          className="min-h-[140px] text-sm bg-card border-border rounded-[2.5rem] focus-visible:ring-secondary/30 p-8 leading-relaxed shadow-sm hover:border-secondary/20 transition-all" 
          placeholder="¿Cuál es la misión principal de este agente?"
        />
      </div>

      {/* 2. TONO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-accent/10 flex items-center justify-center shadow-sm border border-accent/5">
              <MessageCircle className="h-5 w-5 text-accent" />
            </div>
            <div>
              <Label className="text-[11px] font-black uppercase text-foreground tracking-[0.15em]">ADN de Comunicación</Label>
              <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">Personalidad y estilo</p>
            </div>
          </div>
        </div>
        <Textarea 
          value={agent.tone} 
          onChange={(e) => onUpdate('tone', e.target.value, 'Tono')} 
          className="min-h-[140px] text-sm bg-card border-border rounded-[2.5rem] focus-visible:ring-accent/30 p-8 leading-relaxed shadow-sm hover:border-accent/20 transition-all" 
          placeholder="Ej: Empático, ejecutivo, directo pero cordial..."
        />
      </div>

      {/* 3. MANUAL TÉCNICO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm border border-primary/5">
              <FileCode className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <Label className="text-[11px] font-black uppercase text-foreground tracking-[0.15em]">Manual de Comportamiento Técnico</Label>
              <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">Reglas de negocio y protocolos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-secondary animate-pulse" />
            <span className="text-[8px] font-black text-muted-foreground uppercase bg-muted/50 px-3 py-1 rounded-full border border-border shadow-sm tracking-widest">Protocolo Elite</span>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-slate-900 rounded-[3rem] shadow-2xl opacity-50" />
          <Textarea 
            value={agent.knowledge} 
            onChange={(e) => onUpdate('knowledge', e.target.value, 'Manual Técnico')} 
            className="min-h-[450px] font-mono text-[11px] bg-slate-950 text-slate-300 border border-border/40 rounded-[3rem] focus-visible:ring-2 focus-visible:ring-secondary/40 p-10 leading-relaxed relative z-10 transition-all shadow-inner" 
            placeholder="// Escribe aquí las reglas de negocio, FAQs y protocolos...
// El agente seguirá estas instrucciones al pie de la letra."
          />
        </div>
      </div>
    </div>
  );
}
