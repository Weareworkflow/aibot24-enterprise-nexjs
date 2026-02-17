
"use client";

import { AIAgent, AgentMetrics } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Power,
  Trash2,
  Database,
  MessageSquareText,
  MessageCircle,
  Building2,
  Briefcase,
  Zap,
  ArrowRight,
  Calendar,
  ArrowRightLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useFirestore, useDoc } from "@/firebase";
import { doc, updateDoc, deleteDoc, DocumentReference } from "firebase/firestore";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AgentCardProps {
  agent: AIAgent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  const isActive = agent.isActive !== false;

  // Real-time metrics subscription
  const { data: metrics } = useDoc<AgentMetrics>(
    db ? (doc(db, "metrics", agent.id) as DocumentReference<AgentMetrics>) : null
  );

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
          title: nextState ? "Protocolo Activado" : "Unidad en Espera",
          description: `El estado de ${agent.name} ha sido sincronizado.`,
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
          title: "Unidad Desconectada",
          description: `El agente ${agent.name} ha sido eliminado de la flota.`,
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
        "group relative border border-border/80 bg-card text-card-foreground rounded-[2.5rem] p-7 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer overflow-hidden high-volume",
        !isActive && "opacity-80 grayscale-[0.2]"
      )}
    >
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors",
                isActive
                  ? "bg-accent/10 text-accent border-accent/20"
                  : "bg-muted text-muted-foreground border-border"
              )}>
                <MessageSquareText className="h-3 w-3" />
                AI Chat Bot
              </div>
              {isActive && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-foreground text-background text-[8px] font-bold uppercase animate-pulse shadow-sm">
                  <Zap className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
                  Activo
                </div>
              )}
            </div>


            <div className="flex items-center gap-4 mb-2">
              <Avatar className="h-12 w-12 border-2 border-border/50 shadow-sm">
                <AvatarImage src={agent.avatar} className="object-cover" />
                <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                  {agent.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-2xl font-headline font-bold text-foreground group-hover:text-secondary transition-colors truncate">
                {agent.name}
              </h3>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <Briefcase className="h-3.5 w-3.5" />
                {agent.role}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <Building2 className="h-3.5 w-3.5" />
                {agent.company}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-2xl shadow-sm transition-all border border-border/50",
                isActive ? "bg-muted hover:bg-foreground hover:text-background" : "bg-muted text-muted-foreground"
              )}
              onClick={handleToggleActive}
            >
              <Power className="h-4.5 w-4.5" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-2xl bg-muted border border-border/50 hover:bg-destructive hover:text-destructive-foreground transition-all shadow-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[3rem] border-none p-10 shadow-2xl bg-card">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-headline font-bold text-2xl text-center">Protocolo de Eliminación</AlertDialogTitle>
                  <AlertDialogDescription className="text-center text-muted-foreground py-4 uppercase font-bold tracking-widest text-[10px]">
                    ¿Confirmas la desconexión total de <span className="text-foreground font-black">{agent.name}</span>? Esta acción es irreversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-8 flex gap-4 sm:justify-center">
                  <AlertDialogCancel className="rounded-full text-[10px] font-black uppercase h-14 flex-1">Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full text-[10px] font-black uppercase h-14 flex-1 shadow-lg shadow-destructive/20"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>


        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-muted/30 p-2.5 rounded-[1.2rem] border border-border/50 flex flex-col items-center justify-center text-center gap-1 transition-all hover:bg-card hover:shadow-md hover:border-border h-20">
            <div className={cn("h-6 w-6 rounded-md flex items-center justify-center shadow-sm", isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
              <MessageCircle className="h-3 w-3" />
            </div>
            <div>
              <p className="text-[6px] font-black uppercase tracking-widest text-muted-foreground">Messages</p>
              <p className="text-sm font-headline font-bold text-foreground leading-none">{metrics?.totalInteractionMetric || 0}</p>
            </div>
          </div>
          <div className="bg-muted/30 p-2.5 rounded-[1.2rem] border border-border/50 flex flex-col items-center justify-center text-center gap-1 transition-all hover:bg-card hover:shadow-md hover:border-border h-20">
            <div className={cn("h-6 w-6 rounded-md flex items-center justify-center shadow-sm", isActive ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground")}>
              <Calendar className="h-3 w-3" />
            </div>
            <div>
              <p className="text-[6px] font-black uppercase tracking-widest text-muted-foreground">Meet</p>
              <p className="text-sm font-headline font-bold text-foreground leading-none">{metrics?.meetings || 0}</p>
            </div>
          </div>
          <div className="bg-muted/30 p-2.5 rounded-[1.2rem] border border-border/50 flex flex-col items-center justify-center text-center gap-1 transition-all hover:bg-card hover:shadow-md hover:border-border h-20">
            <div className={cn("h-6 w-6 rounded-md flex items-center justify-center shadow-sm", isActive ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground")}>
              <ArrowRightLeft className="h-3 w-3" />
            </div>
            <div>
              <p className="text-[6px] font-black uppercase tracking-widest text-muted-foreground">Transfer</p>
              <p className="text-sm font-headline font-bold text-foreground leading-none">{metrics?.transfers || 0}</p>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-border/50 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="text-center">
              <span className="block text-[7px] font-black uppercase text-muted-foreground mb-0.5">Rating</span>
              <span className="text-xs font-bold text-foreground">{metrics?.performanceRating || 0}%</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-secondary group-hover:translate-x-1 transition-transform">
            Abrir Consola <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </Card>
  );
}
