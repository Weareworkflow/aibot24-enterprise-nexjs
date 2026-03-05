"use client";

import { useRef } from "react";
import { AIAgent } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BrainCircuit,
  Settings2,
  ArrowLeft,
  Calendar,
  Database
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useToast } from "@/hooks/use-toast";

import { IdentitySection } from "./AgentChat/IdentitySection";
import { SystemPromptSection } from "./AgentChat/SystemPromptSection";
import { IntegrationSection } from "./AgentChat/IntegrationSection";
import { AdvancedFieldsSection } from "./AgentChat/AdvancedFieldsSection";

import { useUIStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@remix-run/react";

interface AgentChatProps {
  agent: AIAgent;
}

export function AgentChat({ agent }: AgentChatProps) {

  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateAgentLocal } = useUIStore();

  const handleManualUpdate = async (updates: Partial<AIAgent>, title?: string) => {
    if (!agent) return;

    // Actualizar estado local inmediatamente para feedback visual
    updateAgentLocal(agent.id, updates);

    try {
      // 1. Sincronizar con MongoDB vía API
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Fallo al actualizar en la base de datos");

      if (title) {
        toast({ title: "Sincronizado", description: `${title} actualizado en tiempo real.` });
      }

      // La sincronización con Bitrix ahora se maneja en el servidor (PUT /api/agents/${agent.id})
    } catch (error: any) {
      console.error("Update Error:", error);
      toast({
        variant: "destructive",
        title: "Error de Sincronización",
        description: error.message || "No se pudo actualizar el agente."
      });
    }
  };

  return (
    <div className="flex flex-col bg-card rounded-[2.5rem] shadow-2xl border-none high-volume">
      {/* Header Integrado Nítido */}
      <div className="p-6 border-b bg-card flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 flex items-center justify-center bg-muted/50 rounded-2xl hover:bg-foreground hover:text-background transition-all shadow-sm border border-border"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-12 w-12 border-2 border-border/50 shadow-sm">
            <AvatarImage src={agent.avatar} className="object-cover" />
            <AvatarFallback className="bg-muted text-muted-foreground font-bold">
              {agent.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-headline font-bold text-foreground">{agent.name}</h1>
              <Badge className="border-none text-[9px] font-black h-5 uppercase bg-accent/10 text-accent px-3 tracking-widest">
                UNIDAD ACTIVA
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.15em] mt-1">
              ID: {agent.id} • {agent.company} • {agent.role}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex flex-col p-6">
          <Tabs defaultValue="identidad" className="w-full">
            <TabsList className="grid w-full h-14 p-1.5 bg-card/50 backdrop-blur-xl border border-border/40 rounded-[1.5rem] shadow-sm mb-8 grid-cols-4">
              <TabsTrigger
                value="identidad"
                className="rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg"
              >
                <Settings2 className="h-4 w-4" />
                Identidad
              </TabsTrigger>
              <TabsTrigger
                value="system-prompt"
                className="rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg"
              >
                <BrainCircuit className="h-4 w-4" />
                System Prompt
              </TabsTrigger>
              <TabsTrigger
                value="integration"
                className="rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg"
              >
                <Calendar className="h-4 w-4" />
                Integración
              </TabsTrigger>
              <TabsTrigger
                value="advanced-fields"
                className="rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg"
              >
                <Database className="h-4 w-4" />
                Campos Avanzados
              </TabsTrigger>
            </TabsList>

            <TabsContent value="identidad" className="mt-0 focus-visible:outline-none">
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <IdentitySection agent={agent} onUpdate={handleManualUpdate} />
              </div>
            </TabsContent>

            <TabsContent value="system-prompt" className="mt-0 focus-visible:outline-none">
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <SystemPromptSection
                  agent={agent}
                  onUpdate={handleManualUpdate}
                />
              </div>
            </TabsContent>

            <TabsContent value="integration" className="mt-0 focus-visible:outline-none">
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <IntegrationSection
                  agent={agent}
                  onUpdate={handleManualUpdate}
                />
              </div>
            </TabsContent>

            <TabsContent value="advanced-fields" className="mt-0 focus-visible:outline-none">
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <AdvancedFieldsSection
                  agent={agent}
                  onUpdate={handleManualUpdate}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}