"use client";

import { useEffect, useState, useCallback } from "react";
import { useUIStore } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
    Plus,
    Zap,
    Loader2,
    Trash2,
    Edit2,
    Bell,
    MessageSquare,
    Mail,
    Smartphone
} from "lucide-react";
import { AutomationForm } from "@/components/automations/AutomationForm";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function AutomationsPage() {
    const { tenantId, language } = useUIStore();
    const t = translations[language].automations;
    const common = translations[language].agent_card;
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [templates, setTemplates] = useState<any[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<any | null>(null);

    const fetchTemplates = useCallback(async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/automations?tenantId=${encodeURIComponent(tenantId)}`);
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
    }, [tenantId]);

    useEffect(() => {
        if (tenantId) fetchTemplates();
    }, [tenantId, fetchTemplates]);

    const handleDelete = async (id: string) => {
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

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-headline font-black uppercase tracking-tight text-foreground flex items-center gap-3">
                            <Zap className="h-6 w-6 text-secondary" />
                            {t.title}
                        </h1>
                        <p className="text-xs text-muted-foreground font-medium">Gestión Elité de Notificaciones v3.0</p>
                    </div>

                    {!isFormOpen && (
                        <Button
                            onClick={() => {
                                setEditingTemplate(null);
                                setIsFormOpen(true);
                            }}
                            className="h-12 px-6 rounded-2xl bg-secondary text-white shadow-lg shadow-secondary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest"
                        >
                            <Plus className="h-4 w-4" />
                            {t.new_template}
                        </Button>
                    )}
                </div>

                {isFormOpen ? (
                    <div className="max-w-4xl mx-auto bg-card p-8 rounded-[2.5rem] border border-border/40 shadow-xl">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
                            <h2 className="text-sm font-black uppercase tracking-widest text-foreground">
                                {editingTemplate ? t.edit_template : t.new_template}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsFormOpen(false)} className="rounded-full h-8 w-8 hover:bg-muted">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <AutomationForm
                            initialData={editingTemplate}
                            onSuccess={() => {
                                setIsFormOpen(false);
                                fetchTemplates();
                            }}
                            onCancel={() => setIsFormOpen(false)}
                        />
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                    </div>
                ) : templates.length > 0 ? (
                    <div className="bg-card rounded-[2.5rem] border border-border/40 shadow-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-muted/30 border-b border-border/40">
                                        <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.table_name}</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.table_type}</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.table_channel}</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.table_trigger}</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.table_actions}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                    {templates.map((template) => (
                                        <tr key={template.id} className="group hover:bg-muted/20 transition-colors">
                                            <td className="px-8 py-5">
                                                <span className="text-sm font-bold text-foreground">{template.nombre}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="inline-flex px-3 py-1 rounded-full bg-secondary/10 text-[10px] font-black text-secondary tracking-tighter">
                                                    {template.tipo_plantilla}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    {getChannelIcon(template.canal)}
                                                    <span className="text-xs font-bold text-muted-foreground">{template.canal}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 font-medium">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-foreground">{template.trigger_type}</span>
                                                    {template.trigger_type === 'FRECUENTE' && (
                                                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tight">
                                                            {template.frecuencia_tipo} • {template.hora_especifica}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-xl hover:bg-secondary/10 hover:text-secondary"
                                                        onClick={() => {
                                                            setEditingTemplate(template);
                                                            setIsFormOpen(true);
                                                        }}
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => handleDelete(template.id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-6 bg-card rounded-[2.5rem] border border-dashed border-border/80">
                        <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center">
                            <Zap className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                        <div className="text-center max-w-sm px-4">
                            <p className="text-[11px] font-black uppercase text-secondary tracking-widest mb-1">{t.no_templates}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{t.no_templates_desc}</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function X(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}
