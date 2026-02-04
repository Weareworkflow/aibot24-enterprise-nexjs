
"use client";

import { useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { AIAgent } from "@/lib/types";
import { Loader2, Sparkles, LayoutDashboard, SearchX, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUIStore } from "@/lib/store";

export default function DashboardPage() {
  const db = useFirestore();
  const { searchQuery, tenantId } = useUIStore();
  
  const agentsQuery = useMemo(() => {
    if (!db) return null;
    const effectiveTenantId = tenantId || "anonymous";
    
    return query(
      collection(db, "agents"), 
      where("tenantId", "==", effectiveTenantId),
      orderBy("createdAt", "desc")
    );
  }, [db, tenantId]);

  const { data: agents, loading: collectionLoading, error } = useCollection<AIAgent>(agentsQuery);

  const filteredAgents = useMemo(() => {
    if (!agents) return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return agents;

    return agents.filter(agent => {
      const typeMatch = agent.type === 'voice' 
        ? ('voz'.includes(q) || 'voice'.includes(q))
        : ('texto'.includes(q) || 'text'.includes(q));

      return (
        agent.name.toLowerCase().includes(q) ||
        agent.role.toLowerCase().includes(q) ||
        agent.company.toLowerCase().includes(q) ||
        typeMatch
      );
    });
  }, [agents, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FB]">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-xl">
              <LayoutDashboard className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h1 className="text-xl font-headline font-bold">Panel Operativo</h1>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Estado global de unidades de IA - {tenantId ? `Portal: ${tenantId}` : "Sesión Anónima"}</p>
            </div>
          </div>
        </div>

        {collectionLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Sincronizando con Bitrix24...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="p-4 bg-destructive/5 rounded-full">
              <Database className="h-8 w-8 text-destructive/40" />
            </div>
            <p className="text-destructive font-black uppercase tracking-widest text-[10px]">Error de Sincronización</p>
            <p className="text-xs text-muted-foreground max-w-sm">No pudimos conectar con el flujo de datos para este inquilino.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {filteredAgents.map(agent => (
              <AgentCard 
                key={agent.id} 
                agent={agent} 
              />
            ))}

            {agents && agents.length > 0 && filteredAgents.length === 0 && (
              <div className="col-span-full py-32 text-center space-y-4 flex flex-col items-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/50">
                <SearchX className="h-10 w-10 text-muted-foreground/30" />
                <div className="space-y-1">
                  <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No hay agentes que coincidan con "{searchQuery}"</p>
                </div>
                <Button 
                  variant="link" 
                  onClick={() => useUIStore.getState().setSearchQuery('')}
                  className="text-secondary text-[10px] font-black uppercase tracking-widest"
                >
                  Limpiar Filtro
                </Button>
              </div>
            )}

            {(!agents || agents.length === 0) && (
              <div className="col-span-full py-32 text-center space-y-6 flex flex-col items-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/50">
                <div className="p-4 bg-secondary/5 rounded-full">
                  <Sparkles className="h-8 w-8 text-secondary/40" />
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground font-headline font-bold uppercase tracking-widest text-[10px]">No hay agentes desplegados en este portal.</p>
                  <Link href="/agents/new">
                    <Button variant="link" className="text-secondary text-xs font-bold p-0 h-auto">
                      Iniciar Protocolo de Diseño →
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
