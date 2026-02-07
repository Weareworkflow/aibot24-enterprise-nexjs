
"use client";

import { useRef } from "react";
import { AIAgent } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Settings2,
  Share2
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

interface AgentChatProps {
  agent: AIAgent;
}

export function AgentChat({ agent }: AgentChatProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const db = useFirestore();
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
    <div className="flex flex-col h-full glass-card rounded-[2.5rem] overflow-hidden shadow-2xl border-none bg-white">
      <ScrollArea className="flex-1 modern-scroll" ref={scrollRef}>
        <div className="flex flex-col p-4">
          <Accordion type="single" collapsible defaultValue="identidad" className="w-full">
            <AccordionItem value="identidad" className="border-b-0 px-4">
              <AccordionTrigger className="hover:no-underline py-6 group">
                <div className="flex items-center gap-4 text-[12px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-secondary transition-colors">
                  <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center group-data-[state=open]:bg-secondary group-data-[state=open]:text-white transition-all shadow-sm border border-slate-100">
                    <Settings2 className="h-5 w-5" />
                  </div>
                  Identidad
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 pt-2 animate-in fade-in slide-in-from-top-2">
                <IdentitySection agent={agent} onUpdate={handleManualUpdate} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="integraciones" className="border-b-0 px-4">
              <AccordionTrigger className="hover:no-underline py-6 group">
                <div className="flex items-center gap-4 text-[12px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-secondary transition-colors">
                  <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center group-data-[state=open]:bg-secondary group-data-[state=open]:text-white transition-all shadow-sm border border-slate-100">
                    <Share2 className="h-5 w-5" />
                  </div>
                  Integraciones
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 pt-2 animate-in fade-in slide-in-from-top-2">
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
