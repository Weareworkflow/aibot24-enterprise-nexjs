
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
    <div className="flex flex-col h-full border rounded-[2rem] bg-white shadow-xl overflow-hidden">
      {/* Cabecera y Configuración Manual */}
      <div className="bg-muted/10">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="identidad" className="border-b px-6">
            <AccordionTrigger className="hover:no-underline py-5 data-[state=open]:text-secondary transition-colors">
              <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest">
                <Settings2 className="h-5 w-5" /> Identidad
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-8 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <UserRound className="h-4 w-4" /> Nombre
                  </div>
                  <Input 
                    value={agent.name} 
                    onChange={(e) => handleManualUpdate('name', e.target.value)}
                    className="h-10 text-sm font-bold bg-white/80"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <Sparkles className="h-4 w-4" /> Rol
                  </div>
                  <Input 
                    value={agent.role} 
                    onChange={(e) => handleManualUpdate('role', e.target.value)}
                    className="h-10 text-sm font-bold bg-white/80"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <Building2 className="h-4 w-4" /> Empresa
                  </div>
                  <Input 
                    value={agent.company} 
                    onChange={(e) => handleManualUpdate('company', e.target.value)}
                    className="h-10 text-sm font-bold bg-white/80"
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">
                  <Palette className="h-4 w-4" /> Identidad Visual del Asistente
                </div>
                <div className="flex flex-wrap gap-2">
                  {ASSISTANT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleManualUpdate('color', c)}
                      className={cn(
                        "h-8 w-8 rounded-full transition-all hover:scale-110 flex items-center justify-center relative shadow-sm border",
                        agent.color === c && "ring-2 ring-offset-2 ring-secondary"
                      )}
                      style={{ backgroundColor: c }}
                    >
                      {agent.color === c && <Check className="h-4 w-4 text-white drop-shadow-sm" />}
                    </button>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="instrucciones" className="border-b px-6">
            <AccordionTrigger className="hover:no-underline py-5 data-[state=open]:text-secondary transition-colors">
              <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest">
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
                  className="min-h-[60px] text-sm font-bold leading-relaxed bg-white/80 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <Palette className="h-4 w-4" /> Personalidad y Tono
                  </div>
                  <Textarea 
                    value={agent.tone} 
                    onChange={(e) => handleManualUpdate('tone', e.target.value)}
                    className="min-h-[100px] text-sm italic bg-white/80 leading-relaxed resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <LayoutGrid className="h-4 w-4" /> Base de Conocimiento
                  </div>
                  <Textarea 
                    value={agent.knowledge} 
                    onChange={(e) => handleManualUpdate('knowledge', e.target.value)}
                    className="min-h-[100px] text-[11px] font-mono bg-white/80 leading-relaxed resize-none"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="integraciones" className="border-b px-6">
            <AccordionTrigger className="hover:no-underline py-5 data-[state=open]:text-secondary transition-colors">
              <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest">
                <Share2 className="h-5 w-5" /> Integraciones
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-8 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    className="flex items-center justify-between p-4 border rounded-2xl bg-white/50 hover:bg-white transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <int.icon className={cn("h-5 w-5", agent.integrations?.[int.title] ? "text-secondary" : "text-muted-foreground")} />
                      <span className="text-[11px] font-bold">{int.title}</span>
                    </div>
                    <Switch 
                      className="scale-90"
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
      </div>

      {/* Optimizador AI Colapsable - Altura Media al abrir */}
      <Collapsible 
        open={isChatOpen} 
        onOpenChange={setIsChatOpen}
        className="flex-1 flex flex-col overflow-hidden min-h-0"
      >
        <CollapsibleTrigger asChild>
          <button className="flex items-center justify-between px-6 py-4 bg-secondary/5 hover:bg-secondary/10 transition-colors border-b">
            <div className="flex items-center gap-3">
              <Wand2 className="h-5 w-5 text-secondary" />
              <div className="text-left">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Editar Ajuste con AI</h3>
                <p className="text-[9px] font-bold text-muted-foreground uppercase">Optimización inteligente mediante lenguaje natural</p>
              </div>
            </div>
            {isChatOpen ? <ChevronUp className="h-4 w-4 text-secondary" /> : <ChevronDown className="h-4 w-4 text-secondary" />}
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="flex-1 flex flex-col min-h-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          <div className="flex-1 flex flex-col h-[400px]">
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-6 pb-6">
                {history.length === 0 && !isRefining && (
                  <div className="text-center py-12 space-y-3 opacity-40">
                    <div className="h-12 w-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto text-secondary">
                      <UserCog className="h-6 w-6" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                      Escribe qué quieres mejorar y la IA ajustará los parámetros automáticamente.
                    </p>
                  </div>
                )}

                {history.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex flex-col max-w-[90%] space-y-1 animate-in fade-in slide-in-from-bottom-2",
                      item.role === 'user' ? "ml-auto items-end" : "items-start"
                    )}
                  >
                    <div className={cn(
                      "px-4 py-3 rounded-2xl text-[11px] leading-relaxed shadow-sm border",
                      item.role === 'user' 
                        ? "bg-secondary text-white border-secondary rounded-tr-none" 
                        : "bg-white text-foreground border-slate-100 rounded-tl-none"
                    )}>
                      {item.content}
                      {item.explanation && (
                        <div className="mt-3 pt-3 border-t border-slate-50">
                          <p className="text-[8px] font-black text-secondary uppercase mb-1">Rediseño Aplicado:</p>
                          <p className="text-[10px] italic text-muted-foreground">{item.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isRefining && (
                  <div className="flex items-start gap-2 animate-pulse">
                    <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border flex flex-col gap-2 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin text-secondary" />
                        <span className="text-[10px] font-black uppercase text-secondary">Arquitecto trabajando...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 bg-white border-t mt-auto">
              <div className="flex items-center gap-2 bg-[#F8FAFC] p-2 rounded-2xl border focus-within:border-secondary transition-colors shadow-inner">
                <div className="p-2 text-secondary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <Input 
                  placeholder="Ej: 'Cambia el tono a uno más ejecutivo'..." 
                  className="flex-1 border-none bg-transparent focus-visible:ring-0 text-[11px] h-9 px-1"
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isRefining && handleRefine()}
                  disabled={isRefining}
                />
                <Button 
                  size="icon" 
                  className="rounded-xl h-9 w-9 bg-secondary hover:bg-secondary/90 shadow-lg"
                  onClick={handleRefine}
                  disabled={!feedbackInput.trim() || isRefining}
                >
                  {isRefining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
