
"use client";

import { AIAgent } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Power, 
  Trash2, 
  Database, 
  Mic2, 
  MessageSquareText, 
  PhoneIncoming, 
  PhoneForwarded, 
  PhoneOff, 
  MessageCircle, 
  ArrowRightLeft, 
  UserX, 
  Building2,
  Clock,
  Briefcase
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useFirestore } from "@/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
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
}

export function AgentCard({ agent }: AgentCardProps) {
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  const isVoice = agent.type === 'voice';
  const isActive = agent.isActive !== false;

  const handleCardClick = () => {
    router.push(`/agents/${agent.id}`);
  };

  const handleToggleActive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!db) return;
    
    const agentRef = doc(db, "agents", agent.id);
    const nextState = !isActive;
    
    updateDoc(agentRef, { isActive: nextState })
      .then(() => {
        toast({
          title: nextState ? "Agente activado" : "Agente desactivado",
          description: `El agente ${agent.name} ha sido ${nextState ? 'encendido' : 'apagado'}.`,
        });
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: agentRef.path,
          operation: 'update',
          requestResourceData: { isActive: nextState }
        }));
      });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!db) return;
    
    const agentRef = doc(db, "agents", agent.id);
    deleteDoc(agentRef)
      .then(() => {
        toast({
          title: "Agente eliminado",
          description: `El agente ${agent.name} ha sido removido correctamente.`,
        });
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: agentRef.path,
          operation: 'delete'
        }));
      });
  };

  return (
    <Card 
      onClick={handleCardClick}
      className={cn(
        "card-rounded relative hover:scale-[1.02] transition-all duration-500 border border-slate-100 pill-shadow overflow-hidden p-8 flex flex-col gap-6 group cursor-pointer",
        isActive ? "bg-white alive-bg" : "bg-slate-50/80 grayscale-[0.8]"
      )}
    >
      <div className="flex justify-between items-start w-full">
        <div className="space-y-4 flex-1">
          {/* Header Status & Type */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
              isActive ? "text-muted-foreground" : "text-slate-500"
            )}>
              <div className={cn(
                "p-1.5 rounded-lg flex items-center justify-center premium-relief", 
                isActive 
                  ? (isVoice ? "bg-primary text-white" : "bg-secondary text-white")
                  : "bg-slate-300 text-slate-600 shadow-none"
              )}>
                {isVoice ? <Mic2 className="h-3 w-3" /> : <MessageSquareText className="h-3 w-3" />}
              </div>
              {isVoice ? "VOICE AGENT" : "TEXT AGENT"}
            </div>

            {isActive && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 animate-in fade-in zoom-in duration-700">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
                </span>
                <span className="text-[7px] font-black uppercase tracking-widest text-accent">En Línea</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h3 className={cn(
              "text-2xl font-headline font-black leading-tight transition-colors",
              isActive ? "text-primary group-hover:text-secondary" : "text-slate-700"
            )}>
              {agent.name}
            </h3>
            
            {/* Rol del Agente - Destacado en Verde */}
            <div className={cn(
              "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest py-1 px-2 rounded-md bg-accent/5 w-fit",
              isActive ? "text-accent" : "text-slate-500"
            )}>
              <Briefcase className="h-3.5 w-3.5" />
              {agent.role}
            </div>

            <div className={cn(
              "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest opacity-60 mt-1",
              isActive ? "text-muted-foreground" : "text-slate-500"
            )}>
              <Building2 className="h-3 w-3" />
              {agent.company}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="outline" 
            size="icon" 
            className={cn(
              "h-10 w-10 pill-rounded border-slate-200 transition-all premium-relief",
              isActive 
                ? "bg-white hover:bg-primary hover:text-white" 
                : "bg-slate-200 text-slate-500 hover:bg-slate-300 shadow-none"
            )}
            onClick={handleToggleActive}
          >
            <Power className="h-4 w-4" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className={cn(
                  "h-10 w-10 pill-rounded border-slate-200 transition-all premium-relief",
                  isActive 
                    ? "bg-white hover:bg-destructive hover:text-white" 
                    : "bg-slate-200 text-slate-500 hover:bg-destructive shadow-none"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl border-none p-8">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-headline font-bold text-xl">¿Eliminar este agente?</AlertDialogTitle>
                <AlertDialogDescription className="text-xs leading-relaxed">
                  Esta acción no se puede deshacer. Se eliminarán permanentemente las configuraciones de <strong>{agent.name}</strong> en la infraestructura de la nube.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-6">
                <AlertDialogCancel className="rounded-xl text-[10px] font-black uppercase h-12" onClick={(e) => e.stopPropagation()}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/90 rounded-xl text-[10px] font-black uppercase h-12"
                >
                  Confirmar Eliminación
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={cn(
          "p-4 rounded-[1.8rem] border transition-all duration-500 flex items-center gap-3 premium-relief",
          isActive ? "bg-slate-50 border-white/60" : "bg-slate-200/50 border-slate-300 shadow-none"
        )}>
          <div className={cn("p-2 rounded-full premium-relief", isActive ? "bg-white text-primary" : "bg-slate-300 text-slate-500 shadow-none")}>
            {isVoice ? <Clock className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
          </div>
          <div>
            <p className={cn("text-[8px] font-black uppercase tracking-widest", isActive ? "text-muted-foreground" : "text-slate-600")}>
              {isVoice ? "Minutos" : "Mensajes"}
            </p>
            <p className={cn("text-lg font-headline font-black", isActive ? "text-primary" : "text-slate-800")}>
              {agent.metrics.totalInteractionMetric || "0"}
            </p>
          </div>
        </div>
        <div className={cn(
          "p-4 rounded-[1.8rem] border transition-all duration-500 flex items-center gap-3 premium-relief",
          isActive ? "bg-slate-50 border-white/60" : "bg-slate-200/50 border-slate-300 shadow-none"
        )}>
          <div className={cn("p-2 rounded-full premium-relief", isActive ? "bg-white text-secondary" : "bg-slate-300 text-slate-500 shadow-none")}>
            <Database className="h-4 w-4" />
          </div>
          <div>
            <p className={cn("text-[8px] font-black uppercase tracking-widest", isActive ? "text-muted-foreground" : "text-slate-600")}>Tokens</p>
            <p className={cn("text-lg font-headline font-black", isActive ? "text-secondary" : "text-slate-800")}>{agent.metrics.tokens || "0"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
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
            "text-center py-3 border rounded-2xl flex flex-col items-center justify-center transition-all duration-500 premium-relief",
            isActive ? "bg-white border-slate-100" : "bg-slate-100 border-slate-300 shadow-none"
          )}>
            <m.icon className={cn("h-3.5 w-3.5 mb-1", m.color)} />
            <p className={cn("text-[7px] font-black uppercase tracking-[0.15em] mb-1 opacity-70", isActive ? "text-muted-foreground" : "text-slate-500")}>{m.label}</p>
            <p className={cn("text-sm font-headline font-black", m.color)}>{m.val}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
