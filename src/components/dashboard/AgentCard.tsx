
"use client";

import { AIAgent } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Power, Trash2, Zap, Database, Mic2, MessageSquareText, PhoneIncoming, PhoneForwarded, PhoneOff, MessageCircle, ArrowRightLeft, UserX } from "lucide-react";
import { useRouter } from "next/navigation";
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
  onToggleActive?: () => void;
}

export function AgentCard({ agent, onDelete, onToggleActive }: AgentCardProps) {
  const router = useRouter();
  const isVoice = agent.type === 'voice';
  const isActive = agent.isActive !== false;

  const handleCardClick = () => {
    router.push(`/agents/${agent.id}`);
  };

  return (
    <Card 
      onClick={handleCardClick}
      className={cn(
        "card-rounded relative hover:border-secondary/40 transition-all duration-300 border-none pill-shadow overflow-hidden p-8 flex flex-col gap-6 group cursor-pointer",
        isActive ? "bg-white" : "bg-slate-200 grayscale-[0.5]"
      )}
    >
      {/* HEADER AREA */}
      <div className="flex justify-between items-start w-full">
        <div className="space-y-4">
          <div className={cn(
            "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
            isActive ? "text-muted-foreground" : "text-slate-500"
          )}>
            <div className={cn(
              "p-1.5 rounded flex items-center justify-center", 
              isActive 
                ? (isVoice ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary")
                : "bg-slate-300 text-slate-600"
            )}>
              {isVoice ? <Mic2 className="h-3 w-3" /> : <MessageSquareText className="h-3 w-3" />}
            </div>
            {isVoice ? "VOICE AGENT" : "TEXT AGENT"}
          </div>
          <div className="space-y-1">
            <h3 className={cn(
              "text-xl font-headline font-black leading-tight transition-colors",
              isActive ? "text-primary group-hover:text-secondary" : "text-slate-700"
            )}>
              {agent.name}
            </h3>
            <p className={cn(
              "text-[10px] font-black uppercase tracking-widest line-clamp-1",
              isActive ? "text-muted-foreground" : "text-slate-500"
            )}>
              {agent.personality}
            </p>
          </div>
        </div>
        
        {/* BOTONES DE ACCIÓN */}
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="outline" 
            size="icon" 
            className={cn(
              "h-9 w-9 pill-rounded border-muted transition-all",
              isActive 
                ? "bg-muted/20 hover:bg-primary hover:text-white" 
                : "bg-slate-400 text-slate-800 hover:bg-slate-500"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive?.();
            }}
          >
            <Power className="h-4 w-4" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className={cn(
                  "h-9 w-9 pill-rounded border-muted transition-all",
                  isActive 
                    ? "bg-muted/20 hover:bg-destructive hover:text-white" 
                    : "bg-slate-300 text-slate-600 hover:bg-destructive hover:text-white"
                )}
                onClick={(e) => e.stopPropagation()}
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
                <AlertDialogCancel className="rounded-xl text-[10px] font-black uppercase">
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

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 gap-3">
        <div className={cn(
          "p-3 pill-rounded border flex items-center gap-3",
          isActive ? "bg-muted/30 border-white" : "bg-slate-300/50 border-slate-400/20"
        )}>
          <div className={cn("p-1.5 rounded-full", isActive ? "bg-white text-primary" : "bg-slate-400 text-slate-700")}>
            <Zap className="h-3 w-3" />
          </div>
          <div>
            <p className={cn("text-[8px] font-black uppercase", isActive ? "text-muted-foreground" : "text-slate-600")}>
              {isVoice ? "Minutos" : "Mensajes"}
            </p>
            <p className={cn("text-sm font-headline font-black", isActive ? "text-primary" : "text-slate-800")}>
              {isVoice ? (agent.metrics.latency || "0m") : (agent.metrics.totalInteractionMetric || "0")}
            </p>
          </div>
        </div>
        <div className={cn(
          "p-3 pill-rounded border flex items-center gap-3",
          isActive ? "bg-muted/30 border-white" : "bg-slate-300/50 border-slate-400/20"
        )}>
          <div className={cn("p-1.5 rounded-full", isActive ? "bg-white text-secondary" : "bg-slate-400 text-slate-700")}>
            <Database className="h-3 w-3" />
          </div>
          <div>
            <p className={cn("text-[8px] font-black uppercase", isActive ? "text-muted-foreground" : "text-slate-600")}>Tokens</p>
            <p className={cn("text-sm font-headline font-black", isActive ? "text-secondary" : "text-slate-800")}>{agent.metrics.tokens || "0"}</p>
          </div>
        </div>
      </div>

      {/* CORE ANALYTICS ROW */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { 
            label: isVoice ? "LLAMADAS" : "CHATS", 
            val: agent.metrics.usageCount, 
            color: isActive ? "text-primary" : "text-slate-700", 
            icon: isVoice ? PhoneIncoming : MessageCircle 
          },
          { 
            label: "TRANSF", 
            val: agent.metrics.transfers || 0, 
            color: isActive ? "text-secondary" : "text-slate-700", 
            icon: isVoice ? PhoneForwarded : ArrowRightLeft 
          },
          { 
            label: "ABAND", 
            val: agent.metrics.abandoned || 0, 
            color: isActive ? "text-destructive" : "text-slate-700", 
            icon: isVoice ? PhoneOff : UserX 
          },
        ].map((m, i) => (
          <div key={i} className={cn(
            "text-center py-2 border pill-rounded flex flex-col items-center justify-center",
            isActive ? "bg-white border-border/50" : "bg-slate-100 border-slate-300"
          )}>
            <m.icon className={cn("h-3 w-3 mb-0.5", m.color)} />
            <p className={cn("text-[7px] font-black uppercase tracking-widest mb-0.5", isActive ? "text-muted-foreground" : "text-slate-500")}>{m.label}</p>
            <p className={cn("text-xs font-headline font-black", m.color)}>{m.val}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
