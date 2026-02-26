"use client";

import { use, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AIAgent } from "@/lib/types";
import { AgentChat } from "@/components/agents/AgentChat";
import { AiRefiner } from "@/components/agents/AgentChat/AiRefiner";
import {
  Loader2,
  Wand2,
  Sparkles
} from "lucide-react";
import { useUIStore } from "@/lib/store";

export default function AgentConsolePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const agentId = resolvedParams.id;

  const { agents, setAgent } = useUIStore();
  const [loading, setLoading] = useState(true);

  // Fetch agent from API
  useEffect(() => {
    async function fetchAgent() {
      try {
        const res = await fetch(`/api/agents/${agentId}`);
        if (res.ok) {
          const data = await res.json();
          setAgent(data);
        }
      } catch (err) {
        console.error("Error fetching agent:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAgent();
  }, [agentId, setAgent]);

  // Derive agent from global store
  const agent = agents.find(a => a.id === agentId);

  if (loading && !agent) return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-secondary/20 rounded-full blur-xl animate-pulse" />
          <Loader2 className="h-10 w-10 animate-spin text-secondary relative z-10" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Sincronizando Protocolos...</p>
      </div>
    </div>
  );

  if (!agent) return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="p-12 text-center bg-card rounded-[3rem] shadow-xl border border-border max-w-md w-full">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive animate-pulse">
            Protocolo de Error: Agente no localizado
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background lg:overflow-hidden transition-colors duration-300">
      <Navbar />
      <main className="flex-1 w-full px-4 md:px-6 py-6 flex flex-col min-h-0">
        <div className="flex-1 min-h-0 mb-4">
          <div className="h-auto lg:h-[calc(100vh-120px)] flex flex-col min-h-0">
            <AgentChat agent={agent} />
          </div>
        </div>
      </main>
    </div>
  );
}
