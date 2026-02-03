"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { AIAgent } from "@/lib/types";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
      totalInteractionMetric: 934,
      latency: "1.2s",
      tokens: "120k",
      transfers: 45,
      abandoned: 12
    },
    feedback: ["Excelente capacidad de cierre", "Tono muy profesional"]
  },
  {
    id: "2",
    name: "SUPPORT-CORE-01",
    type: "voice",
    personality: "SOPORTE TÉCNICO NIVEL 1",
    responseStyle: "Paciente y resolutivo",
    initialContext: "Soporte técnico de software",
    createdAt: "2024-02-01T14:30:00Z",
    metrics: {
      usageCount: 540,
      performanceRating: 4.5,
      totalInteractionMetric: 1820,
      latency: "0.8s",
      tokens: "245k",
      transfers: 112,
      abandoned: 9
    },
    feedback: ["Resuelve dudas rápido", "Muy amable"]
  },
  {
    id: "3",
    name: "WHATSAPP-BOT-PRO",
    type: "text",
    personality: "ASISTENTE DE CITAS",
    responseStyle: "Informal pero eficiente",
    initialContext: "Gestión de calendario médico",
    createdAt: "2024-02-10T09:15:00Z",
    metrics: {
      usageCount: 1250,
      performanceRating: 4.9,
      totalInteractionMetric: 5400,
      latency: "0.4s",
      tokens: "450k",
      transfers: 22,
      abandoned: 5
    }
  }
];

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAgents = INITIAL_AGENTS.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FB]">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* COMPACT SEARCH AREA */}
        <div className="max-w-6xl mx-auto">
          <div className="relative w-full max-w-md ml-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nombre de agente..." 
              className="w-full h-11 pl-11 pill-rounded border-none bg-white pill-shadow text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
