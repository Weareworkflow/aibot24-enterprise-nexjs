
"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { useAgentStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const { agents, deleteAgent, toggleAgentActive } = useAgentStore();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  // Evitar errores de hidratación con Zustand persist
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleDeleteAgent = (id: string) => {
    const agentToDelete = agents.find(a => a.id === id);
    deleteAgent(id);
    
    toast({
      title: "Agente eliminado",
      description: `El agente ${agentToDelete?.name} ha sido removido correctamente.`,
    });
  };

  const handleToggleActive = (id: string) => {
    const agent = agents.find(a => a.id === id);
    if (!agent) return;
    
    const nextState = !agent.isActive;
    toggleAgentActive(id);
    
    toast({
      title: nextState ? "Agente activado" : "Agente desactivado",
      description: `El agente ${agent.name} ha sido ${nextState ? 'encendido' : 'apagado'}.`,
    });
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
              <p className="text-muted-foreground font-headline font-bold uppercase tracking-widest text-[10px]">No tienes agentes activos.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
