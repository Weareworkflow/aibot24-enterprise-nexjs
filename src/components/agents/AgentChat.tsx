
"use client";

import { useState, useRef, useEffect } from "react";
import { AIAgent, APIEndpoint } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { 
  Send, 
  Loader2, 
  Wand2, 
  Sparkles,
  UserCog,
  Settings2,
  Code2,
  Share2,
  UserRound,
  Building2,
  Target,
  Smartphone,
  Calendar,
  LayoutGrid,
  FilePlus,
  Cloud,
  Globe,
  Palette,
  Check,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Database,
  Upload,
  AlignLeft,
  Trash2
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
import { cn } from "@/lib/utils";
import { refineAgentConfig } from "@/ai/flows/refine-agent-config";
import { useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { IntegrationModals } from "./IntegrationModals";

interface AgentChatProps {
  agent: AIAgent;
}

const ASSISTANT_COLORS = [
  "#ef4444", "#22c55e", "#10b981", "#3b82f6", "#1e3a8a", 
  "#a855f7", "#06b6d4", "#ec4899", "#84cc16", "#78350f", 
  "#2563eb", "#fef08a", "#f97316", "#475569", "#94a3b8", "#1e293b"
];

export function AgentChat({ agent }: AgentChatProps) {
  const [feedbackInput, setFeedbackInput] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [history, setHistory] = useState<{role: 'user' | 'assistant', content: string, explanation?: string}[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const db = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [history, isRefining, isChatOpen]);

  const handleManualUpdate = (field: string, value: any, title?: string) => {
    if (!db || !agent) return;
    const agentRef = doc(db, "agents", agent.id);
    updateDoc(agentRef, { [field]: value })
      .then(() => {
        if (title) {
          toast({ title: "Integración Activada", description: `${title} vinculada correctamente.` });
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

  const handleRefine = async () => {
    if (!feedbackInput.trim() || !db) return;
    const userFeedback = feedbackInput;
    setFeedbackInput("");
    setIsRefining(true);
    setHistory(prev => [...prev, { role: 'user', content: userFeedback }]);
    
    try {
      const suggestion = await refineAgentConfig({
        currentConfig: {
          name: agent.name,
          role: agent.role,
          company: agent.company,
          objective: agent.objective,
          tone: agent.tone,
          knowledge: agent.knowledge
        },
        feedback: userFeedback
      });

      const agentRef = doc(db, "agents", agent.id);
      await updateDoc(agentRef, {
        role: suggestion.role,
        objective: suggestion.objective,
        tone: suggestion.tone,
        knowledge: suggestion.knowledge
      });

      setHistory(prev => [...prev, { 
        role: 'assistant', 
        content: `Arquitectura de ${agent.name} optimizada con éxito.`,
        explanation: suggestion.explanation
      }]);

    } catch (error: any) {
      errorEmitter.emit('permission-error', error);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-[2rem] bg-white shadow-xl overflow-hidden border-slate-200">
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="flex flex-col min-h-full">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="identidad" className="border-b px-6 border-slate-100">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-[14px] font-black uppercase tracking-widest text-slate-700">
                  <Settings2 className="h-5 w-5" /> Identidad
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 pt-2 space-y-6">
                <div className="space-y-4">
                  {['name', 'role', 'company'].map(field => (
                    <div key={field} className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{field === 'name' ? 'Nombre' : field === 'role' ? 'Rol' : 'Empresa'}</Label>
                      <Input value={(agent as any)[field]} onChange={(e) => handleManualUpdate(field, e.target.value)} className="h-10 text-sm font-bold bg-slate-50" />
                    </div>
                  ))}
                  <div className="pt-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block mb-3">Identidad Visual</Label>
                    <div className="flex flex-wrap gap-2.5">
                      {ASSISTANT_COLORS.map(c => (
                        <button key={c} onClick={() => handleManualUpdate('color', c)} className={cn("h-7 w-7 rounded-full border shadow-sm transition-transform hover:scale-110 flex items-center justify-center", agent.color === c && "ring-2 ring-secondary ring-offset-2")} style={{ backgroundColor: c }}>
                          {agent.color === c && <Check className="h-3 w-3 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="instrucciones" className="border-b px-6 border-slate-100">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-[14px] font-black uppercase tracking-widest text-slate-700">
                  <Code2 className="h-5 w-5" /> Instrucciones
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 pt-2 space-y-6">
                {['objective', 'tone', 'knowledge'].map(field => (
                  <div key={field} className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{field === 'objective' ? 'Objetivo Crítico' : field === 'tone' ? 'Tono' : 'Instrucciones'}</Label>
                    <Textarea value={(agent as any)[field]} onChange={(e) => handleManualUpdate(field, e.target.value)} className={cn("text-sm bg-slate-50", field === 'knowledge' ? "min-h-[250px] font-mono" : "min-h-[100px]")} />
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="integraciones" className="border-b px-6 border-slate-100">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-[14px] font-black uppercase tracking-widest text-slate-700">
                  <Share2 className="h-5 w-5" /> Integraciones
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 pt-2">
                <div className="flex flex-col gap-3">
                  {[
                    { title: "WhatsApp Business", icon: Smartphone },
                    { title: "CRM Bitrix24", icon: Briefcase },
                    { title: "Calendario Bitrix24", icon: Calendar },
                    { title: "Catálogo Bitrix24", icon: LayoutGrid },
                    { title: "Documentos Bitrix24", icon: FilePlus },
                    { title: "Drive Bitrix24", icon: Cloud },
                    { title: "API REST", icon: Globe },
                  ].map((int) => (
                    <div key={int.title} className="flex items-center justify-between p-4 border rounded-2xl bg-white shadow-sm">
                      <div className="flex items-center gap-4">
                        <int.icon className={cn("h-5 w-5", agent.integrations?.[int.title] ? "text-secondary" : "text-muted-foreground")} />
                        <span className="text-[12px] font-black uppercase tracking-wider">{int.title}</span>
                      </div>
                      <Switch checked={agent.integrations?.[int.title] || false} onCheckedChange={(checked) => checked ? setActiveModal(int.title) : handleManualUpdate('integrations', { ...agent.integrations, [int.title]: false })} />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Collapsible open={isChatOpen} onOpenChange={setIsChatOpen} className="w-full">
            <CollapsibleTrigger asChild>
              <button className="flex items-center justify-between px-6 py-6 w-full border-t bg-white">
                <div className="flex items-center gap-4 text-[14px] font-black uppercase tracking-widest text-secondary">
                  <Wand2 className="h-6 w-6" /> Editar Ajuste con AI
                </div>
                {isChatOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-white border-t">
              <div className="flex flex-col h-[350px]">
                <ScrollArea className="flex-1 p-6">
                  {history.map((item, idx) => (
                    <div key={idx} className={cn("flex flex-col max-w-[85%] mb-4 space-y-1", item.role === 'user' ? "ml-auto items-end" : "items-start")}>
                      <div className={cn("px-4 py-3 rounded-2xl text-[13px] border", item.role === 'user' ? "bg-secondary text-white" : "bg-white")}>{item.content}</div>
                    </div>
                  ))}
                  {isRefining && <Loader2 className="h-6 w-6 animate-spin mx-auto text-secondary" />}
                </ScrollArea>
                <div className="p-4 border-t bg-slate-50">
                  <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border">
                    <Input placeholder="Ej: Cambia el tono a ejecutivo" className="border-none bg-transparent h-10 text-[13px]" value={feedbackInput} onChange={(e) => setFeedbackInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRefine()} />
                    <Button size="icon" className="rounded-xl h-10 w-10 bg-secondary" onClick={handleRefine} disabled={!feedbackInput.trim() || isRefining}><Send className="h-5 w-5" /></Button>
                  </div>
                </div>
              </div>
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
