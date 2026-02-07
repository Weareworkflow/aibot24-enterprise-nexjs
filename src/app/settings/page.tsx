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
  Database,
  Sparkles
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
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden high-volume">
          {/* Header Compacto Integrado */}
          <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/30 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 flex items-center justify-center bg-white rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <CardTitle className="text-lg font-headline font-bold text-slate-900 leading-none">Configuración</CardTitle>
                <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1 flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-secondary" />
                  Enterprise Protocol
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full border border-accent/20">
              <div className="h-1.5 w-1.5 bg-accent rounded-full animate-pulse" />
              <span className="text-[8px] font-black uppercase text-accent tracking-widest">Activo</span>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-8">
            {/* Perfil Horizontal Compacto (Diseño Refinado) */}
            <div className="bg-slate-900 rounded-[2rem] p-6 text-white flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-sm shadow-inner">
                  <Building2 className="h-7 w-7 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-headline leading-tight tracking-tight text-white">{portalName}</h3>
                  <div className="mt-1 flex flex-col">
                    <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-0.5">Dominio Bitrix24</span>
                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                      <Globe className="h-3 w-3 text-secondary/60" />
                      {domain || "bitrix24.enterprise"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Estado Operativo</p>
                <div className="flex items-center gap-2 justify-end mt-1">
                  <span className="h-2 w-2 bg-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  <p className="text-[10px] font-black uppercase text-accent">Portal Enlazado</p>
                </div>
              </div>
            </div>

            {/* Protocolos Técnicos */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-1">
                <Sparkles className="h-4 w-4 text-secondary" />
                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-700">Protocolos de Integración</h4>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Webhook */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-3.5 w-3.5 text-secondary" />
                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Webhook del Agente AI</Label>
                  </div>
                  <Input 
                    value={formData.serviceWebhook}
                    onChange={(e) => setFormData({...formData, serviceWebhook: e.target.value})}
                    placeholder="https://su-portal.bitrix24.com/rest/1/..." 
                    className="h-11 bg-slate-50/50 border-slate-100 rounded-xl px-4 text-[12px] focus:bg-white transition-all shadow-inner"
                  />
                </div>

                {/* OAuth Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Key className="h-3.5 w-3.5 text-secondary" />
                      <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Cliente ID</Label>
                    </div>
                    <Input 
                      value={formData.clientId}
                      onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                      placeholder="local.65..." 
                      className="h-11 bg-slate-50/50 border-slate-100 rounded-xl px-4 font-mono text-[11px] focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
                      <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Secret ID</Label>
                    </div>
                    <Input 
                      type="password"
                      value={formData.clientSecret}
                      onChange={(e) => setFormData({...formData, clientSecret: e.target.value})}
                      placeholder="••••••••••••••••" 
                      className="h-11 bg-slate-50/50 border-slate-100 rounded-xl px-4 font-mono text-[11px] focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="pt-2">
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-12 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-secondary/10 transition-all active:scale-95"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {isSaving ? "Sincronizando..." : "Guardar Cambios"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/40 rounded-full border border-slate-200 backdrop-blur-sm">
            <Database className="h-3 w-3 text-slate-400" />
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Cloud Sync Architecture</span>
          </div>
        </div>
      </main>
    </div>
  );
}
