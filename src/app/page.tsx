
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, orderBy, where } from "firebase/firestore";
import { AIAgent } from "@/lib/types";
import { useMemo } from "react";
import { Loader2, Sparkles, SearchX, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUIStore } from "@/lib/store";

export default function HomePage() {
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const { searchQuery } = useUIStore();
  
  const agentsQuery = useMemo(() => {
    if (!db || authLoading) return null;
    
    // Si no hay usuario, buscamos agentes "anonymous" como fallback para la demo
    const uid = user?.uid || "anonymous";
    
    return query(
      collection(db, "agents"), 
      where("tenantId", "==", uid),
      orderBy("createdAt", "desc")
    );
  }, [db, user, authLoading]);

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
        {(collectionLoading || authLoading) ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sincronizando con Bitrix24...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <Database className="h-8 w-8 text-destructive/40" />
            <p className="text-destructive font-black uppercase tracking-widest text-[10px]">Error de Sincronización</p>
            <p className="text-xs text-muted-foreground max-w-sm">No pudimos obtener la lista de agentes. Verifica los índices de Firestore en la consola de Firebase.</p>
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
                  <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No hay coincidencias para "{searchQuery}"</p>
                  <p className="text-[9px] text-muted-foreground/60 uppercase font-bold">Intenta buscar por nombre, rol o empresa</p>
                </div>
                <Button 
                  variant="link" 
                  onClick={() => useUIStore.getState().setSearchQuery('')}
                  className="text-secondary text-[10px] font-black uppercase tracking-widest"
                >
                  Limpiar Búsqueda
                </Button>
              </div>
            )}

            {(!agents || agents.length === 0) && (
              <div className="col-span-full py-32 text-center space-y-6 flex flex-col items-center">
                <div className="p-4 bg-secondary/5 rounded-full">
                  <Sparkles className="h-8 w-8 text-secondary/40" />
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground font-headline font-bold uppercase tracking-widest text-[10px]">No tienes agentes activos en este portal.</p>
                  <Link href="/agents/new">
                    <Button variant="link" className="text-secondary text-xs font-bold p-0 h-auto">
                      Iniciar Protocolo de Creación →
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
