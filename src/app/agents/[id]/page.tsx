"use client";

import { use, useMemo, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AIAgent } from "@/lib/types";
import { AgentChat } from "@/components/agents/AgentChat";
import { AiRefiner } from "@/components/agents/AgentChat/AiRefiner";
import {
  Loader2,
  Wand2,
  Sparkles
} from "lucide-react";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store";

export default function AgentConsolePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const agentId = resolvedParams.id;
  const db = useFirestore();

  const { agents, setAgent } = useUIStore();

  // Real-time synchronization with Firestore
  const agentRef = useMemo(() => {
    if (!db || !agentId) return null;
    return doc(db, "agents", agentId) as any;
  }, [db, agentId]);

  const { data: firestoreAgent, loading: firestoreLoading } = useDoc<AIAgent>(agentRef);

  // Sync state: Firestore -> Zustand
  useEffect(() => {
    if (firestoreAgent) {
      setAgent(firestoreAgent);
    }
  }, [firestoreAgent, setAgent]);

  // Derive agent from global store for instant UI updates
  const agent = agents.find(a => a.id === agentId) || firestoreAgent;
  const loading = firestoreLoading && !agent;

  if (loading) return (
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
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 mb-4">

          {/* Columna Izquierda: Configuración y Datos del Agente */}
          <div className="lg:col-span-7 h-auto lg:h-[calc(100vh-120px)] flex flex-col min-h-0">
            <AgentChat agent={agent} />
          </div>

          {/* Columna Derecha: Arquitecto de Refinamiento (Co-Piloto de IA) */}
          <div className="lg:col-span-5 h-[600px] lg:h-[calc(100vh-120px)] flex flex-col min-h-0">
            <div className="bg-card rounded-[2.5rem] high-volume overflow-hidden h-full flex flex-col border border-border/40 shadow-2xl group focus-within:ring-2 focus-within:ring-secondary/10 transition-all">
              <div className="p-6 border-b bg-secondary/5 text-foreground flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20 shadow-sm">
                    <Wand2 className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">Aibot</h3>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                      <Sparkles className="h-2 w-2 text-secondary animate-pulse" />
                      IA Co-Piloto Operativa
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <AiRefiner
                  agent={agent}
                  db={db}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
