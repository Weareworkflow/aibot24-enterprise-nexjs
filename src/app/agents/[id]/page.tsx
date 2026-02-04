"use client";

import { use, useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AIAgent } from "@/lib/types";
import { AgentChat } from "@/components/agents/AgentChat";
import { 
  ArrowLeft, 
  Database, 
  MessageCircle, 
  ArrowRightLeft, 
  UserX, 
  Building2, 
  Target, 
  UserRound, 
  Sparkles,
  Settings2,
  Code2,
  Share2,
  Smartphone,
  Calendar,
  LayoutGrid,
  FilePlus,
  Search,
  Cloud,
  PhoneCall,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useDoc, useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from "@/hooks/use-toast";

export default function AgentConsolePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const agentId = resolvedParams.id;
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const agentRef = useMemo(() => {
    if (!db || !agentId) return null;
    return doc(db, "agents", agentId);
  }, [db, agentId]);

  const { data: agent, loading } = useDoc<AIAgent>(agentRef);

  const toggleIntegration = (title: string) => {
    if (!agentRef || !agent) return;
    
    const newIntegrations = {
      ...(agent.integrations || {}),
      [title]: !agent.integrations?.[title]
    };

    updateDoc(agentRef, { integrations: newIntegrations })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: agentRef.path,
          operation: 'update',
          requestResourceData: { integrations: newIntegrations }
        }));
      });
  };

  if (loading) return (
    <div className="flex flex-col min-h-screen bg-[#F0F3F5]">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cargando Unidad de Inteligencia...</p>
      </div>
    </div>
  );

  if (!agent) return (
    <div className="flex flex-col min-h-screen bg-[#F0F3F5]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="p-8 text-center font-black uppercase tracking-widest text-muted-foreground animate-pulse">
          Agente no encontrado en el sistema
        </div>
      </div>
    </div>
  );

  const isVoice = agent.type === 'voice';

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F3F5]">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        {/* Header Minimalista */}
        <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-3xl border shadow-sm">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 flex items-center justify-center bg-muted rounded-full hover:bg-muted/80"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-headline font-bold">{agent.name}</h1>
                <Badge className={cn("border-none text-[9px] font-black h-4 uppercase", isVoice ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary")}>
                  {isVoice ? 'MODO VOZ' : 'MODO TEXTO'}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">ID: {agent.id} • {agent.company}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Izquierda: Información y Configuración */}
          <div className="lg:col-span-7 space-y-6">
            <Tabs defaultValue="identidad" className="w-full">
              <div className="flex mb-6 overflow-x-auto pb-2 scrollbar-hide">
                <TabsList className="bg-white border pill-rounded h-12 p-1 gap-1 shadow-sm shrink-0">
                  <TabsTrigger 
                    value="identidad" 
                    className="pill-rounded h-10 px-6 data-[state=active]:bg-secondary data-[state=active]:text-white text-[10px] font-black uppercase tracking-[0.1em] gap-2 transition-all"
                  >
                    <Settings2 className="h-3.5 w-3.5" /> Identidad
                  </TabsTrigger>
                  <TabsTrigger 
                    value="instrucciones" 
                    className="pill-rounded h-10 px-6 data-[state=active]:bg-secondary data-[state=active]:text-white text-[10px] font-black uppercase tracking-[0.1em] gap-2 transition-all"
                  >
                    <Code2 className="h-3.5 w-3.5" /> Instrucciones
                  </TabsTrigger>
                  <TabsTrigger 
                    value="integraciones" 
                    className="pill-rounded h-10 px-6 data-[state=active]:bg-secondary data-[state=active]:text-white text-[10px] font-black uppercase tracking-[0.1em] gap-2 transition-all"
                  >
                    <Share2 className="h-3.5 w-3.5" /> Integraciones
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="identidad" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Card className="shadow-sm border-none bg-white rounded-[2rem]">
                  <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                          <UserRound className="h-3 w-3" /> Nombre de la Unidad
                        </div>
                        <p className="text-sm font-bold border-b pb-2">{agent.name}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                          <Sparkles className="h-3 w-3" /> Cargo / Función
                        </div>
                        <p className="text-sm font-bold border-b pb-2">{agent.role}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                          <Building2 className="h-3 w-3" /> Empresa
                        </div>
                        <p className="text-sm font-bold border-b pb-2">{agent.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instrucciones" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Card className="shadow-sm border-none bg-white rounded-[2rem]">
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                        <Target className="h-3 w-3" /> Objetivo Crítico
                      </div>
                      <p className="text-sm font-bold border-b pb-2">{agent.objective}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                        Tono de Comunicación / Personalidad
                      </div>
                      <p className="text-xs p-4 bg-muted/40 rounded-2xl border italic leading-relaxed">{agent.tone}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                        Cerebro del Agente (Base de Conocimiento)
                      </div>
                      <div className="min-h-[200px] p-6 bg-muted/30 rounded-3xl border-dashed border-2 text-[10px] leading-relaxed font-mono whitespace-pre-wrap">
                        {agent.knowledge}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="integraciones" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Card className="shadow-sm border-none bg-white rounded-[2rem]">
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { title: "WhatsApp Business", icon: Smartphone },
                        { title: "Calendario Bitrix24", icon: Calendar },
                        { title: "Catálogo Bitrix24", icon: LayoutGrid },
                        { title: "Documentos Bitrix24", icon: FilePlus },
                        { title: "Analizador Documento", icon: Search },
                        { title: "Drive Bitrix24", icon: Cloud },
                        { title: "Calls API", icon: PhoneCall },
                      ].map((int, i) => (
                        <div 
                          key={i} 
                          className="flex items-center justify-between p-4 border rounded-3xl hover:bg-muted/30 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2.5 rounded-2xl transition-colors",
                              agent.integrations?.[int.title] ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"
                            )}>
                              <int.icon className="h-4 w-4" />
                            </div>
                            <span className={cn("text-xs font-bold", !agent.integrations?.[int.title] && "text-muted-foreground")}>
                              {int.title}
                            </span>
                          </div>
                          <Switch 
                            checked={agent.integrations?.[int.title] || false} 
                            onCheckedChange={() => toggleIntegration(int.title)}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Columna Derecha: Optimizador AI (Chat) */}
          <div className="lg:col-span-5 h-[650px] sticky top-24">
            <AgentChat agent={agent} />
          </div>
        </div>
      </main>
    </div>
  );
}
