
"use client";

import { AIAgent } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Power, 
  Trash2, 
  Database, 
  Phone, 
  MessageSquareText, 
  PhoneIncoming, 
  PhoneForwarded, 
  PhoneOff, 
  MessageCircle, 
  ArrowRightLeft, 
  UserX, 
  Building2,
  Clock,
  Briefcase,
  Zap
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
          title: nextState ? "Agente Activado" : "Agente Suspendido",
          description: `La unidad ${agent.name} ha cambiado su estado operativo.`,
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
          title: "Protocolo de Eliminación",
          description: `El agente ${agent.name} ha sido removido de la flota.`,
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
        "card-rounded relative hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 border-none pill-shadow overflow-hidden p-8 flex flex-col gap-6 group cursor-pointer bg-white",
        !isActive && "grayscale-[0.5] opacity-85 bg-slate-50/50"
      )}
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-secondary/10 transition-colors" />

      <div className="flex justify-between items-start w-full relative z-10">
        <div className="space-y-4 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className={cn(
              "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm",
              isActive 
                ? (isVoice ? "bg-secondary/10 text-secondary border-secondary/20" : "bg-accent/10 text-accent border-accent/20")
                : "bg-slate-200 text-slate-500 border-slate-300"
            )}>
              {isVoice ? <Phone className="h-3 w-3" /> : <MessageSquareText className="h-3 w-3" />}
              <span>{isVoice ? "Live Mode" : "Chat Mode"}</span>
            </div>

            {isActive && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest shadow-lg">
                <Zap className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
                Active
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h3 className={cn(
              "text-2xl font-headline font-bold leading-tight transition-colors truncate",
              isActive ? "text-primary group-hover:text-secondary" : "text-slate-600"
            )}>
              {agent.name}
            </h3>
            
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
              <Briefcase className="h-3 w-3" />
              {agent.role}
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
              <Building2 className="h-3 w-3" />
              {agent.company}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 flex-shrink-0 ml-4" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-10 w-10 pill-rounded transition-all",
              isActive 
                ? "bg-slate-100 hover:bg-slate-900 hover:text-white" 
                : "bg-slate-200 text-slate-500 hover:bg-slate-300"
            )}
            onClick={handleToggleActive}
          >
            <Power className="h-4 w-4" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 pill-rounded bg-slate-100 hover:bg-destructive hover:text-white transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem] border-none p-10 shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-headline font-bold text-xl text-center">Eliminar Agente</AlertDialogTitle>
                <AlertDialogDescription className="text-xs leading-relaxed text-center py-2 uppercase font-bold tracking-widest opacity-60">
                  ¿Confirmas la desconexión total de <strong>{agent.name}</strong>? Esta acción es irreversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-8 flex gap-3 sm:justify-center">
                <AlertDialogCancel className="pill-rounded text-[10px] font-black uppercase h-12 flex-1" onClick={(e) => e.stopPropagation()}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/90 pill-rounded text-[10px] font-black uppercase h-12 flex-1"
                >
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center gap-4 premium-relief">
          <div className={cn("p-2 rounded-xl", isActive ? "bg-primary text-white" : "bg-slate-300")}>
            {isVoice ? <Clock className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
              {isVoice ? "Minutes" : "Messages"}
            </p>
            <p className="text-lg font-headline font-bold text-primary">
              {agent.metrics.totalInteractionMetric || "0"}
            </p>
          </div>
        </div>
        <div className="p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center gap-4 premium-relief">
          <div className={cn("p-2 rounded-xl", isActive ? "bg-secondary text-white" : "bg-slate-300")}>
            <Database className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Tokens</p>
            <p className="text-lg font-headline font-bold text-secondary">{agent.metrics.tokens || "0"}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 opacity-60">
        <div className="flex flex-col items-center">
          <span className="text-[7px] font-black uppercase tracking-widest mb-1">Success</span>
          <span className="text-xs font-bold text-primary">{agent.metrics.performanceRating}%</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[7px] font-black uppercase tracking-widest mb-1">Transfers</span>
          <span className="text-xs font-bold text-secondary">{agent.metrics.transfers || 0}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[7px] font-black uppercase tracking-widest mb-1">Abandoned</span>
          <span className="text-xs font-bold text-destructive">{agent.metrics.abandoned || 0}</span>
        </div>
      </div>
    </Card>
  );
}
