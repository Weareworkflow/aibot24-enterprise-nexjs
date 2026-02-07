
"use client";

import { useMemo, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Globe, 
  ShieldCheck, 
  Link2, 
  Key, 
  ArrowLeft,
  Loader2,
  Save,
  Database
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/lib/store";
import { useDoc, useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { BitrixInstallation } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const router = useRouter();
  const db = useFirestore();
  const { tenantId, domain } = useUIStore();
  const { toast } = useToast();
  
  const installationRef = useMemo(() => {
    if (!db || !tenantId) return null;
    return doc(db, "installations", tenantId);
  }, [db, tenantId]);

  const { data: installation, loading } = useDoc<BitrixInstallation>(installationRef);
  
  const [formData, setFormData] = useState({
    clientId: "",
    clientSecret: "",
    serviceWebhook: ""
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (installation) {
      setFormData({
        clientId: installation.clientId || "",
        clientSecret: installation.clientSecret || "",
        serviceWebhook: installation.serviceWebhook || ""
      });
    }
  }, [installation]);

  const handleSave = async () => {
    if (!installationRef) return;
    setIsSaving(true);
    try {
      await updateDoc(installationRef, {
        ...formData
      });
      toast({
        title: "Protocolo Guardado",
        description: "Los parámetros de integración han sido actualizados."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de Guardado",
        description: "No se pudieron actualizar los datos técnicos."
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col min-h-screen bg-[#F0F3F5]">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sincronizando Consola...</p>
      </div>
    </div>
  );

  const portalName = domain ? domain.split('.')[0].toUpperCase() : "PORTAL ACTIVO";

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F3F5]">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
        
        {/* Header Consola */}
        <div className="flex items-center gap-6 mb-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-12 w-12 flex items-center justify-center bg-white rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-md border border-slate-100 flex-shrink-0"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-headline font-bold text-slate-900">Consola de Configuración</h1>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mt-2 flex items-center gap-2">
              <ShieldCheck className="h-3 w-3 text-secondary" />
              Gestión de Protocolos Enterprise
            </p>
          </div>
        </div>

        {/* 1. Perfil de Empresa (Principal) */}
        <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden high-volume">
          <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                <Building2 className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-headline font-bold">Perfil de Empresa</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nombre del Portal</Label>
              <div className="h-14 flex items-center px-6 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-800 shadow-inner">
                {portalName}
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dominio Bitrix24</Label>
              <div className="h-14 flex items-center px-6 bg-slate-50 rounded-2xl border border-slate-100 font-medium text-slate-600 shadow-inner overflow-hidden truncate">
                <Globe className="h-3.5 w-3.5 mr-3 text-slate-400" />
                {domain || "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Integración Bitrix24 (Técnico) */}
        <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden high-volume">
          <CardHeader className="p-10 border-b border-slate-50 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-headline font-bold">Integración Bitrix24</CardTitle>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mt-1">Parámetros de Instalación REST</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10 space-y-10">
            
            {/* Campos OAuth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="h-3 w-3 text-secondary" />
                  <Label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Cliente ID</Label>
                </div>
                <Input 
                  value={formData.clientId}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                  placeholder="local.65..." 
                  className="h-14 bg-slate-50 border-slate-200 rounded-2xl px-6 font-mono text-[11px] focus:bg-white transition-all shadow-inner"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3 text-secondary" />
                  <Label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Secret ID</Label>
                </div>
                <Input 
                  type="password"
                  value={formData.clientSecret}
                  onChange={(e) => setFormData({...formData, clientSecret: e.target.value})}
                  placeholder="••••••••••••••••" 
                  className="h-14 bg-slate-50 border-slate-200 rounded-2xl px-6 font-mono text-[11px] focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Webhook de Servicio */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Link2 className="h-3 w-3 text-secondary" />
                <Label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Webhook de Servicio</Label>
              </div>
              <Input 
                value={formData.serviceWebhook}
                onChange={(e) => setFormData({...formData, serviceWebhook: e.target.value})}
                placeholder="https://su-portal.bitrix24.com/rest/1/webhook-key/" 
                className="h-14 bg-slate-50 border-slate-200 rounded-2xl px-6 font-medium text-[12px] focus:bg-white transition-all shadow-inner"
              />
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest pl-2">
                Endpoint para notificaciones de eventos y triggers externos.
              </p>
            </div>

            {/* Botón Guardar */}
            <div className="pt-4">
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-14 rounded-full bg-secondary hover:bg-secondary/90 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-secondary/20 transition-all hover:scale-[1.01]"
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Save className="h-5 w-5 mr-3" />}
                {isSaving ? "Guardando Protocolo..." : "Sincronizar Parámetros"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center pt-8 pb-12">
          <div className="flex items-center gap-3 px-6 py-3 bg-white/50 rounded-full border border-slate-200 shadow-sm backdrop-blur-sm">
            <span className="h-2 w-2 bg-accent rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Conexión REST Activa con Bitrix24</span>
          </div>
        </div>
      </main>
    </div>
  );
}
