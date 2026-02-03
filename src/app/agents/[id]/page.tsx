"use client";

import { use, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { VoiceAgent } from "@/lib/types";
import { AgentChat } from "@/components/agents/AgentChat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Settings, BarChart3, MessageSquare, Play, Trash2, ShieldCheck, Zap } from "lucide-react";
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
  },
  "2": {
    id: "2",
    name: "Marcus Sales-Pro",
    personality: "Energetic, persuasive, and highly professional sales representative specializing in high-ticket closing.",
    responseStyle: "Warm, engaging, and focused on value propositions.",
    initialContext: "Extensive knowledge of product features, handling objections, and closing techniques.",
    createdAt: "2024-02-01T14:30:00Z",
    metrics: {
      usageCount: 850,
      performanceRating: 4.5,
      totalChatTime: 3100
    }
  },
  "3": {
    id: "3",
    name: "Zen Meditation Guide",
    personality: "Soothing, mindful, and deeply empathetic coach for mental wellness apps.",
    responseStyle: "Soft-spoken, slow-paced, and filled with pauses.",
    initialContext: "Knowledge of breathing exercises, mindfulness techniques, and mental health best practices.",
    createdAt: "2024-02-10T09:15:00Z",
    metrics: {
      usageCount: 2100,
      performanceRating: 4.9,
      totalChatTime: 12400
    }
  }
};

export default function AgentConsolePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const agentId = resolvedParams.id;
  const [agent, setAgent] = useState<VoiceAgent | null>(null);
  const [feedbackSummary, setFeedbackSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    const foundAgent = MOCK_AGENTS[agentId];
    if (foundAgent) {
      setAgent(foundAgent);
    }
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

  if (!agent) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Navbar />
      <div className="animate-pulse flex flex-col items-center gap-4 pt-20">
        <Zap className="h-12 w-12 text-primary/20" />
        <p className="text-muted-foreground font-headline">Loading agent console...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen pb-12">
      <Navbar />
      <main className="container mx-auto px-4 pt-8">
        {/* Breadcrumb & Top Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="space-y-1">
            <Link href="/dashboard" className="text-primary text-sm flex items-center gap-1 hover:underline mb-2">
              <ArrowLeft className="h-3 w-3" /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-headline font-bold">{agent.name}</h1>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Production Ready</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl border-border/50">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
            <Button variant="destructive" size="sm" className="rounded-xl">
              <Trash2 className="mr-2 h-4 w-4" /> Archive
            </Button>
            <Button size="sm" className="rounded-xl px-6 bg-primary shadow-lg shadow-primary/10">
              <Play className="mr-2 h-4 w-4" /> Go Live
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Details & Metrics */}
          <div className="lg:col-span-7 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground uppercase">Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-headline">{agent.metrics.usageCount}</div>
                </CardContent>
              </Card>
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground uppercase">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-headline">94.2%</div>
                </CardContent>
              </Card>
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground uppercase">Avg Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-headline">{agent.metrics.performanceRating}/5</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-muted/50 p-1 rounded-xl mb-4">
                <TabsTrigger value="overview" className="rounded-lg data-[state=active]:shadow-sm">
                  <BarChart3 className="h-4 w-4 mr-2" /> Overview
                </TabsTrigger>
                <TabsTrigger value="personality" className="rounded-lg data-[state=active]:shadow-sm">
                  <Zap className="h-4 w-4 mr-2" /> Personality
                </TabsTrigger>
                <TabsTrigger value="feedback" className="rounded-lg data-[state=active]:shadow-sm">
                  <ShieldCheck className="h-4 w-4 mr-2" /> Feedback Analysis
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Usage Performance</CardTitle>
                    <CardDescription>Calls and engagement trends over the last 30 days.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center border-t">
                    <div className="text-center space-y-2 opacity-50">
                      <BarChart3 className="h-10 w-10 mx-auto" />
                      <p className="text-sm">Detailed analytics charts would appear here.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="personality">
                <Card>
                  <CardHeader>
                    <CardTitle>Core configuration</CardTitle>
                    <CardDescription>The underlying logic and identity of your agent.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Personality Persona</h4>
                      <p className="text-sm leading-relaxed p-3 bg-muted/30 rounded-lg">{agent.personality}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Response Style</h4>
                      <p className="text-sm leading-relaxed p-3 bg-muted/30 rounded-lg">{agent.responseStyle}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Knowledge Context</h4>
                      <p className="text-sm leading-relaxed p-3 bg-muted/30 rounded-lg">{agent.initialContext}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="feedback">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>User Feedback Insights</CardTitle>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="rounded-lg"
                        onClick={handleSummarizeFeedback}
                        disabled={isSummarizing || !agent.feedback}
                      >
                        {isSummarizing ? "Summarizing..." : "Analyze Feedback with AI"}
                      </Button>
                    </div>
                    <CardDescription>Aggregated feedback from real-world interactions.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {feedbackSummary ? (
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl animate-in fade-in duration-500">
                        <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                          <Sparkles className="h-4 w-4" /> AI Summary
                        </h4>
                        <p className="text-sm italic text-foreground">{feedbackSummary}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Click the analyze button to generate an LLM summary of recent feedback.</p>
                    )}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest pt-4">Raw Feedback Logs</h4>
                      {agent.feedback?.map((f, i) => (
                        <div key={i} className="text-sm p-3 border rounded-lg bg-white shadow-sm flex gap-3">
                          <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <p>"{f}"</p>
                        </div>
                      )) || <p className="text-sm opacity-50">No feedback available yet.</p>}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Chat Sandbox */}
          <div className="lg:col-span-5 h-[600px] sticky top-24">
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xl font-headline font-bold">Agent Sandbox</h2>
                <Badge variant="secondary">Testing Environment</Badge>
              </div>
              <AgentChat agent={agent} />
              <p className="text-[10px] text-muted-foreground px-2">
                Note: This is a sandbox environment. Interaction here does not affect production metrics.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}