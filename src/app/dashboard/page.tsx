"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { useUIStore } from "@/lib/store";
import { AIAgent } from "@/lib/types";
import {
  Search,
  Plus,
  Zap,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const {
    searchQuery, setSearchQuery,
    tenantId,
    agents, setAgents,
  } = useUIStore();

  const [loading, setLoading] = useState(true);

  const fetchAgents = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/agents?tenantId=${encodeURIComponent(tenantId)}`);
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (err) {
      console.error("Error fetching agents:", err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, setAgents]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const filteredAgents = agents?.filter((a: AIAgent) =>
    a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.company?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar agente..."
              className="pl-12 h-12 bg-card border-border/60 rounded-2xl text-sm font-medium focus-visible:ring-secondary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={() => router.push('/agents/new')}
            className="bg-secondary hover:bg-secondary/90 text-white rounded-2xl h-12 px-6 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-secondary/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Agente
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-6 px-1">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-foreground text-background rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
            <Zap className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            {filteredAgents.length} Unidad{filteredAgents.length !== 1 ? 'es' : ''}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
          </div>
        ) : filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent: AIAgent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-[11px] font-black uppercase text-muted-foreground tracking-widest">Sin resultados</p>
              <p className="text-xs text-muted-foreground">Crea tu primer agente para comenzar.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
