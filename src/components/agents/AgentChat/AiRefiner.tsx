
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIAgent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Send, Loader2 } from "lucide-react";
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
  const [history, setHistory] = useState<{role: 'user' | 'assistant', content: string}[]>([]);

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
        content: `Arquitectura de ${agent.name} optimizada con éxito. ${suggestion.explanation}`
      }]);

    } catch (error: any) {
      errorEmitter.emit('permission-error', error);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="flex flex-col h-[350px]">
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {history.map((item, idx) => (
            <div 
              key={idx} 
              className={cn(
                "flex flex-col max-w-[85%] space-y-1", 
                item.role === 'user' ? "ml-auto items-end" : "items-start"
              )}
            >
              <div 
                className={cn(
                  "px-4 py-3 rounded-2xl text-[13px] border", 
                  item.role === 'user' ? "bg-secondary text-white" : "bg-white"
                )}
              >
                {item.content}
              </div>
            </div>
          ))}
          {isRefining && <Loader2 className="h-6 w-6 animate-spin mx-auto text-secondary" />}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-slate-50">
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border">
          <Input 
            placeholder="Ej: Haz que el tono sea más ejecutivo..." 
            className="border-none bg-transparent h-10 text-[13px]" 
            value={feedbackInput} 
            onChange={(e) => setFeedbackInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleRefine()} 
          />
          <Button 
            size="icon" 
            className="rounded-xl h-10 w-10 bg-secondary" 
            onClick={handleRefine} 
            disabled={!feedbackInput.trim() || isRefining}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
