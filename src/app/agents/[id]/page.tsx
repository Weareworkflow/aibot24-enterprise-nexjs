
"use client";

import { use, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AIAgent } from "@/lib/types";
import { AgentChat } from "@/components/agents/AgentChat";
import { 
  ArrowLeft, 
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";

export default function AgentConsolePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const agentId = resolvedParams.id;
  const db = useFirestore();
  const router = useRouter();

  const agentRef = useMemo(() => {
    if (!db || !agentId) return null;
    return doc(db, "agents", agentId);
  }, [db, agentId]);

  const { data: agent, loading } = useDoc<AIAgent>(agentRef);

  if (loading) return (
    <div className="flex flex-col min-h-screen bg-[#F0F3F5]">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cargando Unidad de Inteligencia...</p>
      </div>
    </div>
  );

  if (!agent) return (
    <div className="flex flex-col min-h-screen bg-[#F0F3F5]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="p-8 text-center font-black uppercase tracking-widest text-muted-foreground animate-pulse">
          Agente no encontrado en el sistema
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F3F5]">
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-3xl border shadow-sm">
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
                <Badge className="border-none text-[9px] font-black h-4 uppercase bg-accent/10 text-accent">
                  MODO CHAT
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">ID: {agent.id} • {agent.company}</p>
            </div>
          </div>
        </div>

        <div className="h-[750px]">
          <AgentChat agent={agent} />
        </div>
      </main>
    </div>
  );
}
