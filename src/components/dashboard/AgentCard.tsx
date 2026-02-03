"use client";

import { AIAgent } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Power, Trash2, Zap, Database, Mic2, MessageSquareText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AgentCardProps {
  agent: AIAgent;
  onDelete?: () => void;
}

export function AgentCard({ agent, onDelete }: AgentCardProps) {
  const isVoice = agent.type === 'voice';

  return (
    <div className="block group relative">
      {/* Invisible link overlay for the whole card */}
      <Link href={`/agents/${agent.id}`} className="absolute inset-0 z-0" />
      
      <Card className="card-rounded hover:border-secondary/40 transition-all duration-300 border-none bg-white pill-shadow overflow-hidden p-8 flex flex-col gap-6 relative z-10 pointer-events-none">
        {/* HEADER AREA */}
        <div className="flex justify-between items-start w-full">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              <div className={cn("p-1.5 rounded flex items-center justify-center", isVoice ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary")}>
                {isVoice ? <Mic2 className="h-3 w-3" /> : <MessageSquareText className="h-3 w-3" />}
              </div>
              {isVoice ? "VOICE AGENT" : "TEXT AGENT"}
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-headline font-black text-primary leading-tight group-hover:text-secondary transition-colors">
                {agent.name}
              </h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest line-clamp-1">
                {agent.personality}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 pointer-events-auto">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-9 w-9 pill-rounded border-muted bg-muted/20 hover:bg-primary hover:text-white transition-all"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Power className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9 pill-rounded border-muted bg-muted/20 hover:bg-destructive hover:text-white transition-all"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl border-none">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-headline font-bold">¿Eliminar este agente?</AlertDialogTitle>
                  <AlertDialogDescription className="text-xs">
                    Esta acción no se puede deshacer. Se eliminarán permanentemente las configuraciones y métricas de <strong>{agent.name}</strong>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel 
                    className="rounded-xl text-[10px] font-black uppercase"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.();
                    }}
                    className="bg-destructive hover:bg-destructive/90 rounded-xl text-[10px] font-black uppercase"
                  >
                    Confirmar Eliminación
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* METRICS GRID (COMPACT) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/30 pill-rounded border border-white flex items-center gap-3">
            <div className="p-1.5 bg-white rounded-full text-primary">
              <Zap className="h-3 w-3" />
            </div>
            <div>
              <p className="text-[8px] font-black text-muted-foreground uppercase">Latencia</p>
              <p className="text-sm font-headline font-black text-primary">{agent.metrics.latency || "0.0s"}</p>
            </div>
          </div>
          <div className="p-3 bg-muted/30 pill-rounded border border-white flex items-center gap-3">
            <div className="p-1.5 bg-white rounded-full text-secondary">
              <Database className="h-3 w-3" />
            </div>
            <div>
              <p className="text-[8px] font-black text-muted-foreground uppercase">Tokens</p>
              <p className="text-sm font-headline font-black text-secondary">{agent.metrics.tokens || "0"}</p>
            </div>
          </div>
        </div>

        {/* CORE ANALYTICS ROW */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "INBOUND", val: agent.metrics.usageCount, color: "text-primary" },
            { label: "TRANSF", val: agent.metrics.transfers || 0, color: "text-secondary" },
            { label: "ABAND", val: agent.metrics.abandoned || 0, color: "text-destructive" },
          ].map((m, i) => (
            <div key={i} className="text-center py-2.5 bg-white border border-border/50 pill-rounded">
              <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">{m.label}</p>
              <p className={cn("text-xs font-headline font-black", m.color)}>{m.val}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
