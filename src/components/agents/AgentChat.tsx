"use client";

import { useState, useRef } from "react";
import { AIAgent } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Settings2,
  Share2,
  Wand2,
  ChevronDown,
  ChevronUp,
  Activity
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { IntegrationModals } from "./IntegrationModals";
import { IdentitySection } from "./AgentChat/IdentitySection";
import { IntegrationsSection } from "./AgentChat/IntegrationsSection";
import { AiRefiner } from "./AgentChat/AiRefiner";

interface AgentChatProps {
  agent: AIAgent;
}

export function AgentChat({ agent }: AgentChatProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const db = useFirestore();
  const { toast } = useToast();

  const handleManualUpdate = (field: string, value: any, title?: string) => {
    if (!db || !agent) return;
    const agentRef = doc(db, "agents", agent.id);
    updateDoc(agentRef, { [field]: value })
      .then(() => {
        if (title) {
          toast({ title: "Sincronizado", description: `${title} actualizado con éxito.` });
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
    <div className="flex flex-col h-full glass-card rounded-[2.5rem] overflow-hidden transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 shadow-2xl border-none">
      <ScrollArea className="flex-1 modern-scroll" ref={scrollRef}>
        <div className="flex flex-col min-h-full">
          {/* Dashboard de Estado Sutil */}
          <div className="bg-slate-50/50 p-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
                <Activity className="h-5 w-5 text-secondary animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Protocolo de Configuración</p>
                <h2 className="text-sm font-bold">Consola Operativa v3.0</h2>
              </div>
            </div>
            <div className="flex gap-2 items-center">
               <div className="h-2 w-2 rounded-full bg-accent animate-ping" />
               <span className="text-[8px] font-black uppercase tracking-widest text-accent">Sincronizado</span>
            </div>
          </div>

          <Accordion type="single" collapsible defaultValue="identidad" className="w-full">
            
            {/* 1. IDENTIDAD (Incluye Objetivo y Tono) */}
            <AccordionItem value="identidad" className="border-b-0 px-8">
              <AccordionTrigger className="hover:no-underline py-8 group">
                <div className="flex items-center gap-4 text-[12px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-secondary transition-colors">
                  <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center group-data-[state=open]:bg-secondary group-data-[state=open]:text-white transition-all">
                    <Settings2 className="h-4 w-4" />
                  </div>
                  Identidad y Estrategia
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-10 pt-2 animate-in fade-in slide-in-from-top-2">
                <IdentitySection agent={agent} onUpdate={handleManualUpdate} />
              </AccordionContent>
            </AccordionItem>

            {/* 2. INTEGRACIONES */}
            <AccordionItem value="integraciones" className="border-b-0 px-8">
              <AccordionTrigger className="hover:no-underline py-8 group">
                <div className="flex items-center gap-4 text-[12px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-secondary transition-colors">
                  <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center group-data-[state=open]:bg-secondary group-data-[state=open]:text-white transition-all">
                    <Share2 className="h-4 w-4" />
                  </div>
                  Canales y Servicios
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-10 pt-2 animate-in fade-in slide-in-from-top-2">
                <IntegrationsSection 
                  agent={agent} 
                  onUpdate={handleManualUpdate} 
                  onOpenModal={setActiveModal} 
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Refinador de IA */}
          <div className="mt-8 px-8 pb-10">
            <Collapsible open={isChatOpen} onOpenChange={setIsChatOpen} className="w-full">
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between p-6 w-full rounded-[2rem] bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all group">
                  <div className="flex items-center gap-4 text-[12px] font-black uppercase tracking-[0.2em]">
                    <div className="h-10 w-10 rounded-2xl bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Wand2 className="h-5 w-5 text-secondary" />
                    </div>
                    Arquitecto de Refinamiento
                  </div>
                  {isChatOpen ? <ChevronDown className="h-5 w-5 opacity-50" /> : <ChevronUp className="h-5 w-5 opacity-50" />}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="bg-slate-900 border-t border-white/5 rounded-b-[2rem] -mt-6 pt-10">
                <AiRefiner agent={agent} db={db} />
              </CollapsibleContent>
            </Collapsible>
          </div>
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