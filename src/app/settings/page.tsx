
"use client";

import { useMemo, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Sparkles,
  Info,
  Palette,
  CloudCog,
  Sun,
  Moon,
  Monitor
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/lib/store";
import { useDoc, useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { BitrixInstallation } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const router = useRouter();
  const db = useFirestore();
  const { theme, setTheme } = useTheme();
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
    <div className="flex flex-col min-h-screen bg-[#F0F3F5] dark:bg-slate-950">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sincronizando Consola...</p>
      </div>
    </div>
  );

  const portalName = domain ? domain.split('.')[0].toUpperCase() : "WORKFLOWTEAMS";

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F3F5] dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden high-volume transition-colors duration-300">
          <CardHeader className="p-6 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all shadow-sm border border-slate-100 dark:border-slate-700"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <CardTitle className="text-lg font-headline font-bold text-slate-900 dark:text-white leading-none">Configuración</CardTitle>
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
            {/* Perfil de Empresa */}
            <div className="bg-slate-900 dark:bg-black rounded-[2rem] p-6 text-white flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-sm shadow-inner">
                  <Building2 className="h-7 w-7 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-headline leading-tight tracking-tight text-white">{portalName}</h3>
                  <div className="mt-1 flex flex-col">
                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                      <Globe className="h-3 w-3 text-secondary/60" />
                      {domain || "workflowteams.bitrix24.es"}
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

            <Tabs defaultValue="conexion" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl p-1 mb-8">
                <TabsTrigger 
                  value="conexion" 
                  className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:text-secondary transition-all"
                >
                  <CloudCog className="h-3.5 w-3.5 mr-2" />
                  Conexión
                </TabsTrigger>
                <TabsTrigger 
                  value="apariencia" 
                  className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:text-secondary transition-all"
                >
                  <Palette className="h-3.5 w-3.5 mr-2" />
                  Apariencia
                </TabsTrigger>
              </TabsList>

              <TabsContent value="conexion" className="space-y-10 focus-visible:outline-none">
                <div className="space-y-6">
                  <div className="flex flex-col gap-2.5 px-1">
                    <div className="flex items-center gap-3">
                      <Key className="h-4 w-4 text-secondary" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Credenciales de Instalación Bitrix24</h4>
                    </div>
                    <div className="flex items-start gap-2 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100/50 dark:border-blue-800/50">
                      <Info className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
                        El Client ID y Secret ID se localizan en la sección de configuración de instalación de aplicaciones locales de su portal Bitrix24.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Cliente ID</Label>
                      </div>
                      <Input 
                        value={formData.clientId}
                        onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                        placeholder="local.65..." 
                        className="h-11 bg-slate-50/50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl px-4 font-mono text-[11px] focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Secret ID</Label>
                      </div>
                      <Input 
                        type="password"
                        value={formData.clientSecret}
                        onChange={(e) => setFormData({...formData, clientSecret: e.target.value})}
                        placeholder="••••••••••••••••" 
                        className="h-11 bg-slate-50/50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl px-4 font-mono text-[11px] focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex flex-col gap-2.5 px-1">
                    <div className="flex items-center gap-3">
                      <Link2 className="h-4 w-4 text-secondary" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Canal de Comunicación AI</h4>
                    </div>
                    <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      <Sparkles className="h-3.5 w-3.5 text-secondary mt-0.5 flex-shrink-0" />
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
                        Este es el servicio del agente dedicado para este portal. Es el endpoint de enlace para procesar interacciones inteligentes.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Webhook del Agente AI</Label>
                    </div>
                    <Input 
                      value={formData.serviceWebhook}
                      onChange={(e) => setFormData({...formData, serviceWebhook: e.target.value})}
                      placeholder="https://agent-service-abc.a.run.app" 
                      className="h-11 bg-slate-50/50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl px-4 text-[12px] focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="apariencia" className="space-y-10 focus-visible:outline-none">
                {/* 1. Selección de Tema */}
                <div className="space-y-6">
                  <div className="flex flex-col gap-2.5 px-1">
                    <div className="flex items-center gap-3">
                      <Sun className="h-4 w-4 text-secondary" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Modo de Visualización</h4>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed px-1">
                      Selecciona el tema visual para tu consola operativa.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'light', label: 'Claro', icon: Sun },
                      { id: 'dark', label: 'Oscuro', icon: Moon },
                      { id: 'system', label: 'Sistema', icon: Monitor },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setTheme(mode.id)}
                        className={cn(
                          "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all group",
                          theme === mode.id 
                            ? "border-secondary bg-secondary/5" 
                            : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-200 dark:hover:border-slate-700"
                        )}
                      >
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                          theme === mode.id ? "bg-secondary text-white" : "bg-white dark:bg-slate-700 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                        )}>
                          <mode.icon className="h-5 w-5" />
                        </div>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          theme === mode.id ? "text-secondary" : "text-slate-400"
                        )}>
                          {mode.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Colores y Marca */}
                <div className="space-y-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex flex-col gap-2.5 px-1">
                    <div className="flex items-center gap-3">
                      <Palette className="h-4 w-4 text-secondary" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Identidad Visual del Portal</h4>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed px-1">
                      Personaliza cómo se visualiza la plataforma para los operadores de este portal.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Color de Marca (Primario)</Label>
                      <div className="flex gap-2">
                        {["#1B75BB", "#41E0F0", "#2FC6F6", "#22c55e", "#000000"].map(color => (
                          <button 
                            key={color}
                            className={cn(
                              "h-8 w-8 rounded-lg border-2 border-white dark:border-slate-700 shadow-sm transition-transform hover:scale-110",
                              color === "#1B75BB" && "ring-2 ring-secondary/20"
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Logotipo del Portal</Label>
                      <div className="h-11 w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-900 transition-colors cursor-pointer">
                        <span className="text-[9px] font-black uppercase text-slate-400">Subir Imagen (PNG/SVG)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 border-dashed">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="h-4 w-4 text-secondary" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Vista Previa de Interfaz</h4>
                  </div>
                  <div className="h-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex items-center gap-3 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-secondary/10 dark:bg-secondary/20" />
                    <div className="space-y-2 flex-1">
                      <div className="h-2 w-24 bg-slate-100 dark:bg-slate-800 rounded-full" />
                      <div className="h-2 w-16 bg-slate-50 dark:bg-slate-900 rounded-full" />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="pt-4">
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-12 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-secondary/10 transition-all active:scale-95"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {isSaving ? "Sincronizando..." : "Guardar Protocolo de Configuración"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/40 dark:bg-slate-900/40 rounded-full border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
            <Database className="h-3 w-3 text-slate-400" />
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Cloud Sync Architecture</span>
          </div>
        </div>
      </main>
    </div>
  );
}
