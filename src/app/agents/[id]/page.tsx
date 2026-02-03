"use client";

import { use, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AIAgent } from "@/lib/types";
import { AgentChat } from "@/components/agents/AgentChat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MessageSquare, Sparkles, Zap, Database } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { summarizeAgentFeedback } from "@/ai/flows/summarize-agent-feedback";
import { cn } from "@/lib/utils";

const MOCK_AGENTS: Record<string, AIAgent> = {
  "1": {
    id: "1",
    name: "Aria Soporte Técnico",
    type: "voice",
    personality: "Asistente paciente y experta en tecnología diseñada para resolver problemas complejos de software.",
    responseStyle: "Concisa, instructiva y calmada.",
    initialContext: "Expert en SaaS platforms, common troubleshooting steps, and empathetic communication.",
    createdAt: "2024-01-15T10:00:00Z",
    metrics: {
      usageCount: 1240,
      performanceRating: 4.8,
      totalInteractionMetric: 5200,
      latency: "1450m",
      tokens: "120k",
      transfers: 45,
      abandoned: 12
    },
    feedback: [
      "Muy útil con mi problema de login.",
      "A veces es demasiado técnica.",
      "Excelente tono de voz calmado."
    ]
  }
};

export default function AgentConsolePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const agentId = resolvedParams.id;
  const [agent, setAgent] = useState<AIAgent | null>(null);
  const [feedbackSummary, setFeedbackSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    const foundAgent = MOCK_AGENTS[agentId] || Object.values(MOCK_AGENTS)[0];
    setAgent(foundAgent);
  }, [agentId]);

  const handleSummarizeFeedback = async () => {
    if (!agent?.feedback) return;
    setIsSummarizing(true);
    try {
      const result = await summarizeAgentFeedback({ feedback: agent.feedback.join("\n") });
      setFeedbackSummary(result.summary);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSummarizing(false);
    }
  };

  if (!agent) return <div className="p-8 text-center">Cargando consola...</div>;

  const isVoice = agent.type === 'voice';

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F3F5]">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="h-8 w-8 flex items-center justify-center bg-muted rounded-full hover:bg-muted/80">
              <ArrowLeft className="h-4 w-4" />
            </Link>
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
                    <p className="text-[8px] font-black uppercase text-muted-foreground">Minutos</p>
                    <p className="text-sm font-headline font-black text-primary">{agent.metrics.latency || "0m"}</p>
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
                  { label: "INBOUND", val: agent.metrics.usageCount, color: "text-primary" },
                  { label: "TRANSF", val: agent.metrics.transfers || 0, color: "text-secondary" },
                  { label: "ABAND", val: agent.metrics.abandoned || 0, color: "text-destructive" },
                ].map((m, i) => (
                  <div key={i} className="text-center py-2.5 border bg-white pill-rounded shadow-sm">
                    <p className="text-[7px] font-black uppercase tracking-widest mb-0.5 text-muted-foreground">{m.label}</p>
                    <p className={cn("text-xs font-headline font-black", m.color)}>{m.val}</p>
                  </div>
                ))}
              </div>
            </div>

            <Tabs defaultValue="personality" className="w-full">
              <TabsList className="bg-white border p-1 rounded-md h-9 mb-4">
                <TabsTrigger value="personality" className="text-[10px] font-black uppercase">Configuración</TabsTrigger>
                <TabsTrigger value="feedback" className="text-[10px] font-black uppercase">Feedback IA</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personality">
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
              </TabsContent>

              <TabsContent value="feedback">
                <Card className="shadow-sm border-none">
                  <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 space-y-0">
                    <CardTitle className="text-sm font-bold">Feedback Reciente</CardTitle>
                    <Button size="sm" variant="secondary" className="h-7 text-[9px] font-black uppercase" onClick={handleSummarizeFeedback} disabled={isSummarizing}>
                      {isSummarizing ? "Procesando..." : "IA Resumen"}
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    {feedbackSummary && (
                      <div className="p-3 bg-primary/5 border-l-2 border-primary rounded-r text-xs italic">
                        <Sparkles className="h-3 w-3 inline mr-2 text-primary" /> {feedbackSummary}
                      </div>
                    )}
                    {agent.feedback?.map((f, i) => (
                      <div key={i} className="text-xs p-2 border rounded bg-white flex gap-2 shadow-sm">
                        <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5" />
                        <p>{f}</p>
                      </div>
                    ))}
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