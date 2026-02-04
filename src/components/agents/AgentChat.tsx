
"use client";

import { useState, useRef, useEffect } from "react";
import { AIAgent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { 
  Send, 
  Loader2, 
  Wand2, 
  Sparkles,
  UserCog,
  CheckCircle2,
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
  Palette
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

export function AgentChat({ agent }: AgentChatProps) {
  const [feedbackInput, setFeedbackInput] = useState("");
  const [isRefining, setIsRefining] = useState(false);
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
  }, [history, isRefining]);

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

  const toggleIntegration = (title: string) => {
    if (!db || !agent) return;
    const agentRef = doc(db, "agents", agent.id);
    const newIntegrations = {
      ...(agent.integrations || {}),
      [title]: !agent.integrations?.[title]
    };

    updateDoc(agentRef, { integrations: newIntegrations })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: agentRef.path,
          operation: 'update',
          requestResourceData: { integrations: newIntegrations }
        }));
      });
  };

  return (
    <div className="flex flex-col h-full border rounded-[2rem] bg-white shadow-xl overflow-hidden">
      {/* Cabecera de la Consola con Acordeones Integrados */}
      <div className="border-b bg-muted/20">
        <div className="p-4 border-b bg-muted/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-full text-secondary">
              <Wand2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-primary">Optimizador AI</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Edición de Arquitectura en Caliente</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-secondary font-black uppercase flex items-center justify-end gap-1.5">
              <span className="h-1.5 w-1.5 bg-secondary rounded-full animate-pulse" />
              Sincronización Bitrix24
            </span>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="identidad" className="border-b px-6">
            <AccordionTrigger className="hover:no-underline py-5 data-[state=open]:text-secondary transition-colors">
              <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest">
                <Settings2 className="h-5 w-5" /> Identidad
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-8 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <UserRound className="h-4 w-4" /> Unidad
                  </div>
                  <p className="text-sm font-bold">{agent.name}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <Sparkles className="h-4 w-4" /> Rol
                  </div>
                  <p className="text-sm font-bold">{agent.role}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <Building2 className="h-4 w-4" /> Empresa
                  </div>
                  <p className="text-sm font-bold">{agent.company}</p>
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
                <div className="flex items-center gap-2.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  <Target className="h-4 w-4" /> Objetivo Crítico
                </div>
                <p className="text-sm font-bold leading-relaxed">{agent.objective}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <Palette className="h-4 w-4" /> Personalidad
                  </div>
                  <p className="text-xs italic bg-white p-3 rounded-xl border leading-relaxed">{agent.tone}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <LayoutGrid className="h-4 w-4" /> Conocimiento
                  </div>
                  <div className="text-[11px] bg-white p-3 rounded-xl border font-mono max-h-32 overflow-y-auto leading-relaxed">
                    {agent.knowledge}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="integraciones" className="border-none px-6">
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
                    className="flex items-center justify-between p-4 border rounded-2xl hover:bg-white transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <int.icon className={cn("h-5 w-5", agent.integrations?.[int.title] ? "text-secondary" : "text-muted-foreground")} />
                      <span className="text-xs font-bold truncate max-w-[120px]">{int.title}</span>
                    </div>
                    <Switch 
                      className="scale-90"
                      checked={agent.integrations?.[int.title] || false} 
                      onCheckedChange={() => toggleIntegration(int.title)}
                    />
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Área de Historial de Cambios */}
      <div className="flex-1 overflow-hidden relative bg-slate-50/30">
        <ScrollArea className="h-full p-6" ref={scrollRef}>
          <div className="space-y-6 pb-4">
            {history.length === 0 && !isRefining && (
              <div className="text-center py-16 space-y-4 opacity-50">
                <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto text-secondary">
                  <UserCog className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Protocolo de Ajuste</h4>
                  <p className="text-[10px] uppercase font-bold px-12 leading-relaxed">
                    Escribe tus instrucciones para que el Arquitecto Virtual optimice la unidad al instante.
                  </p>
                </div>
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
                    ? "bg-secondary text-white border-secondary rounded-tr-none shadow-secondary/10" 
                    : "bg-white text-foreground border-slate-100 rounded-tl-none"
                )}>
                  {item.content}
                  
                  {item.explanation && (
                    <div className="mt-3 pt-3 border-t border-slate-50">
                      <p className="text-[9px] font-black text-secondary flex items-center gap-1.5 uppercase mb-1">
                        <CheckCircle2 className="h-3 w-3" /> Rediseño Aplicado
                      </p>
                      <p className="text-[10px] italic text-muted-foreground leading-relaxed">{item.explanation}</p>
                    </div>
                  )}
                </div>
                <span className="text-[7px] font-black text-muted-foreground uppercase px-2 tracking-widest">
                  {item.role === 'user' ? 'Instrucción Operador' : 'Arquitecto Virtual'}
                </span>
              </div>
            ))}

            {isRefining && (
              <div className="flex items-start gap-2 max-w-[85%] animate-pulse">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin text-secondary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Rediseñando Arquitectura...</span>
                  </div>
                  <div className="h-2 w-32 bg-slate-50 rounded animate-pulse" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer de Entrada */}
      <div className="p-4 bg-white border-t mt-auto">
        <div className="flex items-center gap-2 bg-[#F8FAFC] p-2 rounded-2xl border focus-within:border-secondary transition-colors">
          <div className="p-2 text-secondary">
            <Sparkles className="h-4 w-4" />
          </div>
          
          <Input 
            placeholder="Ej: 'Cambia el tono a uno más agresivo en ventas' o 'Actualiza las FAQs'..." 
            className="flex-1 border-none bg-transparent focus-visible:ring-0 text-[11px] h-9 px-1"
            value={feedbackInput}
            onChange={(e) => setFeedbackInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isRefining) {
                handleRefine();
              }
            }}
            disabled={isRefining}
          />
          
          <Button 
            size="icon" 
            className="rounded-xl h-9 w-9 flex-shrink-0 shadow-lg bg-secondary hover:bg-secondary/90 transition-all active:scale-95"
            onClick={handleRefine}
            disabled={!feedbackInput.trim() || isRefining}
          >
            {isRefining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-[7px] text-center mt-2 font-black text-muted-foreground uppercase tracking-[0.2em]">
          Las actualizaciones se sincronizan con Firestore en tiempo real
        </p>
      </div>
    </div>
  );
}
