"use client";

import { useState, useEffect } from "react";
import { useUIStore } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AutomationFormProps {
    initialData?: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export function AutomationForm({ initialData, onSuccess, onCancel }: AutomationFormProps) {
    const { language, tenantId } = useUIStore();
    const t = translations[language].automations;
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        nombre: initialData?.nombre || "",
        tipo_plantilla: initialData?.tipo_plantilla || "RECORDATORIO",
        canal: initialData?.canal || "WHATSAPP",
        trigger_type: initialData?.trigger_type || "BEFORE",
        frecuencia_tipo: initialData?.frecuencia_tipo || "DIARIO",
        dia_ejecucion: initialData?.dia_ejecucion || "",
        hora_especifica: initialData?.hora_especifica || "09:00",
        mensaje_json: JSON.stringify(initialData?.mensaje_json || { titulo: "", cuerpo: "" }, null, 2),
        condicion_parada: initialData?.condicion_parada || "",
        offset_minutos: initialData?.offset_minutos || 0,
    });

    // Handle Type Change: Enforce strict trigger mapping
    useEffect(() => {
        if (formData.tipo_plantilla === "RECORDATORIO") {
            setFormData(prev => ({ ...prev, trigger_type: "BEFORE" }));
        } else if (formData.tipo_plantilla === "RETARGETING") {
            setFormData(prev => ({ ...prev, trigger_type: "AFTER" }));
        } else if (formData.tipo_plantilla === "INFORMATIVO") {
            if (!["FRECUENTE", "SCHEDULED"].includes(formData.trigger_type)) {
                setFormData(prev => ({ ...prev, trigger_type: "FRECUENTE" }));
            }
        }
    }, [formData.tipo_plantilla]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantId) return;

        setLoading(true);
        try {
            let messageJson;
            try {
                messageJson = JSON.parse(formData.mensaje_json);
            } catch (err) {
                toast({
                    title: "Error",
                    description: "JSON de mensaje inválido",
                    variant: "destructive",
                });
                setLoading(false);
                return;
            }

            // Map specialized fields to the schema's "dia_ejecucion"
            let finalDiaEjecucion = formData.dia_ejecucion;
            if (formData.tipo_plantilla === "RECORDATORIO") {
                finalDiaEjecucion = formData.offset_minutos.toString();
            }

            const payload = {
                ...formData,
                dia_ejecucion: finalDiaEjecucion,
                mensaje_json: messageJson,
                tenantId,
            };

            const url = initialData ? `/api/automations/${initialData.id}` : "/api/automations";
            const method = initialData ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Error al guardar la automatización");

            toast({
                title: "Éxito",
                description: "Automatización guardada correctamente",
            });
            onSuccess();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Type Selection First */}
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-secondary">{t.form_type}</Label>
                    <Select
                        value={formData.tipo_plantilla}
                        onValueChange={(v) => setFormData({ ...formData, tipo_plantilla: v })}
                    >
                        <SelectTrigger className="h-11 rounded-xl bg-secondary/5 border-secondary/20 shadow-none ring-offset-background focus:ring-secondary/30">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="RECORDATORIO">RECORDATORIO</SelectItem>
                            <SelectItem value="RETARGETING">RETARGETING</SelectItem>
                            <SelectItem value="INFORMATIVO">INFORMATIVO</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.form_name}</Label>
                    <Input
                        required
                        placeholder="Ej: Newsletter Semanal"
                        className="h-11 rounded-xl bg-muted/30 border-none focus-visible:ring-secondary/30"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.form_channel}</Label>
                    <Select
                        value={formData.canal}
                        onValueChange={(v) => setFormData({ ...formData, canal: v })}
                    >
                        <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-none">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="WHATSAPP">WHATSAPP</SelectItem>
                            <SelectItem value="PUSH">PUSH</SelectItem>
                            <SelectItem value="EMAIL">EMAIL</SelectItem>
                            <SelectItem value="SMS">SMS</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.form_trigger}</Label>
                    <Select
                        value={formData.trigger_type}
                        onValueChange={(v) => setFormData({ ...formData, trigger_type: v })}
                    >
                        <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-none">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {formData.tipo_plantilla === "RECORDATORIO" && (
                                <SelectItem value="BEFORE">{t.trigger_before}</SelectItem>
                            )}
                            {formData.tipo_plantilla === "RETARGETING" && (
                                <SelectItem value="AFTER">{t.trigger_after}</SelectItem>
                            )}
                            {formData.tipo_plantilla === "INFORMATIVO" && (
                                <>
                                    <SelectItem value="FRECUENTE">{t.trigger_freq}</SelectItem>
                                    <SelectItem value="SCHEDULED">{t.trigger_scheduled}</SelectItem>
                                </>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Specialized Sections */}
            {/* RECORDATORIO Antes */}
            {formData.tipo_plantilla === "RECORDATORIO" && (
                <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 space-y-4 animate-in zoom-in-95 duration-200">
                    <div className="space-y-2 max-w-[200px]">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-secondary">Antelación (Minutos)</Label>
                        <Input
                            type="number"
                            className="h-11 rounded-xl bg-background border-none shadow-sm focus-visible:ring-secondary/30"
                            value={formData.offset_minutos}
                            onChange={(e) => setFormData({ ...formData, offset_minutos: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                </div>
            )}

            {/* RETARGETING AFTER (Inactivity) */}
            {formData.tipo_plantilla === "RETARGETING" && formData.trigger_type === "AFTER" && (
                <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 space-y-4 animate-in zoom-in-95 duration-200">
                    <div className="space-y-2 max-w-[200px]">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-secondary">Días de Inactividad</Label>
                        <Input
                            type="number"
                            placeholder="7"
                            className="h-11 rounded-xl bg-background border-none shadow-sm focus-visible:ring-secondary/30"
                            value={formData.dia_ejecucion}
                            onChange={(e) => setFormData({ ...formData, dia_ejecucion: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {/* INFORMATIVO SCHEDULED */}
            {formData.tipo_plantilla === "INFORMATIVO" && formData.trigger_type === "SCHEDULED" && (
                <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 space-y-4 animate-in zoom-in-95 duration-200">
                    <div className="space-y-2 max-w-[200px]">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-secondary">Fecha de Envío</Label>
                        <Input
                            type="date"
                            className="h-11 rounded-xl bg-background border-none shadow-sm focus-visible:ring-secondary/30"
                            value={formData.dia_ejecucion}
                            onChange={(e) => setFormData({ ...formData, dia_ejecucion: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {/* Dynamic Frequent Logic */}
            {formData.trigger_type === "FRECUENTE" && (
                <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 space-y-6 animate-in zoom-in-95 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-secondary">{t.form_freq}</Label>
                            <Select
                                value={formData.frecuencia_tipo}
                                onValueChange={(v) => setFormData({ ...formData, frecuencia_tipo: v, dia_ejecucion: "" })}
                            >
                                <SelectTrigger className="h-11 rounded-xl bg-background border-none shadow-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="DIARIO">{t.freq_daily}</SelectItem>
                                    <SelectItem value="SEMANAL">{t.freq_weekly}</SelectItem>
                                    <SelectItem value="MENSUAL">{t.freq_monthly}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.frecuencia_tipo === "SEMANAL" && (
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-secondary">{t.form_day}</Label>
                                <Select
                                    value={formData.dia_ejecucion}
                                    onValueChange={(v) => setFormData({ ...formData, dia_ejecucion: v })}
                                >
                                    <SelectTrigger className="h-11 rounded-xl bg-background border-none shadow-sm">
                                        <SelectValue placeholder="Seleccionar día" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="MONDAY">Lunes</SelectItem>
                                        <SelectItem value="TUESDAY">Martes</SelectItem>
                                        <SelectItem value="WEDNESDAY">Miércoles</SelectItem>
                                        <SelectItem value="THURSDAY">Jueves</SelectItem>
                                        <SelectItem value="FRIDAY">Viernes</SelectItem>
                                        <SelectItem value="SATURDAY">Sábado</SelectItem>
                                        <SelectItem value="SUNDAY">Domingo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {formData.frecuencia_tipo === "MENSUAL" && (
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-secondary">{t.form_day}</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="31"
                                    placeholder="Día (1-31)"
                                    className="h-11 rounded-xl bg-background border-none shadow-sm focus-visible:ring-secondary/30"
                                    value={formData.dia_ejecucion}
                                    onChange={(e) => setFormData({ ...formData, dia_ejecucion: e.target.value })}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-secondary">{t.form_hour}</Label>
                            <Input
                                type="time"
                                className="h-11 rounded-xl bg-background border-none shadow-sm focus-visible:ring-secondary/30"
                                value={formData.hora_especifica}
                                onChange={(e) => setFormData({ ...formData, hora_especifica: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Message and Stop Condition */}
            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.form_message}</Label>
                <Textarea
                    placeholder='{"titulo": "Hola", "cuerpo": "..."}'
                    className="min-h-[150px] rounded-2xl bg-muted/30 border-none font-mono text-xs focus-visible:ring-secondary/30"
                    value={formData.mensaje_json}
                    onChange={(e) => setFormData({ ...formData, mensaje_json: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.form_stop}</Label>
                <Input
                    placeholder="Ej: user_active == true"
                    className="h-11 rounded-xl bg-muted/30 border-none focus-visible:ring-secondary/30"
                    value={formData.condicion_parada}
                    onChange={(e) => setFormData({ ...formData, condicion_parada: e.target.value })}
                />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    className="h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                >
                    {language === 'es' ? 'Cancelar' : 'Cancel'}
                </Button>
                <Button
                    disabled={loading}
                    className="h-12 px-8 rounded-2xl bg-secondary text-white shadow-lg shadow-secondary/20 font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {t.save_btn}
                </Button>
            </div>
        </form>
    );
}
