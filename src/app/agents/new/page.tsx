
"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Sparkles, Loader2, Send, Bot, Rocket, MessageSquareText } from "lucide-react";
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

const CONFIG_STEPS = [
  { key: 'name', question: "¡Hola! Soy tu Arquitecto Virtual. Vamos a diseñar tu agente de chat de élite. Primero, ¿qué nombre llevará esta unidad?", label: "Nombre" },
  { key: 'role', question: "Entendido. ¿Cuál será su función o cargo específico dentro de la organización?", label: "Rol" },
  { key: 'company', question: "¿Para qué empresa o marca estará operando?", label: "Empresa" },
  { key: 'objective', question: "Crucial. ¿Cuál es el objetivo principal que debe cumplir en cada interacción?", label: "Objetivo" },
  { key: 'tone', question: "¿Qué tono de voz y personalidad prefieres? (Ej: Ejecutivo y directo, Amable y cercano...)", label: "Tono" },
  { key: 'knowledge', question: "Finalmente, entrégame las instrucciones detalladas para el agente. Reglas, manuales, FAQs o cualquier dato técnico esencial.", label: "Instrucciones" },
];

export default function NewAgentPage() {
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [config, setConfig] = useState({
    name: "",
    role: "",
    company: "",
    objective: "",
    tone: "",
    knowledge: ""
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

  const handleSendMessage = () => {
    if (!inputValue.trim() || isFinished) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    const updatedConfig = { ...config, [CONFIG_STEPS[currentConfigIndex].key]: inputValue };
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
          content: "¡Excelente! He procesado toda la información. Aquí tienes la ficha técnica final de tu agente de chat. Revisa los detalles y confirma el despliegue.",
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
          performanceRating: 5.0,
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
        description: `${config.name} ha sido activado correctamente en tu portal.`,
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

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F3F5]">
      <Navbar />
      <main className="container mx-auto px-4 pt-8 max-w-4xl pb-20">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-headline font-bold text-foreground flex items-center gap-3">
            <Bot className="h-6 w-6 text-secondary" />
            Arquitecto de Agentes Chat
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
              {isFinished ? "Revisión de Arquitectura" : `Fase: ${CONFIG_STEPS[currentConfigIndex].label}`}
            </p>
            {tenantId && (
              <p className="text-[9px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                Tenant: {tenantId.substring(0, 8)}...
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="space-y-6">
            <Card className="border-none shadow-lg animate-in slide-in-from-bottom-4 duration-500 overflow-hidden card-rounded bg-white">
              <CardHeader className="bg-white border-b py-4 px-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white shadow-inner">
                    <Bot className="h-7 w-7" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-black uppercase tracking-widest">Arquitecto Virtual</CardTitle>
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-secondary">
                      <span className="h-2 w-2 bg-secondary rounded-full animate-pulse" />
                      Protocolo de Chat Activo
                    </div>
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
                          "flex flex-col max-w-[90%] space-y-1 animate-in fade-in slide-in-from-bottom-2",
                          msg.role === 'user' ? "ml-auto items-end" : "items-start"
                        )}
                      >
                        <div
                          className={cn(
                            "px-5 py-3 rounded-2xl text-xs shadow-sm leading-relaxed",
                            msg.role === 'user' 
                              ? "bg-secondary text-white rounded-tr-none" 
                              : "bg-muted/50 text-foreground rounded-tl-none border"
                          )}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[8px] font-black text-muted-foreground uppercase px-2 tracking-widest">
                          {msg.role === 'user' ? 'Respuesta Operador' : 'Arquitecto'}
                        </span>
                      </div>
                    ))}

                    {isFinished && (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                        <Card className="bg-[#F8FAFC] border-2 border-dashed border-secondary/30 rounded-[2rem] overflow-hidden">
                          <div className="bg-secondary p-4 flex items-center justify-between text-white">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Ficha Técnica de Despliegue (Chat)</h4>
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <CardContent className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-[8px] font-black text-muted-foreground uppercase">Nombre</p>
                                <p className="text-xs font-bold">{config.name}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[8px] font-black text-muted-foreground uppercase">Rol</p>
                                <p className="text-xs font-bold">{config.role}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[8px] font-black text-muted-foreground uppercase">Empresa</p>
                                <p className="text-xs font-bold">{config.company}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[8px] font-black text-muted-foreground uppercase">Objetivo</p>
                                <p className="text-xs font-bold">{config.objective}</p>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[8px] font-black text-muted-foreground uppercase">Tono</p>
                              <p className="text-[11px] p-2 bg-white rounded-lg border italic">{config.tone}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[8px] font-black text-muted-foreground uppercase">Instrucciones de Comportamiento</p>
                              <div className="max-h-32 overflow-y-auto text-[10px] p-3 bg-white rounded-xl border border-dashed font-mono leading-relaxed">
                                {config.knowledge}
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="bg-white p-4 border-t flex justify-center">
                            <Button 
                              onClick={handleSave} 
                              disabled={isSaving}
                              className="w-full h-12 pill-rounded bg-secondary hover:bg-secondary/90 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-secondary/20"
                            >
                              {isSaving ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Verificando Protocolos...
                                </>
                              ) : (
                                <>
                                  <Rocket className="h-4 w-4" />
                                  Confirmar y Desplegar Bot de Chat
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

              {!isFinished && (
                <CardFooter className="p-4 bg-white border-t">
                  <div className="flex items-center gap-3 w-full bg-muted/30 p-2 rounded-2xl">
                    {CONFIG_STEPS[currentConfigIndex].key === 'knowledge' ? (
                      <Textarea 
                        placeholder="Define aquí el manual de comportamiento, reglas de negocio o FAQs..."
                        className="flex-1 bg-transparent border-none focus-visible:ring-0 min-h-[60px] text-xs resize-none"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey && handleSendMessage()}
                      />
                    ) : (
                      <Input 
                        placeholder="Escribe tu respuesta..." 
                        className="flex-1 bg-transparent border-none focus-visible:ring-0 h-10 text-xs px-4"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                    )}
                    <Button 
                      size="icon" 
                      className="rounded-xl h-10 w-10 bg-secondary hover:bg-secondary/90 flex-shrink-0 shadow-md"
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
