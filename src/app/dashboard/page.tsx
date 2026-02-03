"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { AIAgent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, TrendingUp, Users, Clock, Star, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const INITIAL_AGENTS: AIAgent[] = [
  {
    id: "1",
    name: "Aria Soporte Técnico",
    type: "voice",
    personality: "Asistente paciente y experta en tecnología diseñada para resolver problemas complejos de software.",
    responseStyle: "Concisa, instructiva y calmada.",
    initialContext: "Experta en plataformas SaaS y solución de problemas comunes.",
    createdAt: "2024-01-15T10:00:00Z",
    metrics: {
      usageCount: 1240,
      performanceRating: 4.8,
      totalInteractionMetric: 5200
    }
  },
  {
    id: "2",
    name: "Marcus Ventas Pro",
    type: "text",
    personality: "Representante de ventas energético y persuasivo especializado en cierres de alto valor.",
    responseStyle: "Cálido, atractivo y centrado en propuestas de valor.",
    initialContext: "Conocimiento extenso de características de productos y técnicas de cierre.",
    createdAt: "2024-02-01T14:30:00Z",
    metrics: {
      usageCount: 850,
      performanceRating: 4.5,
      totalInteractionMetric: 3100
    }
  },
  {
    id: "3",
    name: "Zen Guía de Meditación",
    type: "voice",
    personality: "Coach de bienestar mental relajante, consciente y profundamente empático.",
    responseStyle: "Voz suave, ritmo lento y lleno de pausas.",
    initialContext: "Conocimiento de ejercicios de respiración y técnicas de mindfulness.",
    createdAt: "2024-02-10T09:15:00Z",
    metrics: {
      usageCount: 2100,
      performanceRating: 4.9,
      totalInteractionMetric: 12400
    }
  }
];

export default function DashboardPage() {
  const [agents] = useState<AIAgent[]>(INITIAL_AGENTS);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F3F5]">
      <Navbar />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4 border-border/60">
          <div>
            <h1 className="text-xl font-headline font-bold text-[#333]">Panel de Agentes</h1>
            <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-tight">Gestión total de Voz y Texto IA</p>
          </div>
          <Button asChild size="sm" className="bg-secondary hover:bg-secondary/90 text-white font-bold h-8 px-4">
            <Link href="/agents/new">
              <Plus className="mr-1.5 h-4 w-4" />
              NUEVO AGENTE
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Activos", value: "12", icon: Users, color: "text-primary" },
            { label: "Consultas", value: "4.1k", icon: TrendingUp, color: "text-secondary" },
            { label: "T. Voz", value: "2.4m", icon: Clock, color: "text-blue-500" },
            { label: "Msjs Texto", value: "15k", icon: MessageSquare, color: "text-orange-400" },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm bg-white">
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className="text-lg font-headline font-bold leading-none">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nombre..." 
              className="pl-9 h-9 bg-white border-border rounded shadow-none text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 rounded bg-white border-border text-[10px] font-black uppercase">
            <Filter className="mr-1.5 h-3.5 w-3.5" />
            FILTROS
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAgents.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </main>
    </div>
  );
}
