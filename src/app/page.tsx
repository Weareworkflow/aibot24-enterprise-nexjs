"use client";

import { Navbar } from "@/components/layout/Navbar";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { AIAgent } from "@/lib/types";
import { useMemo, useEffect } from "react";
import { Loader2, Sparkles, SearchX, Database, Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUIStore } from "@/lib/store";

export default function HomePage() {
  const db = useFirestore();
  const { searchQuery, tenantId } = useUIStore();
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const memberId = params.get('member_id');
    if (memberId && !tenantId) {
      useUIStore.getState().setTenantId(memberId);
    }
  }, [tenantId]);

  const agentsQuery = useMemo(() => {
    if (!db || !tenantId) return null;
    
    // Consulta simple para evitar requisitos de índices compuestos manuales
    return query(
      collection(db, "agents"), 
      where("tenantId", "==", tenantId)
    );
  }, [db, tenantId]);

  const { data: agents, loading: collectionLoading, error } = useCollection<AIAgent>(agentsQuery);

  const filteredAgents = useMemo(() => {
    if (!agents) return [];
    
    // Ordenar en memoria por fecha de creación descendente
    const sorted = [...agents].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const q = searchQuery.toLowerCase().trim();
    if (!q) return sorted;

    return sorted.filter(agent => {
      const matchesText = 
        agent.name.toLowerCase().includes(q) ||
        agent.role.toLowerCase().includes(q) ||
        agent.company.toLowerCase().includes(q);

      const isLiveTerm = 'live'.includes(q) || 'voz'.includes(q) || 'voice'.includes(q);
      const isChatTerm = 'chat'.includes(q) || 'texto'.includes(q) || 'text'.includes(q);
      
      const matchesType = 
        (agent.type === 'voice' && isLiveTerm) ||
        (agent.type === 'text' && isChatTerm);

      return matchesText || matchesType;
    });
  }, [agents, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FB]">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-8">
        
        {!tenantId && (
          <div className="max-w-6xl mx-auto mb-6 bg-secondary/5 border border-secondary/20 p-6 rounded-3xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Info className="h-6 w-6 text-secondary flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-800">No se ha detectado el portal de Bitrix24</p>
                <p className="text-[11px] text-muted-foreground uppercase font-black tracking-widest mt-1">Es necesario ejecutar el protocolo de enlace inicial</p>
              </div>
            </div>
            <Link href="/install">
              <Button variant="default" className="pill-rounded bg-secondary text-white text-[10px] font-black uppercase tracking-widest px-6">
                Enlazar Portal →
              </Button>
            </Link>
          </div>
        )}

        {tenantId && collectionLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sincronizando con Portal: {tenantId.substring(0, 8)}...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <Database className="h-8 w-8 text-destructive/40" />
            <p className="text-destructive font-black uppercase tracking-widest text-[10px]">Error de Sincronización</p>
            <p className="text-xs text-muted-foreground max-w-sm">No pudimos obtener la lista de agentes para tu portal ({tenantId || "sin-id"}). Revisa los permisos de Firestore e índices.</p>
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

            {tenantId && (!agents || agents.length === 0) && !collectionLoading && (
              <div className="col-span-full py-24 text-center space-y-8 flex flex-col items-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white shadow-sm max-w-4xl mx-auto">
                <div className="relative">
                  <div className="absolute inset-0 bg-secondary/10 rounded-full blur-2xl animate-pulse" />
                  <div className="relative h-20 w-20 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-secondary" />
                  </div>
                </div>
                <div className="space-y-2 max-w-md">
                  <h2 className="text-xl font-headline font-bold">Sin Unidades Desplegadas</h2>
                  <p className="text-[11px] text-muted-foreground uppercase font-black tracking-widest leading-relaxed">
                    Tu portal Bitrix24 aún no cuenta con agentes de IA configurados. Inicia el protocolo para automatizar tu atención.
                  </p>
                </div>
                <Link href="/agents/new">
                  <Button className="h-12 px-8 pill-rounded bg-secondary hover:bg-secondary/90 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-secondary/20">
                    <Plus className="h-4 w-4" />
                    Diseñar Mi Primer Agente
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}