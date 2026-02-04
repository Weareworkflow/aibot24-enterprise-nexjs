
"use client";

import { useState, useRef, useEffect } from "react";
import { AIAgent } from "@/lib/types";
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
  KeyRound,
  SmartphoneNfc,
  AlertCircle,
  CalendarDays,
  ShoppingBag,
  FileText,
  FolderOpen,
  Plus,
  Trash2,
  Link2
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { refineAgentConfig } from "@/ai/flows/refine-agent-config";
import { useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
  
  // Modals States
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isApiRestModalOpen, setIsApiRestModalOpen] = useState(false);
  
  const [waCredentials, setWaCredentials] = useState({ phoneId: "", token: "" });
  const [newApi, setNewApi] = useState({ url: "", method: "POST", name: "" });
  const [endpoints, setEndpoints] = useState<{name: string, url: string, method: string}[]>([]);
  
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

  const handleManualUpdate = (field: keyof AIAgent, value: any) => {
    if (!db || !agent) return;
    const agentRef = doc(db, "agents", agent.id);
    updateDoc(agentRef, { [field]: value })
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
        content: `He actualizado la arquitectura de ${agent.name} siguiendo tus instrucciones.`,
        explanation: suggestion.explanation
      }]);

      toast({
        title: "Arquitectura Actualizada",
        description: "Los cambios se han aplicado automáticamente.",
      });

    } catch (error: any) {
      if (error?.name === 'FirestorePermissionError') {
         errorEmitter.emit('permission-error', error);
      } else {
        toast({
          variant: "destructive",
          title: "Error de Optimización",
          description: "No pudimos aplicar los cambios en este momento.",
        });
      }
    } finally {
      setIsRefining(false);
    }
  };

  const handleWhatsAppIntegration = () => {
    if (!db || !agent) return;
    const newInts = { ...agent.integrations, "WhatsApp Business": true };
    handleManualUpdate('integrations', newInts);
    setIsWhatsAppModalOpen(false);
    toast({
      title: "Conexión Establecida",
      description: "WhatsApp API se ha integrado correctamente con Bitrix24.",
    });
  };

  const handleApiRestAdd = () => {
    if (!newApi.url || !newApi.name) return;
    setEndpoints([...endpoints, newApi]);
    setNewApi({ url: "", method: "POST", name: "" });
  };

  const handleApiRestRemove = (idx: number) => {
    setEndpoints(endpoints.filter((_, i) => i !== idx));
  };

  const handleApiRestSave = () => {
    if (!db || !agent) return;
    const newInts = { ...agent.integrations, "API REST": true };
    handleManualUpdate('integrations', newInts);
    setIsApiRestModalOpen(false);
    toast({
      title: "API REST Activada",
      description: "Se han vinculado los servicios externos al agente.",
    });
  };

  const handleGenericIntegration = (title: string, setModal: (val: boolean) => void) => {
    if (!db || !agent) return;
    const newInts = { ...agent.integrations, [title]: true };
    handleManualUpdate('integrations', newInts);
    setModal(false);
    toast({
      title: "Integración Activada",
      description: `${title} se ha vinculado correctamente.`,
    });
  };

  return (
    <div className="flex flex-col h-full border rounded-[2rem] bg-white shadow-xl overflow-hidden border-slate-200">
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="flex flex-col min-h-full">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="identidad" className="border-b px-6 border-slate-100">
              <AccordionTrigger className="hover:no-underline py-6 text-slate-700 data-[state=open]:text-secondary transition-colors outline-none">
                <div className="flex items-center gap-4 text-[14px] font-black uppercase tracking-widest">
                  <Settings2 className="h-5 w-5" /> Identidad
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 pt-2">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <UserRound className="h-4 w-4" /> Nombre
                    </div>
                    <Input 
                      value={agent.name} 
                      onChange={(e) => handleManualUpdate('name', e.target.value)}
                      className="h-10 text-sm font-bold bg-slate-50 border-slate-200 focus-visible:ring-secondary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <Sparkles className="h-4 w-4" /> Rol
                    </div>
                    <Input 
                      value={agent.role} 
                      onChange={(e) => handleManualUpdate('role', e.target.value)}
                      className="h-10 text-sm font-bold bg-slate-50 border-slate-200 focus-visible:ring-secondary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <Building2 className="h-4 w-4" /> Empresa
                    </div>
                    <Input 
                      value={agent.company} 
                      onChange={(e) => handleManualUpdate('company', e.target.value)}
                      className="h-10 text-sm font-bold bg-slate-50 border-slate-200 focus-visible:ring-secondary/30"
                    />
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">
                      <Palette className="h-4 w-4" /> Identidad Visual
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {ASSISTANT_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => handleManualUpdate('color', c)}
                          className={cn(
                            "h-8 w-8 rounded-full transition-all hover:scale-110 flex items-center justify-center relative shadow-sm border border-slate-200",
                            agent.color === c && "ring-2 ring-offset-2 ring-secondary"
                          )}
                          style={{ backgroundColor: c }}
                        >
                          {agent.color === c && <Check className="h-4 w-4 text-white drop-shadow-sm" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="instrucciones" className="border-b px-6 border-slate-100">
              <AccordionTrigger className="hover:no-underline py-6 text-slate-700 data-[state=open]:text-secondary transition-colors outline-none">
                <div className="flex items-center gap-4 text-[14px] font-black uppercase tracking-widest">
                  <Code2 className="h-5 w-5" /> Instrucciones
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 pt-2 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <Target className="h-4 w-4" /> Objetivo Crítico
                  </div>
                  <Textarea 
                    value={agent.objective} 
                    onChange={(e) => handleManualUpdate('objective', e.target.value)}
                    className="min-h-[100px] text-sm bg-slate-50 border-slate-200 resize-none focus-visible:ring-secondary/30"
                  />
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <Palette className="h-4 w-4" /> Personalidad y Tono
                    </div>
                    <Textarea 
                      value={agent.tone} 
                      onChange={(e) => handleManualUpdate('tone', e.target.value)}
                      className="min-h-[120px] text-sm italic bg-slate-50 border-slate-200 resize-none focus-visible:ring-secondary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <LayoutGrid className="h-4 w-4" /> Base de Conocimiento
                    </div>
                    <Textarea 
                      value={agent.knowledge} 
                      onChange={(e) => handleManualUpdate('knowledge', e.target.value)}
                      className="min-h-[200px] text-[12px] font-mono bg-slate-50 border-slate-200 resize-none focus-visible:ring-secondary/30"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="integraciones" className="border-b px-6 border-slate-100">
              <AccordionTrigger className="hover:no-underline py-6 text-slate-700 data-[state=open]:text-secondary transition-colors outline-none">
                <div className="flex items-center gap-4 text-[14px] font-black uppercase tracking-widest">
                  <Share2 className="h-5 w-5" /> Integraciones
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 pt-2">
                <div className="flex flex-col gap-3">
                  {[
                    { title: "WhatsApp Business", icon: Smartphone },
                    { title: "Calendario Bitrix24", icon: Calendar },
                    { title: "Catálogo Bitrix24", icon: LayoutGrid },
                    { title: "Documentos Bitrix24", icon: FilePlus },
                    { title: "Drive Bitrix24", icon: Cloud },
                    { title: "API REST", icon: Globe },
                  ].map((int, i) => {
                    const isActive = agent.integrations?.[int.title] || false;

                    return (
                      <div key={i} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-white hover:bg-slate-50 transition-colors shadow-sm">
                          <div className="flex items-center gap-4">
                            <int.icon className={cn("h-6 w-6", isActive ? "text-secondary" : "text-muted-foreground")} />
                            <span className="text-[12px] font-black uppercase tracking-wider">{int.title}</span>
                          </div>
                          <Switch 
                            checked={isActive} 
                            onCheckedChange={(checked) => {
                              if (checked) {
                                switch (int.title) {
                                  case "WhatsApp Business": setIsWhatsAppModalOpen(true); break;
                                  case "Calendario Bitrix24": setIsCalendarModalOpen(true); break;
                                  case "Catálogo Bitrix24": setIsCatalogModalOpen(true); break;
                                  case "Documentos Bitrix24": setIsDocumentsModalOpen(true); break;
                                  case "Drive Bitrix24": setIsDriveModalOpen(true); break;
                                  case "API REST": setIsApiRestModalOpen(true); break;
                                  default:
                                    const newInts = { ...agent.integrations, [int.title]: checked };
                                    handleManualUpdate('integrations', newInts);
                                }
                              } else {
                                const newInts = { ...agent.integrations, [int.title]: checked };
                                handleManualUpdate('integrations', newInts);
                              }
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Collapsible open={isChatOpen} onOpenChange={setIsChatOpen} className="w-full">
            <CollapsibleTrigger asChild>
              <button className={cn(
                "flex items-center justify-between px-6 py-6 w-full border-t border-slate-100 transition-colors outline-none bg-white",
                isChatOpen ? "bg-secondary/5" : "hover:bg-slate-50"
              )}>
                <div className="flex items-center gap-4 text-[14px] font-black uppercase tracking-widest text-secondary">
                  <Wand2 className="h-6 w-6" /> Editar Ajuste con AI
                </div>
                {isChatOpen ? <ChevronDown className="h-5 w-5 text-secondary" /> : <ChevronUp className="h-5 w-5 text-secondary" />}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-white border-t border-slate-100">
              <div className="flex flex-col h-[400px]">
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-5 pb-4">
                    {history.length === 0 && !isRefining && (
                      <div className="text-center py-10 space-y-3 opacity-30">
                        <UserCog className="h-10 w-10 mx-auto text-secondary" />
                        <p className="text-[10px] font-black uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                          Instruye a la IA para rediseñar el agente de inmediato.
                        </p>
                      </div>
                    )}
                    {history.map((item, idx) => (
                      <div key={idx} className={cn("flex flex-col max-w-[85%] space-y-1 animate-in fade-in slide-in-from-bottom-1", item.role === 'user' ? "ml-auto items-end" : "items-start")}>
                        <div className={cn("px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm border", item.role === 'user' ? "bg-secondary text-white border-secondary rounded-tr-none" : "bg-white text-foreground border-slate-100 rounded-tl-none")}>
                          {item.content}
                          {item.explanation && (
                            <div className="mt-3 pt-3 border-t border-slate-50">
                              <p className="text-[9px] font-black text-secondary uppercase mb-1 tracking-widest">Log de Cambios:</p>
                              <p className="text-[12px] italic text-muted-foreground">{item.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isRefining && (
                      <div className="flex items-start gap-2 animate-pulse">
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 flex flex-col gap-2 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-secondary" />
                            <span className="text-[11px] font-black uppercase text-secondary">Procesando Arquitectura...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="p-4 bg-white border-t border-slate-100">
                  <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-secondary transition-colors">
                    <Sparkles className="h-5 w-5 text-secondary ml-2" />
                    <Input 
                      placeholder="Ej: 'Cambia el tono a uno más ejecutivo'..." 
                      className="flex-1 border-none bg-transparent focus-visible:ring-0 text-[13px] h-10"
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !isRefining && handleRefine()}
                      disabled={isRefining}
                    />
                    <Button size="icon" className="rounded-xl h-10 w-10 bg-secondary hover:bg-secondary/90" onClick={handleRefine} disabled={!feedbackInput.trim() || isRefining}>
                      {isRefining ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>

      {/* WhatsApp Configuration Modal */}
      <Dialog open={isWhatsAppModalOpen} onOpenChange={setIsWhatsAppModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
          <DialogHeader>
            <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
              <SmartphoneNfc className="h-8 w-8 text-secondary" />
            </div>
            <DialogTitle className="text-center font-headline font-bold text-xl">Integración WhatsApp API</DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground uppercase font-black tracking-widest pt-2">
              Credenciales de Meta for Developers
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="phoneId" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Smartphone className="h-3 w-3" /> Phone Number ID
              </Label>
              <Input
                id="phoneId"
                placeholder="Ej: 1029384756..."
                className="pill-rounded bg-slate-50 border-slate-200 focus:ring-secondary/20"
                value={waCredentials.phoneId}
                onChange={(e) => setWaCredentials(prev => ({ ...prev, phoneId: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="token" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <KeyRound className="h-3 w-3" /> Permanent Access Token
              </Label>
              <Input
                id="token"
                type="password"
                placeholder="EAAB..."
                className="pill-rounded bg-slate-50 border-slate-200 focus:ring-secondary/20"
                value={waCredentials.token}
                onChange={(e) => setWaCredentials(prev => ({ ...prev, token: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button 
              type="submit" 
              className="w-full h-12 pill-rounded bg-secondary hover:bg-secondary/90 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-secondary/20"
              onClick={handleWhatsAppIntegration}
              disabled={!waCredentials.phoneId || !waCredentials.token}
            >
              Vincular con Bitrix24
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API REST Modal */}
      <Dialog open={isApiRestModalOpen} onOpenChange={setIsApiRestModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Globe className="h-8 w-8 text-secondary" />
            </div>
            <DialogTitle className="text-center font-headline font-bold text-xl">Configuración API REST</DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground uppercase font-black tracking-widest pt-2">
              Protocolos de Comunicación Externa
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 py-4">
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 space-y-4">
              <h4 className="text-[9px] font-black uppercase text-secondary tracking-widest">Añadir Nuevo Endpoint</h4>
              <div className="space-y-3">
                <Input 
                  placeholder="Nombre del servicio (Ej: CRM Webhook)" 
                  className="h-10 text-[11px] bg-white pill-rounded"
                  value={newApi.name}
                  onChange={(e) => setNewApi({...newApi, name: e.target.value})}
                />
                <div className="flex gap-2">
                  <Select value={newApi.method} onValueChange={(val) => setNewApi({...newApi, method: val})}>
                    <SelectTrigger className="w-[100px] h-10 text-[11px] bg-white pill-rounded">
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    placeholder="https://api.empresa.com/v1/..." 
                    className="flex-1 h-10 text-[11px] bg-white pill-rounded"
                    value={newApi.url}
                    onChange={(e) => setNewApi({...newApi, url: e.target.value})}
                  />
                </div>
                <Button 
                  onClick={handleApiRestAdd}
                  className="w-full h-10 bg-slate-900 text-white pill-rounded text-[10px] font-black uppercase tracking-widest gap-2"
                  disabled={!newApi.url || !newApi.name}
                >
                  <Plus className="h-3 w-3" /> Registrar Endpoint
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-2">Endpoints Registrados ({endpoints.length})</h4>
              {endpoints.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-3xl opacity-40">
                  <Link2 className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No hay conexiones activas</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {endpoints.map((ep, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white border rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-black uppercase tracking-tight text-primary">{ep.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-black bg-secondary/10 text-secondary px-1.5 py-0.5 rounded uppercase">{ep.method}</span>
                          <span className="text-[9px] text-muted-foreground truncate max-w-[200px]">{ep.url}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleApiRestRemove(i)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="sm:justify-center pt-4 border-t">
            <Button 
              type="button" 
              className="w-full h-12 pill-rounded bg-secondary hover:bg-secondary/90 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-secondary/20"
              onClick={handleApiRestSave}
            >
              Confirmar y Activar API REST
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rest of the modals (Calendar, Catalog, Documents, Drive) stay the same... */}
      {/* Calendar Configuration Modal */}
      <Dialog open={isCalendarModalOpen} onOpenChange={setIsCalendarModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
          <DialogHeader>
            <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
              <CalendarDays className="h-8 w-8 text-secondary" />
            </div>
            <DialogTitle className="text-center font-headline font-bold text-xl">Calendario Bitrix24</DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground uppercase font-black tracking-widest pt-2">
              Selección de Agenda Operativa
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 flex flex-col items-center justify-center text-center gap-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200 mx-2">
            <AlertCircle className="h-10 w-10 text-muted-foreground/30" />
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Sin Agendas Disponibles</p>
              <p className="text-[11px] italic text-muted-foreground px-6">
                Se debe crear un Calendario en Bitrix24 para seleccionarlo aquí.
              </p>
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button 
              type="button" 
              className="w-full h-12 pill-rounded bg-secondary hover:bg-secondary/90 text-white font-black text-[11px] uppercase tracking-[0.2em]"
              onClick={() => handleGenericIntegration("Calendario Bitrix24", setIsCalendarModalOpen)}
            >
              Cerrar y Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Catalog Configuration Modal */}
      <Dialog open={isCatalogModalOpen} onOpenChange={setIsCatalogModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
          <DialogHeader>
            <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
              <ShoppingBag className="h-8 w-8 text-secondary" />
            </div>
            <DialogTitle className="text-center font-headline font-bold text-xl">Catálogo de Productos</DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground uppercase font-black tracking-widest pt-2">
              Sincronización de Inventario Bitrix24
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 flex flex-col items-center justify-center text-center gap-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200 mx-2">
            <AlertCircle className="h-10 w-10 text-muted-foreground/30" />
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Sin Catálogos Disponibles</p>
              <p className="text-[11px] italic text-muted-foreground px-6">
                Se debe crear un Catálogo de Productos en Bitrix24 para seleccionarlo aquí.
              </p>
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button 
              type="button" 
              className="w-full h-12 pill-rounded bg-secondary hover:bg-secondary/90 text-white font-black text-[11px] uppercase tracking-[0.2em]"
              onClick={() => handleGenericIntegration("Catálogo Bitrix24", setIsCatalogModalOpen)}
            >
              Cerrar y Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Documents Configuration Modal */}
      <Dialog open={isDocumentsModalOpen} onOpenChange={setIsDocumentsModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
          <DialogHeader>
            <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
              <FileText className="h-8 w-8 text-secondary" />
            </div>
            <DialogTitle className="text-center font-headline font-bold text-xl">Documentos Bitrix24</DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground uppercase font-black tracking-widest pt-2">
              Gestión de Plantillas Operativas
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 flex flex-col items-center justify-center text-center gap-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200 mx-2">
            <AlertCircle className="h-10 w-10 text-muted-foreground/30" />
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Sin Plantillas Disponibles</p>
              <p className="text-[11px] italic text-muted-foreground px-6">
                Se debe crear una Plantilla de Documento en Bitrix24 para seleccionarla aquí.
              </p>
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button 
              type="button" 
              className="w-full h-12 pill-rounded bg-secondary hover:bg-secondary/90 text-white font-black text-[11px] uppercase tracking-[0.2em]"
              onClick={() => handleGenericIntegration("Documentos Bitrix24", setIsDocumentsModalOpen)}
            >
              Cerrar y Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Drive Configuration Modal */}
      <Dialog open={isDriveModalOpen} onOpenChange={setIsDriveModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
          <DialogHeader>
            <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
              <FolderOpen className="h-8 w-8 text-secondary" />
            </div>
            <DialogTitle className="text-center font-headline font-bold text-xl">Drive Bitrix24</DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground uppercase font-black tracking-widest pt-2">
              Gestión de Carpetas de Almacenamiento
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 flex flex-col items-center justify-center text-center gap-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200 mx-2">
            <AlertCircle className="h-10 w-10 text-muted-foreground/30" />
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Sin Carpetas Disponibles</p>
              <p className="text-[11px] italic text-muted-foreground px-6">
                Se debe crear una Carpeta en Bitrix24 para seleccionarla aquí.
              </p>
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button 
              type="button" 
              className="w-full h-12 pill-rounded bg-secondary hover:bg-secondary/90 text-white font-black text-[11px] uppercase tracking-[0.2em]"
              onClick={() => handleGenericIntegration("Drive Bitrix24", setIsDriveModalOpen)}
            >
              Cerrar y Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
