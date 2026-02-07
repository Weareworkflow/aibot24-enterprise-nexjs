
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  BookOpen, 
  HelpCircle, 
  ShieldCheck,
  Zap,
  Mail,
  ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";

const FAQS = [
  {
    q: "¿Cómo conecto mi bot a las Líneas Abiertas de Bitrix24?",
    a: "Es muy sencillo. Entra en la consola de tu agente, abre la sección de 'Integraciones' y activa el switch de 'Open Lines'. Nuestro sistema ejecutará el protocolo de registro automático y el bot aparecerá instantáneamente en tu Centro de Contacto de Bitrix24."
  },
  {
    q: "¿Cómo puedo ajustar el comportamiento de mi agente una vez creado?",
    a: "No necesitas editar códigos complejos. Simplemente usa el 'Arquitecto de Refinamiento' (el chat lateral derecho en la consola del agente) y escribe instrucciones en lenguaje natural, por ejemplo: 'No des precios sin pedir el correo' o 'Usa un tono más ejecutivo'. La IA actualizará el protocolo al instante."
  },
  {
    q: "¿Qué significan las métricas de Tokens y Mensajes?",
    a: "Los 'Mensajes' cuentan cada interacción individual con un cliente. Los 'Tokens' representan la unidad de procesamiento de la IA de Google (Gemini). Un mayor número de tokens suele indicar conversaciones más largas o análisis de documentos extensos."
  },
  {
    q: "¿Mis datos y los de mis clientes están seguros?",
    a: "Totalmente. AIBot24 utiliza encriptación de grado militar (AES-256) para almacenar tus protocolos y archivos. Además, operamos bajo la infraestructura segura de Google Cloud y Firebase, cumpliendo con los estándares internacionales de protección de datos."
  }
];

export default function HelpPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-6xl space-y-8">
        
        {/* 1. FAQ - Ahora contiene el Header integrado */}
        <Card className="border-none shadow-2xl rounded-[3rem] bg-card overflow-hidden high-volume">
          <CardHeader className="p-10 border-b border-border bg-muted/20 flex flex-row items-center gap-6">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-12 w-12 flex items-center justify-center bg-card rounded-2xl hover:bg-foreground hover:text-background transition-all shadow-md border border-border flex-shrink-0"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <CardTitle className="text-2xl font-headline font-bold text-foreground">Centro de Operaciones y Ayuda</CardTitle>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mt-2 flex items-center gap-2">
                <ShieldCheck className="h-3 w-3 text-secondary" />
                Protocolo de Soporte Elite Activo
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-8 md:p-12">
            <div className="mb-8 flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                <HelpCircle className="h-4 w-4" />
              </div>
              <h3 className="text-[11px] font-black uppercase text-muted-foreground tracking-[0.2em]">Preguntas Frecuentes de la Flota (FAQ)</h3>
            </div>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {FAQS.map((faq, idx) => (
                <AccordionItem 
                  key={idx} 
                  value={`item-${idx}`} 
                  className="border border-border rounded-[2rem] px-8 bg-muted/20 hover:bg-card transition-all data-[state=open]:bg-card data-[state=open]:shadow-lg data-[state=open]:border-secondary/20"
                >
                  <AccordionTrigger className="hover:no-underline py-6 group">
                    <span className="text-[14px] font-bold text-foreground text-left group-hover:text-secondary transition-colors">
                      {faq.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-8 pt-2">
                    <div className="flex gap-4">
                      <div className="h-full w-1 bg-secondary/20 rounded-full" />
                      <p className="text-[13px] text-muted-foreground leading-relaxed font-medium">
                        {faq.a}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* 2. Grid de Documentación y Contacto (Invertidos) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Documentación (Izquierda) */}
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-card overflow-hidden high-volume group">
            <CardHeader className="p-8 border-b border-border flex flex-row items-center gap-5">
              <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-foreground group-hover:text-background transition-all shadow-sm border border-border">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-headline font-bold text-foreground">Documentación</CardTitle>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">Manuales y Guías Técnicas</p>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-4">
                <p className="text-[13px] text-muted-foreground font-medium leading-relaxed">
                  Explora nuestra biblioteca completa de documentación para<br className="hidden lg:block" /> dominar todas las capacidades de AIBot24.
                </p>
              </div>
              <Button 
                variant="outline" 
                className="w-full h-14 rounded-full border-2 border-border bg-transparent hover:bg-muted hover:text-secondary text-foreground font-black text-[11px] uppercase tracking-[0.2em] transition-all"
              >
                EXPLORAR GUIA
              </Button>
            </CardContent>
          </Card>

          {/* Contacto (Derecha) */}
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-card overflow-hidden high-volume group">
            <CardHeader className="p-8 border-b border-border flex flex-row items-center gap-5">
              <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all shadow-sm border border-secondary/5">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-headline font-bold">Contacto</CardTitle>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">Soporte Técnico Directo</p>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-4">
                <p className="text-[13px] text-muted-foreground font-medium leading-relaxed">
                  Optimiza tus flujos para maximizar el rendimiento mediante<br className="hidden lg:block" /> soporte experto para tu flota operativa.
                </p>
              </div>
              <Button className="w-full h-14 rounded-full bg-secondary hover:bg-secondary/90 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-secondary/20 transition-all hover:scale-[1.02]">
                SOLICITAR ASISTENCIA
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center pt-8 pb-12">
          <div className="flex items-center gap-3 px-6 py-3 bg-card/50 rounded-full border border-border shadow-sm backdrop-blur-sm">
            <Zap className="h-4 w-4 text-secondary animate-pulse" />
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Protocolo de ayuda actualizado v3.1</span>
          </div>
        </div>
      </main>
    </div>
  );
}
