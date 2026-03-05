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
    Database,
} from "lucide-react";
import { useNavigate } from "@remix-run/react";
import { useUIStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { translations } from "@/lib/translations";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const { tenantId, domain, language, setLanguage, installation, loadInstallation, loadAppConfig, appConfig } = useUIStore();

    const t = translations[language].settings;
    const [isSaving, setIsSaving] = useState(false);

    const [clientId, setClientId] = useState("");
    const [clientSecret, setClientSecret] = useState("");

    const isConfigured = !!(installation?.clientId && installation?.clientSecret);

    useEffect(() => {
        if (tenantId) {
            loadInstallation(tenantId);
            loadAppConfig(tenantId);
        }
    }, [tenantId, loadInstallation, loadAppConfig]);

    useEffect(() => {
        if (appConfig) {
            if (appConfig.theme && appConfig.theme !== theme) {
                setTheme(appConfig.theme);
            }
            if (appConfig.language && appConfig.language !== language) {
                setLanguage(appConfig.language);
            }
        }
    }, [appConfig, setTheme, setLanguage, theme, language]);

    useEffect(() => {
        if (installation) {
            setClientId(installation.clientId || "");
            setClientSecret(installation.clientSecret || "");
        }
    }, [installation]);

    const saveSettings = async (newTheme?: string, newLang?: 'es' | 'en') => {
        if (!tenantId) return;
        setIsSaving(true);

        if (newTheme) setTheme(newTheme);
        if (newLang) setLanguage(newLang);

        try {
            await fetch(`/api/config/${encodeURIComponent(tenantId)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    theme: newTheme || theme,
                    language: newLang || language,
                }),
            });
        } catch (err) {
            console.error("Failed to save settings:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const saveConnection = async () => {
        if (!tenantId) return;
        setIsSaving(true);
        try {
            await fetch(`/api/installations/${encodeURIComponent(tenantId)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId,
                    clientSecret,
                }),
            });
            loadInstallation(tenantId);
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

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4 mb-2">
                    <div className="flex items-center gap-5 w-full sm:w-auto">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 flex items-center justify-center bg-card rounded-2xl hover:bg-foreground hover:text-background transition-all shadow-sm border border-border"
                            onClick={() => navigate(-1)}
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
                </div>

                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full h-14 p-1.5 bg-card/50 backdrop-blur-xl border border-border/40 rounded-[1.5rem] shadow-sm mb-6 grid-cols-2">
                        <TabsTrigger value="general" className="rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest">
                            <Settings2 className="h-4 w-4" />
                            {t.tab_appearance}
                        </TabsTrigger>
                        <TabsTrigger value="connection" className="rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest">
                            <Database className="h-4 w-4" />
                            {t.tab_connection}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="connection">
                        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-card text-card-foreground overflow-hidden">
                            <CardContent className="p-8 space-y-10">
                                <div className="space-y-6">
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

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">{t.client_id}</Label>
                                            <Input
                                                value={clientId}
                                                onChange={(e) => setClientId(e.target.value)}
                                                placeholder="ID de aplicación..."
                                                className="bg-muted/30 border-none rounded-2xl h-12 px-5 text-xs font-mono"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">{t.secret_id}</Label>
                                            <Input
                                                type="password"
                                                value={clientSecret}
                                                onChange={(e) => setClientSecret(e.target.value)}
                                                placeholder="••••••••••••••••"
                                                className="bg-muted/30 border-none rounded-2xl h-12 px-5 text-xs font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="general">
                        {/* General tab content (Theme/Lang) same as old one but adapted to Remix useNavigate */}
                        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-card text-card-foreground overflow-hidden">
                            <CardContent className="p-8 space-y-10">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <Sun className="h-4 w-4 text-secondary" />
                                        <h4 className="text-[11px] font-black uppercase tracking-widest opacity-80">{t.display_mode}</h4>
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
                                                <mode.icon className="h-6 w-6" />
                                                <span className="text-[11px] font-black uppercase tracking-widest">{mode.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6 pt-4 border-t border-border/40">
                                    <div className="flex items-center gap-3">
                                        <Languages className="h-4 w-4 text-secondary" />
                                        <h4 className="text-[11px] font-black uppercase tracking-widest opacity-80">{t.language_title}</h4>
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
                                                {language === lang.id && <Check className="h-3 w-3 text-secondary" />}
                                            </button>
                                        ))}
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
