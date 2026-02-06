
"use client";

import { useMemo } from "react";
import { AIAgent } from "@/lib/types";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { Loader2, Database, SearchX, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUIStore } from "@/lib/store";

interface AgentListProps {
  agents: AIAgent[] | null;
  loading: boolean;
  error: any;
  tenantId: string | null;
}

export function AgentList({ agents, loading, error, tenantId }: AgentListProps) {
  const { searchQuery, setSearchQuery } = useUIStore();

  const filteredAgents = useMemo(() => {
    if (!agents) return [];
    
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sincronizando con Portal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <Database className="h-8 w-8 text-destructive/40" />
        <p className="text-destructive font-black uppercase tracking-widest text-[10px]">Error de Sincronización</p>
        <p className="text-xs text-muted-foreground max-w-sm">No pudimos obtener la lista de agentes para tu portal.</p>
      </div>
    );
  }

  if (!agents || agents.length === 0) {
    return (
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
    );
  }

  if (filteredAgents.length === 0) {
    return (
      <div className="col-span-full py-32 text-center space-y-4 flex flex-col items-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/50">
        <SearchX className="h-10 w-10 text-muted-foreground/30" />
        <div className="space-y-1">
          <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No hay coincidencias para "{searchQuery}"</p>
        </div>
        <Button 
          variant="link" 
          onClick={() => setSearchQuery('')}
          className="text-secondary text-[10px] font-black uppercase tracking-widest"
        >
          Limpiar Búsqueda
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {filteredAgents.map(agent => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
