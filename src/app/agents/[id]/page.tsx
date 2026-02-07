
"use client";

import { use, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AIAgent } from "@/lib/types";
import { AgentChat } from "@/components/agents/AgentChat";
import { AiRefiner } from "@/components/agents/AgentChat/AiRefiner";
import { 
  Loader2,
  Wand2
} from "lucide-react";
import { useRouter } from "next/navigation";
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
        <div className="relative">
          <div className="absolute inset-0 bg-secondary/20 rounded-full blur-xl animate-pulse" />
          <Loader2 className="h-10 w-10 animate-spin text-secondary relative z-10" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Sincronizando Unidad...</p>
      </div>
    </div>
  );

  if (!agent) return (
    <div className="flex flex-col min-h-screen bg-[#F0F3F5]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="p-12 text-center bg-white rounded-[3rem] shadow-xl border border-slate-100">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
            Protocolo de Error: Agente no localizado
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F3F5] overflow-hidden">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-[1400px] flex flex-col min-h-0">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 mb-4">
          {/* Columna Izquierda: Configuración con Header Integrado */}
          <div className="lg:col-span-7 h-full min-h-0 flex flex-col">
            <AgentChat agent={agent} />
          </div>

          {/* Columna Derecha: AiRefiner (Chat) */}
          <div className="lg:col-span-5 h-full min-h-0 flex flex-col">
            <div className="bg-white rounded-[2.5rem] high-volume overflow-hidden h-full flex flex-col border-none shadow-2xl">
              <div className="p-6 border-b bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-secondary/20 flex items-center justify-center border border-white/10">
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
