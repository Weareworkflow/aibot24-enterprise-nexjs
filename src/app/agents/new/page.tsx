
"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Save, Mic2, Wand2, MessageSquareText, Send, UserRound, Building2, Target, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AgentType, ChatMessage } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";

const CONFIG_STEPS = [
  { key: 'name', question: "¡Perfecto! Vamos a diseñar tu agente. Primero, ¿qué nombre llevará?", label: "Nombre del Agente" },
  { key: 'role', question: "Entendido. ¿Cuál será su rol o cargo específico?", label: "Rol / Cargo" },
  { key: 'company', question: "¿Para qué empresa o marca trabajará?", label: "Empresa" },
  { key: 'objective', question: "¿Cuál es el objetivo principal de este agente?", label: "Objetivo" },
  { key: 'tone', question: "¿Qué tono de voz debe utilizar? (Ej: Profesional, Amable, Directo...)", label: "Tono de Voz" },
  { key: 'knowledge', question: "Finalmente, dime todo lo que debe saber (instrucciones, manuales, FAQs...). Tómate tu tiempo, este campo es el más importante.", label: "Base de Conocimiento" },
];

export default function NewAgentPage() {
  const [step, setStep] = useState(1); // 1: Type selection, 2: Conversational Chat, 3: Summary
  const [agentType, setAgentType] = useState<AgentType | null>(null);
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);
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
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

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
        setStep(3);
        toast({
          title: "Configuración Completada",
          description: "Hemos recolectado toda la información para tu nuevo agente.",
        });
      }, 1000);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Agente Creado",
        description: `${config.name} ya está listo para ser desplegado.`,
      });
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen pb-12 bg-[#F0F3F5]">
      <Navbar />
      <main className="container mx-auto px-4 pt-8 max-w-4xl">
        <div className="mb-8 space-y-1">
          <h1 className="text-2xl font-headline font-bold text-foreground flex items-center gap-3">
            <Mic2 className="h-6 w-6 text-secondary" />
            Arquitecto de Agentes IA
          </h1>
          <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">
            {step === 1 ? "Selección de Canal" : step === 2 ? `Configurando: ${CONFIG_STEPS[currentConfigIndex].label}` : "Resumen Final"}
          </p>
        </div>

        <div className="grid gap-6">
          {/* STEP 1: SELECT TYPE */}
          {step === 1 && (
            <Card className="border-none shadow-sm animate-in fade-in duration-500 card-rounded">
              <CardHeader>
                <CardTitle className="text-lg">¿Qué tipo de agente necesitas?</CardTitle>
                <CardDescription>Elige el canal principal de interacción para tu IA.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => { setAgentType('voice'); setStep(2); }}
                  className={cn(
                    "flex flex-col items-center gap-4 p-8 rounded-[2rem] border-2 transition-all group",
                    "hover:border-secondary hover:bg-secondary/5 border-border"
                  )}
                >
                  <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors">
                    <Mic2 className="h-8 w-8 text-secondary group-hover:text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold">Agente de Voz</h3>
                    <p className="text-xs text-muted-foreground mt-1">Llamadas telefónicas y asistentes de voz en tiempo real.</p>
                  </div>
                </button>
                <button 
                  onClick={() => { setAgentType('text'); setStep(2); }}
                  className={cn(
                    "flex flex-col items-center gap-4 p-8 rounded-[2rem] border-2 transition-all group",
                    "hover:border-accent hover:bg-accent/5 border-border"
                  )}
                >
                  <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                    <MessageSquareText className="h-8 w-8 text-accent group-hover:text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold">Agente de Texto</h3>
                    <p className="text-xs text-muted-foreground mt-1">Chats web, WhatsApp y mensajería omnicanal.</p>
                  </div>
                </button>
              </CardContent>
            </Card>
          )}

          {/* STEP 2: CONVERSATIONAL CHAT */}
          {step === 2 && (
            <Card className="border-none shadow-sm animate-in slide-in-from-right-4 duration-500 overflow-hidden card-rounded">
              <CardHeader className="bg-white border-b py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-white">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">Arquitecto Virtual</CardTitle>
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-green-600">
                      <span className="h-1.5 w-1.5 bg-green-600 rounded-full animate-pulse" />
                      Configurando Identidad
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-6" ref={scrollRef}>
                  <div className="space-y-6">
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
                            "px-4 py-3 rounded-2xl text-xs shadow-sm leading-relaxed",
                            msg.role === 'user' 
                              ? "bg-secondary text-white rounded-tr-none" 
                              : "bg-muted text-foreground rounded-tl-none border"
                          )}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase px-1">
                          {msg.role === 'user' ? 'Tú' : 'Arquitecto'}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="p-4 bg-white border-t">
                <div className="flex items-center gap-2 w-full">
                  {CONFIG_STEPS[currentConfigIndex].key === 'knowledge' ? (
                    <Textarea 
                      placeholder="Escribe o pega aquí la base de conocimiento..."
                      className="flex-1 rounded-xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-secondary min-h-[80px] text-xs"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey && handleSendMessage()}
                    />
                  ) : (
                    <Input 
                      placeholder={`Responde aquí...`} 
                      className="flex-1 rounded-full bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-secondary h-11 text-xs px-6"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                  )}
                  <Button 
                    size="icon" 
                    className="rounded-full h-11 w-11 bg-secondary hover:bg-secondary/90 flex-shrink-0"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}

          {/* STEP 3: FINALIZE / SUMMARY */}
          {step === 3 && (
            <Card className="border-none shadow-sm animate-in slide-in-from-right-4 duration-500 card-rounded overflow-hidden">
              <CardHeader className="bg-secondary text-white flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Configuración Finalizada</CardTitle>
                  <CardDescription className="text-white/80">Revisa la arquitectura antes del despliegue.</CardDescription>
                </div>
                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase flex items-center gap-1 text-muted-foreground"><UserRound className="h-3 w-3" /> Nombre</Label>
                    <p className="text-sm font-bold border-b pb-1">{config.name}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase flex items-center gap-1 text-muted-foreground"><Sparkles className="h-3 w-3" /> Rol</Label>
                    <p className="text-sm font-bold border-b pb-1">{config.role}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase flex items-center gap-1 text-muted-foreground"><Building2 className="h-3 w-3" /> Empresa</Label>
                    <p className="text-sm font-bold border-b pb-1">{config.company}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase flex items-center gap-1 text-muted-foreground"><Target className="h-3 w-3" /> Objetivo</Label>
                    <p className="text-sm font-bold border-b pb-1">{config.objective}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Tono de Voz</Label>
                  <div className="p-3 bg-muted/40 rounded-xl border text-xs">{config.tone}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Base de Conocimiento</Label>
                  <div className="p-4 bg-muted/20 rounded-2xl border-dashed border-2 text-[11px] leading-relaxed font-mono max-h-[200px] overflow-auto">
                    {config.knowledge}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t p-6 bg-muted/5 flex justify-between">
                <Button variant="ghost" size="sm" onClick={() => { setStep(2); setCurrentConfigIndex(0); setMessages([]); }} className="text-[10px] font-black uppercase">Reiniciar Chat</Button>
                <Button onClick={handleSave} disabled={isSaving} className="bg-secondary hover:bg-secondary/90 font-bold px-8 h-10 pill-rounded">
                  {isSaving ? "Desplegando..." : "DESPLEGAR AGENTE AHORA"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
