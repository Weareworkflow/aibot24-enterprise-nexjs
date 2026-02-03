"use client";

import { useState, useRef, useEffect } from "react";
import { AIAgent, ChatMessage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Loader2, 
  Wand2, 
  Sparkles,
  UserCog,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
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
    
    // Añadir feedback del usuario al historial
    setHistory(prev => [...prev, { role: 'user', content: userFeedback }]);
    
    try {
      // 1. Obtener refinamiento de la IA
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

      // 2. Aplicar cambios inmediatamente en Firestore
      const agentRef = doc(db, "agents", agent.id);
      await updateDoc(agentRef, {
        role: suggestion.role,
        objective: suggestion.objective,
        tone: suggestion.tone,
        knowledge: suggestion.knowledge
      });

      // 3. Añadir confirmación al historial
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
      {/* Cabecera de la Consola */}
      <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary/10 rounded-full text-secondary">
            <Wand2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Optimizador AI</h3>
            <p className="text-[8px] font-bold text-muted-foreground uppercase">Edición de Arquitectura en Caliente</p>
          </div>
        </div>
        
        <div className="text-right">
          <span className="text-[8px] text-green-600 font-black uppercase flex items-center justify-end gap-1">
            <span className="h-1 w-1 bg-green-600 rounded-full animate-pulse" />
            Sincronización Activa
          </span>
        </div>
      </div>

      {/* Área de Historial de Cambios */}
      <div className="flex-1 overflow-hidden relative bg-slate-50/30">
        <ScrollArea className="h-full p-6" ref={scrollRef}>
          <div className="space-y-6 pb-4">
            {history.length === 0 && !isRefining && (
              <div className="text-center py-20 space-y-4 opacity-50">
                <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto text-secondary">
                  <UserCog className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Protocolo de Ajuste</h4>
                  <p className="text-[10px] uppercase font-bold px-12 leading-relaxed">
                    Indica qué quieres cambiar o mejorar del agente. El Arquitecto Virtual aplicará los cambios al instante.
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
                    ? "bg-primary text-white border-primary rounded-tr-none" 
                    : "bg-white text-foreground border-secondary/20 rounded-tl-none"
                )}>
                  {item.content}
                  
                  {item.explanation && (
                    <div className="mt-3 pt-3 border-t border-secondary/10">
                      <p className="text-[9px] font-black text-secondary flex items-center gap-1.5 uppercase mb-1">
                        <CheckCircle2 className="h-3 w-3" /> Cambios Realizados
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
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-secondary/20 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin text-secondary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Rediseñando...</span>
                  </div>
                  <div className="h-2 w-32 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer de Entrada Unificado */}
      <div className="p-4 bg-white border-t mt-auto">
        <div className="flex items-center gap-2 bg-[#F8FAFC] p-2 rounded-2xl border focus-within:border-secondary transition-colors">
          <div className="p-2 text-secondary">
            <Sparkles className="h-4 w-4" />
          </div>
          
          <Input 
            placeholder="Ej: 'Haz que el tono sea más persuasivo' o 'Actualiza los precios del catálogo'..." 
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
          Tus instrucciones modifican la base de conocimiento en tiempo real
        </p>
      </div>
    </div>
  );
}
