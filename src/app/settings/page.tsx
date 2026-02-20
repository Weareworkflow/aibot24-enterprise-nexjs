"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Sun,
  Moon,
  ShieldCheck,
  Languages,
  Check,
  Settings2,
  Save,
  Loader2,
  BrainCircuit,
  Database
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { translations } from "@/lib/translations";
import { useFirestore, useDoc } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useMemo, useEffect, useState } from "react";
import { AppConfig } from "@/lib/types";
import { getCollections } from "@/lib/db-schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { tenantId, domain, language, setLanguage, installation, loadInstallation } = useUIStore();
  const db = useFirestore();

  const t = translations[language].settings;

  // --- 1. GENERAL APP CONFIG ---
  const configRef = useMemo(() => {
    if (!db || !tenantId) return null;
    return doc(getCollections(db).appConfig, tenantId);
  }, [db, tenantId]);

  // --- 2. INSTALLATION DATA ---
  const instRef = useMemo(() => {
    if (!db || !tenantId) return null;
    return doc(getCollections(db).installations, tenantId);
  }, [db, tenantId]);

  const { data: remoteConfig } = useDoc<AppConfig>(configRef);
  const [localPrompt, setLocalPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // States for connection credentials
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  const isConfigured = installation?.clientId && installation?.clientSecret;

  useEffect(() => {
    if (tenantId) loadInstallation(tenantId);
  }, [tenantId]);

  useEffect(() => {
    if (remoteConfig) {
      if (remoteConfig.theme && remoteConfig.theme !== theme) {
        setTheme(remoteConfig.theme);
      }
      if (remoteConfig.language && remoteConfig.language !== language) {
        setLanguage(remoteConfig.language);
      }
      if (remoteConfig.systemPrompt !== undefined) {
        setLocalPrompt(remoteConfig.systemPrompt);
      }
    }
  }, [remoteConfig, setTheme, setLanguage]);

  useEffect(() => {
    if (installation) {
      setClientId(installation.clientId || "");
      setClientSecret(installation.clientSecret || "");
    }
  }, [installation]);

  const saveSettings = async (newTheme?: string, newLang?: 'es' | 'en') => {
    if (!configRef) return;
    setIsSaving(true);

    if (newTheme) setTheme(newTheme);
    if (newLang) setLanguage(newLang);

    try {
      const themeVal = (newTheme || theme) as AppConfig['theme'];
      const langVal = (newLang || language) as AppConfig['language'];

      await setDoc(configRef, {
        theme: themeVal,
        language: langVal,
        systemPrompt: localPrompt,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const saveConnection = async () => {
    if (!instRef) return;
    setIsSaving(true);
    try {
      await setDoc(instRef, {
        clientId,
        clientSecret,
        updatedAt: serverTimestamp()
      }, { merge: true });
      if (tenantId) loadInstallation(tenantId);
    } catch (err) {
      console.error("Failed to save connection:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">

        {/* HEADER */}
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
            <div className="flex flex-col items-end gap-1">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
                {t.console_v}
              </p>
              <div className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 rounded-full border",
                isConfigured ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-muted border-border text-muted-foreground"
              )}>
                <div className={cn("h-1.5 w-1.5 rounded-full", isConfigured ? "bg-green-500" : "bg-muted-foreground")} />
                <span className="text-[8px] font-black uppercase tracking-wider">{isConfigured ? "Protocolo Activado" : "Pendiente"}</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full h-14 p-1.5 bg-card/50 backdrop-blur-xl border border-border/40 rounded-[1.5rem] shadow-sm mb-6 grid-cols-2">
            <TabsTrigger value="general" className="rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg">
              <Settings2 className="h-4 w-4" />
              {t.tab_appearance}
            </TabsTrigger>
            <TabsTrigger value="connection" className="rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg">
              <Database className="h-4 w-4" />
              {t.tab_connection}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connection">
            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-card text-card-foreground overflow-hidden">
              <CardContent className="p-8 space-y-10">
                <div className="space-y-6">
                  <div className="flex flex-col gap-2.5 px-1 text-foreground">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Database className="h-4 w-4 text-secondary" />
                        <h4 className="text-[11px] font-black uppercase tracking-widest opacity-80">{t.credentials_title}</h4>
                      </div>
                      <Button
                        size="sm"
                        onClick={saveConnection}
                        disabled={isSaving}
                        className="bg-secondary text-white rounded-xl h-8 text-[9px] font-black uppercase tracking-widest"
                      >
                        {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Save className="h-3 w-3 mr-1.5" /> Enlazar Portal</>}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">{t.client_id}</Label>
                      <Input
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="ID de aplicación..."
                        className="bg-muted/30 border-none rounded-2xl h-12 focus-visible:ring-secondary/50 px-5 text-xs font-mono"
                      />
                      <p className="text-[9px] text-muted-foreground px-1">{t.client_id_note}</p>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">{t.secret_id}</Label>
                      <Input
                        type="password"
                        value={clientSecret}
                        onChange={(e) => setClientSecret(e.target.value)}
                        placeholder="••••••••••••••••"
                        className="bg-muted/30 border-none rounded-2xl h-12 focus-visible:ring-secondary/50 px-5 text-xs font-mono"
                      />
                      <p className="text-[9px] text-muted-foreground px-1">{t.secret_id_note}</p>
                    </div>
                  </div>

                  <div className="p-6 bg-secondary/5 rounded-[1.5rem] border border-secondary/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-secondary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Nota de Seguridad</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Para obtener el <b>Client ID</b> y <b>Secret ID</b>, debes ir a la configuración de aplicaciones locales en tu portal Bitrix24. Sin estos valores, la consola no podrá registrar nuevos bots inteligentes en tus canales de comunicación.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="general">
            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-card text-card-foreground overflow-hidden">
              <CardContent className="p-8 space-y-10">
                {/* TEMA VISUAL */}
                <div className="space-y-6">
                  <div className="flex flex-col gap-2.5 px-1 text-foreground">
                    <div className="flex items-center gap-3">
                      <Sun className="h-4 w-4 text-secondary" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest opacity-80">{t.display_mode}</h4>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: 'light', label: t.theme_light, icon: Sun },
                      { id: 'dark', label: t.theme_dark, icon: Moon },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        disabled={isSaving}
                        onClick={() => saveSettings(mode.id)}
                        className={cn(
                          "flex flex-col items-center gap-4 p-8 rounded-[2rem] border-2 transition-all",
                          theme === mode.id ? "border-secondary bg-secondary/5" : "border-border bg-muted/30"
                        )}
                      >
                        <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", theme === mode.id ? "bg-secondary text-white" : "bg-card text-muted-foreground")}>
                          <mode.icon className="h-6 w-6" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest">{mode.label}</span>
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
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: 'es', label: 'Español' },
                      { id: 'en', label: 'English' },
                    ].map((lang) => (
                      <button
                        key={lang.id}
                        disabled={isSaving}
                        onClick={() => saveSettings(undefined, lang.id as 'es' | 'en')}
                        className={cn("flex items-center justify-between p-6 rounded-2xl border-2 transition-all", language === lang.id ? "border-secondary bg-secondary/5" : "border-border bg-muted/30")}
                      >
                        <span className="text-[11px] font-black uppercase tracking-widest">{lang.label}</span>
                        {language === lang.id && <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center"><Check className="h-3 w-3 text-white" /></div>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* GLOBAL SYSTEM PROMPT */}
                <div className="space-y-6 pt-4 border-t border-border/40">
                  <div className="flex flex-col gap-2.5 px-1 text-foreground">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BrainCircuit className="h-4 w-4 text-secondary" />
                        <h4 className="text-[11px] font-black uppercase tracking-widest opacity-80">{t.prompt_label}</h4>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => saveSettings()}
                        disabled={isSaving}
                        className="bg-secondary text-white rounded-xl h-8 text-[9px] font-black uppercase tracking-widest"
                      >
                        {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Save className="h-3 w-3 mr-1.5" /> {t.save_btn.split(' ')[0]}</>}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-60">
                      {t.webhook_note}
                    </Label>
                    <Textarea
                      value={localPrompt}
                      onChange={(e) => setLocalPrompt(e.target.value)}
                      placeholder="Enter global system prompt..."
                      className="bg-muted/30 border-none rounded-2xl min-h-[200px] resize-none focus-visible:ring-secondary/50 p-5 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </main>
    </div>
  );
}

