import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Send, Bot, Rocket, Check, Sparkles, ShieldAlert, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "@remix-run/react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useUIStore } from "@/lib/store";

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

const ASSISTANT_COLORS = [
    "#1B75BB", "#41E0F0", "#2FC6F6", "#22c55e", "#10b981",
    "#3b82f6", "#ef4444", "#f97316", "#a855f7", "#06b6d4",
    "#ec4899", "#84cc16", "#78350f", "#1e293b", "#475569", "#94a3b8"
];

const CONFIG_STEPS = [
    { key: 'name', question: "¿Precio operativo o nombre del agente?" },
    { key: 'role', question: "¿Cuál será su rol en el portal?" },
    { key: 'company', question: "¿A qué organización representa?" },
    { key: 'color', question: "Seleccionemos el ADN Visual (Color):" },
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
    const navigate = useNavigate();
    const { tenantId, installation, loadInstallation } = useUIStore();

    useEffect(() => {
        if (tenantId) loadInstallation(tenantId);

        if (messages.length === 0) {
            setMessages([{
                id: 'start',
                role: 'assistant',
                content: CONFIG_STEPS[0].question,
                timestamp: new Date().toISOString()
            }]);
        }
    }, [tenantId, loadInstallation]);

    const handleNextStep = (value?: string) => {
        const response = value || inputValue.trim();
        if (!response) return;

        const currentKey = CONFIG_STEPS[currentStep].key as keyof typeof config;
        const nextStep = currentStep + 1;

        setConfig(prev => ({ ...prev, [currentKey]: response }));

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
                content: "¡Protocolo completado! El agente está listo para ser desplegado en el portal.",
                timestamp: new Date().toISOString()
            });
            setIsFinished(true);
        }

        setMessages(newMessages);

        setTimeout(() => {
            if (scrollRef.current) {
                const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
                if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }, 100);
    };

    const handleSave = async () => {
        setIsSaving(true);

        if (!installation?.clientId || !installation?.clientSecret) {
            toast({
                variant: "destructive",
                title: "Protocolo Incompleto",
                description: "Configura las credenciales de Bitrix24 antes del despliegue.",
            });
            setIsSaving(false);
            return;
        }

        if (!tenantId) {
            toast({
                variant: "destructive",
                title: "Error de Contexto",
                description: "No se identificó el portal de Bitrix24."
            });
            setIsSaving(false);
            return;
        }

        try {
            const res = await fetch("/api/agents/deploy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain: tenantId, config })
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Fallo en el despliegue");

            toast({
                title: "Agente Desplegado",
                description: `Arquitectura de ${config.name} finalizada con éxito.`
            });

            navigate("/");
        } catch (error: any) {
            console.error("Error al desplegar:", error);
            toast({
                variant: "destructive",
                title: "Fallo Crítico",
                description: error.message || "Error al generar el protocolo."
            });
        } finally {
            setIsSaving(false);
        }
    };

    const isColorStep = CONFIG_STEPS[currentStep].key === 'color';
    const isConfigured = !!(installation?.clientId && installation?.clientSecret);

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden transition-colors duration-300">
            <Navbar />

            <Dialog open={!isConfigured && !!tenantId}>
                <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl">
                    <DialogHeader className="flex flex-col items-center gap-4 py-4">
                        <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center">
                            <ShieldAlert className="h-8 w-8 text-red-500" />
                        </div>
                        <DialogTitle className="text-xl font-headline font-bold text-center">Protocolo Incompleto</DialogTitle>
                        <DialogDescription className="text-center text-muted-foreground">
                            Configura el <b>Client ID</b> y <b>Secret ID</b> en Ajustes antes de crear agentes.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex sm:justify-center gap-3 mt-4">
                        <Button variant="outline" onClick={() => navigate("/")} className="rounded-xl font-bold uppercase text-[10px] h-11">Cerrar</Button>
                        <Button onClick={() => navigate("/settings")} className="bg-secondary hover:bg-secondary/90 text-white rounded-xl font-bold uppercase text-[10px] gap-2 h-11"><Settings className="h-4 w-4" /> Ajustes</Button>
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
                                                className={cn("h-8 w-8 rounded-lg border-2 shadow-sm transition-all hover:scale-110 flex items-center justify-center", config.color === c ? "border-secondary ring-2 ring-secondary/20" : "border-background")}
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
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-secondary flex items-center gap-1"><Sparkles className="h-2 w-2" /> Protocolo Listo</p>
                                                    <h3 className="font-bold text-lg text-foreground">{config.name}</h3>
                                                </div>
                                                <div className="h-10 w-10 rounded-xl shadow-lg border-2 border-white/10" style={{ backgroundColor: config.color }} />
                                            </div>
                                            <div className="space-y-2 mb-6 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                                {config.company} • {config.role}
                                            </div>

                                            <Button
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className="w-full h-12 rounded-full bg-secondary hover:bg-secondary/90 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-xl shadow-secondary/20"
                                            >
                                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                                                {isSaving ? "Generando Agente..." : "Desplegar Protocolo"}
                                            </Button>
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
