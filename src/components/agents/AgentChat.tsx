
"use client";

import { useState, useRef, useEffect } from "react";
import { AIAgent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { 
  Send, 
  Loader2, 
  Wand2, 
  Sparkles,
  UserCog,
  Settings2,
  Code2,
  Share2,
  UserRound,
  Building2,
  Target,
  Smartphone,
  Calendar,
  LayoutGrid,
  FilePlus,
  Search,
  Cloud,
  PhoneCall,
  Palette,
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { refineAgentConfig } from "@/ai/flows/refine-agent-config";
import { useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface AgentChatProps {
  agent: AIAgent;
}

const ASSISTANT_COLORS = [
  "#ef4444", "#22c55e", "#10b981", "#3b82f6", "#1e3a8a", 
  "#a855f7", "#06b6d4", "#ec4899", "#84cc16", "#78350f", 
  "#2563eb", "#fef08a", "#f97316", "#475569", "#94a3b8", "#1e293b"
];

export function AgentChat({ agent }: AgentChatProps) {
  const [feedbackInput, setFeedbackInput] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [history, setHistory] = useState<{role: 'user' | 'assistant', content: string, explanation?: string}[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const db = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [history, isRefining, isChatOpen]);

  const handleManualUpdate = (field: keyof AIAgent, value: any) => {
    if (!db || !agent) return;
    const agentRef = doc(db, "agents", agent.id);
    updateDoc(agentRef, { [field]: value })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: agentRef.path,
          operation: 'update',
          requestResourceData: { [field]: value }
        }));
      });
  };

  const handleRefine = async () => {
    if (!feedbackInput.trim() || !db) return;
    
    const userFeedback = feedbackInput;
    setFeedbackInput("");
    setIsRefining(true);
    
    setHistory(prev => [...prev, { role: 'user', content: userFeedback }]);
    
    try {
      const suggestion = await refineAgentConfig({
        currentConfig: {
          name: agent.name,
          role: agent.role,
          company: agent.company,
          objective: agent.objective,
          tone: agent.tone,
          knowledge: agent.knowledge
        },
        feedback: userFeedback
      });

      const agentRef = doc(db, "agents", agent.id);
      await updateDoc(agentRef, {
        role: suggestion.role,
        objective: suggestion.objective,
        tone: suggestion.tone,
        knowledge: suggestion.knowledge
      });

      setHistory(prev => [...prev, { 
        role: 'assistant', 
        content: `He actualizado la arquitectura de ${agent.name} siguiendo tus instrucciones.`,
        explanation: suggestion.explanation
      }]);

      toast({
        title: "Arquitectura Actualizada",
        description: "Los cambios se han aplicado automáticamente.",
      });

    } catch (error: any) {
      if (error?.name === 'FirestorePermissionError') {
         errorEmitter.emit('permission-error', error);
      } else {
        toast({
          variant: "destructive",
          title: "Error de Optimización",
          description: "No pudimos aplicar los cambios en este momento.",
        });
      }
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-[2rem] bg-white shadow-xl overflow-hidden border-slate-200">
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="flex flex-col min-h-full">
          <Accordion type="single" collapsible className="w-full">
            {/* IDENTIDAD */}
            <AccordionItem value="identidad" className="border-b px-6 border-slate-100">
              <AccordionTrigger className="hover:no-underline py-6 text-slate-700 data-[state=open]:text-secondary transition-colors outline-none">
                <div className="flex items-center gap-4 text-[14px] font-black uppercase tracking-widest">
                  <Settings2 className="h-5 w-5" /> Identidad
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 pt-2">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <UserRound className="h-4 w-4" /> Nombre
                    </div>
                    <Input 
                      value={agent.name} 
                      onChange={(e) => handleManualUpdate('name', e.target.value)}
                      className="h-10 text-sm font-bold bg-slate-50 border-slate-200 focus-visible:ring-secondary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <Sparkles className="h-4 w-4" /> Rol
                    </div>
                    <Input 
                      value={agent.role} 
                      onChange={(e) => handleManualUpdate('role', e.target.value)}
                      className="h-10 text-sm font-bold bg-slate-50 border-slate-200 focus-visible:ring-secondary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <Building2 className="h-4 w-4" /> Empresa
                    </div>
                    <Input 
                      value={agent.company} 
                      onChange={(e) => handleManualUpdate('company', e.target.value)}
                      className="h-10 text-sm font-bold bg-slate-50 border-slate-200 focus-visible:ring-secondary/30"
                    />
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">
                      <Palette className="h-4 w-4" /> Identidad Visual
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {ASSISTANT_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => handleManualUpdate('color', c)}
                          className={cn(
                            "h-8 w-8 rounded-full transition-all hover:scale-110 flex items-center justify-center relative shadow-sm border border-slate-200",
                            agent.color === c && "ring-2 ring-offset-2 ring-secondary"
                          )}
                          style={{ backgroundColor: c }}
                        >
                          {agent.color === c && <Check className="h-4 w-4 text-white drop-shadow-sm" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* INSTRUCCIONES */}
            <AccordionItem value="instrucciones" className="border-b px-6 border-slate-100">
              <AccordionTrigger className="hover:no-underline py-6 text-slate-700 data-[state=open]:text-secondary transition-colors outline-none">
                <div className="flex items-center gap-4 text-[14px] font-black uppercase tracking-widest">
                  <Code2 className="h-5 w-5" /> Instrucciones
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 pt-2 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <Target className="h-4 w-4" /> Objetivo Crítico
                  </div>
                  <Textarea 
                    value={agent.objective} 
                    onChange={(e) => handleManualUpdate('objective', e.target.value)}
                    className="min-h-[100px] text-sm bg-slate-50 border-slate-200 resize-none focus-visible:ring-secondary/30"
                  />
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <Palette className="h-4 w-4" /> Personalidad y Tono
                    </div>
                    <Textarea 
                      value={agent.tone} 
                      onChange={(e) => handleManualUpdate('tone', e.target.value)}
                      className="min-h-[120px] text-sm italic bg-slate-50 border-slate-200 resize-none focus-visible:ring-secondary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <LayoutGrid className="h-4 w-4" /> Base de Conocimiento
                    </div>
                    <Textarea 
                      value={agent.knowledge} 
                      onChange={(e) => handleManualUpdate('knowledge', e.target.value)}
                      className="min-h-[200px] text-[12px] font-mono bg-slate-50 border-slate-200 resize-none focus-visible:ring-secondary/30"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* INTEGRACIONES - COLUMNA ÚNICA */}
            <AccordionItem value="integraciones" className="border-b px-6 border-slate-100">
              <AccordionTrigger className="hover:no-underline py-6 text-slate-700 data-[state=open]:text-secondary transition-colors outline-none">
                <div className="flex items-center gap-4 text-[14px] font-black uppercase tracking-widest">
                  <Share2 className="h-5 w-5" /> Integraciones
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 pt-2">
                <div className="flex flex-col gap-3">
                  {[
                    { title: "WhatsApp Business", icon: Smartphone },
                    { title: "Calendario Bitrix24", icon: Calendar },
                    { title: "Catálogo Bitrix24", icon: LayoutGrid },
                    { title: "Documentos Bitrix24", icon: FilePlus },
                    { title: "Analizador Documento", icon: Search },
                    { title: "Drive Bitrix24", icon: Cloud },
                    { title: "Calls API", icon: PhoneCall },
                  ].map((int, i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-white hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <int.icon className={cn("h-6 w-6", agent.integrations?.[int.title] ? "text-secondary" : "text-muted-foreground")} />
                        <span className="text-[12px] font-black uppercase tracking-wider">{int.title}</span>
                      </div>
                      <Switch 
                        checked={agent.integrations?.[int.title] || false} 
                        onCheckedChange={(checked) => {
                          const newInts = { ...agent.integrations, [int.title]: checked };
                          handleManualUpdate('integrations', newInts);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* EDITAR CON AI - PEGADO A INTEGRACIONES */}
          <Collapsible open={isChatOpen} onOpenChange={setIsChatOpen} className="w-full">
            <CollapsibleTrigger asChild>
              <button className={cn(
                "flex items-center justify-between px-6 py-6 w-full border-t border-slate-100 transition-colors outline-none bg-white",
                isChatOpen ? "bg-secondary/5" : "hover:bg-slate-50"
              )}>
                <div className="flex items-center gap-4 text-[14px] font-black uppercase tracking-widest text-secondary">
                  <Wand2 className="h-6 w-6" /> Editar Ajuste con AI
                </div>
                {isChatOpen ? <ChevronDown className="h-5 w-5 text-secondary" /> : <ChevronUp className="h-5 w-5 text-secondary" />}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-white border-t border-slate-100">
              <div className="flex flex-col h-[400px]">
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-5 pb-4">
                    {history.length === 0 && !isRefining && (
                      <div className="text-center py-10 space-y-3 opacity-30">
                        <UserCog className="h-10 w-10 mx-auto text-secondary" />
                        <p className="text-[10px] font-black uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                          Instruye a la IA para rediseñar el agente de inmediato.
                        </p>
                      </div>
                    )}
                    {history.map((item, idx) => (
                      <div key={idx} className={cn("flex flex-col max-w-[85%] space-y-1 animate-in fade-in slide-in-from-bottom-1", item.role === 'user' ? "ml-auto items-end" : "items-start")}>
                        <div className={cn("px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm border", item.role === 'user' ? "bg-secondary text-white border-secondary rounded-tr-none" : "bg-white text-foreground border-slate-100 rounded-tl-none")}>
                          {item.content}
                          {item.explanation && (
                            <div className="mt-3 pt-3 border-t border-slate-50">
                              <p className="text-[9px] font-black text-secondary uppercase mb-1 tracking-widest">Log de Cambios:</p>
                              <p className="text-[12px] italic text-muted-foreground">{item.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isRefining && (
                      <div className="flex items-start gap-2 animate-pulse">
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 flex flex-col gap-2 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-secondary" />
                            <span className="text-[11px] font-black uppercase text-secondary">Procesando Arquitectura...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="p-4 bg-white border-t border-slate-100">
                  <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-secondary transition-colors">
                    <Sparkles className="h-5 w-5 text-secondary ml-2" />
                    <Input 
                      placeholder="Ej: 'Cambia el tono a uno más ejecutivo'..." 
                      className="flex-1 border-none bg-transparent focus-visible:ring-0 text-[13px] h-10"
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !isRefining && handleRefine()}
                      disabled={isRefining}
                    />
                    <Button size="icon" className="rounded-xl h-10 w-10 bg-secondary hover:bg-secondary/90" onClick={handleRefine} disabled={!feedbackInput.trim() || isRefining}>
                      {isRefining ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );
}
