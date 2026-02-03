"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Save, Mic2, Wand2, MessageSquareText, ChevronRight } from "lucide-react";
import { generateAgentConfig, type GenerateAgentConfigOutput } from "@/ai/flows/generate-agent-config";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AgentType } from "@/lib/types";

export default function NewAgentPage() {
  const [step, setStep] = useState(1);
  const [agentType, setAgentType] = useState<AgentType | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<GenerateAgentConfigOutput | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt faltante",
        description: "Por favor describe qué tipo de agente quieres crear.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAgentConfig({ prompt });
      setConfig(result);
      setStep(3);
      toast({
        title: "Configuración Generada",
        description: "Los detalles han sido autocompletados con IA.",
      });
    } catch (error) {
      toast({
        title: "Error en generación",
        description: "Hubo un problema al generar la configuración. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!config || !agentType) return;
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Agente Creado",
        description: `${config.agentName} ya está listo para ser desplegado.`,
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
            <Mic2 className="h-6 w-6 text-primary" />
            Configurar Nuevo Agente
          </h1>
          <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Paso {step} de 3</p>
        </div>

        <div className="grid gap-6">
          {/* STEP 1: SELECT TYPE */}
          {step === 1 && (
            <Card className="border-none shadow-sm animate-in fade-in duration-500">
              <CardHeader>
                <CardTitle className="text-lg">¿Qué tipo de agente necesitas?</CardTitle>
                <CardDescription>Elige el canal principal de interacción para tu IA.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => { setAgentType('voice'); setStep(2); }}
                  className={cn(
                    "flex flex-col items-center gap-4 p-8 rounded-xl border-2 transition-all group",
                    "hover:border-primary hover:bg-primary/5 border-border"
                  )}
                >
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <Mic2 className="h-8 w-8 text-primary group-hover:text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold">Agente de Voz</h3>
                    <p className="text-xs text-muted-foreground mt-1">Llamadas telefónicas y asistentes de voz en tiempo real.</p>
                  </div>
                </button>
                <button 
                  onClick={() => { setAgentType('text'); setStep(2); }}
                  className={cn(
                    "flex flex-col items-center gap-4 p-8 rounded-xl border-2 transition-all group",
                    "hover:border-secondary hover:bg-secondary/5 border-border"
                  )}
                >
                  <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors">
                    <MessageSquareText className="h-8 w-8 text-secondary group-hover:text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold">Agente de Texto</h3>
                    <p className="text-xs text-muted-foreground mt-1">Chats web, WhatsApp y mensajería omnicanal.</p>
                  </div>
                </button>
              </CardContent>
            </Card>
          )}

          {/* STEP 2: PROMPT */}
          {step === 2 && (
            <Card className="border-none shadow-sm animate-in slide-in-from-right-4 duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary text-lg">
                  <Wand2 className="h-5 w-5" />
                  Define el Propósito
                </CardTitle>
                <CardDescription>
                  Describe brevemente qué hará tu agente de {agentType === 'voice' ? 'Voz' : 'Texto'}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea 
                  placeholder="Ej: Un asistente inmobiliario que agende citas y sea muy amable..."
                  className="min-h-[120px] rounded-lg border-muted bg-white"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                  className="w-full h-10 font-bold"
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : "AUTO-CONFIGURAR CON IA"}
                </Button>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-[10px] font-black uppercase">Volver</Button>
              </CardFooter>
            </Card>
          )}

          {/* STEP 3: FINALIZE */}
          {step === 3 && config && (
            <Card className="border-none shadow-sm animate-in slide-in-from-right-4 duration-500">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Ajustes Finales</CardTitle>
                  <CardDescription>Revisa y personaliza la identidad de tu agente.</CardDescription>
                </div>
                <Badge className={cn(agentType === 'voice' ? 'bg-primary' : 'bg-secondary')}>
                  MODO {agentType?.toUpperCase()}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase">Nombre</Label>
                    <Input 
                      value={config.agentName} 
                      onChange={(e) => setConfig({ ...config, agentName: e.target.value })}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase">Persona</Label>
                    <Input 
                      value={config.agentPersonality} 
                      onChange={(e) => setConfig({ ...config, agentPersonality: e.target.value })}
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase">Estilo de Respuesta</Label>
                  <Textarea 
                    value={config.agentResponseStyle} 
                    onChange={(e) => setConfig({ ...config, agentResponseStyle: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase">Conocimiento Base</Label>
                  <Textarea 
                    value={config.agentInitialContext} 
                    onChange={(e) => setConfig({ ...config, agentInitialContext: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 bg-muted/5 flex justify-between">
                <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="text-[10px] font-black uppercase">Cambiar Concepto</Button>
                <Button onClick={handleSave} disabled={isSaving} className="bg-secondary hover:bg-secondary/90 font-bold h-9">
                  {isSaving ? "Guardando..." : "DESPLEGAR AGENTE"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
