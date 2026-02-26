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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NotificationTemplate } from "@/lib/types";

interface AutomationFormProps {
    initialData?: NotificationTemplate;
    onSuccess: () => void;
    onCancel: () => void;
}

export function AutomationForm({ initialData, onSuccess, onCancel }: AutomationFormProps) {
    const { language, tenantId } = useUIStore();
    const t = translations[language].automations;
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Initial state based on the new nested schema
    const [formData, setFormData] = useState<Partial<NotificationTemplate>>({
        nombre: initialData?.nombre || "",
        tipo_plantilla: initialData?.tipo_plantilla || "RECORDATORIO",
        canal: initialData?.canal || "WHATSAPP",
        estado: initialData?.estado ?? true,
        configuracion: initialData?.configuracion || {
            recordatorio: {
                activar_antes: { valor: 30, unidad: 'MINUTES' }
            }
        },
        contenido: initialData?.contenido || {
            titulo: "",
            cuerpo: ""
        }
    });

    // Sync configuration structure when template type changes
    useEffect(() => {
        if (!initialData) { // Only auto-set defaults for NEW templates
            if (formData.tipo_plantilla === "RECORDATORIO") {
                setFormData(prev => ({
                    ...prev,
                    configuracion: {
                        recordatorio: { activar_antes: { valor: 30, unidad: 'MINUTES' } }
                    }
                }));
            } else if (formData.tipo_plantilla === "RETARGETING") {
                setFormData(prev => ({
                    ...prev,
                    configuracion: {
                        retargeting: {
                            esperar_despues_de_evento: { valor: 1, unidad: 'DAYS' },
                            condicion_parada: "",
                            intentos_maximos: 3
                        }
                    }
                }));
            } else if (formData.tipo_plantilla === "INFORMATIVO") {
                setFormData(prev => ({
                    ...prev,
                    configuracion: {
                        informativo: {
                            modo: 'UNICO',
                            fecha_fija: new Date().toISOString().split('T')[0]
                        }
                    }
                }));
            }
        }
    }, [formData.tipo_plantilla, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantId) return;

        setLoading(true);
        try {
            const payload = {
                ...formData,
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
            {/* Header / Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.form_name}</Label>
                    <Input
                        required
                        placeholder="Ej: Recordatorio de Cita"
                        className="h-11 rounded-xl bg-muted/30 border-none focus-visible:ring-secondary/30"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-secondary">{t.form_type}</Label>
                    <Select
                        value={formData.tipo_plantilla}
                        onValueChange={(v: any) => setFormData({ ...formData, tipo_plantilla: v })}
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
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.form_channel}</Label>
                    <Select
                        value={formData.canal}
                        onValueChange={(v: any) => setFormData({ ...formData, canal: v })}
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

                <div className="flex items-center gap-4 pt-6">
                    <Checkbox
                        checked={formData.estado}
                        onCheckedChange={(v: boolean) => setFormData({ ...formData, estado: v })}
                    />
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Activo</Label>
                </div>
            </div>

            {/* Nested Configuration */}
            <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-secondary mb-4">Configuración del Disparador</h3>

                {formData.tipo_plantilla === "RECORDATORIO" && formData.configuracion?.recordatorio && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in zoom-in-95 duration-200">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black">{t.trigger_before} (Valor)</Label>
                            <Input
                                type="number"
                                className="h-11 rounded-xl bg-background"
                                value={formData.configuracion.recordatorio.activar_antes.valor}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    configuracion: {
                                        ...formData.configuracion,
                                        recordatorio: {
                                            activar_antes: {
                                                ...formData.configuracion!.recordatorio!.activar_antes,
                                                valor: parseInt(e.target.value) || 0
                                            }
                                        }
                                    }
                                })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black">Unidad</Label>
                            <Select
                                value={formData.configuracion.recordatorio.activar_antes.unidad}
                                onValueChange={(v: any) => setFormData({
                                    ...formData,
                                    configuracion: {
                                        ...formData.configuracion,
                                        recordatorio: {
                                            activar_antes: {
                                                ...formData.configuracion!.recordatorio!.activar_antes,
                                                unidad: v
                                            }
                                        }
                                    }
                                })}
                            >
                                <SelectTrigger className="h-11 rounded-xl bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="MINUTES">{(t as any).unit_minutes}</SelectItem>
                                    <SelectItem value="HOURS">{(t as any).unit_hours}</SelectItem>
                                    <SelectItem value="DAYS">{(t as any).unit_days}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {formData.tipo_plantilla === "RETARGETING" && formData.configuracion?.retargeting && (
                    <div className="space-y-6 animate-in zoom-in-95 duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black">{(t as any).wait_time}</Label>
                                <Input
                                    type="number"
                                    className="h-11 rounded-xl bg-background"
                                    value={formData.configuracion.retargeting.esperar_despues_de_evento.valor}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        configuracion: {
                                            ...formData.configuracion,
                                            retargeting: {
                                                ...formData.configuracion!.retargeting!,
                                                esperar_despues_de_evento: {
                                                    ...formData.configuracion!.retargeting!.esperar_despues_de_evento,
                                                    valor: parseInt(e.target.value) || 0
                                                }
                                            }
                                        }
                                    })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black">Unidad</Label>
                                <Select
                                    value={formData.configuracion.retargeting.esperar_despues_de_evento.unidad}
                                    onValueChange={(v: any) => setFormData({
                                        ...formData,
                                        configuracion: {
                                            ...formData.configuracion,
                                            retargeting: {
                                                ...formData.configuracion!.retargeting!,
                                                esperar_despues_de_evento: {
                                                    ...formData.configuracion!.retargeting!.esperar_despues_de_evento,
                                                    unidad: v
                                                }
                                            }
                                        }
                                    })}
                                >
                                    <SelectTrigger className="h-11 rounded-xl bg-background">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="MINUTES">{(t as any).unit_minutes}</SelectItem>
                                        <SelectItem value="HOURS">{(t as any).unit_hours}</SelectItem>
                                        <SelectItem value="DAYS">{(t as any).unit_days}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black">{(t as any).stop_condition}</Label>
                                <Input
                                    placeholder="Ej: pago_completado == true"
                                    className="h-11 rounded-xl bg-background"
                                    value={formData.configuracion.retargeting.condicion_parada}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        configuracion: {
                                            ...formData.configuracion,
                                            retargeting: {
                                                ...formData.configuracion!.retargeting!,
                                                condicion_parada: e.target.value
                                            }
                                        }
                                    })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black">{(t as any).max_retries}</Label>
                                <Input
                                    type="number"
                                    className="h-11 rounded-xl bg-background"
                                    value={formData.configuracion.retargeting.intentos_maximos}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        configuracion: {
                                            ...formData.configuracion,
                                            retargeting: {
                                                ...formData.configuracion!.retargeting!,
                                                intentos_maximos: parseInt(e.target.value) || 0
                                            }
                                        }
                                    })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {formData.tipo_plantilla === "INFORMATIVO" && formData.configuracion?.informativo && (
                    <div className="space-y-6 animate-in zoom-in-95 duration-200">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black">Modo de Envío</Label>
                            <Select
                                value={formData.configuracion.informativo.modo}
                                onValueChange={(v: any) => {
                                    const info = formData.configuracion!.informativo!;
                                    setFormData({
                                        ...formData,
                                        configuracion: {
                                            ...formData.configuracion,
                                            informativo: {
                                                ...info,
                                                modo: v,
                                                fecha_fija: v === 'UNICO' ? (info.fecha_fija || new Date().toISOString().split('T')[0]) : undefined,
                                                frecuencia: v === 'FRECUENTE' ? (info.frecuencia || { tipo: 'DIARIO', hora: "08:30", dia_ejecucion: "MONDAY" }) : undefined
                                            }
                                        }
                                    });
                                }}
                            >
                                <SelectTrigger className="h-11 rounded-xl bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="UNICO">{(t as any).mode_single}</SelectItem>
                                    <SelectItem value="FRECUENTE">{(t as any).mode_frequent}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.configuracion.informativo.modo === 'UNICO' && (
                            <div className="space-y-2 animate-in slide-in-from-top-2">
                                <Label className="text-[10px] font-black">{(t as any).date_fixed}</Label>
                                <Input
                                    type="date"
                                    className="h-11 rounded-xl bg-background"
                                    value={formData.configuracion.informativo.fecha_fija}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        configuracion: {
                                            ...formData.configuracion,
                                            informativo: {
                                                ...formData.configuracion!.informativo!,
                                                fecha_fija: e.target.value
                                            }
                                        }
                                    })}
                                />
                            </div>
                        )}

                        {formData.configuracion.informativo.modo === 'FRECUENTE' && formData.configuracion.informativo.frecuencia && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black">Frecuencia</Label>
                                    <Select
                                        value={formData.configuracion.informativo.frecuencia.tipo}
                                        onValueChange={(v: any) => setFormData({
                                            ...formData,
                                            configuracion: {
                                                ...formData.configuracion,
                                                informativo: {
                                                    ...formData.configuracion!.informativo!,
                                                    frecuencia: {
                                                        ...formData.configuracion!.informativo!.frecuencia!,
                                                        tipo: v,
                                                        dia_ejecucion: v === 'DIARIO' ? "" : v === 'SEMANAL' ? "MONDAY" : "1"
                                                    }
                                                }
                                            }
                                        })}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl bg-background">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="DIARIO">{t.freq_daily}</SelectItem>
                                            <SelectItem value="SEMANAL">{t.freq_weekly}</SelectItem>
                                            <SelectItem value="MENSUAL">{t.freq_monthly}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.configuracion.informativo.frecuencia.tipo !== 'DIARIO' && (
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black">{(t as any).execution_day}</Label>
                                        {formData.configuracion.informativo.frecuencia.tipo === 'SEMANAL' ? (
                                            <Select
                                                value={formData.configuracion.informativo.frecuencia.dia_ejecucion}
                                                onValueChange={(v) => setFormData({
                                                    ...formData,
                                                    configuracion: {
                                                        ...formData.configuracion,
                                                        informativo: {
                                                            ...formData.configuracion!.informativo!,
                                                            frecuencia: {
                                                                ...formData.configuracion!.informativo!.frecuencia!,
                                                                dia_ejecucion: v
                                                            }
                                                        }
                                                    }
                                                })}
                                            >
                                                <SelectTrigger className="h-11 rounded-xl bg-background">
                                                    <SelectValue />
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
                                        ) : (
                                            <Input
                                                type="number"
                                                min="1"
                                                max="31"
                                                className="h-11 rounded-xl bg-background"
                                                value={formData.configuracion.informativo.frecuencia.dia_ejecucion}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    configuracion: {
                                                        ...formData.configuracion,
                                                        informativo: {
                                                            ...formData.configuracion!.informativo!,
                                                            frecuencia: {
                                                                ...formData.configuracion!.informativo!.frecuencia!,
                                                                dia_ejecucion: e.target.value
                                                            }
                                                        }
                                                    }
                                                })}
                                            />
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black">Hora</Label>
                                    <Input
                                        type="time"
                                        className="h-11 rounded-xl bg-background"
                                        value={formData.configuracion.informativo.frecuencia.hora}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            configuracion: {
                                                ...formData.configuracion,
                                                informativo: {
                                                    ...formData.configuracion!.informativo!,
                                                    frecuencia: {
                                                        ...formData.configuracion!.informativo!.frecuencia!,
                                                        hora: e.target.value
                                                    }
                                                }
                                            }
                                        })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contenido de la Notificación</h3>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black">Título</Label>
                    <Input
                        required
                        className="h-11 rounded-xl bg-muted/30 border-none"
                        value={formData.contenido?.titulo}
                        onChange={(e) => setFormData({
                            ...formData,
                            contenido: { ...formData.contenido!, titulo: e.target.value }
                        })}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black">Cuerpo del Mensaje</Label>
                    <Textarea
                        required
                        className="min-h-[120px] rounded-2xl bg-muted/30 border-none"
                        value={formData.contenido?.cuerpo}
                        onChange={(e) => setFormData({
                            ...formData,
                            contenido: { ...formData.contenido!, cuerpo: e.target.value }
                        })}
                    />
                </div>
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
