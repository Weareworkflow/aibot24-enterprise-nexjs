"use client";

import { use, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { VoiceAgent } from "@/lib/types";
import { AgentChat } from "@/components/agents/AgentChat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Settings, BarChart3, MessageSquare, Play, Trash2, ShieldCheck, Zap, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { summarizeAgentFeedback } from "@/ai/flows/summarize-agent-feedback";

const MOCK_AGENTS: Record<string, VoiceAgent> = {
  "1": {
    id: "1",
    name: "Aria Tech-Support",
    personality: "A patient, knowledgeable, and tech-savvy assistant designed to help customers solve complex software issues.",
    responseStyle: "Concise, instructional, and calm.",
    initialContext: "Expert in SaaS platforms, common troubleshooting steps, and empathetic communication.",
    createdAt: "2024-01-15T10:00:00Z",
    metrics: {
      usageCount: 1240,
      performanceRating: 4.8,
      totalChatTime: 5200
    },
    feedback: [
      "Very helpful when fixing my login issue.",
      "A bit too technical sometimes.",
      "Great patient tone during high stress."
    ]
  }
};

export default function AgentConsolePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const agentId = resolvedParams.id;
  const [agent, setAgent] = useState<VoiceAgent | null>(null);
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

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F3F5]">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="h-8 w-8 flex items-center justify-center bg-muted rounded-full hover:bg-muted/80">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-headline font-bold">{agent.name}</h1>
                <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black h-4 uppercase">PROD</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Creado el {new Date(agent.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase">
              <Settings className="mr-1.5 h-3.5 w-3.5" /> Ajustes
            </Button>
            <Button size="sm" className="h-8 bg-secondary hover:bg-secondary/90 text-white font-black text-[10px] uppercase px-4">
              <Play className="mr-1.5 h-3.5 w-3.5" /> Lanzar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Uso", val: agent.metrics.usageCount },
                { label: "Éxito", val: "94%" },
                { label: "Score", val: `${agent.metrics.performanceRating}/5` }
              ].map((m, i) => (
                <Card key={i} className="shadow-none border-border">
                  <CardContent className="p-3 text-center">
                    <p className="text-[9px] font-black text-muted-foreground uppercase">{m.label}</p>
                    <p className="text-xl font-headline font-bold">{m.val}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="personality" className="w-full">
              <TabsList className="bg-white border p-1 rounded-md h-9 mb-4">
                <TabsTrigger value="personality" className="text-[10px] font-black uppercase">Personalidad</TabsTrigger>
                <TabsTrigger value="feedback" className="text-[10px] font-black uppercase">Feedback</TabsTrigger>
                <TabsTrigger value="stats" className="text-[10px] font-black uppercase">Métricas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personality">
                <Card className="shadow-sm">
                  <CardContent className="p-4 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-black text-primary uppercase">Persona</h4>
                        <p className="text-xs p-2 bg-muted/40 rounded border leading-relaxed">{agent.personality}</p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-black text-primary uppercase">Respuesta</h4>
                        <p className="text-xs p-2 bg-muted/40 rounded border leading-relaxed">{agent.responseStyle}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black text-primary uppercase">Conocimiento</h4>
                      <p className="text-xs p-2 bg-muted/40 rounded border leading-relaxed">{agent.initialContext}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="feedback">
                <Card className="shadow-sm">
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
                      <div key={i} className="text-xs p-2 border rounded bg-white flex gap-2">
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
