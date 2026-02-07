"use client";

import { useRef } from "react";
import { AIAgent } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Settings2,
  Share2,
  ArrowLeft
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { IntegrationModals } from "./IntegrationModals";
import { IdentitySection } from "./AgentChat/IdentitySection";
import { IntegrationsSection } from "./AgentChat/IntegrationsSection";
import { useUIStore } from "@/lib/store";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface AgentChatProps {
  agent: AIAgent;
}

export function AgentChat({ agent }: AgentChatProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { updateAgentLocal } = useUIStore();

  const handleManualUpdate = (field: string, value: any, title?: string) => {
    if (!db || !agent) return;
    
    updateAgentLocal(agent.id, { [field]: value });

    const agentRef = doc(db, "agents", agent.id);
    updateDoc(agentRef, { [field]: value })
      .then(() => {
        if (title) {
          toast({ title: "Sincronizado", description: `${title} actualizado en tiempo real.` });
        }
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: agentRef.path,
          operation: 'update',
          requestResourceData: { [field]: value }
        }));
      });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-none high-volume">
      {/* Header Integrado Nítido */}
      <div className="p-6 border-b bg-white flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-11 w-11 flex items-center justify-center bg-slate-50 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-headline font-bold text-slate-900">{agent.name}</h1>
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
          <Accordion type="single" collapsible defaultValue="identidad" className="w-full">
            <AccordionItem value="identidad" className="border-b-0 px-4">
              <AccordionTrigger className="hover:no-underline py-8 group border-b border-slate-50">
                <div className="flex items-center gap-5 text-[13px] font-black uppercase tracking-[0.2em] text-secondary transition-colors">
                  <div className="h-12 w-12 rounded-[1.2rem] bg-slate-50 flex items-center justify-center group-data-[state=open]:bg-secondary group-data-[state=open]:text-white transition-all shadow-sm border border-slate-100">
                    <Settings2 className="h-6 w-6" />
                  </div>
                  Identidad
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-10 pt-6 animate-in fade-in slide-in-from-top-2">
                <IdentitySection agent={agent} onUpdate={handleManualUpdate} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="integraciones" className="border-b-0 px-4">
              <AccordionTrigger className="hover:no-underline py-8 group">
                <div className="flex items-center gap-5 text-[13px] font-black uppercase tracking-[0.2em] text-secondary transition-colors">
                  <div className="h-12 w-12 rounded-[1.2rem] bg-slate-50 flex items-center justify-center group-data-[state=open]:bg-secondary group-data-[state=open]:text-white transition-all shadow-sm border border-slate-100">
                    <Share2 className="h-6 w-6" />
                  </div>
                  Integraciones
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-10 pt-6 animate-in fade-in slide-in-from-top-2">
                <IntegrationsSection 
                  agent={agent} 
                  onUpdate={handleManualUpdate} 
                  onOpenModal={setActiveModal} 
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>

      <IntegrationModals 
        agent={agent} 
        activeModal={activeModal} 
        onClose={() => setActiveModal(null)} 
        onSave={handleManualUpdate}
        onApiUpdate={(endpoints) => handleManualUpdate('apiEndpoints', endpoints)}
      />
    </div>
  );
}
