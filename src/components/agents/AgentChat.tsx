"use client";

import { useRef } from "react";
import { AIAgent } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Settings2,
  ArrowLeft
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

import { IdentitySection } from "./AgentChat/IdentitySection";
import { SystemPromptSection } from "./AgentChat/SystemPromptSection";



import { useUIStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface AgentChatProps {
  agent: AIAgent;
}

export function AgentChat({ agent }: AgentChatProps) {

  const scrollRef = useRef<HTMLDivElement>(null);
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { updateAgentLocal } = useUIStore();



  const handleManualUpdate = (updates: Partial<AIAgent>, title?: string) => {
    if (!db || !agent) return;

    updateAgentLocal(agent.id, updates);

    const agentRef = doc(db, "agents", agent.id);
    updateDoc(agentRef, updates)
      .then(() => {
        if (title) {
          toast({ title: "Sincronizado", description: `${title} actualizado en tiempo real.` });
        }
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: agentRef.path,
          operation: 'update',
          requestResourceData: updates
        }));
      });
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-[2.5rem] overflow-hidden shadow-2xl border-none high-volume">
      {/* Header Integrado Nítido */}
      <div className="p-6 border-b bg-card flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 flex items-center justify-center bg-muted/50 rounded-2xl hover:bg-foreground hover:text-background transition-all shadow-sm border border-border"
            onClick={() => router.push('/')}
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

      <ScrollArea className="flex-1 modern-scroll" ref={scrollRef}>
        <div className="flex flex-col p-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="identidad" className="border-b-0 px-4">
              <AccordionTrigger className="hover:no-underline py-8 group border-b border-border/40">
                <div className="flex items-center gap-5 text-[13px] font-black uppercase tracking-[0.2em] text-secondary transition-colors">
                  <div className="h-12 w-12 rounded-[1.2rem] bg-muted/50 flex items-center justify-center group-data-[state=open]:bg-secondary group-data-[state=open]:text-white transition-all shadow-sm border border-border/40">
                    <Settings2 className="h-6 w-6" />
                  </div>
                  Identidad
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-10 pt-6 animate-in fade-in slide-in-from-top-2">
                <IdentitySection agent={agent} onUpdate={handleManualUpdate} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="system-prompt" className="border-b-0 px-4">
              <AccordionTrigger className="hover:no-underline py-8 group">
                <div className="flex items-center gap-5 text-[13px] font-black uppercase tracking-[0.2em] text-secondary transition-colors">
                  <div className="h-12 w-12 rounded-[1.2rem] bg-muted/50 flex items-center justify-center group-data-[state=open]:bg-secondary group-data-[state=open]:text-white transition-all shadow-sm border border-border/40">
                    <Settings2 className="h-6 w-6" />
                  </div>
                  System Prompt
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-10 pt-6 animate-in fade-in slide-in-from-top-2">
                <SystemPromptSection
                  agent={agent}
                  onUpdate={handleManualUpdate}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>


    </div>
  );
}