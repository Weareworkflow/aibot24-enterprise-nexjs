"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIAgent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Send, Loader2, Sparkles, Wand2, AlertTriangle, CheckCircle2, Settings2 } from "lucide-react";
import { useUIStore } from "@/lib/store";

import { doc, updateDoc, Firestore } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface AiRefinerProps {
  agent: AIAgent;
  db: Firestore | null;
}

export function AiRefiner({ agent, db }: AiRefinerProps) {
  const [feedbackInput, setFeedbackInput] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [history, setHistory] = useState<{ role: 'user' | 'assistant' | 'error' | 'system', content: string, id: string }[]>([]);

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

    const userMessageId = Date.now().toString();
    setHistory(prev => [...prev, {
      id: userMessageId,
      role: 'user',
      content: userFeedback
    }]);

    try {
      const response = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentConfig: {
            name: agent.name,
            role: agent.role,
            company: agent.company,
            systemPrompt: agent.systemPrompt || "",
          },
          feedback: userFeedback,
          tenantId: useUIStore.getState().tenantId // Pass Domain as context
        }),
      });

      if (!response.ok || !response.body) throw new Error("Error en la conexión con el servidor.");

      const assistantMessageId = (Date.now() + 1).toString();
      let fullContent = "";

      setHistory(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: ""
      }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;

        setHistory(prev => prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, content: fullContent }
            : msg
        ));
      }

      // Extraer conocimiento del bloque markdown final
      const knowledgeMatch = fullContent.match(/```markdown\s*([\s\S]*?)\s*```/);
      const newKnowledge = knowledgeMatch ? knowledgeMatch[1].trim() : null;

      if (newKnowledge) {
        const agentRef = doc(db, "agents", agent.id);
        await updateDoc(agentRef, {
          knowledge: newKnowledge
        });

        const systemMessageId = (Date.now() + 2).toString();
        setHistory(prev => [...prev, {
          id: systemMessageId,
          role: 'system',
          content: "Protocolo sincronizado en Firestore."
        }]);

        toast({
          title: "Protocolo Sincronizado",
          description: "El manual técnico ha sido actualizado.",
        });
      }

    } catch (error: any) {
      console.error("Refinement Error:", error);
      setHistory(prev => [...prev, {
        id: Date.now().toString(),
        role: 'error',
        content: `Error: ${error.message || "Fallo de conexión."}`
      }]);
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
              Hola, soy Aibot. Mi función es redactar el System Prompt para <strong className="text-secondary">{agent.name}</strong>.
              <br /><br />
              Dame instrucciones y actualizaré el System Prompt en la base de datos instantáneamente.
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
                <div className="whitespace-pre-wrap">{item.content}</div>
              </div>
            </div>
          ))}

          {isRefining && (
            <div className="flex items-center gap-3 p-4 bg-secondary/5 rounded-2xl border border-secondary/20 w-fit animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin text-secondary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Arquitecto redactando...</span>
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
