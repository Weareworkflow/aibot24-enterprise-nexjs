"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Send, Bot, Rocket, Check, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChatMessage, AIAgent, AgentMetrics } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShieldAlert, Settings } from "lucide-react";
import { useFirestore } from "@/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useUIStore } from "@/lib/store";
import { generateAgentConfig } from "@/ai/flows/generate-agent-config";
import { registerOpenLinesBot } from "@/app/actions/bitrix-actions";

const ASSISTANT_COLORS = [
  "#1B75BB", "#41E0F0", "#2FC6F6", "#22c55e", "#10b981",
  "#3b82f6", "#ef4444", "#f97316", "#a855f7", "#06b6d4",
  "#ec4899", "#84cc16", "#78350f", "#1e293b", "#475569", "#94a3b8"
];

const CONFIG_STEPS = [
  { key: 'name', question: "¿Nombre del agente?" },
  { key: 'role', question: "¿Cuál será su rol?" },
  { key: 'company', question: "¿Empresa que representa?" },
  { key: 'color', question: "Selecciona su color:" },
];

export default function NewAgentPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [config, setConfig] = useState({
    name: "",
    role: "",
    company: "",
    color: ASSISTANT_COLORS[0]
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { tenantId, installation, loadInstallation } = useUIStore();
  const db = useFirestore();

  useEffect(() => {
    if (tenantId) loadInstallation(tenantId);

    // Initial message
    if (messages.length === 0) {
      setMessages([{
        id: 'start',
        role: 'assistant',
        content: CONFIG_STEPS[0].question,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [tenantId]);

  const handleNextStep = (value?: string) => {
    const response = value || inputValue.trim();
    if (!response) return;

    const currentKey = CONFIG_STEPS[currentStep].key;
    const nextStep = currentStep + 1;

    // Save answer
    setConfig(prev => ({ ...prev, [currentKey]: response }));

    // Add message to chat
    const newMessages: ChatMessage[] = [
      ...messages,
      { id: Date.now().toString(), role: 'user', content: response, timestamp: new Date().toISOString() }
    ];

    if (nextStep < CONFIG_STEPS.length) {
      newMessages.push({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: CONFIG_STEPS[nextStep].question,
        timestamp: new Date().toISOString()
      });
      setCurrentStep(nextStep);
      setInputValue("");
    } else {
      newMessages.push({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "¡Perfecto! Todo está listo para crear tu agente. ¿Deseas desplegarlo ahora?",
        timestamp: new Date().toISOString()
      });
      setIsFinished(true);
    }

    setMessages(newMessages);

    // Scroll to bottom
    setTimeout(() => {
      if (scrollRef.current) {
        const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }, 100);
  };

  const handleSave = async () => {
    if (!db) {
      toast({ variant: "destructive", title: "Error", description: "Base de datos no disponible." });
      return;
    }

    // --- CHECK CREDENTIALS ---
    const isConfigured = installation?.clientId && installation?.clientSecret;
    if (!isConfigured && tenantId !== "anonymous") {
      toast({
        variant: "destructive",
        title: "Protocolo Incompleto",
        description: "Debes configurar el Client ID y Secret ID en la sección de Configuración antes de crear agentes para Bitrix24.",
      });
      return;
    }

    const effectiveTenantId = tenantId || "anonymous";
    setIsSaving(true);

    try {
      const aiResponse = await generateAgentConfig({
        prompt: `Genera un objetivo estratégico breve y un tono de comunicación para un agente con el rol: ${config.role} de la empresa ${config.company}.`,
        tenantId: effectiveTenantId
      });

      const agentId = Date.now().toString();

      const newAgent: AIAgent = {
        id: agentId,
        tenantId: effectiveTenantId,
        name: config.name,
        type: 'text',
        role: config.role,
        company: config.company,
        systemPrompt: "", // Empty — to be refined by user via Architect
        color: config.color,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      const initialMetrics: AgentMetrics = {
        usageCount: 0,
        performanceRating: 100,
        totalInteractionMetric: 0,
        tokens: "0",
        meetings: 0,
        transfers: 0,
        abandoned: 0
      };

      // 1. Save Agent + Metrics to Firestore
      await Promise.all([
        setDoc(doc(db, "agents", agentId), newAgent),
        setDoc(doc(db, "metrics", agentId), initialMetrics)
      ]);

      // 2. Auto-register bot in Bitrix24 (name, role/WORK_POSITION, color, webhook URL)
      // Company is saved only in Firestore (Bitrix imbot.register doesn't support WORK_COMPANY)
      if (effectiveTenantId !== "anonymous") {
        try {
          const bitrixResult = await registerOpenLinesBot(effectiveTenantId, {
            name: config.name,
            role: config.role,
            color: config.color,
            agentId: agentId
          });

          if (bitrixResult.success && bitrixResult.botId) {
            // Store bitrixBotId on the agent
            await updateDoc(doc(db, "agents", agentId), {
              bitrixBotId: bitrixResult.botId,
            });
            console.log(`✅ Bot registrado en Bitrix24: ID ${bitrixResult.botId}`);
          } else {
            console.warn("⚠️ Bot registration failed:", bitrixResult.error);
            toast({
              title: "Agente creado",
              description: `El agente se guardó pero el bot de Bitrix no se registró: ${bitrixResult.error}. Puedes reintentarlo desde Integraciones.`,
            });
          }
        } catch (bitrixError: any) {
          console.error("⚠️ Bitrix registration error:", bitrixError);
          // Don't block — agent is already saved
        }
      }

      toast({
        title: "Agente Desplegado",
        description: `Arquitectura de ${config.name} finalizada con éxito.`
      });

      router.push("/");
    } catch (error: any) {
      console.error("Error al guardar:", error);
      toast({ variant: "destructive", title: "Error al desplegar", description: "Hubo un problema de red al generar el protocolo. Reintente." });
    } finally {
      setIsSaving(false);
    }
  };

  const isColorStep = CONFIG_STEPS[currentStep].key === 'color';
  const isConfigured = (installation?.clientId && installation?.clientSecret) || tenantId === "anonymous";

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden transition-colors duration-300">
      <Navbar />

      {/* BLOCKING MODAL */}
      <Dialog open={!isConfigured && !!tenantId}>
        <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl">
          <DialogHeader className="flex flex-col items-center gap-4 py-4">
            <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-red-500" />
            </div>
            <DialogTitle className="text-xl font-headline font-bold text-center">Protocolo Incompleto</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Tu portal Bitrix24 no está enlazado correctamente. Debes configurar el <b>Client ID</b> y <b>Secret ID</b> antes de desplegar nuevos agentes inteligentes.
            </DialogDescription>
          </DialogHeader>
          <div className="p-1 bg-secondary/5 rounded-2xl border border-secondary/20">
            <div className="p-4 space-y-2">
              <p className="text-[11px] font-bold text-secondary uppercase tracking-widest">¿Por qué es necesario?</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Estas credenciales permiten a la consola registrar el bot dentro de tu infraestructura de Bitrix24, activando los webhooks y permisos necesarios.
              </p>
            </div>
          </div>
          <DialogFooter className="flex sm:justify-center gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-11"
            >
              Regresar
            </Button>
            <Button
              onClick={() => router.push("/settings")}
              className="bg-secondary hover:bg-secondary/90 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest gap-2 h-11"
            >
              <Settings className="h-4 w-4" />
              Configurar Ahora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-xl flex flex-col h-[calc(100vh-120px)]">
          <div className="mb-4 flex items-center justify-between px-2">
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Bot className="h-4 w-4 text-secondary" />
              Diseño de Agente Chat
            </h1>
            <div className="flex gap-1">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={cn("h-1 w-4 rounded-full transition-all", i <= currentStep ? "bg-secondary" : "bg-muted")} />
              ))}
            </div>
          </div>

          <Card className="flex-1 border-none shadow-2xl flex flex-col overflow-hidden rounded-[2.5rem] bg-card high-volume transition-colors duration-300">
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[80%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                      msg.role === 'user' ? "ml-auto items-end" : "items-start"
                    )}
                  >
                    <div className={cn(
                      "px-4 py-2.5 rounded-2xl text-[13px] font-medium shadow-sm border",
                      msg.role === 'user'
                        ? "bg-secondary text-white border-transparent rounded-tr-none"
                        : "bg-muted/50 text-foreground border-border/40 rounded-tl-none"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {!isFinished && isColorStep && (
                  <div className="grid grid-cols-8 gap-2 p-3 bg-muted/30 rounded-3xl border border-dashed border-border/60 animate-in zoom-in-95 duration-500">
                    {ASSISTANT_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => handleNextStep(c)}
                        className={cn(
                          "h-8 w-8 rounded-lg border-2 shadow-sm transition-all hover:scale-110 flex items-center justify-center relative",
                          config.color === c ? "border-secondary ring-2 ring-secondary/20" : "border-background"
                        )}
                        style={{ backgroundColor: c }}
                      >
                        {config.color === c && <Check className="h-4 w-4 text-white drop-shadow-sm" />}
                      </button>
                    ))}
                  </div>
                )}

                {isFinished && (
                  <div className="pt-4 animate-in slide-in-from-bottom-4 duration-700">
                    <Card className="bg-primary/5 dark:bg-muted/20 rounded-[2rem] p-6 shadow-xl border border-border/40">
                      <div className="flex items-center justify-between mb-4">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-secondary flex items-center gap-1">
                            <Sparkles className="h-2 w-2" />
                            Auto-configuración Activa
                          </p>
                          <h3 className="font-bold text-lg text-foreground">{config.name}</h3>
                        </div>
                        <div className="h-10 w-10 rounded-xl shadow-lg border-2 border-white/10" style={{ backgroundColor: config.color }} />
                      </div>
                      <div className="space-y-2 mb-6">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{config.company} • {config.role}</p>
                        <p className="text-[9px] text-muted-foreground italic">Objetivo y Tono se generarán al desplegar.</p>
                      </div>

                      {!(installation?.clientId && installation?.clientSecret) && tenantId !== "anonymous" ? (
                        <Card className="p-5 bg-red-500/10 border-red-500/20 rounded-2xl mb-4 text-center space-y-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Acción Bloqueada</p>
                          <p className="text-[11px] text-muted-foreground leading-snug">
                            Debes configurar las credenciales de Bitrix24 para registrar bots.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push("/settings")}
                            className="w-full rounded-xl text-[9px] font-black uppercase tracking-widest border-red-500/50 hover:bg-red-500 hover:text-white"
                          >
                            Ir a Configuración
                          </Button>
                        </Card>
                      ) : (
                        <Button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="w-full h-12 rounded-full bg-secondary hover:bg-secondary/90 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-xl shadow-secondary/20"
                        >
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                          {isSaving ? "Generando Protocolo..." : "Desplegar Agente"}
                        </Button>
                      )}
                    </Card>
                  </div>
                )}
              </div>
            </ScrollArea>

            {!isFinished && !isColorStep && (
              <CardFooter className="p-4 bg-card border-t border-border/60">
                <div className="flex items-center gap-2 w-full bg-muted/30 p-1.5 rounded-2xl border border-border/40 shadow-inner group">
                  <Input
                    placeholder="Responde aquí..."
                    className="flex-1 bg-transparent border-none focus-visible:ring-0 h-10 text-[13px] px-3 font-medium text-foreground placeholder:text-muted-foreground"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}
                    autoFocus
                  />
                  <Button
                    size="icon"
                    className="rounded-xl h-10 w-10 bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/10"
                    onClick={() => handleNextStep()}
                    disabled={!inputValue.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
