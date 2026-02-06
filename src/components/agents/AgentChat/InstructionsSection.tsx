"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AIAgent } from "@/lib/types";
import { Info, Target, MessageCircle, FileCode, Zap } from "lucide-react";

interface InstructionsSectionProps {
  agent: AIAgent;
  onUpdate: (field: string, value: any, title?: string) => void;
}

export function InstructionsSection({ agent, onUpdate }: InstructionsSectionProps) {
  return (
    <div className="space-y-10">
      {/* 1. OBJETIVO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-secondary" />
            </div>
            <Label className="text-[11px] font-black uppercase text-slate-700 tracking-[0.15em]">Objetivo Estratégico</Label>
          </div>
          <Zap className="h-3 w-3 text-secondary/30" />
        </div>
        <Textarea 
          value={agent.objective} 
          onChange={(e) => onUpdate('objective', e.target.value, 'Objetivo')} 
          className="min-h-[120px] text-sm bg-slate-50/50 border-slate-100 rounded-[2rem] focus-visible:ring-1 focus-visible:ring-secondary/20 p-6 leading-relaxed shadow-sm transition-all hover:bg-white" 
          placeholder="¿Cuál es la misión principal de este agente?"
        />
        <p className="text-[9px] text-muted-foreground flex items-center gap-1.5 px-2">
          <Info className="h-3.5 w-3.5 opacity-40" /> Define el éxito de cada interacción.
        </p>
      </div>

      {/* 2. TONO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-accent/10 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-accent" />
            </div>
            <Label className="text-[11px] font-black uppercase text-slate-700 tracking-[0.15em]">ADN de Comunicación</Label>
          </div>
        </div>
        <Textarea 
          value={agent.tone} 
          onChange={(e) => onUpdate('tone', e.target.value, 'Tono')} 
          className="min-h-[120px] text-sm bg-slate-50/50 border-slate-100 rounded-[2rem] focus-visible:ring-1 focus-visible:ring-accent/20 p-6 leading-relaxed shadow-sm transition-all hover:bg-white" 
          placeholder="Ej: Empático, ejecutivo, directo pero cordial..."
        />
        <p className="text-[9px] text-muted-foreground flex items-center gap-1.5 px-2">
          <Info className="h-3.5 w-3.5 opacity-40" /> Esto moldea la personalidad de la IA.
        </p>
      </div>

      {/* 3. MANUAL TÉCNICO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileCode className="h-5 w-5 text-primary" />
            </div>
            <Label className="text-[11px] font-black uppercase text-slate-700 tracking-[0.15em]">Manual de Comportamiento Técnico</Label>
          </div>
          <span className="text-[8px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-full tracking-tighter">Elite Mode</span>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-accent/5 rounded-[2.5rem] -m-0.5 blur-sm opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <Textarea 
            value={agent.knowledge} 
            onChange={(e) => onUpdate('knowledge', e.target.value, 'Manual Técnico')} 
            className="min-h-[400px] font-mono text-[11px] bg-slate-900 text-slate-300 border-none rounded-[2.5rem] focus-visible:ring-2 focus-visible:ring-secondary/30 p-8 leading-relaxed shadow-2xl relative z-10" 
            placeholder="// Escribe aquí las reglas de negocio, FAQs y protocolos...
// El agente seguirá estas instrucciones al pie de la letra."
          />
        </div>
        <p className="text-[9px] text-muted-foreground flex items-center gap-1.5 px-2 font-bold uppercase tracking-widest opacity-60">
          <Zap className="h-3 w-3 text-yellow-500" /> Base del razonamiento operativo de la unidad.
        </p>
      </div>
    </div>
  );
}