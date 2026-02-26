"use client";

import { useState, useEffect, useCallback } from "react";
import { AIAgent, NotificationTemplate } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Plus,
    Trash2,
    Edit2,
    Bell,
    Zap,
    MessageSquare,
    Mail,
    Smartphone,
    Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AutomationForm } from "@/components/automations/AutomationForm";
import { useUIStore } from "@/lib/store";
import { translations } from "@/lib/translations";
import { cn } from "@/lib/utils";

interface AutomationSectionProps {
    agent: AIAgent;
}

export function AutomationSection({ agent }: AutomationSectionProps) {
    const { language } = useUIStore();
    const t = translations[language].automations;
    const common = translations[language].agent_card;
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);

    const fetchTemplates = useCallback(async () => {
        if (!agent.tenantId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/automations?tenantId=${encodeURIComponent(agent.tenantId)}`);
            if (!res.ok) throw new Error("Error fetching templates");
            const data = await res.json();
            setTemplates(data);
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [agent.tenantId, toast]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const handleDelete = async (id: string | undefined) => {
        if (!id) return;
        if (!confirm(common.delete_desc.replace("{name}", "esta plantilla"))) return;

        try {
            const res = await fetch(`/api/automations/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Error deleting template");
            toast({
                title: "Éxito",
                description: "Plantilla eliminada",
            });
            fetchTemplates();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive",
            });
        }
    };

    const getChannelIcon = (channel: string) => {
        switch (channel) {
            case "WHATSAPP": return <MessageSquare className="h-4 w-4 text-green-500" />;
            case "PUSH": return <Bell className="h-4 w-4 text-orange-500" />;
            case "EMAIL": return <Mail className="h-4 w-4 text-blue-500" />;
            case "SMS": return <Smartphone className="h-4 w-4 text-purple-500" />;
            default: return <Zap className="h-4 w-4 text-gray-500" />;
        }
    };

    const getConfigSummary = (template: NotificationTemplate) => {
        const { tipo_plantilla, configuracion } = template;
        if (tipo_plantilla === "RECORDATORIO" && configuracion?.recordatorio) {
            const { valor, unidad } = configuracion.recordatorio.activar_antes;
            return `-${valor} ${unidad}`;
        }
        if (tipo_plantilla === "RETARGETING" && configuracion?.retargeting) {
            const { valor, unidad } = configuracion.retargeting.esperar_despues_de_evento;
            return `Espera ${valor} ${unidad}`;
        }
        if (tipo_plantilla === "INFORMATIVO" && configuracion?.informativo) {
            const { modo, frecuencia } = configuracion.informativo;
            if (modo === 'UNICO') return 'Envío Único';
            if (frecuencia) return `${frecuencia.tipo} • ${frecuencia.hora}`;
        }
        return "-";
    };

    if (isFormOpen) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                    <h2 className="text-xl font-headline font-bold text-foreground">
                        {editingTemplate ? "Editar Protocolo" : "Nuevo Protocolo"}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={() => { setIsFormOpen(false); setEditingTemplate(null); }} className="rounded-2xl h-10 w-10">
                        <Plus className="h-5 w-5 rotate-45" />
                    </Button>
                </div>
                <AutomationForm
                    initialData={editingTemplate || undefined}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        setEditingTemplate(null);
                        fetchTemplates();
                    }}
                    onCancel={() => {
                        setIsFormOpen(false);
                        setEditingTemplate(null);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-headline font-bold text-foreground">Protocolos de Automatización</h2>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">Configuración de flujos de salida y recordatorios</p>
                </div>

                <Button
                    onClick={() => { setEditingTemplate(null); setIsFormOpen(true); }}
                    className="bg-secondary hover:bg-secondary/90 text-white rounded-2xl h-12 px-6 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-secondary/20 transition-all hover:scale-[1.02]"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Protocolo
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                </div>
            ) : templates.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {templates.map((template) => (
                        <Card key={template.id} className="bg-card border border-border/40 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group">
                            <CardHeader className="p-6 flex flex-row items-center justify-between border-b bg-muted/5 border-border/40 space-y-0">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-secondary/10">
                                        {getChannelIcon(template.canal)}
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm font-black uppercase tracking-[0.15em] text-foreground">
                                            {template.nombre}
                                        </CardTitle>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                                                {template.tipo_plantilla}
                                            </span>
                                            <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-widest",
                                                template.estado ? "text-green-500" : "text-muted-foreground"
                                            )}>
                                                {template.estado ? "ACTIVO" : "INACTIVO"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-muted-foreground hover:text-secondary hover:bg-secondary/10 rounded-xl"
                                        onClick={() => {
                                            setEditingTemplate(template);
                                            setIsFormOpen(true);
                                        }}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                                        onClick={() => handleDelete(template.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Contenido</span>
                                    <p className="text-sm text-foreground line-clamp-3 leading-relaxed">
                                        {template.contenido.cuerpo}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                    <div className="px-3 py-1 bg-muted/50 rounded-full text-[9px] font-black uppercase tracking-widest text-muted-foreground border border-border/40">
                                        {getConfigSummary(template)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="p-20 text-center bg-muted/10 border-2 border-dashed border-border/40 rounded-[3.5rem] flex flex-col items-center gap-6 group hover:bg-muted/20 transition-all duration-700">
                    <div className="relative">
                        <div className="absolute inset-0 bg-secondary/20 rounded-full blur-3xl group-hover:bg-secondary/30 transition-all" />
                        <Bell className="h-16 w-16 text-muted-foreground/30 relative z-10" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-foreground font-black uppercase tracking-[0.3em]">Hangar Vacío</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">No hay protocolos de automatización desplegados para este agente.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
