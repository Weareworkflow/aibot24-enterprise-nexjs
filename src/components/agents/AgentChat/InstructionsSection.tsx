
"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AIAgent } from "@/lib/types";
import { Info, Target, MessageCircle, FileCode } from "lucide-react";

interface InstructionsSectionProps {
  agent: AIAgent;
  onUpdate: (field: string, value: any, title?: string) => void;
}

export function InstructionsSection({ agent, onUpdate }: InstructionsSectionProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. OBJETIVO */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-secondary" />
          <Label className="text-[10px] font-black uppercase text-slate-800 tracking-[0.2em]">Objetivo Operativo</Label>
        </div>
        <Textarea 
          value={agent.objective} 
          onChange={(e) => onUpdate('objective', e.target.value, 'Objetivo')} 
          className="min-h-[100px] text-xs bg-slate-50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-secondary/30 p-4 leading-relaxed shadow-inner" 
          placeholder="¿Qué debe lograr el agente en cada interacción?"
        />
        <p className="text-[9px] text-muted-foreground flex items-center gap-1.5 px-1">
          <Info className="h-3 w-3" /> Define la meta principal de conversión o asistencia.
        </p>
      </div>

      {/* 2. TONO */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-accent" />
          <Label className="text-[10px] font-black uppercase text-slate-800 tracking-[0.2em]">Tono de Comunicación</Label>
        </div>
        <Textarea 
          value={agent.tone} 
          onChange={(e) => onUpdate('tone', e.target.value, 'Tono')} 
          className="min-h-[100px] text-xs bg-slate-50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-accent/30 p-4 leading-relaxed shadow-inner" 
          placeholder="Ej: Profesional, ejecutivo, empático pero directo..."
        />
        <p className="text-[9px] text-muted-foreground flex items-center gap-1.5 px-1">
          <Info className="h-3 w-3" /> Esto define la personalidad y estilo del agente.
        </p>
      </div>

      {/* 3. MANUAL TÉCNICO */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-primary" />
          <Label className="text-[10px] font-black uppercase text-slate-800 tracking-[0.2em]">Manual de Comportamiento Técnico</Label>
        </div>
        <div className="relative">
          <Textarea 
            value={agent.knowledge} 
            onChange={(e) => onUpdate('knowledge', e.target.value, 'Manual Técnico')} 
            className="min-h-[350px] font-mono text-[11px] bg-slate-900 text-slate-300 border-none rounded-3xl focus-visible:ring-2 focus-visible:ring-secondary/50 p-6 leading-relaxed shadow-2xl" 
            placeholder="// Instrucciones detalladas de comportamiento...
// Puedes incluir reglas de negocio, FAQs y protocolos de escalamiento."
          />
          <div className="absolute top-4 right-4 text-[9px] font-black text-white/20 uppercase tracking-widest pointer-events-none">
            Modo Arquitecto
          </div>
        </div>
        <p className="text-[9px] text-muted-foreground flex items-center gap-1.5 px-1">
          <Info className="h-3 w-3" /> Este manual es la base del razonamiento del agente.
        </p>
      </div>
    </div>
  );
}
