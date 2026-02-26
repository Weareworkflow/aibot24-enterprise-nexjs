"use client";

import { useState, useEffect } from "react";
import { AIAgent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Bell,
    Plus,
    Trash2,
    Save,
    Target,
    Info,
    Clock,
    ChevronDown,
    Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Removed unused and incorrect DropdownMenu imports

interface AutomationSectionProps {
    agent: AIAgent;
}

const TEMPLATE_TYPES = [
    {
        type: 'retargeting',
        label: 'Retargeting',
        icon: Target,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        defaultContent: "Hola {{nombre}}, soy el asistente de {{empresa}}. Noté que nos consultaste por {{servicio}} hace poco, ¿te queda alguna duda en la que pueda apoyarte?",
        description: 'Persuadir a leads que no han respondido.'
    },
    {
        type: 'informativa',
        label: 'Informativa',
        icon: Info,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        defaultContent: "Hola {{nombre}}, te compartimos info relevante sobre {{tema}}. ¡Espero te sea de utilidad!",
        description: 'Brindar contexto o novedades útiles.'
    },
    {
        type: 'reminder',
        label: 'Recordatorio',
        icon: Clock,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        defaultContent: "¡Hola {{nombre}}! Solo paso a recordarte tu cita del día {{fecha}} a las {{hora}}. ¡Te esperamos!",
        description: 'Recordar próximas citas agendadas.'
    }
];

export function AutomationSection({ agent }: AutomationSectionProps) {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchTemplates();
    }, [agent.tenantId]);

    const fetchTemplates = async () => {
        try {
            const res = await fetch(`/api/workflow/templates?tenantId=${agent.tenantId}`);
            if (res.ok) {
                const data = await res.json();
                setTemplates(data);
            }
        } catch (err) {
            console.error("Error fetching templates:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTemplate = (typeData: typeof TEMPLATE_TYPES[0]) => {
        const newTemplate = {
            tenant_id: agent.tenantId,
            key: `${typeData.type}_${Date.now()}`,
            content: typeData.defaultContent,
            variables: ["nombre"],
            active: true,
            type: typeData.type,
            isNew: true
        };
        setTemplates([...templates, newTemplate]);
    };

    const handleSaveTemplate = async (template: any) => {
        try {
            const res = await fetch("/api/workflow/templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(template),
            });

            if (res.ok) {
                toast({ title: "Plantilla guardada", description: "La automatización se ha actualizado." });
                fetchTemplates();
            }
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la plantilla." });
        }
    };

    const getTypeData = (key: string) => {
        return TEMPLATE_TYPES.find(t => key.startsWith(t.type)) || TEMPLATE_TYPES[0];
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-headline font-bold text-foreground">Protocolos de Automatización</h2>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">Configuración de flujos de salida y recordatorios</p>
                </div>

                <div className="flex gap-2">
                    {TEMPLATE_TYPES.map((type) => (
                        <Button
                            key={type.type}
                            onClick={() => handleAddTemplate(type)}
                            variant="outline"
                            className="gap-2 rounded-2xl h-12 px-5 border-border/40 hover:bg-foreground hover:text-background transition-all shadow-sm group"
                        >
                            <type.icon className={`h-4 w-4 ${type.color} group-hover:text-current`} />
                            <span className="text-[9px] font-black uppercase tracking-widest">+ {type.label}</span>
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {templates.map((template, idx) => {
                    const typeData = getTypeData(template.key);
                    const Icon = typeData.icon;

                    return (
                        <Card key={idx} className="bg-card border border-border/40 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group">
                            <CardHeader className="p-6 border-b bg-muted/5 border-none">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl ${typeData.bgColor}`}>
                                            <Icon className={`h-5 w-5 ${typeData.color}`} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-black uppercase tracking-[0.15em]">
                                                {typeData.label}
                                            </CardTitle>
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                                                KEY: {template.key}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/70">Diseño del Mensaje</Label>
                                    <div className="relative">
                                        <Textarea
                                            value={template.content}
                                            onChange={(e) => {
                                                const newTemplates = [...templates];
                                                newTemplates[idx].content = e.target.value;
                                                setTemplates(newTemplates);
                                            }}
                                            className="min-h-[120px] bg-muted/20 border-border/40 rounded-3xl text-sm focus:ring-2 focus:ring-secondary/20 transition-all resize-none p-5"
                                            placeholder="Escribe el contenido del mensaje..."
                                        />
                                        <div className="absolute top-4 right-4 animate-pulse opacity-20 group-hover:opacity-100 transition-opacity">
                                            <Sparkles className={`h-4 w-4 ${typeData.color}`} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="h-1 w-1 rounded-full bg-secondary" />
                                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                                            Usa <span className="text-foreground">&#123;&#123;variable&#125;&#125;</span> para datos dinámicos.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex gap-2">
                                        <div className="h-2 w-8 rounded-full bg-secondary/20" />
                                        <div className="h-2 w-4 rounded-full bg-secondary/10" />
                                    </div>
                                    <Button
                                        onClick={() => handleSaveTemplate(template)}
                                        className="gap-2 rounded-2xl px-6 h-11 bg-foreground text-background hover:bg-secondary hover:text-white transition-all shadow-lg active:scale-95"
                                    >
                                        <Save className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Sincronizar</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {templates.length === 0 && !loading && (
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
