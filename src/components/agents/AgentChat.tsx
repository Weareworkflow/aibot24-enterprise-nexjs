
"use client";

import { useState, useRef, useEffect } from "react";
import { AIAgent, KnowledgeFile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Send, 
  Loader2, 
  Wand2, 
  Settings2,
  Code2,
  Share2,
  Smartphone,
  Calendar,
  LayoutGrid,
  BookOpen,
  FileText,
  FileSpreadsheet,
  Trash2,
  UploadCloud,
  Paperclip,
  Check,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Globe
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !db) return;

    const newFiles: KnowledgeFile[] = Array.from(files).map(file => ({
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      uploadedAt: new Date().toISOString()
    }));

    const updatedFiles = [...(agent.knowledgeFiles || []), ...newFiles];
    handleManualUpdate('knowledgeFiles', updatedFiles, 'Archivos de Conocimiento');
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    if (!agent.knowledgeFiles) return;
    const updatedFiles = agent.knowledgeFiles.filter((_, i) => i !== index);
    handleManualUpdate('knowledgeFiles', updatedFiles, 'Archivo eliminado');
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    if (type.includes('word') || type.includes('document')) return <FileText className="h-5 w-5 text-blue-500" />;
    return <Paperclip className="h-5 w-5 text-slate-400" />;
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
          <Accordion type="single" collapsible defaultValue="identidad" className="w-full">
            {/* 1. IDENTIDAD */}
            <AccordionItem value="identidad" className="border-b px-6 border-slate-100">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-[14px] font-black uppercase tracking-widest text-slate-700">
                  <Settings2 className="h-5 w-5" /> Identidad
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 pt-2 space-y-6">
                <div className="space-y-4">
                  {[
                    { key: 'name', label: 'Nombre' },
                    { key: 'role', label: 'Rol' },
                    { key: 'company', label: 'Empresa' }
                  ].map(field => (
                    <div key={field.key} className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{field.label}</Label>
                      <Input 
                        value={(agent as any)[field.key]} 
                        onChange={(e) => handleManualUpdate(field.key, e.target.value)} 
                        className="h-10 text-sm font-bold bg-slate-50" 
                      />
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

            {/* 2. INSTRUCCIONES */}
            <AccordionItem value="instrucciones" className="border-b px-6 border-slate-100">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-[14px] font-black uppercase tracking-widest text-slate-700">
                  <Code2 className="h-5 w-5" /> Instrucciones
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 pt-2 space-y-6">
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Objetivo Crítico</Label>
                    <Textarea 
                      value={agent.objective} 
                      onChange={(e) => handleManualUpdate('objective', e.target.value, 'Objetivo')} 
                      className="min-h-[100px] text-sm bg-slate-50" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Tono y Personalidad</Label>
                    <Textarea 
                      value={agent.tone} 
                      onChange={(e) => handleManualUpdate('tone', e.target.value, 'Tono')} 
                      className="min-h-[100px] text-sm bg-slate-50" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Manual de Instrucciones Técnicas</Label>
                    <Textarea 
                      value={agent.knowledge} 
                      onChange={(e) => handleManualUpdate('knowledge', e.target.value, 'Instrucciones')} 
                      className="min-h-[300px] font-mono text-sm bg-slate-50 leading-relaxed" 
                      placeholder="Define aquí el comportamiento detallado del agente..."
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 3. CONOCIMIENTO (Debajo de Instrucciones) */}
            <AccordionItem value="conocimiento" className="border-b px-6 border-slate-100">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-[14px] font-black uppercase tracking-widest text-slate-700">
                  <BookOpen className="h-5 w-5" /> Conocimiento
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 pt-2 space-y-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Base Documental (Archivos)</Label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 hover:border-secondary/40 transition-all cursor-pointer group"
                  >
                    <input 
                      type="file" 
                      multiple 
                      hidden 
                      ref={fileInputRef} 
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                    />
                    <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UploadCloud className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-600">Subir PDF, DOC, Excel o Texto</p>
                      <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-1">Sincronización documental activa</p>
                    </div>
                  </div>

                  {agent.knowledgeFiles && agent.knowledgeFiles.length > 0 && (
                    <div className="grid gap-2">
                      {agent.knowledgeFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-2xl bg-white shadow-sm">
                          <div className="flex items-center gap-3 overflow-hidden">
                            {getFileIcon(file.type)}
                            <div className="flex flex-col truncate">
                              <span className="text-[11px] font-bold truncate">{file.name}</span>
                              <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{file.size}</span>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeFile(idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                <div className="flex flex-col gap-3">
                  {[
                    { title: "WhatsApp Business", icon: Smartphone },
                    { title: "CRM Bitrix24", icon: Briefcase },
                    { title: "Calendario Bitrix24", icon: Calendar },
                    { title: "Catálogo Bitrix24", icon: LayoutGrid },
                    { title: "Documentos Bitrix24", icon: FileText },
                    { title: "Drive Bitrix24", icon: UploadCloud },
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
                  <Wand2 className="h-6 w-6" /> Refinar con AI
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
                    <Input placeholder="Ej: Haz que el tono sea más ejecutivo..." className="border-none bg-transparent h-10 text-[13px]" value={feedbackInput} onChange={(e) => setFeedbackInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRefine()} />
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
