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
  Palette,
  CloudCog,
  Sun,
  Moon,
  ShieldCheck,
  Languages,
  Check,
  ShieldAlert,
  ExternalLink
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/lib/store";
import { useDoc, useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { BitrixInstallation } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { translations } from "@/lib/translations";
import { getBitrixAuthUrl } from "@/lib/bitrix-service";

export default function SettingsPage() {
  const router = useRouter();
  const db = useFirestore();
  const { theme, setTheme } = useTheme();
  const { tenantId, domain, language, setLanguage } = useUIStore();
  const { toast } = useToast();
  
  const t = translations[language].settings;
  
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
        ...formData,
      });
      toast({
        title: t.saved_title,
        description: t.saved_desc
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron guardar los cambios."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReauthorize = () => {
    if (!domain) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No hay un dominio de Bitrix24 vinculado."
      });
      return;
    }
    const authUrl = getBitrixAuthUrl(domain, formData.clientId);
    window.open(authUrl, '_blank');
  };

  if (loading) return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
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
                <h1 className="text-2xl font-headline font-bold text-foreground leading-none">
                  {domain ? domain.split('.')[0].toUpperCase() : "PORTAL"}
                </h1>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-accent/10 rounded-full border border-accent/20">
                  <span className="h-1.5 w-1.5 bg-accent rounded-full animate-pulse" />
                  <span className="text-[9px] font-black uppercase text-accent tracking-widest">{t.active}</span>
                </div>
              </div>
              <p className="text-[11px] font-bold text-muted-foreground mt-1 tracking-tight">
                {domain || "bitrix24.enterprise"}
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2 justify-end">
              <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
              {t.console_v}
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
                  {t.tab_connection}
                </TabsTrigger>
                <TabsTrigger 
                  value="apariencia" 
                  className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-secondary transition-all"
                >
                  <Palette className="h-4 w-4 mr-2" />
                  {t.tab_appearance}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="conexion" className="space-y-10 focus-visible:outline-none">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-foreground px-1">
                    <Key className="h-4 w-4 text-secondary" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest opacity-80">{t.credentials_title}</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2.5">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t.client_id}</Label>
                      <Input 
                        value={formData.clientId}
                        onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                        placeholder="local.65..." 
                        className="h-12 bg-muted/30 border-border rounded-xl px-4 font-mono text-[11px] focus:bg-background transition-all shadow-inner"
                      />
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider leading-relaxed px-1 italic">
                        {t.client_id_note}
                      </p>
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t.secret_id}</Label>
                      <Input 
                        type="password"
                        value={formData.clientSecret}
                        onChange={(e) => setFormData({...formData, clientSecret: e.target.value})}
                        placeholder="••••••••••••••••" 
                        className="h-12 bg-muted/30 border-border rounded-xl px-4 font-mono text-[11px] focus:bg-background transition-all shadow-inner"
                      />
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider leading-relaxed px-1 italic">
                        {t.secret_id_note}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between text-foreground px-1">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="h-4 w-4 text-secondary" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest opacity-80">Permisos y Autorización</h4>
                    </div>
                  </div>
                  <div className="p-6 bg-secondary/5 rounded-2xl border border-secondary/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-foreground uppercase tracking-tight">Sincronizar Alcance (Scopes)</p>
                      <p className="text-[9px] text-muted-foreground font-medium max-w-sm">Si tu app tiene errores de acceso, pulsa para re-autorizar con todos los permisos (CRM, IM, Drive, Tareas, etc).</p>
                    </div>
                    <Button 
                      onClick={handleReauthorize}
                      variant="outline" 
                      className="pill-rounded h-10 border-secondary text-secondary hover:bg-secondary hover:text-white font-black text-[9px] uppercase tracking-widest gap-2 flex-shrink-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Autorizar Scopes
                    </Button>
                  </div>
                </div>

                <div className="space-y-6 pt-4 border-t border-border/40">
                  <div className="flex items-center gap-3 text-foreground px-1">
                    <Link2 className="h-4 w-4 text-secondary" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest opacity-80">{t.communication_title}</h4>
                  </div>

                  <div className="space-y-2.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t.webhook_label}</Label>
                    <Input 
                      value={formData.serviceWebhook}
                      onChange={(e) => setFormData({...formData, serviceWebhook: e.target.value})}
                      placeholder="https://agent-service-abc.a.run.app" 
                      className="h-12 bg-muted/30 border-border rounded-xl px-4 text-[12px] focus:bg-background transition-all shadow-inner"
                    />
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider leading-relaxed px-1 italic">
                      {t.webhook_note}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="apariencia" className="space-y-10 focus-visible:outline-none">
                {/* TEMA VISUAL */}
                <div className="space-y-6">
                  <div className="flex flex-col gap-2.5 px-1 text-foreground">
                    <div className="flex items-center gap-3">
                      <Sun className="h-4 w-4 text-secondary" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest opacity-80">{t.display_mode}</h4>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider leading-relaxed px-1">
                      {t.display_note}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: 'light', label: t.theme_light, icon: Sun },
                      { id: 'dark', label: t.theme_dark, icon: Moon },
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

                {/* IDIOMA */}
                <div className="space-y-6 pt-4 border-t border-border/40">
                  <div className="flex flex-col gap-2.5 px-1 text-foreground">
                    <div className="flex items-center gap-3">
                      <Languages className="h-4 w-4 text-secondary" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest opacity-80">{t.language_title}</h4>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider leading-relaxed px-1">
                      {t.language_note}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: 'es', label: 'Español' },
                      { id: 'en', label: 'English' },
                    ].map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setLanguage(lang.id as 'es' | 'en')}
                        className={cn(
                          "flex items-center justify-between p-6 rounded-2xl border-2 transition-all group",
                          language === lang.id 
                            ? "border-secondary bg-secondary/5" 
                            : "border-border bg-muted/30 hover:border-muted-foreground/30"
                        )}
                      >
                        <span className={cn(
                          "text-[11px] font-black uppercase tracking-widest",
                          language === lang.id ? "text-secondary" : "text-muted-foreground"
                        )}>
                          {lang.label}
                        </span>
                        {language === lang.id && (
                          <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
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
                {isSaving ? t.saving : t.save_btn}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
