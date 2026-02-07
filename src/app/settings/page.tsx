"use client";

import { useMemo, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Link2, 
  Key, 
  ArrowLeft,
  Loader2,
  Save,
  Sparkles,
  Info,
  Palette,
  CloudCog,
  Sun,
  Moon,
  ShieldCheck
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
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sincronizando Consola...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        
        {/* Cabecera Integrada (Sin Tarjeta/Banner) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4 mb-2">
          <div className="flex items-center gap-5 w-full sm:w-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-11 w-11 flex items-center justify-center bg-card rounded-2xl hover:bg-foreground hover:text-background transition-all shadow-sm border border-border"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-headline font-bold text-foreground leading-none">WORKFLOWTEAMS</h1>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-accent/10 rounded-full border border-accent/20">
                  <span className="h-1.5 w-1.5 bg-accent rounded-full animate-pulse" />
                  <span className="text-[9px] font-black uppercase text-accent tracking-widest">Activo</span>
                </div>
              </div>
              <p className="text-[11px] font-bold text-muted-foreground mt-1 tracking-tight">
                workflowteams.bitrix24.es
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2 justify-end">
              <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
              Consola Operativa v3.1
            </p>
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-card text-card-foreground overflow-hidden high-volume transition-colors duration-300">
          <CardContent className="p-8 space-y-8">
            <Tabs defaultValue="conexion" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/50 rounded-2xl p-1.5 mb-8">
                <TabsTrigger 
                  value="conexion" 
                  className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-secondary transition-all"
                >
                  <CloudCog className="h-4 w-4 mr-2" />
                  Conexión
                </TabsTrigger>
                <TabsTrigger 
                  value="apariencia" 
                  className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-secondary transition-all"
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Apariencia
                </TabsTrigger>
              </TabsList>

              <TabsContent value="conexion" className="space-y-10 focus-visible:outline-none">
                <div className="space-y-6">
                  <div className="flex flex-col gap-2.5 px-1">
                    <div className="flex items-center gap-3 text-foreground">
                      <Key className="h-4 w-4 text-secondary" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest opacity-80">Credenciales de Instalación Bitrix24</h4>
                    </div>
                    <div className="flex items-start gap-2 bg-blue-50/10 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100/20 dark:border-blue-800/20">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider leading-relaxed">
                        El Client ID y Secret ID se localizan en la sección de configuración de instalación de aplicaciones locales de su portal Bitrix24.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2.5">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Cliente ID</Label>
                      <Input 
                        value={formData.clientId}
                        onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                        placeholder="local.65..." 
                        className="h-12 bg-muted/30 border-border rounded-xl px-4 font-mono text-[11px] focus:bg-background transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Secret ID</Label>
                      <Input 
                        type="password"
                        value={formData.clientSecret}
                        onChange={(e) => setFormData({...formData, clientSecret: e.target.value})}
                        placeholder="••••••••••••••••" 
                        className="h-12 bg-muted/30 border-border rounded-xl px-4 font-mono text-[11px] focus:bg-background transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-4 border-t border-border/40">
                  <div className="flex flex-col gap-2.5 px-1">
                    <div className="flex items-center gap-3 text-foreground">
                      <Link2 className="h-4 w-4 text-secondary" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest opacity-80">Canal de Comunicación AI</h4>
                    </div>
                    <div className="flex items-start gap-2 bg-muted/30 p-4 rounded-xl border border-border/40">
                      <Sparkles className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider leading-relaxed">
                        Este es el servicio del agente dedicado para este portal. Es el endpoint de enlace para procesar interacciones inteligentes.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Webhook del Agente AI</Label>
                    <Input 
                      value={formData.serviceWebhook}
                      onChange={(e) => setFormData({...formData, serviceWebhook: e.target.value})}
                      placeholder="https://agent-service-abc.a.run.app" 
                      className="h-12 bg-muted/30 border-border rounded-xl px-4 text-[12px] focus:bg-background transition-all shadow-inner"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="apariencia" className="space-y-10 focus-visible:outline-none">
                <div className="space-y-6">
                  <div className="flex flex-col gap-2.5 px-1 text-foreground">
                    <div className="flex items-center gap-3">
                      <Sun className="h-4 w-4 text-secondary" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest opacity-80">Modo de Visualización</h4>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider leading-relaxed px-1">
                      Selecciona el tema visual para tu consola operativa.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: 'light', label: 'Modo Claro', icon: Sun },
                      { id: 'dark', label: 'Modo Oscuro', icon: Moon },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setTheme(mode.id)}
                        className={cn(
                          "flex flex-col items-center gap-4 p-10 rounded-[2rem] border-2 transition-all group",
                          theme === mode.id 
                            ? "border-secondary bg-secondary/5" 
                            : "border-border bg-muted/30 hover:border-muted-foreground/30"
                        )}
                      >
                        <div className={cn(
                          "h-14 w-14 rounded-full flex items-center justify-center transition-all",
                          theme === mode.id ? "bg-secondary text-white scale-110" : "bg-card text-muted-foreground group-hover:text-foreground"
                        )}>
                          <mode.icon className="h-7 w-7" />
                        </div>
                        <span className={cn(
                          "text-[11px] font-black uppercase tracking-widest",
                          theme === mode.id ? "text-secondary" : "text-muted-foreground"
                        )}>
                          {mode.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6 pt-4 border-t border-border/40">
                  <div className="flex flex-col gap-2.5 px-1 text-foreground">
                    <div className="flex items-center gap-3">
                      <Palette className="h-4 w-4 text-secondary" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest opacity-80">Identidad Visual del Portal</h4>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider leading-relaxed px-1">
                      Personaliza los colores de marca para este portal específico.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Color de Marca (Primario)</Label>
                      <div className="flex gap-3">
                        {["#1B75BB", "#41E0F0", "#2FC6F6", "#22c55e", "#000000"].map(color => (
                          <button 
                            key={color}
                            className={cn(
                              "h-10 w-10 rounded-xl border-2 border-background shadow-sm transition-transform hover:scale-110",
                              color === "#1B75BB" && "ring-2 ring-secondary/20"
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Logotipo del Portal</Label>
                      <div className="h-14 w-full border-2 border-dashed border-border rounded-2xl flex items-center justify-center bg-muted/30 hover:bg-background transition-colors cursor-pointer">
                        <span className="text-[10px] font-black uppercase text-muted-foreground">Subir Imagen (PNG/SVG)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="pt-6">
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-14 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-secondary/20 transition-all active:scale-95"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {isSaving ? "Sincronizando..." : "Guardar Protocolo de Configuración"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}