"use client";

import { useMemo } from "react";
import { AIAgent } from "@/lib/types";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { Loader2, Database, SearchX, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@remix-run/react";
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
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    const q = searchQuery.toLowerCase().trim();
    if (!q) return sorted;

    return sorted.filter(agent => {
      const matchesText =
        agent.name.toLowerCase().includes(q) ||
        agent.role.toLowerCase().includes(q) ||
        agent.company.toLowerCase().includes(q);

      return matchesText;
    });
  }, [agents, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Sincronizando flota...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <Database className="h-8 w-8 text-destructive/40" />
        <p className="text-destructive font-black uppercase tracking-widest text-[10px]">Error de Sincronización</p>
        <p className="text-xs text-muted-foreground max-w-sm">No pudimos obtener la flota de agentes para este portal ({tenantId || "anonymous"}).</p>
      </div>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <div className="col-span-full py-24 text-center space-y-8 flex flex-col items-center border-2 border-dashed border-border rounded-[3rem] bg-card shadow-sm w-full max-w-4xl mx-auto animate-in fade-in zoom-in duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-secondary/10 rounded-full blur-2xl animate-pulse" />
          <div className="relative h-20 w-20 rounded-full bg-secondary/10 flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-secondary" />
          </div>
        </div>
        <div className="space-y-2 max-w-md p-4">
          <h2 className="text-xl font-headline font-bold text-foreground">Sin Flota Activa</h2>
          <p className="text-[11px] text-muted-foreground uppercase font-black tracking-widest leading-relaxed">
            Tu portal Bitrix24 aún no cuenta con agentes de chat inteligentes. Inicia el protocolo para automatizar tu atención.
          </p>
        </div>
        <Link href="/agents/new">
          <Button className="h-12 px-8 pill-rounded bg-secondary hover:bg-secondary/90 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-secondary/20">
            <Plus className="h-4 w-4" />
            Configurar Mi Primer Bot
          </Button>
        </Link>
      </div>
    );
  }

  if (filteredAgents.length === 0) {
    return (
      <div className="col-span-full py-32 text-center space-y-4 flex flex-col items-center border-2 border-dashed border-border rounded-[3rem] bg-card/50">
        <SearchX className="h-10 w-10 text-muted-foreground/30" />
        <div className="space-y-1">
          <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No hay agentes que coincidan con "{searchQuery}"</p>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {filteredAgents.map(agent => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
