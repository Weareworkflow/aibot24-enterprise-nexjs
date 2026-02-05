
"use client";

import { useState } from "react";
import { AIAgent, APIEndpoint } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  SmartphoneNfc, 
  Briefcase, 
  Globe, 
  MessageSquare,
  UploadCloud,
  Plus, 
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { registerOpenLinesBot } from "@/app/actions/bitrix-actions";

const DEPARTMENTS = [
  "Departamento de Ventas",
  "Soporte Técnico",
  "Atención al Cliente",
  "Marketing y Publicidad",
  "Recursos Humanos",
  "Administración y Finanzas",
  "Logística"
];

interface IntegrationModalsProps {
  agent: AIAgent;
  activeModal: string | null;
  onClose: () => void;
  onSave: (field: string, value: any, title: string) => void;
  onApiUpdate: (endpoints: APIEndpoint[]) => void;
}

export function IntegrationModals({ agent, activeModal, onClose, onSave, onApiUpdate }: IntegrationModalsProps) {
  const [waCredentials, setWaCredentials] = useState({ phoneId: "", token: "" });
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [newApi, setNewApi] = useState<APIEndpoint>({ name: "", url: "", method: "POST", headers: "", body: "" });
  const [isRegisteringBot, setIsRegisteringBot] = useState(false);
  const { toast } = useToast();

  const handleWhatsApp = () => {
    onSave('integrations', { ...agent.integrations, "WhatsApp Business": true }, "WhatsApp Business");
    onClose();
  };

  const handleCrm = () => {
    onSave('integrations', { ...agent.integrations, "CRM Bitrix24": true }, "CRM Bitrix24");
    onClose();
  };

  const handleOpenLines = async () => {
    if (!agent.tenantId) {
      toast({
        variant: "destructive",
        title: "Error de Contexto",
        description: "No se ha detectado el member_id del portal.",
      });
      return;
    }

    setIsRegisteringBot(true);
    try {
      const result = await registerOpenLinesBot(agent.tenantId, {
        name: agent.name,
        role: agent.role,
        color: agent.color || 'BLUE',
        agentId: agent.id
      });
      
      if (result.success) {
        onSave('integrations', { ...agent.integrations, "Open Lines (Chat Bitrix24)": true }, "Open Lines (Chat Bitrix24)");
        toast({
          title: "Bot Registrado",
          description: `El bot tipo O "${agent.name}" ha sido vinculado a Open Lines.`,
        });
        onClose();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de Registro",
        description: error.message || "No se pudo registrar el bot en Bitrix24.",
      });
    } finally {
      setIsRegisteringBot(false);
    }
  };

  const toggleDept = (dept: string) => {
    setSelectedDepts(prev => prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]);
  };

  const handleApiAdd = () => {
    const updated = [...(agent.apiEndpoints || []), newApi];
    onApiUpdate(updated);
    setNewApi({ name: "", url: "", method: "POST", headers: "", body: "" });
  };

  const handleApiRemove = (idx: number) => {
    const updated = (agent.apiEndpoints || []).filter((_, i) => i !== idx);
    onApiUpdate(updated);
  };

  const handleApiSave = () => {
    onSave('integrations', { ...agent.integrations, "API REST": true }, "API REST");
    onClose();
  };

  return (
    <>
      {/* Open Lines (Chat Bitrix24) - TIPO O */}
      <Dialog open={activeModal === "Open Lines (Chat Bitrix24)"} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
          <DialogHeader>
            <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
              <MessageSquare className="h-8 w-8 text-secondary" />
            </div>
            <DialogTitle className="text-center font-headline font-bold text-xl">Open Lines Bot (Tipo O)</DialogTitle>
            <DialogDescription className="text-center text-[10px] text-muted-foreground uppercase font-black tracking-widest pt-2">
              Integración Nativa de Chat
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="p-4 bg-secondary/5 rounded-2xl border border-secondary/10 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5" />
              <p className="text-[11px] leading-relaxed text-slate-600">
                Al activar esta opción, <strong>{agent.name}</strong> se registrará como un Bot de Líneas Abiertas. Podrá responder mensajes de WhatsApp, Facebook y Live Chat directamente desde el centro de contacto de Bitrix24.
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Código de Bot</Label>
              <div className="p-3 bg-slate-50 rounded-xl font-mono text-[10px] border">bot_{agent.id}</div>
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button 
              className="w-full h-12 pill-rounded bg-secondary gap-2 font-black uppercase text-[10px] tracking-widest" 
              onClick={handleOpenLines}
              disabled={isRegisteringBot}
            >
              {isRegisteringBot ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registrando Protocolo...
                </>
              ) : (
                "Activar en Líneas Abiertas"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WhatsApp */}
      <Dialog open={activeModal === "WhatsApp Business"} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
          <DialogHeader>
            <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
              <SmartphoneNfc className="h-8 w-8 text-secondary" />
            </div>
            <DialogTitle className="text-center font-headline font-bold text-xl">WhatsApp API</DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground uppercase font-black tracking-widest pt-2">
              Credenciales de Meta
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Number ID</Label>
              <Input
                placeholder="Ej: 1029384756..."
                className="pill-rounded bg-slate-50"
                value={waCredentials.phoneId}
                onChange={(e) => setWaCredentials(p => ({ ...p, phoneId: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Access Token</Label>
              <Input
                type="password"
                placeholder="EAAB..."
                className="pill-rounded bg-slate-50"
                value={waCredentials.token}
                onChange={(e) => setWaCredentials(p => ({ ...p, token: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button className="w-full h-12 pill-rounded bg-secondary" onClick={handleWhatsApp} disabled={!waCredentials.phoneId || !waCredentials.token}>
              Vincular WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CRM */}
      <Dialog open={activeModal === "CRM Bitrix24"} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
          <DialogHeader>
            <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Briefcase className="h-8 w-8 text-secondary" />
            </div>
            <DialogTitle className="text-center font-headline font-bold text-xl">CRM Bitrix24</DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground uppercase font-black tracking-widest pt-2">
              Selección de Departamentos
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-2">
                {DEPARTMENTS.map((dept) => (
                  <div key={dept} className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toggleDept(dept)}>
                    <Checkbox checked={selectedDepts.includes(dept)} onCheckedChange={() => toggleDept(dept)} />
                    <span className="text-[11px] font-bold text-slate-700">{dept}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button className="w-full h-12 pill-rounded bg-secondary" onClick={handleCrm} disabled={selectedDepts.length === 0}>
              Vincular {selectedDepts.length > 0 ? `(${selectedDepts.length})` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API REST */}
      <Dialog open={activeModal === "API REST"} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[550px] rounded-[2rem] border-none shadow-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Globe className="h-8 w-8 text-secondary" />
            </div>
            <DialogTitle className="text-center font-headline font-bold text-xl">Protocolos API REST</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 py-4">
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              <h4 className="text-[9px] font-black uppercase text-secondary tracking-widest">Nueva Petición</h4>
              <Input placeholder="Nombre del servicio" className="h-10 text-[11px] bg-white pill-rounded" value={newApi.name} onChange={(e) => setNewApi({...newApi, name: e.target.value})} />
              <div className="flex gap-2">
                <Select value={newApi.method} onValueChange={(val) => setNewApi({...newApi, method: val})}>
                  <SelectTrigger className="w-[110px] h-10 text-[11px] bg-white pill-rounded">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="URL del Endpoint" className="flex-1 h-10 text-[11px] bg-white pill-rounded" value={newApi.url} onChange={(e) => setNewApi({...newApi, url: e.target.value})} />
              </div>
              <Button onClick={handleApiAdd} className="w-full h-11 bg-slate-900 text-white pill-rounded text-[10px] font-black uppercase">Registrar</Button>
            </div>
            <div className="space-y-2">
              {(agent.apiEndpoints || []).map((ep, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white border rounded-2xl">
                  <span className="text-[10px] font-bold uppercase">{ep.name}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleApiRemove(i)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="pt-4 border-t">
            <Button className="w-full h-12 pill-rounded bg-secondary" onClick={handleApiSave}>Guardar Protocolos</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generic Placeholder for others */}
      {["Calendario Bitrix24", "Catálogo Bitrix24", "Documentos Bitrix24", "Drive Bitrix24"].includes(activeModal || "") && (
        <Dialog open={!!activeModal} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
            <DialogHeader>
              <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <AlertCircle className="h-8 w-8 text-secondary" />
              </div>
              <DialogTitle className="text-center font-headline font-bold text-xl">{activeModal}</DialogTitle>
            </DialogHeader>
            <div className="py-8 text-center text-[11px] italic text-muted-foreground px-6">
              Recurso pendiente de selección en Bitrix24.
            </div>
            <DialogFooter>
              <Button className="w-full h-12 pill-rounded bg-secondary" onClick={() => { onSave('integrations', { ...agent.integrations, [activeModal!]: true }, activeModal!); onClose(); }}>Vincular</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
