
"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Send, Bot, Rocket, Check, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChatMessage, AIAgent } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFirestore } from "@/firebase";
import { collection, doc, setDoc, query, where, getDocs } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useUIStore } from "@/lib/store";

const ASSISTANT_COLORS = [
  "#1B75BB", "#41E0F0", "#2FC6F6", "#22c55e", "#10b981", 
  "#3b82f6", "#ef4444", "#f97316", "#a855f7", "#06b6d4", 
  "#ec4899", "#84cc16", "#78350f", "#1e293b", "#475569", "#94a3b8"
];

const CONFIG_STEPS = [
  { key: 'name', question: "¿Qué nombre llevará el agente?", label: "Nombre" },
  { key: 'role', question: "¿Cuál será su rol o cargo?", label: "Rol" },
  { key: 'company', question: "¿Para qué empresa operará?", label: "Empresa" },
  { key: 'color', question: "Selecciona el color de identidad:", label: "Color" },
];

export default function NewAgentPage() {
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [config, setConfig] = useState({
    name: "",
    role: "",
    company: "",
    color: ASSISTANT_COLORS[0],
    objective: "Atención al cliente inteligente.",
    tone: "Profesional y resolutivo.",
    knowledge: "Eres un asistente de IA de élite. Responde con precisión."
  });
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const db = useFirestore();
  const { tenantId } = useUIStore();

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: "start",
        role: "assistant",
        content: CONFIG_STEPS[0].question,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isFinished]);

  const handleSendMessage = (valueOverride?: string) => {
    const value = valueOverride || inputValue;
    if (!value.trim() || isFinished) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: CONFIG_STEPS[currentConfigIndex].key === 'color' ? "Color seleccionado" : value,
      timestamp: new Date().toISOString()
    };

    const updatedConfig = { ...config, [CONFIG_STEPS[currentConfigIndex].key]: value };
    setConfig(updatedConfig);
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");

    if (currentConfigIndex < CONFIG_STEPS.length - 1) {
      setTimeout(() => {
        const nextIndex = currentConfigIndex + 1;
        setCurrentConfigIndex(nextIndex);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: CONFIG_STEPS[nextIndex].question,
          timestamp: new Date().toISOString()
        }]);
      }, 400);
    } else {
      setTimeout(() => {
        setIsFinished(true);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Arquitectura lista. Confirma el despliegue para activar la unidad.",
          timestamp: new Date().toISOString()
        }]);
      }, 500);
    }
  };

  const handleSave = async () => {
    if (!db || !tenantId) {
      toast({ variant: "destructive", title: "Error", description: "Sin portal detectado." });
      return;
    }

    setIsSaving(true);
    try {
      const agentId = Date.now().toString();
      const newAgent: AIAgent = {
        id: agentId,
        tenantId: tenantId,
        name: config.name,
        type: 'text',
        role: config.role,
        company: config.company,
        objective: config.objective,
        tone: config.tone,
        knowledge: config.knowledge,
        color: config.color,
        isActive: true,
        createdAt: new Date().toISOString(),
        integrations: {
          "Open Lines (Chat Bitrix24)": false,
          "WhatsApp Business": false,
          "CRM Bitrix24": false,
          "Calendario Bitrix24": false,
          "Catálogo Bitrix24": false,
          "Documentos Bitrix24": false,
          "Drive Bitrix24": false,
          "API REST": false
        },
        metrics: {
          usageCount: 0,
          performanceRating: 100,
          totalInteractionMetric: 0,
          tokens: "0",
          transfers: 0,
          abandoned: 0
        }
      };

      await setDoc(doc(db, "agents", agentId), newAgent);
      toast({ title: "Agente Desplegado", description: `${config.name} activado.` });
      router.push("/");
    } catch (error: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: "agents", operation: 'create' }));
    } finally {
      setIsSaving(false);
    }
  };

  const isColorStep = CONFIG_STEPS[currentConfigIndex].key === 'color';

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F3F5]">
      <Navbar />
      <main className="container mx-auto px-4 pt-8 max-w-2xl pb-20">
        <div className="mb-6">
          <h1 className="text-xl font-headline font-bold text-foreground flex items-center gap-2">
            <Bot className="h-5 w-5 text-secondary" />
            Nuevo Agente de Chat
          </h1>
        </div>

        <Card className="border-none shadow-2xl overflow-hidden rounded-[2.5rem] bg-white">
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] p-6" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-1", msg.role === 'user' ? "ml-auto items-end" : "items-start")}>
                    <div className={cn("px-4 py-2.5 rounded-2xl text-[13px] shadow-sm", msg.role === 'user' ? "bg-secondary text-white rounded-tr-none" : "bg-muted/50 text-foreground rounded-tl-none border")}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {!isFinished && isColorStep && (
                  <div className="grid grid-cols-8 gap-2 p-4 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 animate-in fade-in zoom-in-95 duration-300">
                    {ASSISTANT_COLORS.map(c => (
                      <button 
                        key={c} 
                        onClick={() => handleSendMessage(c)} 
                        className={cn("h-8 w-8 rounded-lg border-2 shadow-sm transition-all hover:scale-110 flex items-center justify-center", config.color === c ? "border-secondary ring-2 ring-secondary/20" : "border-white")} 
                        style={{ backgroundColor: c }}
                      >
                        {config.color === c && <Check className="h-4 w-4 text-white" />}
                      </button>
                    ))}
                  </div>
                )}

                {isFinished && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4">
                    <Card className="bg-[#F8FAFC] border-2 border-secondary/20 rounded-[2rem] overflow-hidden">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{config.role}</p>
                            <h3 className="font-bold text-lg">{config.name}</h3>
                          </div>
                          <div className="h-10 w-10 rounded-xl shadow-lg" style={{ backgroundColor: config.color }} />
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{config.company}</p>
                      </CardContent>
                      <CardFooter className="bg-white p-4 border-t">
                        <Button onClick={handleSave} disabled={isSaving} className="w-full h-12 rounded-full bg-secondary hover:bg-secondary/90 text-white font-black text-[10px] uppercase tracking-widest gap-2">
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                          Confirmar y Desplegar
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          {!isFinished && !isColorStep && (
            <CardFooter className="p-4 bg-white border-t">
              <div className="flex items-center gap-2 w-full bg-muted/30 p-1.5 rounded-2xl border border-slate-100">
                <Input 
                  placeholder="Escribe aquí..." 
                  className="flex-1 bg-transparent border-none focus-visible:ring-0 h-9 text-[13px] px-3"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  autoFocus
                />
                <Button 
                  size="icon" 
                  className="rounded-xl h-9 w-9 bg-secondary hover:bg-secondary/90"
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </main>
    </div>
  );
}
