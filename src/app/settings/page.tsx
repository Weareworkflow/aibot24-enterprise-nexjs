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
  BrainCircuit,
  Settings2,
  Wand2,
  Save,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { translations } from "@/lib/translations";
import { useFirestore, useDoc } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useMemo, useEffect, useState } from "react";
import { AppConfig, ArchitectConfiguration, AIConfig } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { tenantId, domain, language, setLanguage } = useUIStore();
  const db = useFirestore();

  const t = translations[language].settings;

  // --- 1. GENERAL APP CONFIG ---
  const configRef = useMemo(() => {
    if (!db || !tenantId) return null;
    return doc(db, "config-app", tenantId);
  }, [db, tenantId]);

  const { data: remoteConfig } = useDoc<AppConfig>(configRef);

  useEffect(() => {
    if (remoteConfig) {
      if (remoteConfig.theme && remoteConfig.theme !== theme) {
        setTheme(remoteConfig.theme);
      }
      if (remoteConfig.language && remoteConfig.language !== language) {
        setLanguage(remoteConfig.language);
      }
    }
  }, [remoteConfig, setTheme, setLanguage]);

  const saveSettings = async (newTheme?: string, newLang?: 'es' | 'en') => {
    if (!configRef) return;
    if (newTheme) setTheme(newTheme);
    if (newLang) setLanguage(newLang);

    try {
      await setDoc(configRef, {
        theme: newTheme || theme,
        language: newLang || language,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  // --- 2. ARCHITECT CONFIG ---
  const archRef = useMemo(() => {
    if (!db || !tenantId) return null;
    return doc(db, "config-architect", tenantId);
  }, [db, tenantId]);

  const archAiRef = useMemo(() => {
    if (!db || !tenantId) return null;
    return doc(db, "config-architect", tenantId, "ai", "config");
  }, [db, tenantId]);

  const { data: remoteArch } = useDoc<ArchitectConfiguration>(archRef);
  const { data: remoteArchAi } = useDoc<AIConfig>(archAiRef);

  const [archIdentity, setArchIdentity] = useState<Partial<ArchitectConfiguration>>({});
  const [archAi, setArchAi] = useState<Partial<AIConfig>>({});
  const [isSavingArch, setIsSavingArch] = useState(false);

  useEffect(() => {
    if (remoteArch) setArchIdentity(remoteArch);
    if (remoteArchAi) setArchAi(remoteArchAi);
  }, [remoteArch, remoteArchAi]);

  const handleSaveArchitect = async () => {
    if (!archRef || !archAiRef) return;
    setIsSavingArch(true);
    try {
      // 1. Save Identity to root doc
      await setDoc(archRef, {
        ...archIdentity,
        updatedAt: new Date().toISOString()
      }, { merge: false }); // Wipe old fields like 'model'

      // 2. Save AI to sub-collection doc
      await setDoc(archAiRef, {
        ...archAi,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      alert(t.saved_title);
    } catch (err) {
      console.error("Failed to save Architect:", err);
    } finally {
      setIsSavingArch(false);
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
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2 justify-end">
              <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
              {t.console_v}
            </p>
          </div>
        </div>

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14 p-1.5 bg-card/50 backdrop-blur-xl border border-border/40 rounded-[1.5rem] shadow-sm mb-6">
            <TabsTrigger value="appearance" className="rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg">
              <Settings2 className="h-4 w-4" />
              {t.tab_appearance}
            </TabsTrigger>
            <TabsTrigger value="architect" className="rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg">
              <BrainCircuit className="h-4 w-4" />
              {t.tab_architect}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance">
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
                        onClick={() => saveSettings(undefined, lang.id as 'es' | 'en')}
                        className={cn("flex items-center justify-between p-6 rounded-2xl border-2 transition-all", language === lang.id ? "border-secondary bg-secondary/5" : "border-border bg-muted/30")}
                      >
                        <span className="text-[11px] font-black uppercase tracking-widest">{lang.label}</span>
                        {language === lang.id && <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center"><Check className="h-3 w-3 text-white" /></div>}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="architect">
            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-card text-card-foreground overflow-hidden">
              <CardContent className="p-8 space-y-10">
                {/* IDENTITY SECTION */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 px-1">
                    <Wand2 className="h-4 w-4 text-secondary" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest opacity-80">{t.identity_title}</h4>
                  </div>

                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t.name_label}</Label>
                      <Input
                        value={archIdentity.name || ''}
                        onChange={(e) => setArchIdentity({ ...archIdentity, name: e.target.value })}
                        className="bg-muted/30 border-none rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t.role_label}</Label>
                      <Input
                        value={archIdentity.role || ''}
                        onChange={(e) => setArchIdentity({ ...archIdentity, role: e.target.value })}
                        className="bg-muted/30 border-none rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t.prompt_label}</Label>
                      <Textarea
                        value={archIdentity.systemPrompt || ''}
                        onChange={(e) => setArchIdentity({ ...archIdentity, systemPrompt: e.target.value })}
                        className="bg-muted/30 border-none rounded-xl min-h-[150px] resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* AI SECTION */}
                <div className="space-y-6 pt-4 border-t border-border/40">
                  <div className="flex items-center gap-3 px-1">
                    <ShieldCheck className="h-4 w-4 text-secondary" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest opacity-80">{t.ai_title}</h4>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t.model_label}</Label>
                      <Input
                        value={archAi.model || ''}
                        onChange={(e) => setArchAi({ ...archAi, model: e.target.value })}
                        className="bg-muted/30 border-none rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t.temp_label} ({archAi.temperature || 0.7})</Label>
                      <Input
                        type="number" step="0.1" min="0" max="1"
                        value={archAi.temperature || 0.7}
                        onChange={(e) => setArchAi({ ...archAi, temperature: parseFloat(e.target.value) })}
                        className="bg-muted/30 border-none rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t.api_key_label}</Label>
                    <Input
                      type="password"
                      placeholder={t.api_key_placeholder}
                      value={archAi.apiKey || ''}
                      onChange={(e) => setArchAi({ ...archAi, apiKey: e.target.value })}
                      className="bg-muted/30 border-none rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSaveArchitect}
                  disabled={isSavingArch}
                  className="w-full h-12 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-black uppercase tracking-widest text-[10px] mt-4 shadow-lg shadow-secondary/20"
                >
                  {isSavingArch ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" />{t.save_architect}</>}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </main>
    </div>
  );
}

