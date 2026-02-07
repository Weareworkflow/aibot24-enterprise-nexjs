
"use client";

import { use, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AIAgent } from "@/lib/types";
import { AgentChat } from "@/components/agents/AgentChat";
import { AiRefiner } from "@/components/agents/AgentChat/AiRefiner";
import { 
  ArrowLeft, 
  Loader2,
  Wand2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
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
    <div className="flex flex-col min-h-screen bg-[#F0F3F5] overflow-hidden">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-[1400px] flex flex-col gap-6">
        {/* Header Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-[2rem] border shadow-sm">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 flex items-center justify-center bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-headline font-bold">{agent.name}</h1>
                <Badge className="border-none text-[9px] font-black h-5 uppercase bg-accent/10 text-accent px-3">
                  UNIDAD ACTIVA
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                ID: {agent.id} • {agent.company} • {agent.role}
              </p>
            </div>
          </div>
        </div>

        {/* Dos Columnas: Configuración y Chat */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          {/* Columna Izquierda: Configuración (Acordeones) */}
          <div className="lg:col-span-7 h-full">
            <AgentChat agent={agent} />
          </div>

          {/* Columna Derecha: AiRefiner (Chat) */}
          <div className="lg:col-span-5 h-full">
            <div className="bg-white rounded-[2.5rem] high-volume overflow-hidden h-full flex flex-col border-none shadow-2xl">
              <div className="p-6 border-b bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-secondary/20 flex items-center justify-center">
                    <Wand2 className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Arquitecto de Refinamiento</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">IA Co-Piloto Operativa</p>
                  </div>
                </div>
              </div>
              <AiRefiner agent={agent} db={db} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
