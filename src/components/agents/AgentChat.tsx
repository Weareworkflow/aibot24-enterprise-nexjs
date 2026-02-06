
"use client";

import { useState, useRef, useEffect } from "react";
import { AIAgent } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Settings2,
  Code2,
  Share2,
  BookOpen,
  Wand2,
  ChevronDown,
  ChevronUp
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
import { InstructionsSection } from "./AgentChat/InstructionsSection";
import { KnowledgeSection } from "./AgentChat/KnowledgeSection";
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
          toast({ title: "Cambio guardado", description: `Campo ${title} actualizado.` });
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
    <div className="flex flex-col h-full border rounded-[2rem] bg-white shadow-xl overflow-hidden border-slate-200">
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="flex flex-col min-h-full">
          <Accordion type="single" collapsible defaultValue="identidad" className="w-full">
            
            {/* 1. IDENTIDAD */}
            <AccordionItem value="identidad" className="border-b px-6 border-slate-100">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-[14px] font-black uppercase tracking-widest text-slate-700">
                  <Settings2 className="h-5 w-5" /> Identidad
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 pt-2">
                <IdentitySection agent={agent} onUpdate={handleManualUpdate} />
              </AccordionContent>
            </AccordionItem>

            {/* 2. INSTRUCCIONES */}
            <AccordionItem value="instrucciones" className="border-b px-6 border-slate-100">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-[14px] font-black uppercase tracking-widest text-slate-700">
                  <Code2 className="h-5 w-5" /> Instrucciones
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 pt-2">
                <InstructionsSection agent={agent} onUpdate={handleManualUpdate} />
              </AccordionContent>
            </AccordionItem>

            {/* 3. CONOCIMIENTO (Ubicado justo debajo) */}
            <AccordionItem value="conocimiento" className="border-b px-6 border-slate-100">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-[14px] font-black uppercase tracking-widest text-slate-700">
                  <BookOpen className="h-5 w-5" /> Conocimiento
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 pt-2">
                <KnowledgeSection agent={agent} onUpdate={handleManualUpdate} />
              </AccordionContent>
            </AccordionItem>

            {/* 4. INTEGRACIONES */}
            <AccordionItem value="integraciones" className="border-b px-6 border-slate-100">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-[14px] font-black uppercase tracking-widest text-slate-700">
                  <Share2 className="h-5 w-5" /> Integraciones
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 pt-2">
                <IntegrationsSection 
                  agent={agent} 
                  onUpdate={handleManualUpdate} 
                  onOpenModal={setActiveModal} 
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Collapsible open={isChatOpen} onOpenChange={setIsChatOpen} className="w-full">
            <CollapsibleTrigger asChild>
              <button className="flex items-center justify-between px-6 py-6 w-full border-t bg-white">
                <div className="flex items-center gap-4 text-[14px] font-black uppercase tracking-widest text-secondary">
                  <Wand2 className="h-6 w-6" /> Refinar con IA
                </div>
                {isChatOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-white border-t">
              <AiRefiner agent={agent} db={db} />
            </CollapsibleContent>
          </Collapsible>
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
