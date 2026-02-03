
"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Sparkles, Loader2, Mic2, MessageSquareText, Send, UserRound, Building2, Target, Bot, Rocket, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AgentType, ChatMessage } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";

const CONFIG_STEPS = [
  { key: 'name', question: "¡Hola! Soy tu Arquitecto Virtual. Vamos a diseñar tu agente de élite. Primero, ¿qué nombre llevará esta unidad?", label: "Nombre" },
  { key: 'role', question: "Entendido. ¿Cuál será su función o cargo específico dentro de la organización?", label: "Rol" },
  { key: 'company', question: "¿Para qué empresa o marca estará operando?", label: "Empresa" },
  { key: 'objective', question: "Crucial. ¿Cuál es el objetivo principal que debe cumplir en cada interacción?", label: "Objetivo" },
  { key: 'tone', question: "¿Qué tono de voz y personalidad prefieres? (Ej: Ejecutivo y directo, Amable y cercano...)", label: "Tono" },
  { key: 'knowledge', question: "Finalmente, entrégame su base de conocimiento. Instrucciones, manuales, FAQs o cualquier dato técnico esencial.", label: "Conocimiento" },
];

export default function NewAgentPage() {
  const [step, setStep] = useState(1); // 1: Type selection, 2: Conversational Chat
  const [agentType, setAgentType] = useState<AgentType | null>(null);
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

  useEffect(() => {
    if (step === 2 && messages.length === 0) {
      setMessages([{
        id: "start",
        role: "assistant",
        content: CONFIG_STEPS[0].question,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [step, messages.length]);

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
          content: "¡Excelente! He procesado toda la información. Aquí tienes la ficha técnica final de tu agente. Revisa los detalles y confirma el despliegue.",
          timestamp: new Date().toISOString()
        }]);
      }, 800);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Agente Desplegado",
        description: `${config.name} ha sido activado correctamente.`,
      });
      router.push("/");
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F3F5]">
      <Navbar />
      <main className="container mx-auto px-4 pt-8 max-w-4xl pb-20">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-headline font-bold text-foreground flex items-center gap-3">
            <Bot className="h-6 w-6 text-secondary" />
            Arquitecto de Agentes IA
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
            {step === 1 ? "Iniciando Protocolo" : isFinished ? "Revisión de Arquitectura" : `Fase: ${CONFIG_STEPS[currentConfigIndex].label}`}
          </p>
        </div>

        <div className="grid gap-6">
          {/* STEP 1: SELECT TYPE */}
          {step === 1 && (
            <Card className="border-none shadow-sm animate-in fade-in zoom-in-95 duration-500 card-rounded p-8">
              <div className="text-center mb-8 space-y-2">
                <h2 className="text-lg font-bold">Bienvenido, Operador</h2>
                <p className="text-xs text-muted-foreground">Selecciona el canal de comunicación principal para tu nueva IA.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  onClick={() => { setAgentType('voice'); setStep(2); }}
                  className="flex flex-col items-center gap-6 p-10 rounded-[3rem] border-2 border-dashed border-muted hover:border-secondary hover:bg-secondary/5 transition-all group"
                >
                  <div className="h-20 w-20 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all">
                    <Mic2 className="h-10 w-10 text-secondary group-hover:text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-black text-sm uppercase tracking-wider">Modo Voz</h3>
                    <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase">Llamadas y Telefonía</p>
                  </div>
                </button>
                <button 
                  onClick={() => { setAgentType('text'); setStep(2); }}
                  className="flex flex-col items-center gap-6 p-10 rounded-[3rem] border-2 border-dashed border-muted hover:border-accent hover:bg-accent/5 transition-all group"
                >
                  <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                    <MessageSquareText className="h-10 w-10 text-accent group-hover:text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-black text-sm uppercase tracking-wider">Modo Texto</h3>
                    <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase">Chat Web y WhatsApp</p>
                  </div>
                </button>
              </div>
            </Card>
          )}

          {/* STEP 2: FULL CONVERSATIONAL INTERFACE */}
          {step === 2 && (
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
                        Sesión de Diseño Activa
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

                      {/* FINAL SUMMARY CARD INSIDE THE CHAT */}
                      {isFinished && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                          <Card className="bg-[#F8FAFC] border-2 border-dashed border-secondary/30 rounded-[2rem] overflow-hidden">
                            <div className="bg-secondary p-4 flex items-center justify-between text-white">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Ficha Técnica de Despliegue</h4>
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
                                <p className="text-[8px] font-black text-muted-foreground uppercase">Base de Conocimiento</p>
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
                                    Inicializando Sistemas...
                                  </>
                                ) : (
                                  <>
                                    <Rocket className="h-4 w-4" />
                                    Confirmar y Desplegar Agente
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
                          placeholder="Carga aquí el manual, instrucciones o FAQs..."
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

              {isFinished && (
                <div className="flex justify-center animate-in fade-in slide-in-from-top-2 duration-1000">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setStep(2); setCurrentConfigIndex(0); setMessages([]); setIsFinished(false); }}
                    className="text-[9px] font-black uppercase text-muted-foreground hover:text-secondary tracking-widest"
                  >
                    Reiniciar Protocolo de Diseño
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
