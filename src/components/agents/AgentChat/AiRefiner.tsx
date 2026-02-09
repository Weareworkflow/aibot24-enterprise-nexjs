"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIAgent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Send, Loader2, Sparkles, Wand2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { refineAgentConfig } from "@/ai/flows/refine-agent-config";
import { doc, updateDoc, Firestore } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface AiRefinerProps {
  agent: AIAgent;
  db: Firestore | null;
}

export function AiRefiner({ agent, db }: AiRefinerProps) {
  const [feedbackInput, setFeedbackInput] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [history, setHistory] = useState<{role: 'user' | 'assistant' | 'error' | 'system', content: string, id: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
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
    
    setHistory(prev => [...prev, { 
      id: Date.now().toString(),
      role: 'user', 
      content: userFeedback 
    }]);
    
    try {
      const activeIntegrations = Object.entries(agent.integrations || {})
        .filter(([_, active]) => active)
        .map(([name]) => name);

      // 1. Generación con Gemini 1.5 Flash
      const suggestion = await refineAgentConfig({
        currentConfig: {
          name: agent.name,
          role: agent.role,
          company: agent.company,
          objective: agent.objective,
          tone: agent.tone,
          knowledge: agent.knowledge || "",
          activeIntegrations
        },
        feedback: userFeedback
      });

      // 2. Guardado inmediato en la base de datos
      const agentRef = doc(db, "agents", agent.id);
      await updateDoc(agentRef, {
        knowledge: suggestion.knowledge
      });

      setHistory(prev => [...prev, { 
        id: (Date.now() + 1).toString(),
        role: 'assistant', 
        content: suggestion.explanation
      }, {
        id: (Date.now() + 2).toString(),
        role: 'system',
        content: "Protocolo sincronizado en Firestore correctamente."
      }]);

      toast({
        title: "Protocolo Sincronizado",
        description: "El manual técnico ha sido actualizado en tiempo real.",
      });

    } catch (error: any) {
      console.error("Refinement Error:", error);
      
      setHistory(prev => [...prev, { 
        id: Date.now().toString(),
        role: 'error', 
        content: `Error crítico: ${error.message || "No se pudo conectar con el motor de IA."}`
      }]);

      toast({
        variant: "destructive",
        title: "Fallo en la Arquitectura",
        description: "Revisa la consola o la clave de API de Gemini."
      });
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card transition-colors duration-300">
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-6">
          {history.length === 0 && (
            <div className="bg-secondary/5 border border-secondary/20 p-6 rounded-[2rem] text-[12px] text-foreground font-medium leading-relaxed animate-in fade-in duration-700">
              <div className="flex items-center gap-2 mb-3 text-secondary">
                <Wand2 className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Arquitecto Senior Gemini</span>
              </div>
              Hola, soy el Arquitecto de Protocolos. Mi función es redactar el **Manual Técnico de Comportamiento** para <strong className="text-secondary">{agent.name}</strong>. 
              <br /><br />
              Dame instrucciones y actualizaré el manual en la base de datos instantáneamente.
            </div>
          )}

          {history.map((item) => (
            <div 
              key={item.id} 
              className={cn(
                "flex flex-col max-w-[90%] animate-in fade-in slide-in-from-bottom-2 duration-300", 
                item.role === 'user' ? "ml-auto items-end" : "items-start"
              )}
            >
              <div 
                className={cn(
                  "px-5 py-3 rounded-2xl text-[13px] font-medium shadow-sm border", 
                  item.role === 'user' 
                    ? "bg-secondary text-white border-transparent rounded-tr-none" 
                    : item.role === 'error'
                      ? "bg-destructive/10 text-destructive border-destructive/20 flex items-center gap-2"
                      : item.role === 'system'
                        ? "bg-accent/5 text-accent border-accent/20 text-[10px] uppercase font-black tracking-widest flex items-center gap-2"
                        : "bg-muted/40 text-foreground border-border/40 rounded-tl-none"
                )}
              >
                {item.role === 'error' && <AlertTriangle className="h-3 w-3" />}
                {item.role === 'system' && <CheckCircle2 className="h-3 w-3" />}
                {item.content}
              </div>
            </div>
          ))}
          
          {isRefining && (
            <div className="flex items-center gap-3 p-4 bg-secondary/5 rounded-2xl border border-secondary/20 w-fit animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin text-secondary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Arquitecto Gemini redactando...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-muted/5">
        <div className="flex items-center gap-2 bg-card p-2 rounded-2xl border border-border/60 shadow-inner group focus-within:ring-2 focus-within:ring-secondary/20 transition-all">
          <Input 
            placeholder="Ej: 'Añade un protocolo para capturar correos...'" 
            className="flex-1 border-none bg-transparent focus-visible:ring-0 h-10 text-[13px] px-3 font-medium text-foreground placeholder:text-muted-foreground/50" 
            value={feedbackInput} 
            onChange={(e) => setFeedbackInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleRefine()} 
          />
          <Button 
            size="icon" 
            className="rounded-xl h-10 w-10 bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/10 transition-transform active:scale-95" 
            onClick={handleRefine} 
            disabled={!feedbackInput.trim() || isRefining}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
