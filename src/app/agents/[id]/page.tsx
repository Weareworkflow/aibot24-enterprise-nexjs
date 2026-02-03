
"use client";

import { use, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AIAgent } from "@/lib/types";
import { AgentChat } from "@/components/agents/AgentChat";
import { ArrowLeft, Zap, Database, PhoneIncoming, PhoneForwarded, PhoneOff, MessageCircle, ArrowRightLeft, UserX, MessageSquareText, Mic2 } from "lucide-react";
import Link from "next/navigation";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MOCK_AGENTS_DATA: AIAgent[] = [
  {
    id: "1",
    name: "AIV-SALES-MASTER",
    type: "voice",
    isActive: true,
    personality: "ESPECIALISTA VENTAS B2B",
    responseStyle: "Directo y profesional",
    initialContext: "Ventas corporativas y cierre de tratos de alto valor.",
    createdAt: "2024-01-15T10:00:00Z",
    metrics: {
      usageCount: 215,
      performanceRating: 4.8,
      totalInteractionMetric: 934,
      latency: "450m",
      tokens: "120k",
      transfers: 45,
      abandoned: 12
    }
  },
  {
    id: "2",
    name: "SUPPORT-CORE-01",
    type: "voice",
    isActive: true,
    personality: "SOPORTE TÉCNICO NIVEL 1",
    responseStyle: "Paciente y resolutivo",
    initialContext: "Soporte técnico de software, resolución de incidencias comunes y guía paso a paso.",
    createdAt: "2024-02-01T14:30:00Z",
    metrics: {
      usageCount: 540,
      performanceRating: 4.5,
      totalInteractionMetric: 1820,
      latency: "1200m",
      tokens: "245k",
      transfers: 112,
      abandoned: 9
    }
  },
  {
    id: "3",
    name: "WHATSAPP-BOT-PRO",
    type: "text",
    isActive: true,
    personality: "ASISTENTE DE CITAS",
    responseStyle: "Informal pero eficiente",
    initialContext: "Gestión de calendario médico, recordatorios y cancelación de citas.",
    createdAt: "2024-02-10T09:15:00Z",
    metrics: {
      usageCount: 1250,
      performanceRating: 4.9,
      totalInteractionMetric: 5400,
      latency: "850m",
      tokens: "450k",
      transfers: 22,
      abandoned: 5
    }
  }
];

export default function AgentConsolePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const agentId = resolvedParams.id;
  const [agent, setAgent] = useState<AIAgent | null>(null);
  const router = useRouter();

  useEffect(() => {
    const foundAgent = MOCK_AGENTS_DATA.find(a => a.id === agentId);
    if (foundAgent) {
      setAgent(foundAgent);
    } else {
      // Si no se encuentra, por defecto mostramos el primero o podrías redirigir
      setAgent(MOCK_AGENTS_DATA[0]);
    }
  }, [agentId]);

  if (!agent) return <div className="p-8 text-center font-black uppercase tracking-widest text-muted-foreground">Cargando consola...</div>;

  const isVoice = agent.type === 'voice';

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
              onClick={() => router.push('/dashboard')}
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
            
            {/* ANALYTICS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 pill-rounded border bg-white flex items-center gap-3 shadow-sm">
                  <div className="p-1.5 rounded-full bg-muted/50 text-primary">
                    <Zap className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase text-muted-foreground">
                      {isVoice ? "Minutos" : "Mensajes"}
                    </p>
                    <p className="text-sm font-headline font-black text-primary">
                      {isVoice ? (agent.metrics.latency || "0m") : (agent.metrics.totalInteractionMetric || "0")}
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

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Configuración del Agente</h2>
              </div>
              <Card className="shadow-sm border-none">
                <CardContent className="p-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[8px] font-black px-1.5 py-0">PERSONA</Badge>
                      </div>
                      <p className="text-xs p-2 bg-muted/40 rounded border leading-relaxed">{agent.personality}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[8px] font-black px-1.5 py-0">RESPUESTA</Badge>
                      </div>
                      <p className="text-xs p-2 bg-muted/40 rounded border leading-relaxed">{agent.responseStyle}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[8px] font-black px-1.5 py-0">CONOCIMIENTO</Badge>
                    </div>
                    <p className="text-xs p-2 bg-muted/40 rounded border leading-relaxed">{agent.initialContext}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-5 h-[500px]">
            <AgentChat agent={agent} />
          </div>
        </div>
      </main>
    </div>
  );
}
