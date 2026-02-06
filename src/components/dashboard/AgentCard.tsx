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
  MessageCircle, 
  Building2,
  Clock,
  Briefcase,
  Zap,
  ArrowRight
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
        "group relative border border-slate-200/80 bg-white rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-2 cursor-pointer overflow-hidden high-volume",
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
                  ? (isVoice ? "bg-secondary/5 text-secondary border-secondary/20" : "bg-accent/5 text-accent border-accent/20")
                  : "bg-slate-100 text-slate-400 border-slate-200"
              )}>
                {isVoice ? <Phone className="h-3 w-3" /> : <MessageSquareText className="h-3 w-3" />}
                {isVoice ? "Live Voice" : "AI Chat"}
              </div>
              {isActive && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 text-white text-[8px] font-bold uppercase animate-pulse shadow-sm">
                  <Zap className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
                  Live
                </div>
              )}
            </div>
            
            <h3 className="text-2xl font-headline font-bold text-slate-800 group-hover:text-secondary transition-colors truncate">
              {agent.name}
            </h3>
            
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                {agent.role}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                {agent.company}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-10 w-10 rounded-2xl shadow-sm transition-all border border-transparent",
                isActive ? "bg-slate-50 border-slate-100 hover:bg-slate-900 hover:text-white" : "bg-slate-100 text-slate-400"
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
                  className="h-10 w-10 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-destructive hover:text-white transition-all shadow-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[3rem] border-none p-10 shadow-2xl bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-headline font-bold text-2xl text-center">Protocolo de Eliminación</AlertDialogTitle>
                  <AlertDialogDescription className="text-center text-slate-500 py-4 uppercase font-bold tracking-widest text-[10px]">
                    ¿Confirmas la desconexión total de <span className="text-slate-900 font-black">{agent.name}</span>? Esta acción es irreversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-8 flex gap-4 sm:justify-center">
                  <AlertDialogCancel className="rounded-full text-[10px] font-black uppercase h-14 flex-1 border-slate-200">Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90 rounded-full text-[10px] font-black uppercase h-14 flex-1 shadow-lg shadow-destructive/20"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 flex items-center gap-4 transition-all hover:bg-white hover:shadow-md hover:border-slate-200">
            <div className={cn("p-2.5 rounded-2xl shadow-sm", isActive ? "bg-primary text-white" : "bg-slate-200 text-slate-400")}>
              {isVoice ? <Clock className="h-4.5 w-4.5" /> : <MessageCircle className="h-4.5 w-4.5" />}
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{isVoice ? "Minutos" : "Msgs"}</p>
              <p className="text-xl font-headline font-bold text-slate-800">{agent.metrics.totalInteractionMetric || 0}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 flex items-center gap-4 transition-all hover:bg-white hover:shadow-md hover:border-slate-200">
            <div className={cn("p-2.5 rounded-2xl shadow-sm", isActive ? "bg-secondary text-white" : "bg-slate-200 text-slate-400")}>
              <Database className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Tokens</p>
              <p className="text-xl font-headline font-bold text-slate-800">{agent.metrics.tokens || 0}</p>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="text-center">
              <span className="block text-[7px] font-black uppercase text-muted-foreground mb-0.5">Rating</span>
              <span className="text-xs font-bold text-primary">{agent.metrics.performanceRating}%</span>
            </div>
            <div className="text-center">
              <span className="block text-[7px] font-black uppercase text-muted-foreground mb-0.5">Transf.</span>
              <span className="text-xs font-bold text-secondary">{agent.metrics.transfers || 0}</span>
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