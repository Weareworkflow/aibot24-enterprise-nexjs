import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    HelpCircle,
    BookOpen,
    MessageCircle,
    ExternalLink,
    ShieldCheck,
    Zap
} from "lucide-react";
import { useNavigate } from "@remix-run/react";
import { useUIStore } from "@/lib/store";
import { translations } from "@/lib/translations";

export default function HelpPage() {
    const navigate = useNavigate();
    const { language } = useUIStore();
    const t = translations[language].help || { title: "Ayuda", description: "Guía de usuario" };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl h-10 w-10 border border-border bg-card"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-headline font-bold text-foreground">Centro de Conocimiento</h1>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">AIBot24 Enterprise Support</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-xl rounded-[2rem] bg-card overflow-hidden">
                        <CardContent className="p-6 space-y-4">
                            <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                                <ShieldCheck className="h-6 w-6 text-secondary" />
                            </div>
                            <h3 className="font-bold text-sm">Privacidad</h3>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Tus datos y llaves de Bitrix24 están cifradas y solo se usan para la comunicación con tu portal.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl rounded-[2rem] bg-card overflow-hidden">
                        <CardContent className="p-6 space-y-4">
                            <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                                <Zap className="h-6 w-6 text-accent" />
                            </div>
                            <h3 className="font-bold text-sm">Rendimiento</h3>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Los agentes responden en tiempo real usando modelos optimizados para tareas corporativas.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl rounded-[2rem] bg-card overflow-hidden">
                        <CardContent className="p-6 space-y-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-bold text-sm">Guías</h3>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Consulta la documentación completa para aprender a configurar flujos avanzados.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* FAQ Section */}
                <div className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Preguntas Frecuentes</h2>
                    <div className="space-y-3">
                        {[
                            {
                                q: "¿Cómo conecto mi portal?",
                                a: "Ve a Ajustes > Conexión e ingresa tu Client ID y Secret ID obtenidos de Bitrix24 Local App."
                            },
                            {
                                q: "¿Qué es un Agente Detonador?",
                                a: "Es un bot que se activa automáticamente cuando un cliente escribe a un canal abierto vinculado."
                            },
                            {
                                q: "¿Puedo cambiar el prompt?",
                                a: "Sí, dentro de la consola de cada agente puedes editar su personalidad y objetivos específicos."
                            }
                        ].map((faq, i) => (
                            <Card key={i} className="border-border/40 bg-card rounded-3xl shadow-sm transition-all hover:border-secondary/30">
                                <CardHeader className="py-4">
                                    <CardTitle className="text-sm font-bold flex items-center gap-3">
                                        <HelpCircle className="h-4 w-4 text-secondary" />
                                        {faq.q}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pb-4">
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">{faq.a}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
