"use client";

import { useState, useEffect, useCallback } from "react";
import { AIAgent, AgentIntegration } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Building2,
    Key,
    Mail,
    Search,
    Calendar,
    Save,
    Loader2,
    Check,
    ShieldCheck,
    Users,
    Power,
    PowerOff,
    Plus,
    Trash2,
    UserPlus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface IntegrationSectionProps {
    agent: AIAgent;
    onUpdate: (updates: Partial<AIAgent>, title?: string) => Promise<void>;
}

export function IntegrationSection({ agent, onUpdate }: IntegrationSectionProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fetchingCalendars, setFetchingCalendars] = useState(false);
    const [searchingUsers, setSearchingUsers] = useState(false);

    // Initialize integrations array if not present
    const [integrations, setIntegrations] = useState<AgentIntegration[]>(
        agent.integrations && agent.integrations.length > 0
            ? agent.integrations
            : [{
                id: "outlook-primary",
                provider: "OUTLOOK",
                isActive: false,
                config: { assignments: [] }
            }]
    );

    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [calendars, setCalendars] = useState<any[]>([]);

    // State for the new assignment flow
    const [isAddingAssignment, setIsAddingAssignment] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [selectedCalendar, setSelectedCalendar] = useState<any>(null);

    // Find Outlook integration from the list
    const outlookIntegration = integrations.find(i => i.provider === "OUTLOOK") || {
        id: "outlook-primary",
        provider: "OUTLOOK",
        isActive: false,
        config: { assignments: [] }
    };

    const updateOutlookConfig = (newConfig: any) => {
        setIntegrations(prev => prev.map(i =>
            i.provider === "OUTLOOK" ? { ...i, config: { ...i.config, ...newConfig } } : i
        ));
    };

    const toggleOutlookActive = () => {
        setIntegrations(prev => prev.map(i =>
            i.provider === "OUTLOOK" ? { ...i, isActive: !i.isActive } : i
        ));
    };

    const handleSearchUsers = useCallback(async (query: string) => {
        if (!agent.tenantId) return;
        setSearchingUsers(true);
        try {
            const res = await fetch(`/api/bitrix/users?tenantId=${encodeURIComponent(agent.tenantId)}${query ? `&search=${encodeURIComponent(query)}` : ""}`);
            if (!res.ok) throw new Error("Error buscando usuarios");
            const data = await res.json();
            setUsers(data);
        } catch (err: any) {
            console.error(err);
        } finally {
            setSearchingUsers(false);
        }
    }, [agent.tenantId]);

    useEffect(() => {
        handleSearchUsers("");
    }, [handleSearchUsers]);

    const handleFetchCalendars = async (email: string) => {
        const config = outlookIntegration.config;
        if (!config.clientId || !config.clientSecret || !config.tenantId || !email) {
            toast({
                title: "Credenciales Faltantes",
                description: "Por favor, completa las credenciales de Azure primero.",
                variant: "destructive",
            });
            return;
        }

        setFetchingCalendars(true);
        try {
            const res = await fetch("/api/outlook/calendars", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clientId: config.clientId,
                    clientSecret: config.clientSecret,
                    tenantId: config.tenantId,
                    userEmail: email,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Error al obtener calendarios");
            }

            const data = await res.json();
            setCalendars(data);
        } catch (err: any) {
            toast({
                title: "Error Outlook",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setFetchingCalendars(false);
        }
    };

    const handleAddAssignment = () => {
        if (!selectedUser || !selectedCalendar) return;

        const newAssignment = {
            userId: selectedUser.id,
            userEmail: selectedUser.email,
            userName: selectedUser.name,
            calendarId: selectedCalendar.id,
            calendarName: selectedCalendar.name
        };

        const currentAssignments = outlookIntegration.config.assignments || [];

        // Check if user already assigned
        if (currentAssignments.some((a: any) => a.userId === newAssignment.userId)) {
            toast({
                title: "Usuario Duplicado",
                description: "Este usuario ya tiene un calendario asignado.",
                variant: "destructive"
            });
            return;
        }

        updateOutlookConfig({
            assignments: [...currentAssignments, newAssignment]
        });

        // Reset flow
        setIsAddingAssignment(false);
        setSelectedUser(null);
        setSelectedCalendar(null);
        setSearch("");
        setCalendars([]);
    };

    const handleRemoveAssignment = (userId: string) => {
        const currentAssignments = outlookIntegration.config.assignments || [];
        updateOutlookConfig({
            assignments: currentAssignments.filter((a: any) => a.userId !== userId)
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await onUpdate({
                integrations
            }, "Configuración de Integraciones");
        } catch (err: any) {
            // Error handled by onUpdate
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-headline font-bold text-foreground">Gestión de Integraciones</h2>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">Configuración de proveedores y asignaciones de calendario</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-secondary hover:bg-secondary/90 text-white rounded-2xl h-12 px-6 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-secondary/20 transition-all hover:scale-[1.02]"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Guardar Cambios
                </Button>
            </div>

            <div className="flex gap-4 p-1 bg-muted/20 rounded-2xl w-fit">
                <button className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-secondary text-white shadow-lg">
                    Outlook
                </button>
                <button className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 cursor-not-allowed" disabled>
                    Google
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Azure Credentials (Standard for the provider) */}
                <div className="lg:col-span-1">
                    <Card className="bg-card border border-border/40 rounded-[2.5rem] overflow-hidden shadow-sm h-fit sticky top-6">
                        <CardHeader className="p-6 border-b bg-muted/5 border-border/40 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-blue-500/10">
                                    <ShieldCheck className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-black uppercase tracking-[0.15em] text-foreground">Tenant Azure</CardTitle>
                                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Credenciales Globales</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleOutlookActive}
                                className={cn(
                                    "rounded-full h-8 w-8 transition-all",
                                    outlookIntegration.isActive ? "text-green-500 bg-green-500/10" : "text-muted-foreground bg-muted"
                                )}
                            >
                                <Power className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Client ID</Label>
                                <Input
                                    value={outlookIntegration.config.clientId || ""}
                                    onChange={(e) => updateOutlookConfig({ clientId: e.target.value })}
                                    className="bg-muted/20 border-border/40 rounded-xl h-10 text-[10px] font-bold"
                                    placeholder="ID de aplicación"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Client Secret</Label>
                                <Input
                                    type="password"
                                    value={outlookIntegration.config.clientSecret || ""}
                                    onChange={(e) => updateOutlookConfig({ clientSecret: e.target.value })}
                                    className="bg-muted/20 border-border/40 rounded-xl h-10 text-[10px] font-bold"
                                    placeholder="Secreto de cliente"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tenant ID</Label>
                                <Input
                                    value={outlookIntegration.config.tenantId || ""}
                                    onChange={(e) => updateOutlookConfig({ tenantId: e.target.value })}
                                    className="bg-muted/20 border-border/40 rounded-xl h-10 text-[10px] font-bold"
                                    placeholder="ID de inquilino"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Assignments List and Management */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-secondary" />
                            <h3 className="text-sm font-black uppercase tracking-[0.15em]">Asignaciones de Calendario</h3>
                        </div>
                        {!isAddingAssignment && (
                            <Button
                                size="sm"
                                onClick={() => setIsAddingAssignment(true)}
                                className="rounded-xl h-9 bg-secondary hover:bg-secondary/90 text-white text-[9px] font-black uppercase tracking-widest"
                            >
                                <Plus className="h-3 w-3 mr-2" />
                                Agregar Asesor
                            </Button>
                        )}
                    </div>

                    {isAddingAssignment ? (
                        <Card className="bg-card border-2 border-dashed border-secondary/30 rounded-[2.5rem] overflow-hidden animate-in slide-in-from-top-4 duration-500">
                            <CardHeader className="p-6 border-b bg-secondary/5 border-secondary/10 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <UserPlus className="h-4 w-4 text-secondary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Nuevo Calendario Vinculado</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => { setIsAddingAssignment(false); setSelectedUser(null); }} className="h-8 rounded-xl text-[9px] font-bold uppercase">Cancelar</Button>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">1. Buscar Asesor</Label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/40" />
                                            <Input
                                                value={search}
                                                onChange={(e) => {
                                                    setSearch(e.target.value);
                                                    handleSearchUsers(e.target.value);
                                                }}
                                                placeholder="Nombre o Email..."
                                                className="pl-10 bg-muted/20 border-border/40 rounded-xl h-10 text-xs font-bold"
                                            />
                                            {searchingUsers && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-secondary" />}
                                        </div>
                                        <div className="border border-border/40 rounded-xl bg-muted/5 overflow-hidden shadow-inner">
                                            <ScrollArea className="h-32">
                                                <div className="p-2 space-y-1">
                                                    {users.length === 0 && !searchingUsers && search && (
                                                        <p className="text-[9px] text-center p-4 text-muted-foreground uppercase font-black tracking-widest">Sin resultados</p>
                                                    )}
                                                    {users.map(u => (
                                                        <button
                                                            key={u.id}
                                                            onClick={() => { setSelectedUser(u); handleFetchCalendars(u.email); }}
                                                            className={cn(
                                                                "w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all",
                                                                selectedUser?.id === u.id ? "bg-secondary text-white" : "hover:bg-muted/50"
                                                            )}
                                                        >
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarImage src={u.avatar} />
                                                                <AvatarFallback className="text-[8px]">{u.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="overflow-hidden">
                                                                <p className="text-[9px] font-black truncate">{u.name}</p>
                                                                <p className="text-[7px] truncate opacity-60">{u.email}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">2. Seleccionar Calendario</Label>
                                        <Select
                                            disabled={!selectedUser || fetchingCalendars}
                                            onValueChange={(val) => {
                                                const cal = calendars.find(c => c.id === val);
                                                setSelectedCalendar(cal);
                                            }}
                                        >
                                            <SelectTrigger className="bg-muted/20 border-border/40 rounded-xl h-10 text-xs font-bold">
                                                <SelectValue placeholder={fetchingCalendars ? "Cargando..." : "Elige un calendario"} />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border/40">
                                                {calendars.map(c => (
                                                    <SelectItem key={c.id} value={c.id} className="text-[10px] font-bold">
                                                        {c.name} {c.isDefault && "(Principal)"}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <div className="pt-4">
                                            <Button
                                                disabled={!selectedUser || !selectedCalendar}
                                                onClick={handleAddAssignment}
                                                className="w-full h-10 bg-secondary hover:bg-secondary/90 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-secondary/20"
                                            >
                                                Confirmar Asignación
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : null}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(outlookIntegration.config?.assignments || []).length > 0 ? (
                            (outlookIntegration.config?.assignments || []).map((as: any) => (
                                <Card key={as.userId} className="bg-card border border-border/40 rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border-2 border-secondary/10">
                                                <AvatarFallback className="bg-secondary/5 text-secondary text-xs font-black">
                                                    {as.userName.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">{as.userName}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge variant="outline" className="p-0 border-none text-[8px] text-muted-foreground lowercase font-medium">{as.userEmail}</Badge>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1.5 text-secondary">
                                                    <Calendar className="h-3 w-3" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest">{as.calendarName}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveAssignment(as.userId)}
                                            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </Card>
                            ))
                        ) : !isAddingAssignment ? (
                            <div className="col-span-2 p-12 text-center bg-muted/5 border-2 border-dashed border-border/40 rounded-[2.5rem]">
                                <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No hay asesores asignados</p>
                                <p className="text-[8px] text-muted-foreground/50 uppercase tracking-widest mt-1">Haz clic en 'Agregar Asesor' para gestionar su disponibilidad.</p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
