"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { VoiceAgent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Filter, TrendingUp, Users, Clock, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const INITIAL_AGENTS: VoiceAgent[] = [
  {
    id: "1",
    name: "Aria Soporte Técnico",
    personality: "Asistente paciente y experta en tecnología diseñada para resolver problemas complejos de software.",
    responseStyle: "Concisa, instructiva y calmada.",
    initialContext: "Experta en plataformas SaaS y solución de problemas comunes.",
    createdAt: "2024-01-15T10:00:00Z",
    metrics: {
      usageCount: 1240,
      performanceRating: 4.8,
      totalChatTime: 5200
    }
  },
  {
    id: "2",
    name: "Marcus Ventas Pro",
    personality: "Representante de ventas energético y persuasivo especializado en cierres de alto valor.",
    responseStyle: "Cálido, atractivo y centrado en propuestas de valor.",
    initialContext: "Conocimiento extenso de características de productos y técnicas de cierre.",
    createdAt: "2024-02-01T14:30:00Z",
    metrics: {
      usageCount: 850,
      performanceRating: 4.5,
      totalChatTime: 3100
    }
  },
  {
    id: "3",
    name: "Zen Guía de Meditación",
    personality: "Coach de bienestar mental relajante, consciente y profundamente empático.",
    responseStyle: "Voz suave, ritmo lento y lleno de pausas.",
    initialContext: "Conocimiento de ejercicios de respiración y técnicas de mindfulness.",
    createdAt: "2024-02-10T09:15:00Z",
    metrics: {
      usageCount: 2100,
      performanceRating: 4.9,
      totalChatTime: 12400
    }
  }
];

export default function DashboardPage() {
  const [agents] = useState<VoiceAgent[]>(INITIAL_AGENTS);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7F8]">
      <Navbar />
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-headline font-bold text-[#333]">Escritorio de Agentes</h1>
            <p className="text-sm text-muted-foreground font-medium">Gestiona y monitorea tus agentes de voz inteligentes.</p>
          </div>
          <Button asChild className="rounded-md h-10 px-6 bg-secondary hover:bg-secondary/90 shadow-sm font-bold text-xs uppercase tracking-wider">
            <Link href="/agents/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Nuevo Agente
            </Link>
          </Button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Agentes Activos", value: "12", icon: Users, color: "text-primary" },
            { label: "Sesiones Hoy", value: "4,190", icon: TrendingUp, color: "text-secondary" },
            { label: "Resolución Prom.", value: "2.4m", icon: Clock, color: "text-blue-500" },
            { label: "Satisfacción", value: "4.82/5", icon: Star, color: "text-orange-400" },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm overflow-hidden bg-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-2xl font-headline font-bold text-[#333]">{stat.value}</p>
                </div>
                <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nombre..." 
              className="pl-10 h-10 bg-white border-border rounded-md shadow-sm text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="h-10 px-4 rounded-md border-border bg-white text-xs font-bold uppercase">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {filteredAgents.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
          {filteredAgents.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4 bg-white rounded-xl border border-dashed border-border">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-headline font-semibold text-[#333]">No se encontraron agentes</h3>
                <p className="text-sm text-muted-foreground">Prueba ajustando tu búsqueda o crea uno nuevo.</p>
              </div>
              <Button asChild variant="outline" className="font-bold">
                <Link href="/agents/new">Crear mi primer agente</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}