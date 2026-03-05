"use client";

import { useState, useEffect, useCallback } from "react";
import { AIAgent } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Search,
    Database,
    Plus,
    Loader2,
    Briefcase,
    User,
    Target,
    Building2,
    ShieldCheck,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AdvancedFieldsSectionProps {
    agent: AIAgent;
    onUpdate: (updates: Partial<AIAgent>, title?: string) => Promise<void>;
}

type EntityType = 'leads' | 'contacts' | 'deals' | 'companies';

interface BitrixField {
    id: string;
    code: string;
    label: string;
    type: string;
    mandatory: boolean;
}

const ENTITIES: { id: EntityType, label: string, icon: any, color: string }[] = [
    { id: 'leads', label: 'Prospectos', icon: Target, color: 'text-orange-500' },
    { id: 'contacts', label: 'Contactos', icon: User, color: 'text-blue-500' },
    { id: 'deals', label: 'Negociaciones', icon: Briefcase, color: 'text-green-500' },
    { id: 'companies', label: 'Empresas', icon: Building2, color: 'text-purple-500' },
];

export function AdvancedFieldsSection({ agent, onUpdate }: AdvancedFieldsSectionProps) {
    const { toast } = useToast();
    const [activeEntity, setActiveEntity] = useState<EntityType>('leads');
    const [fields, setFields] = useState<BitrixField[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    // Create field state
    const [isCreating, setIsCreating] = useState(false);
    const [newFieldLabel, setNewFieldLabel] = useState("");
    const [newFieldType, setNewFieldType] = useState("string");
    const [creatingField, setCreatingField] = useState(false);

    const managedFields = agent.managedFields || {};

    const fetchFields = useCallback(async (entity: EntityType) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/bitrix/fields?tenantId=${agent.tenantId}&entity=${entity}`);
            if (!res.ok) throw new Error("Error al obtener campos");
            const data = await res.json();
            setFields(data);
        } catch (err: any) {
            toast({
                title: "Error Bitrix24",
                description: err.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [agent.tenantId, toast]);

    useEffect(() => {
        fetchFields(activeEntity);
    }, [activeEntity, fetchFields]);

    const handleToggleField = async (fieldCode: string) => {
        const currentSelections = managedFields[activeEntity] || [];
        const isSelected = currentSelections.includes(fieldCode);

        const nextSelections = isSelected
            ? currentSelections.filter(c => c !== fieldCode)
            : [...currentSelections, fieldCode];

        const nextManagedFields = {
            ...managedFields,
            [activeEntity]: nextSelections
        };

        try {
            await onUpdate({ managedFields: nextManagedFields }, `Campo ${isSelected ? 'removido' : 'habilitado'}`);
        } catch (err) {
            // Error handled by onUpdate
        }
    };

    const handleCreateField = async () => {
        if (!newFieldLabel.trim()) return;

        setCreatingField(true);
        try {
            const res = await fetch("/api/bitrix/fields", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenantId: agent.tenantId,
                    entity: activeEntity,
                    label: newFieldLabel,
                    type: newFieldType
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Error al crear campo");
            }

            const result = await res.json();

            toast({
                title: "Campo Creado",
                description: `El campo ${result.fieldName} se creó correctamente en Bitrix24.`
            });

            // Automatically enable the new field
            const currentSelections = managedFields[activeEntity] || [];
            const nextManagedFields = {
                ...managedFields,
                [activeEntity]: [...currentSelections, result.fieldName]
            };
            await onUpdate({ managedFields: nextManagedFields });

            // Reset and refresh
            setIsCreating(false);
            setNewFieldLabel("");
            fetchFields(activeEntity);
        } catch (err: any) {
            toast({
                title: "Error al crear",
                description: err.message,
                variant: "destructive"
            });
        } finally {
            setCreatingField(false);
        }
    };

    const filteredFields = fields.filter(f =>
        f.label.toLowerCase().includes(search.toLowerCase()) ||
        f.code.toLowerCase().includes(search.toLowerCase())
    );

    const selectedCount = managedFields[activeEntity]?.length || 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Entity Selector Tabs */}
            <div className="flex flex-wrap gap-4 p-1.5 bg-muted/20 rounded-[2rem] w-fit">
                {ENTITIES.map((entity) => {
                    const Icon = entity.icon;
                    const isActive = activeEntity === entity.id;
                    const count = managedFields[entity.id]?.length || 0;

                    return (
                        <button
                            key={entity.id}
                            onClick={() => setActiveEntity(entity.id)}
                            className={cn(
                                "relative px-6 py-3 rounded-2xl flex items-center gap-3 transition-all duration-300",
                                isActive
                                    ? "bg-secondary text-white shadow-xl shadow-secondary/20 scale-105 z-10"
                                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("h-4 w-4", !isActive && entity.color)} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{entity.label}</span>
                            {count > 0 && (
                                <Badge className={cn(
                                    "h-5 w-5 p-0 flex items-center justify-center rounded-full text-[9px] font-black border-none",
                                    isActive ? "bg-white text-secondary" : "bg-secondary/10 text-secondary"
                                )}>
                                    {count}
                                </Badge>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content Card */}
                <Card className="flex-1 bg-card border border-border/40 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <CardHeader className="p-6 border-b bg-muted/5 border-border/40 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-secondary/10">
                                <Database className="h-5 w-5 text-secondary" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-black uppercase tracking-[0.15em] text-foreground">
                                    Diccionario de Datos
                                </CardTitle>
                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                                    Configuración de Identidad en Bitrix24
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative w-48 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar campo..."
                                    className="pl-9 h-10 bg-muted/20 border-border/40 rounded-xl text-[10px] font-bold focus:ring-secondary/30"
                                />
                            </div>

                            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="bg-secondary text-white rounded-xl h-10 px-4 text-[9px] font-black uppercase tracking-widest shadow-lg shadow-secondary/10">
                                        <Plus className="h-3 w-3 mr-2" />
                                        Crear Campo
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-[2.5rem] border-border/40 bg-card p-10 max-w-md">
                                    <DialogHeader className="mb-6">
                                        <DialogTitle className="text-xl font-headline font-bold uppercase tracking-widest">Nuevo Campo en {activeEntity.slice(0, -1)}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Etiqueta del Campo</Label>
                                            <Input
                                                value={newFieldLabel}
                                                onChange={(e) => setNewFieldLabel(e.target.value)}
                                                placeholder="Ej: Presupuesto Estimado"
                                                className="bg-muted/20 border-border/40 rounded-xl h-12 text-[10px] font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tipo de Dato</Label>
                                            <Select value={newFieldType} onValueChange={setNewFieldType}>
                                                <SelectTrigger className="bg-muted/20 border-border/40 rounded-xl h-12 text-[10px] font-bold transition-all">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-border/40">
                                                    <SelectItem value="string" className="text-[10px] font-bold rounded-lg my-1">Texto (Cualquier dato)</SelectItem>
                                                    <SelectItem value="double" className="text-[10px] font-bold rounded-lg my-1">Número (Dinero, Cantidades)</SelectItem>
                                                    <SelectItem value="boolean" className="text-[10px] font-bold rounded-lg my-1">Booleano (Sí / No)</SelectItem>
                                                    <SelectItem value="datetime" className="text-[10px] font-bold rounded-lg my-1">Fecha y Hora</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            onClick={handleCreateField}
                                            disabled={creatingField || !newFieldLabel}
                                            className="w-full h-12 bg-secondary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-secondary/20 transition-all hover:scale-[1.02]"
                                        >
                                            {creatingField ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear en Bitrix24 e Habilitar"}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <ScrollArea className="h-[500px]">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full py-20 space-y-4">
                                    <Loader2 className="h-8 w-8 animate-spin text-secondary/40" />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Sincronizando con Bitrix24...</p>
                                </div>
                            ) : filteredFields.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 p-6 gap-3">
                                    {filteredFields.map((field) => {
                                        const isSelected = managedFields[activeEntity]?.includes(field.code);

                                        return (
                                            <div
                                                key={field.id}
                                                onClick={() => handleToggleField(field.code)}
                                                className={cn(
                                                    "group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                                                    isSelected
                                                        ? "bg-secondary/[0.03] border-secondary/30 shadow-sm"
                                                        : "bg-muted/5 border-border/20 hover:border-secondary/20 hover:bg-muted/10"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                                                        isSelected ? "bg-secondary text-white" : "bg-muted text-muted-foreground group-hover:bg-secondary/10 group-hover:text-secondary"
                                                    )}>
                                                        {isSelected ? <CheckCircle2 className="h-5 w-5" /> : <Database className="h-4 w-4" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground group-hover:text-secondary transition-colors">
                                                            {field.label}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <code className="text-[8px] font-bold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded uppercase">{field.code}</code>
                                                            <Badge variant="outline" className="h-4 px-1.5 text-[7px] font-black border-none bg-muted/30 text-muted-foreground lowercase">{field.type}</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => handleToggleField(field.code)}
                                                    className="h-5 w-5 rounded-md border-border/40 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
                                    <div className="bg-muted/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                                        <Database className="h-8 w-8 text-muted-foreground/30" />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-widest text-foreground">No se encontraron campos</p>
                                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-2 max-w-xs leading-relaxed">
                                        No hay campos personalizados que coincidan con tu búsqueda en {activeEntity}.
                                    </p>
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Summary / Stats Card */}
                <Card className="lg:w-80 bg-card border border-border/40 rounded-[2.5rem] overflow-hidden shadow-sm h-fit sticky top-6">
                    <CardHeader className="p-6 border-b bg-muted/5 border-border/40">
                        <CardTitle className="text-xs font-black uppercase tracking-widest">Resumen de Gestión</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Campos Activos</span>
                                <Badge className="bg-secondary text-white font-black text-[10px] h-6 px-3 rounded-full">{selectedCount}</Badge>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-secondary transition-all duration-1000"
                                    style={{ width: `${Math.min(100, (selectedCount / 10) * 100)}%` }}
                                />
                            </div>
                            <p className="text-[8px] text-muted-foreground font-medium italic">
                                * El agente priorizará la lectura y actualización de estos campos durante las interacciones con el usuario.
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/10 space-y-3">
                            <div className="flex items-center gap-2 text-secondary">
                                <ShieldCheck className="h-4 w-4" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Gobernanza de Datos</span>
                            </div>
                            <p className="text-[8px] leading-relaxed font-bold text-muted-foreground/80 lowercase">
                                El agente solo tendrá permisos para consultar y modificar los códigos UF vinculados explícitamente en esta sección para evitar inconsistencias en el CRM.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
