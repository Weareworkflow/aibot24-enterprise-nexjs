"use client";

import { useState, useRef, useEffect } from "react";
import { AIAgent, ChatMessage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Send, 
  Mic, 
  Loader2, 
  MessageSquareText, 
  Wand2, 
  History, 
  CheckCircle2, 
  AlertCircle,
  RefreshCcw,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { refineAgentConfig, RefineAgentConfigOutput } from "@/ai/flows/refine-agent-config";
import { useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface AgentChatProps {
  agent: AIAgent;
}

export function AgentChat({ agent }: AgentChatProps) {
  // Estados para Modo Prueba
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [testInput, setTestInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Estados para Modo Corrección
  const [feedbackInput, setFeedbackInput] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [suggestion, setSuggestion] = useState<RefineAgentConfigOutput | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const db = useFirestore();
  const { toast } = useToast();
  const isVoice = agent.type === 'voice';

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping, suggestion]);

  // Manejador de Chat (Modo Prueba)
  const handleSendTest = async () => {
    if (!testInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: testInput,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setTestInput("");
    setIsTyping(true);

    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Soy ${agent.name}. Estoy operando en modo ${isVoice ? 'Voz' : 'Texto'}. Mi rol es ${agent.role}. Respondo a tu solicitud bajo el tono "${agent.tone}".`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1200);
  };

  // Manejador de Corrección (Modo Optimización)
  const handleRefine = async () => {
    if (!feedbackInput.trim()) return;
    setIsRefining(true);
    setSuggestion(null);

    try {
      const result = await refineAgentConfig({
        currentConfig: {
          name: agent.name,
          role: agent.role,
          company: agent.company,
          objective: agent.objective,
          tone: agent.tone,
          knowledge: agent.knowledge
        },
        feedback: feedbackInput
      });
      setSuggestion(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de Refinamiento",
        description: "No pudimos generar una propuesta en este momento.",
      });
    } finally {
      setIsRefining(false);
    }
  };

  const handleApplyChanges = async () => {
    if (!suggestion || !db) return;
    const agentRef = doc(db, "agents", agent.id);

    updateDoc(agentRef, {
      role: suggestion.role,
      objective: suggestion.objective,
      tone: suggestion.tone,
      knowledge: suggestion.knowledge
    })
    .then(() => {
      toast({
        title: "Arquitectura Actualizada",
        description: "El agente ha sido reconfigurado con éxito.",
      });
      setSuggestion(null);
      setFeedbackInput("");
    })
    .catch(async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: agentRef.path,
        operation: 'update',
        requestResourceData: suggestion
      }));
    });
  };

  return (
    <div className="flex flex-col h-full border rounded-[2rem] bg-white shadow-xl overflow-hidden">
      <Tabs defaultValue="test" className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
          <TabsList className="bg-[#F0F3F5] h-9 pill-rounded p-1 shadow-inner border">
            <TabsTrigger 
              value="test" 
              className="pill-rounded h-7 px-4 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <History className="h-3 w-3 mr-1.5" /> Probar
            </TabsTrigger>
            <TabsTrigger 
              value="correct" 
              className="pill-rounded h-7 px-4 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-secondary data-[state=active]:text-white"
            >
              <Wand2 className="h-3 w-3 mr-1.5" /> Corregir
            </TabsTrigger>
          </TabsList>
          
          <div className="text-right hidden sm:block">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">{agent.name}</h3>
            <span className="text-[8px] text-green-600 font-black uppercase flex items-center justify-end gap-1">
              <span className="h-1 w-1 bg-green-600 rounded-full animate-pulse" />
              Conectado
            </span>
          </div>
        </div>

        <TabsContent value="test" className="flex-1 flex flex-col m-0 p-0 overflow-hidden">
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-20 opacity-30 flex flex-col items-center justify-center gap-3">
                  <div className="p-4 bg-muted rounded-full">
                    <MessageSquareText className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">SandBox de Validación</p>
                    <p className="text-[10px] uppercase font-bold">Inicia una conversación para probar el tono.</p>
                  </div>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[85%] space-y-1 animate-in fade-in slide-in-from-bottom-1",
                    msg.role === 'user' ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "px-4 py-3 rounded-2xl text-[11px] leading-relaxed shadow-sm",
                      msg.role === 'user' 
                        ? "bg-primary text-white rounded-tr-none" 
                        : "bg-[#F0F3F5] text-foreground rounded-tl-none border border-border/50"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-start gap-2 max-w-[85%] animate-pulse">
                  <div className="bg-[#F0F3F5] px-4 py-3 rounded-2xl rounded-tl-none border border-border/50 flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="h-1 w-1 bg-muted-foreground rounded-full animate-bounce" />
                      <span className="h-1 w-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="h-1 w-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 bg-white border-t">
            <div className="flex items-center gap-2 bg-[#F8FAFC] p-2 rounded-2xl border">
              {isVoice && (
                <Button size="icon" variant="ghost" className="rounded-xl text-primary hover:bg-primary/10">
                  <Mic className="h-5 w-5" />
                </Button>
              )}
              <Input 
                placeholder={isVoice ? "Habla o escribe para validar..." : "Escribe un mensaje de prueba..."} 
                className="flex-1 border-none bg-transparent focus-visible:ring-0 text-[11px] h-9 px-3"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendTest()}
              />
              <Button 
                size="icon" 
                className={cn("rounded-xl h-9 w-9 flex-shrink-0 shadow-lg", isVoice ? "bg-primary" : "bg-secondary")}
                onClick={handleSendTest}
                disabled={!testInput.trim() || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="correct" className="flex-1 flex flex-col m-0 p-0 overflow-hidden bg-slate-50/50">
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="space-y-6">
              {!suggestion && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                  <div className="p-6 bg-white border border-dashed rounded-[2rem] text-center space-y-4 shadow-sm">
                    <div className="h-12 w-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto text-secondary">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-widest">Optimizador Virtual</h4>
                      <p className="text-[10px] text-muted-foreground leading-relaxed uppercase font-bold">
                        ¿El agente no respondió como esperabas? <br />
                        Explícame qué falló y yo actualizaré su arquitectura.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase text-muted-foreground ml-2">Tu Feedback Técnico</label>
                    <textarea 
                      placeholder="Ej: El agente es demasiado serio, quiero que sea más cercano y que siempre mencione la oferta de bienvenida..."
                      className="w-full min-h-[120px] p-4 rounded-3xl border bg-white text-[11px] focus:ring-1 focus:ring-secondary focus:outline-none shadow-inner leading-relaxed"
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                    />
                    <Button 
                      onClick={handleRefine}
                      disabled={isRefining || !feedbackInput.trim()}
                      className="w-full h-11 pill-rounded bg-secondary hover:bg-secondary/90 text-white text-[10px] font-black uppercase tracking-[0.2em] gap-2 shadow-lg shadow-secondary/20"
                    >
                      {isRefining ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analizando Arquitectura...
                        </>
                      ) : (
                        <>
                          <RefreshCcw className="h-4 w-4" />
                          Generar Optimización AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {suggestion && (
                <div className="space-y-4 animate-in zoom-in-95 duration-500">
                  <div className="bg-white border rounded-[2rem] overflow-hidden shadow-xl border-secondary/20">
                    <div className="bg-secondary p-4 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.1em]">Propuesta de Mejora</h4>
                      </div>
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="p-5 space-y-5">
                      <div className="p-3 bg-secondary/5 rounded-xl border border-secondary/10">
                        <p className="text-[10px] font-bold text-secondary flex items-center gap-1.5 uppercase mb-1">
                          <AlertCircle className="h-3 w-3" /> Explicación del Cambio
                        </p>
                        <p className="text-[10px] leading-relaxed italic">{suggestion.explanation}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-muted-foreground uppercase">Nuevo Tono</p>
                          <p className="text-[10px] font-bold border-b pb-1">{suggestion.tone}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-muted-foreground uppercase">Nuevo Rol</p>
                          <p className="text-[10px] font-bold border-b pb-1">{suggestion.role}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[8px] font-black text-muted-foreground uppercase">Refinamiento de Instrucciones</p>
                        <div className="max-h-32 overflow-y-auto text-[10px] p-3 bg-muted/30 rounded-xl border border-dashed font-mono leading-relaxed">
                          {suggestion.knowledge}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="ghost" 
                          onClick={() => setSuggestion(null)}
                          className="flex-1 pill-rounded text-[9px] font-black uppercase hover:bg-slate-100"
                        >
                          Descartar
                        </Button>
                        <Button 
                          onClick={handleApplyChanges}
                          className="flex-1 pill-rounded bg-secondary hover:bg-secondary/90 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-secondary/20"
                        >
                          Aplicar Cambios
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
