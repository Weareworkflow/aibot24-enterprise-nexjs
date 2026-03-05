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

    // Initialize integrations array if not present or missing providers
    const [integrations, setIntegrations] = useState<AgentIntegration[]>(() => {
        const existing = agent.integrations || [];
        const hasOutlook = existing.some(i => i.provider === "OUTLOOK");
        const hasGoogle = existing.some(i => i.provider === "GOOGLE");

        const initial = [...existing];
        if (!hasOutlook) {
            initial.push({
                id: "outlook-primary",
                provider: "OUTLOOK",
                isActive: false,
                config: { assignments: [] }
            });
        }
        if (!hasGoogle) {
            initial.push({
                id: "google-primary",
                provider: "GOOGLE",
                isActive: false,
                config: { assignments: [] }
            });
        }
        return initial;
    });

    const [activeTab, setActiveTab] = useState<'OUTLOOK' | 'GOOGLE'>('OUTLOOK');

    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [advisorSearch, setAdvisorSearch] = useState("");
    const [calendars, setCalendars] = useState<any[]>([]);

    // State for the new assignment flow
    const [isAddingAssignment, setIsAddingAssignment] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [selectedCalendar, setSelectedCalendar] = useState<any>(null);

    // State for configuration mode
    const [isEditingConfig, setIsEditingConfig] = useState(false);

    // Find current integration from the list based on active tab
    const currentIntegration = integrations.find(i => i.provider === activeTab) || {
        id: `${activeTab.toLowerCase()}-primary`,
        provider: activeTab,
        isActive: false,
        config: { assignments: [] }
    };

    const isConfigured = activeTab === "OUTLOOK"
        ? !!(currentIntegration.config.clientId && currentIntegration.config.clientSecret && currentIntegration.config.tenantId)
        : !!(currentIntegration.config.clientEmail && currentIntegration.config.privateKey && currentIntegration.config.projectId);

    const updateCurrentConfig = (newConfig: any) => {
        setIntegrations(prev => prev.map(i =>
            i.provider === activeTab ? { ...i, config: { ...i.config, ...newConfig } } : i
        ));
    };

    const toggleCurrentActive = () => {
        setIntegrations(prev => prev.map(i =>
            i.provider === activeTab ? { ...i, isActive: !i.isActive } : i
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
        const config = currentIntegration.config;

        if (activeTab === "OUTLOOK") {
            if (!config.clientId || !config.clientSecret || !config.tenantId || !email) {
                toast({ title: "Credenciales Faltantes", description: "Por favor, completa las credenciales de Azure primero.", variant: "destructive" });
                return;
            }
        } else {
            if (!config.clientEmail || !config.privateKey || !email) {
                toast({ title: "Credenciales Faltantes", description: "Por favor, completa las credenciales de Google primero.", variant: "destructive" });
                return;
            }
        }

        setFetchingCalendars(true);
        try {
            const url = activeTab === "OUTLOOK" ? "/api/outlook/calendars" : "/api/google/calendars";
            const body = activeTab === "OUTLOOK"
                ? { clientId: config.clientId, clientSecret: config.clientSecret, tenantId: config.tenantId, userEmail: email }
                : { clientEmail: config.clientEmail, privateKey: config.privateKey, projectId: config.projectId, userEmail: email };

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || `Error al obtener calendarios de ${activeTab}`);
            }

            const data = await res.json();
            setCalendars(data);
        } catch (err: any) {
            toast({
                title: `Error ${activeTab}`,
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setFetchingCalendars(false);
        }
    };

    const handleAddAssignment = async () => {
        if (!selectedUser || !selectedCalendar) return;

        const newAssignment = {
            userId: selectedUser.id,
            userEmail: selectedUser.email,
            userName: selectedUser.name,
            calendarId: selectedCalendar.id,
            calendarName: selectedCalendar.name
        };

        const currentAssignments = currentIntegration.config.assignments || [];

        // Check if user already assigned
        if (currentAssignments.some((a: any) => a.userId === newAssignment.userId)) {
            toast({
                title: "Usuario Duplicado",
                description: "Este usuario ya tiene un calendario asignado.",
                variant: "destructive"
            });
            return;
        }

        const newAssignments = [...currentAssignments, newAssignment];

        // Update local state first for responsiveness
        const nextIntegrations = integrations.map(i =>
            i.provider === activeTab ? { ...i, config: { ...i.config, assignments: newAssignments } } : i
        );
        setIntegrations(nextIntegrations);

        // Save immediately
        try {
            await onUpdate({ integrations: nextIntegrations }, `Asesor vinculado (${activeTab})`);

            // Reset flow only on success
            setIsAddingAssignment(false);
            setSelectedUser(null);
            setSelectedCalendar(null);
            setSearch("");
            setCalendars([]);
        } catch (err) {
            // Error handled by onUpdate
        }
    };

    const handleRemoveAssignment = async (userId: string) => {
        const currentAssignments = currentIntegration.config.assignments || [];
        const newAssignments = currentAssignments.filter((a: any) => a.userId !== userId);

        // Update local state
        const nextIntegrations = integrations.map(i =>
            i.provider === activeTab ? { ...i, config: { ...i.config, assignments: newAssignments } } : i
        );
        setIntegrations(nextIntegrations);

        // Save immediately
        try {
            await onUpdate({ integrations: nextIntegrations }, `Asesor removido (${activeTab})`);
        } catch (err) {
            // Error handled by onUpdate
        }
    };

    const handleSaveConfig = async () => {
        setLoading(true);
        try {
            await onUpdate({
                integrations
            }, "Configuración de Azure");
            setIsEditingConfig(false);
        } catch (err: any) {
            // Error handled by onUpdate
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex gap-4 p-1 bg-muted/20 rounded-2xl w-fit">
                <button
                    onClick={() => { setActiveTab('OUTLOOK'); setIsEditingConfig(false); setIsAddingAssignment(false); }}
                    className={cn(
                        "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeTab === 'OUTLOOK' ? "bg-secondary text-white shadow-lg" : "text-muted-foreground hover:bg-muted/30"
                    )}
                >
                    Outlook Calendar
                </button>
                <button
                    onClick={() => { setActiveTab('GOOGLE'); setIsEditingConfig(false); setIsAddingAssignment(false); }}
                    className={cn(
                        "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeTab === 'GOOGLE' ? "bg-secondary text-white shadow-lg" : "text-muted-foreground hover:bg-muted/30"
                    )}
                >
                    Google Calendar
                </button>
            </div>

            <div className="flex flex-col gap-8">
                {/* Azure Credentials (Standard for the provider) */}
                <div className="w-full transition-all duration-500">
                    <Card className={cn(
                        "bg-card border border-border/40 rounded-[2.5rem] overflow-hidden shadow-sm h-fit transition-all duration-500",
                        (!isConfigured || isEditingConfig) ? "border-secondary/30 shadow-xl shadow-secondary/5" : "sticky top-6"
                    )}>
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
                            <div className="flex items-center gap-2">
                                {isConfigured && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsEditingConfig(!isEditingConfig)}
                                        className="h-8 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest"
                                    >
                                        {isEditingConfig ? "Cerrar" : "Modificar"}
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleCurrentActive}
                                    className={cn(
                                        "rounded-full h-8 w-8 transition-all",
                                        currentIntegration.isActive ? "text-green-500 bg-green-500/10" : "text-muted-foreground bg-muted"
                                    )}
                                >
                                    <Power className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className={cn("p-6 transition-all duration-500", (!isConfigured || isEditingConfig) ? "space-y-5" : "space-y-3")}>
                            {(!isConfigured || isEditingConfig) ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {activeTab === "OUTLOOK" ? (
                                            <>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Client ID</Label>
                                                    <Input
                                                        value={currentIntegration.config.clientId || ""}
                                                        onChange={(e) => updateCurrentConfig({ clientId: e.target.value })}
                                                        className="bg-muted/20 border-border/40 rounded-xl h-12 text-[10px] font-bold"
                                                        placeholder="ID de aplicación"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Client Secret</Label>
                                                    <Input
                                                        type="password"
                                                        value={currentIntegration.config.clientSecret || ""}
                                                        onChange={(e) => updateCurrentConfig({ clientSecret: e.target.value })}
                                                        className="bg-muted/20 border-border/40 rounded-xl h-12 text-[10px] font-bold"
                                                        placeholder="Secreto de cliente"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tenant ID</Label>
                                                    <Input
                                                        value={currentIntegration.config.tenantId || ""}
                                                        onChange={(e) => updateCurrentConfig({ tenantId: e.target.value })}
                                                        className="bg-muted/20 border-border/40 rounded-xl h-12 text-[10px] font-bold"
                                                        placeholder="ID de inquilino"
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Client Email</Label>
                                                    <Input
                                                        value={currentIntegration.config.clientEmail || ""}
                                                        onChange={(e) => updateCurrentConfig({ clientEmail: e.target.value })}
                                                        className="bg-muted/20 border-border/40 rounded-xl h-12 text-[10px] font-bold"
                                                        placeholder="email@project.iam.gserviceaccount.com"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Project ID</Label>
                                                    <Input
                                                        value={currentIntegration.config.projectId || ""}
                                                        onChange={(e) => updateCurrentConfig({ projectId: e.target.value })}
                                                        className="bg-muted/20 border-border/40 rounded-xl h-12 text-[10px] font-bold"
                                                        placeholder="id-del-proyecto"
                                                    />
                                                </div>
                                                <div className="space-y-1.5 md:col-span-3">
                                                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Private Key (RSA)</Label>
                                                    <textarea
                                                        value={currentIntegration.config.privateKey || ""}
                                                        onChange={(e) => updateCurrentConfig({ privateKey: e.target.value })}
                                                        className="w-full bg-muted/20 border border-border/40 rounded-2xl p-4 text-[10px] font-mono font-bold focus:outline-none focus:ring-1 focus:ring-secondary/30 min-h-[120px]"
                                                        placeholder="-----BEGIN PRIVATE KEY-----..."
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="pt-2 flex justify-end">
                                        <Button
                                            size="sm"
                                            onClick={handleSaveConfig}
                                            disabled={loading}
                                            className="bg-secondary text-white rounded-xl h-10 px-6 text-[9px] font-black uppercase tracking-widest shadow-lg shadow-secondary/20 transition-all hover:scale-[1.02]"
                                        >
                                            {loading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Save className="h-3 w-3 mr-2" />}
                                            Guardar Configuración
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-3 py-2">
                                    <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/20">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Status</span>
                                        <Badge variant="outline" className="bg-green-500/10 text-green-500 text-[8px] font-black tracking-widest border-none h-5 px-2">CONFIGURADO</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/20">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Provider</span>
                                        <span className="text-[9px] font-bold text-foreground">{activeTab === "OUTLOOK" ? "Microsoft Graph" : "Google Calendar v3"}</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Assignments List and Management */}
                {isConfigured && !isEditingConfig && (
                    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-secondary" />
                                <h3 className="text-sm font-black uppercase tracking-[0.15em]">Asesores y Calendarios</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                                    <Input
                                        value={advisorSearch}
                                        onChange={(e) => setAdvisorSearch(e.target.value)}
                                        placeholder="Filtrar asesores..."
                                        className="pl-9 h-9 w-full sm:w-48 bg-muted/20 border-border/40 rounded-xl text-[10px] font-bold focus:ring-secondary/30"
                                    />
                                </div>
                                {!isAddingAssignment && (
                                    <Button
                                        size="sm"
                                        onClick={() => setIsAddingAssignment(true)}
                                        className="rounded-xl h-9 bg-secondary hover:bg-secondary/90 text-white text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Plus className="h-3 w-3 mr-2" />
                                        Agregar
                                    </Button>
                                )}
                            </div>
                        </div>

                        {isAddingAssignment ? (
                            <Card className="bg-card border-2 border-dashed border-secondary/30 rounded-[2.5rem] overflow-hidden animate-in slide-in-from-top-4 duration-500 shadow-2xl shadow-secondary/5">
                                <CardHeader className="p-6 border-b bg-secondary/5 border-secondary/10 flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <UserPlus className="h-4 w-4 text-secondary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Vincular Nuevo Asesor</span>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => { setIsAddingAssignment(false); setSelectedUser(null); }} className="h-8 rounded-xl text-[9px] font-bold uppercase transition-colors hover:bg-secondary/10 hover:text-secondary">Cancelar</Button>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">1. Seleccionar Empleado</Label>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/40" />
                                                <Input
                                                    value={search}
                                                    onChange={(e) => { setSearch(e.target.value); handleSearchUsers(e.target.value); }}
                                                    placeholder="Buscar en Bitrix24..."
                                                    className="pl-10 bg-muted/20 border-border/40 rounded-xl h-11 text-xs font-bold focus:ring-secondary/30"
                                                />
                                                {searchingUsers && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
                                            </div>
                                            <div className="border border-border/40 rounded-[1.5rem] bg-muted/5 overflow-hidden shadow-inner">
                                                <ScrollArea className="h-48">
                                                    <div className="p-2 space-y-1">
                                                        {users.map(u => (
                                                            <button
                                                                key={u.id}
                                                                onClick={() => { setSelectedUser(u); handleFetchCalendars(u.email); }}
                                                                className={cn(
                                                                    "w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all",
                                                                    selectedUser?.id === u.id ? "bg-secondary text-white shadow-lg shadow-secondary/20" : "hover:bg-muted/50"
                                                                )}
                                                            >
                                                                <Avatar className="h-8 w-8 border-2 border-background/20">
                                                                    <AvatarImage src={u.avatar} />
                                                                    <AvatarFallback className="text-[10px] font-black">{u.name.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="overflow-hidden">
                                                                    <p className="text-[10px] font-black truncate leading-tight">{u.name}</p>
                                                                    <p className="text-[8px] truncate opacity-80 font-medium">{u.email}</p>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">2. Vincular Calendario</Label>
                                            <div className="min-h-[140px] flex flex-col justify-between pt-1">
                                                <Select
                                                    disabled={!selectedUser || fetchingCalendars}
                                                    onValueChange={(val) => {
                                                        const cal = calendars.find(c => c.id === val);
                                                        setSelectedCalendar(cal);
                                                    }}
                                                >
                                                    <SelectTrigger className="bg-muted/20 border-border/40 rounded-xl h-11 text-xs font-bold focus:ring-secondary/30 transition-all">
                                                        <SelectValue placeholder={fetchingCalendars ? "Sincronizando..." : `Selecciona un calendario de ${activeTab === "OUTLOOK" ? "Outlook" : "Google"}`} />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-border/40">
                                                        {calendars.map(c => (
                                                            <SelectItem key={c.id} value={c.id} className="text-[10px] font-bold rounded-lg my-1">
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="h-3 w-3 text-secondary/60" />
                                                                    <span className="truncate max-w-[200px]">{c.name}</span> {c.isDefault && "(Principal)"}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <div className="pt-8">
                                                    <Button
                                                        disabled={!selectedUser || !selectedCalendar}
                                                        onClick={handleAddAssignment}
                                                        className="w-full h-12 bg-secondary hover:bg-secondary/90 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-secondary/20 transition-all hover:scale-[1.02] active:scale-95"
                                                    >
                                                        Finalizar Vinculación
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : null}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {(currentIntegration.config.assignments || []).length > 0 ? (
                                (currentIntegration.config.assignments || [])
                                    .filter((as: any) =>
                                        as.userName.toLowerCase().includes(advisorSearch.toLowerCase()) ||
                                        as.userEmail.toLowerCase().includes(advisorSearch.toLowerCase())
                                    )
                                    .map((as: any) => (
                                        <Card key={as.userId} className="bg-card border border-border/40 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border-l-4 border-l-secondary/40">
                                            <div className="p-5 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <Avatar className="h-12 w-12 border-2 border-secondary/10 shadow-sm transition-transform group-hover:scale-105">
                                                            <AvatarFallback className="bg-secondary/5 text-secondary text-sm font-black">
                                                                {as.userName.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="absolute -bottom-1 -right-1 bg-green-500 h-3.5 w-3.5 rounded-full border-2 border-background shadow-sm" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground leading-tight group-hover:text-secondary transition-colors">{as.userName}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="p-0 border-none bg-transparent text-[8px] text-muted-foreground lowercase font-semibold opacity-70">{as.userEmail}</Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-secondary/5 rounded-lg w-fit">
                                                            <Calendar className="h-3 w-3 text-secondary" />
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-secondary">{as.calendarName}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveAssignment(as.userId)}
                                                    className="h-10 w-10 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </Card>
                                    ))
                            ) : !isAddingAssignment ? (
                                <div className="col-span-1 md:col-span-2 p-16 text-center bg-muted/5 border-2 border-dashed border-border/40 rounded-[3rem] transition-colors hover:bg-muted/10">
                                    <div className="bg-muted/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Users className="h-8 w-8 text-muted-foreground/30" />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Escuadrón No Asignado</p>
                                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-2 max-w-[280px] mx-auto leading-relaxed">
                                        Configura el primer asesor para habilitar la toma de citas inteligente a través de {activeTab === "OUTLOOK" ? "Outlook" : "Google Calendar"}.
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsAddingAssignment(true)}
                                        className="mt-6 rounded-xl border-secondary/30 text-secondary hover:bg-secondary hover:text-white px-6 text-[9px] font-black uppercase tracking-widest"
                                    >
                                        Comenzar Ahora
                                    </Button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
