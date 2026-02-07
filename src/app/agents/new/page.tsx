
"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Sparkles, Loader2, Send, Bot, Rocket, Check, Palette } from "lucide-react";
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
  { key: 'name', question: "¡Hola! Soy tu Arquitecto Virtual. Vamos a diseñar tu agente de chat de élite. Primero, ¿qué nombre llevará esta unidad?", label: "Nombre" },
  { key: 'role', question: "Entendido. ¿Cuál será su función o cargo específico dentro de la organización?", label: "Rol" },
  { key: 'company', question: "¿Para qué empresa o marca estará operando?", label: "Empresa" },
  { key: 'color', question: "Perfecto. Por último, selecciona el color de identidad para este agente:", label: "Color" },
];

export default function NewAgentPage() {
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [config, setConfig] = useState({
    name: "",
    role: "",
    company: "",
    color: ASSISTANT_COLORS[0],
    objective: "Atención al cliente y soporte inteligente.",
    tone: "Profesional, amable y resolutivo.",
    knowledge: "Eres un asistente de IA de élite. Responde siempre con precisión y cortesía."
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
      }, 600);
    } else {
      setTimeout(() => {
        setIsFinished(true);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "¡Excelente! He configurado el núcleo de tu agente. Revisa la ficha técnica y confirma el despliegue para activarlo en tu portal.",
          timestamp: new Date().toISOString()
        }]);
      }, 800);
    }
  };

  const handleSave = async () => {
    if (!db || !tenantId) {
      toast({
        variant: "destructive",
        title: "Error de Sesión",
        description: "No se ha detectado un member_id válido de Bitrix24.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const agentsRef = collection(db, "agents");
      const q = query(agentsRef, where("tenantId", "==", tenantId));
      const querySnapshot = await getDocs(q);
      
      const isDuplicate = querySnapshot.docs.some(doc => 
        doc.data().name.toLowerCase() === config.name.toLowerCase()
      );
      
      if (isDuplicate) {
        setIsSaving(false);
        toast({
          variant: "destructive",
          title: "Nombre Duplicado",
          description: `Ya existe un agente llamado "${config.name}" en tu portal. Por favor, elige otro nombre.`,
        });
        return;
      }

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

      const agentRef = doc(db, "agents", agentId);
      await setDoc(agentRef, newAgent);
      
      setIsSaving(false);
      toast({
        title: "Agente Desplegado",
        description: `${config.name} ha sido activado correctamente.`,
      });
      router.push("/");

    } catch (error: any) {
      setIsSaving(false);
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: "agents",
        operation: 'create'
      }));
    }
  };

  const isColorStep = CONFIG_STEPS[currentConfigIndex].key === 'color';

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F3F5]">
      <Navbar />
      <main className="container mx-auto px-4 pt-8 max-w-4xl pb-20">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-headline font-bold text-foreground flex items-center gap-3">
            <Bot className="h-6 w-6 text-secondary" />
            Arquitecto de Agentes Chat
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
            {isFinished ? "Revisión de Arquitectura" : `Fase: ${CONFIG_STEPS[currentConfigIndex].label}`}
          </p>
        </div>

        <Card className="border-none shadow-xl animate-in slide-in-from-bottom-4 duration-500 overflow-hidden card-rounded bg-white">
          <CardHeader className="bg-white border-b py-4 px-6 flex flex-row items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-white shadow-inner">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-[10px] font-black uppercase tracking-widest">Protocolo Arquitecto</CardTitle>
              <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-secondary">
                <span className="h-1.5 w-1.5 bg-secondary rounded-full animate-pulse" />
                Sesión Activa
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-[450px] p-6" ref={scrollRef}>
              <div className="space-y-6 pb-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[85%] space-y-1 animate-in fade-in slide-in-from-bottom-2",
                      msg.role === 'user' ? "ml-auto items-end" : "items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "px-5 py-3 rounded-2xl text-[13px] shadow-sm leading-relaxed",
                        msg.role === 'user' 
                          ? "bg-secondary text-white rounded-tr-none" 
                          : "bg-muted/50 text-foreground rounded-tl-none border"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {!isFinished && isColorStep && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 bg-slate-50 p-6 rounded-[2rem] border border-dashed border-slate-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Palette className="h-4 w-4 text-secondary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Selector de ADN Visual</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {ASSISTANT_COLORS.map(c => (
                        <button 
                          key={c} 
                          onClick={() => handleSendMessage(c)} 
                          className={cn(
                            "h-10 w-10 rounded-[1rem] border-2 shadow-sm transition-all hover:scale-110 flex items-center justify-center relative", 
                            config.color === c ? "border-secondary scale-110 ring-4 ring-secondary/10" : "border-white"
                          )} 
                          style={{ backgroundColor: c }}
                        >
                          {config.color === c && <Check className="h-5 w-5 text-white drop-shadow-lg" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isFinished && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Card className="bg-[#F8FAFC] border-2 border-dashed border-secondary/30 rounded-[2.5rem] overflow-hidden">
                      <div className="bg-secondary p-4 flex items-center justify-between text-white">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Ficha de Despliegue</h4>
                        <div 
                          className="h-6 w-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: config.color }}
                        />
                      </div>
                      <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Nombre Operativo</p>
                            <p className="text-sm font-bold text-slate-800">{config.name}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Rol / Cargo</p>
                            <p className="text-sm font-bold text-slate-800">{config.role}</p>
                          </div>
                          <div className="space-y-1 col-span-2">
                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Empresa Representada</p>
                            <p className="text-sm font-bold text-slate-800">{config.company}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="bg-white p-6 border-t">
                        <Button 
                          onClick={handleSave} 
                          disabled={isSaving}
                          className="w-full h-14 rounded-full bg-secondary hover:bg-secondary/90 text-white font-black text-[11px] uppercase tracking-[0.15em] gap-3 shadow-xl shadow-secondary/20 transition-all active:scale-95"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Sincronizando...
                            </>
                          ) : (
                            <>
                              <Rocket className="h-5 w-5" />
                              Confirmar y Desplegar Bot
                            </>
                          )}
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
              <div className="flex items-center gap-3 w-full bg-muted/30 p-2 rounded-2xl border border-slate-100 shadow-inner">
                <Input 
                  placeholder="Escribe tu respuesta..." 
                  className="flex-1 bg-transparent border-none focus-visible:ring-0 h-10 text-[13px] px-4"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  autoFocus
                />
                <Button 
                  size="icon" 
                  className="rounded-xl h-10 w-10 bg-secondary hover:bg-secondary/90 flex-shrink-0 shadow-md transition-transform active:scale-90"
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
