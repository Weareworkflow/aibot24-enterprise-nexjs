"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { AIAgent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Plus, Search, TrendingUp, Phone, ArrowUpRight, XCircle, Clock, Zap, Database } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";

const INITIAL_AGENTS: AIAgent[] = [
  {
    id: "1",
    name: "AIV-SALES-MASTER",
    type: "voice",
    personality: "ESPECIALISTA VENTAS B2B",
    responseStyle: "Directo y profesional",
    initialContext: "Ventas corporativas",
    createdAt: "2024-01-15T10:00:00Z",
    metrics: {
      usageCount: 215,
      performanceRating: 4.8,
      totalInteractionMetric: 0 // Transf
    },
    feedback: ["20"] // Aband (reutilizando para el mock)
  },
  {
    id: "2",
    name: "SUPPORT-CORE-01",
    type: "voice",
    personality: "SOPORTE TÉCNICO NIVEL 1",
    responseStyle: "Paciente y resolutivo",
    initialContext: "Soporte técnico",
    createdAt: "2024-02-01T14:30:00Z",
    metrics: {
      usageCount: 90,
      performanceRating: 4.5,
      totalInteractionMetric: 112 // Transf
    },
    feedback: ["9"] // Aband
  }
];

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState("SEMANA");

  const filteredAgents = INITIAL_AGENTS.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FB]">
      <Navbar />
      <main className="container mx-auto px-4 py-10 space-y-12">
        {/* LOGO HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black italic tracking-tighter text-primary font-headline">
            AIBOT24
          </h1>
          <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-accent" />
            SISTEMA DE COMUNICACIÓN NEURONAL
          </div>
        </div>

        {/* CONTROLS ROW */}
        <div className="flex flex-col lg:flex-row items-center gap-4 max-w-6xl mx-auto">
          <Button asChild className="pill-rounded bg-primary hover:bg-primary/90 text-white h-14 px-8 text-xs font-black uppercase tracking-widest shadow-xl">
            <Link href="/agents/new">
              <Plus className="mr-2 h-5 w-5" />
              NUEVO AGENTE
            </Link>
          </Button>

          <div className="flex items-center bg-white/50 p-1.5 pill-rounded border pill-shadow">
            {["HOY", "SEMANA", "MES"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-6 py-2 text-[10px] font-black pill-rounded transition-all",
                  timeRange === range ? "bg-white shadow-md text-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                {range}
              </button>
            ))}
          </div>

          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nombre, compañía o rol..." 
              className="w-full h-14 pl-14 pill-rounded border-none bg-white pill-shadow text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* GLOBAL METRICS PILL */}
        <div className="bg-white pill-rounded border pill-shadow p-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[
              { label: "INBOUND", val: "306", icon: Phone, color: "text-primary" },
              { label: "TRANSFERS", val: "113", icon: ArrowUpRight, color: "text-secondary" },
              { label: "ABANDON", val: "29", icon: XCircle, color: "text-destructive" },
              { label: "MINUTES", val: "934", icon: Clock, color: "text-primary" },
              { label: "LATENCY", val: "1.2s", icon: Zap, color: "text-secondary" },
              { label: "TOKENS", val: "300k", icon: Database, color: "text-primary" },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-3 px-4 first:pl-0 border-r last:border-none border-border/50">
                <div className={cn("p-2 rounded-lg bg-muted/50", m.color)}>
                  <m.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{m.label}</p>
                  <p className="text-xl font-headline font-black">{m.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AGENTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {filteredAgents.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </main>
    </div>
  );
}