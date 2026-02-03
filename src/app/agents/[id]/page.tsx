"use client";

import { use, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AIAgent } from "@/lib/types";
import { AgentChat } from "@/components/agents/AgentChat";
import { 
  ArrowLeft, 
  Database, 
  MessageCircle, 
  ArrowRightLeft, 
  UserX, 
  Building2, 
  Target, 
  UserRound, 
  Sparkles,
  Settings2,
  Code2,
  Share2,
  Smartphone,
  Calendar,
  LayoutGrid,
  FilePlus,
  Search,
  Cloud,
  PhoneCall,
  Clock,
  PhoneIncoming,
  PhoneForwarded,
  PhoneOff
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAgentStore } from "@/lib/store";
import { Switch } from "@/components/ui/switch";

export default function AgentConsolePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const agentId = resolvedParams.id;
  const { agents } = useAgentStore();
  const [agent, setAgent] = useState<AIAgent | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Local state for integration toggles
  const [activeIntegrations, setActiveIntegrations] = useState<Record<string, boolean>>({
    "Calls API": true,
    "Drive Bitrix24": true,
    "Catálogo Bitrix24": true
  });

  useEffect(() => {
    setIsMounted(true);
    const foundAgent = agents.find(a => a.id === agentId);
    if (foundAgent) {
      setAgent(foundAgent);
    }
  }, [agentId, agents]);

  if (!isMounted) return null;
  if (!agent) return (
    <div className="flex flex-col min-h-screen bg-[#F0F3F5]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="p-8 text-center font-black uppercase tracking-widest text-muted-foreground animate-pulse">
          Agente no encontrado
        </div>
      </div>
    </div>
  );

  const isVoice = agent.type === 'voice';

  const toggleIntegration = (title: string) => {
    setActiveIntegrations(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F3F5]">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 flex items-center justify-center bg-muted rounded-full hover:bg-muted/80"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-headline font-bold">{agent.name}</h1>
                <Badge className={cn("border-none text-[9px] font-black h-4 uppercase", isVoice ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary")}>
                  {isVoice ? 'MODO VOZ' : 'MODO TEXTO'}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Activo desde {new Date(agent.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 pill-rounded border bg-white flex items-center gap-3 shadow-sm">
                  <div className="p-1.5 rounded-full bg-muted/50 text-primary">
                    {isVoice ? <Clock className="h-3 w-3" /> : <MessageCircle className="h-3 w-3" />}
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase text-muted-foreground">
                      {isVoice ? "Minutos" : "Mensajes"}
                    </p>
                    <p className="text-sm font-headline font-black text-primary">
                      {isVoice ? (agent.metrics.totalInteractionMetric || "0") : (agent.metrics.totalInteractionMetric || "0")}
                    </p>
                  </div>
                </div>
                <div className="p-3 pill-rounded border bg-white flex items-center gap-3 shadow-sm">
                  <div className="p-1.5 rounded-full bg-muted/50 text-secondary">
                    <Database className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase text-muted-foreground">Tokens</p>
                    <p className="text-sm font-headline font-black text-secondary">{agent.metrics.tokens || "0"}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { 
                    label: isVoice ? "INBOUND" : "CHATS", 
                    val: agent.metrics.usageCount, 
                    color: "text-primary", 
                    icon: isVoice ? PhoneIncoming : MessageCircle 
                  },
                  { 
                    label: "TRANSF", 
                    val: agent.metrics.transfers || 0, 
                    color: "text-secondary", 
                    icon: isVoice ? PhoneForwarded : ArrowRightLeft 
                  },
                  { 
                    label: "ABAND", 
                    val: agent.metrics.abandoned || 0, 
                    color: "text-destructive", 
                    icon: isVoice ? PhoneOff : UserX 
                  },
                ].map((m, i) => (
                  <div key={i} className="text-center py-2 border bg-white pill-rounded shadow-sm flex flex-col items-center justify-center">
                    <m.icon className={cn("h-3 w-3 mb-0.5", m.color)} />
                    <p className="text-[7px] font-black uppercase tracking-widest mb-0.5 text-muted-foreground">{m.label}</p>
                    <p className={cn("text-sm font-headline font-black", m.color)}>{m.val}</p>
                  </div>
                ))}
              </div>
            </div>

            <Tabs defaultValue="identidad" className="w-full">
              <div className="flex mb-6">
                <TabsList className="bg-white border pill-rounded h-12 p-1 gap-1 shadow-sm">
                  <TabsTrigger 
                    value="identidad" 
                    className="pill-rounded h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-white text-[10px] font-black uppercase tracking-[0.1em] gap-2 transition-all"
                  >
                    <Settings2 className="h-3.5 w-3.5" /> Identidad
                  </TabsTrigger>
                  <TabsTrigger 
                    value="instrucciones" 
                    className="pill-rounded h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-white text-[10px] font-black uppercase tracking-[0.1em] gap-2 transition-all"
                  >
                    <Code2 className="h-3.5 w-3.5" /> Instrucciones
                  </TabsTrigger>
                  <TabsTrigger 
                    value="integraciones" 
                    className="pill-rounded h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-white text-[10px] font-black uppercase tracking-[0.1em] gap-2 transition-all"
                  >
                    <Share2 className="h-3.5 w-3.5" /> Integraciones
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="identidad" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Card className="shadow-sm border-none bg-white">
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase">
                          <UserRound className="h-3 w-3" /> Nombre
                        </div>
                        <p className="text-sm font-bold border-b pb-1">{agent.name}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase">
                          <Sparkles className="h-3 w-3" /> Rol
                        </div>
                        <p className="text-sm font-bold border-b pb-1">{agent.role}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase">
                          <Building2 className="h-3 w-3" /> Empresa
                        </div>
                        <p className="text-sm font-bold border-b pb-1">{agent.company}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase">
                          <Target className="h-3 w-3" /> Objetivo
                        </div>
                        <p className="text-sm font-bold border-b pb-1">{agent.objective}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instrucciones" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Card className="shadow-sm border-none bg-white">
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase">
                        Tono de Voz / Personalidad
                      </div>
                      <p className="text-xs p-3 bg-muted/40 rounded-lg border italic">{agent.tone}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase">
                        Base de Conocimiento
                      </div>
                      <div className="min-h-[150px] p-4 bg-muted/30 rounded-xl border-dashed border-2 text-[10px] leading-relaxed font-mono whitespace-pre-wrap">
                        {agent.knowledge}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="integraciones" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Card className="shadow-sm border-none bg-white">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { title: "WhatsApp Business", icon: Smartphone },
                        { title: "Calendario Bitrix24", icon: Calendar },
                        { title: "Catálogo Bitrix24", icon: LayoutGrid },
                        { title: "Documentos Bitrix24", icon: FilePlus },
                        { title: "Analizador Documento", icon: Search },
                        { title: "Drive Bitrix24", icon: Cloud },
                        { title: "Calls API", icon: PhoneCall },
                      ].map((int, i) => (
                        <div 
                          key={i} 
                          className="flex items-center justify-between p-4 border rounded-2xl hover:bg-muted/30 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 bg-muted rounded-full transition-colors",
                              activeIntegrations[int.title] ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            )}>
                              <int.icon className="h-4 w-4" />
                            </div>
                            <span className={cn("text-xs font-bold", !activeIntegrations[int.title] && "text-muted-foreground")}>
                              {int.title}
                            </span>
                          </div>
                          <Switch 
                            checked={activeIntegrations[int.title] || false} 
                            onCheckedChange={() => toggleIntegration(int.title)}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-5 h-[500px]">
            <AgentChat agent={agent} />
          </div>
        </div>
      </main>
    </div>
  );
}
