"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIAgent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Send, Loader2, Sparkles } from "lucide-react";
import { refineAgentConfig } from "@/ai/flows/refine-agent-config";
import { doc, updateDoc, Firestore } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';

interface AiRefinerProps {
  agent: AIAgent;
  db: Firestore | null;
}

export function AiRefiner({ agent, db }: AiRefinerProps) {
  const [feedbackInput, setFeedbackInput] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [history, setHistory] = useState<{role: 'user' | 'assistant', content: string, id: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

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

      const agentRef = doc(db, "agents", agent.id);
      await updateDoc(agentRef, {
        knowledge: suggestion.knowledge
      });

      setHistory(prev => [...prev, { 
        id: (Date.now() + 1).toString(),
        role: 'assistant', 
        content: `Protocolo de comportamiento actualizado. ${suggestion.explanation}`
      }]);

    } catch (error: any) {
      errorEmitter.emit('permission-error', error);
      setHistory(prev => [...prev, { 
        id: Date.now().toString(),
        role: 'assistant', 
        content: "Error al actualizar el protocolo. Por favor, verifica tu conexión."
      }]);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-4">
          {history.length === 0 && (
            <div className="bg-muted/30 border border-border/40 p-4 rounded-2xl text-[12px] text-muted-foreground font-medium leading-relaxed mb-4">
              <div className="flex items-center gap-2 mb-2 text-secondary">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Protocolo de Asistencia</span>
              </div>
              Hola, soy el Arquitecto de IA. Ajustaré el comportamiento de <strong className="text-foreground">{agent.name}</strong> según tus necesidades. 
              Pídeme reglas específicas: "No des precios sin capturar el email", "Sé más breve", etc.
            </div>
          )}

          {history.map((item) => (
            <div 
              key={item.id} 
              className={cn(
                "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300", 
                item.role === 'user' ? "ml-auto items-end" : "items-start"
              )}
            >
              <div 
                className={cn(
                  "px-4 py-2.5 rounded-2xl text-[13px] font-medium shadow-sm border", 
                  item.role === 'user' 
                    ? "bg-secondary text-white border-transparent rounded-tr-none" 
                    : "bg-muted/50 text-foreground border-border/40 rounded-tl-none"
                )}
              >
                {item.content}
              </div>
            </div>
          ))}
          
          {isRefining && (
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-2xl border border-border/40 w-fit animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin text-secondary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Refinando comportamiento...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-muted/10">
        <div className="flex items-center gap-2 bg-card p-1.5 rounded-2xl border border-border/60 shadow-inner group">
          <Input 
            placeholder="Instrucciones de comportamiento..." 
            className="flex-1 border-none bg-transparent focus-visible:ring-0 h-10 text-[13px] px-3 font-medium text-foreground placeholder:text-muted-foreground" 
            value={feedbackInput} 
            onChange={(e) => setFeedbackInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleRefine()} 
          />
          <Button 
            size="icon" 
            className="rounded-xl h-10 w-10 bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/10" 
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