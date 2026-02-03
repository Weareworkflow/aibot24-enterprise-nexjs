"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { AIAgent } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const INITIAL_AGENTS: AIAgent[] = [
  {
    id: "1",
    name: "AIV-SALES-MASTER",
    type: "voice",
    isActive: true,
    personality: "ESPECIALISTA VENTAS B2B",
    responseStyle: "Directo y profesional",
    initialContext: "Ventas corporativas",
    createdAt: "2024-01-15T10:00:00Z",
    metrics: {
      usageCount: 215,
      performanceRating: 4.8,
      totalInteractionMetric: 934,
      latency: "450m",
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
    isActive: true,
    personality: "SOPORTE TÉCNICO NIVEL 1",
    responseStyle: "Paciente y resolutivo",
    initialContext: "Soporte técnico de software",
    createdAt: "2024-02-01T14:30:00Z",
    metrics: {
      usageCount: 540,
      performanceRating: 4.5,
      totalInteractionMetric: 1820,
      latency: "1200m",
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
    isActive: true,
    personality: "ASISTENTE DE CITAS",
    responseStyle: "Informal pero eficiente",
    initialContext: "Gestión de calendario médico",
    createdAt: "2024-02-10T09:15:00Z",
    metrics: {
      usageCount: 1250,
      performanceRating: 4.9,
      totalInteractionMetric: 5400,
      latency: "850m",
      tokens: "450k",
      transfers: 22,
      abandoned: 5
    }
  }
];

export default function DashboardPage() {
  const [agents, setAgents] = useState<AIAgent[]>(INITIAL_AGENTS);
  const { toast } = useToast();

  const handleDeleteAgent = (id: string) => {
    const agentToDelete = agents.find(a => a.id === id);
    setAgents(prev => prev.filter(agent => agent.id !== id));
    
    toast({
      title: "Agente eliminado",
      description: `El agente ${agentToDelete?.name} ha sido removido correctamente.`,
    });
  };

  const handleToggleActive = (id: string) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id === id) {
        const newState = !agent.isActive;
        toast({
          title: newState ? "Agente activado" : "Agente desactivado",
          description: `El agente ${agent.name} ha sido ${newState ? 'encendido' : 'apagado'}.`,
        });
        return { ...agent, isActive: newState };
      }
      return agent;
    }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FB]">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {agents.map(agent => (
            <AgentCard 
              key={agent.id} 
              agent={agent} 
              onDelete={() => handleDeleteAgent(agent.id)}
              onToggleActive={() => handleToggleActive(agent.id)}
            />
          ))}
          {agents.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4">
              <p className="text-muted-foreground font-headline font-bold">No tienes agentes activos.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}