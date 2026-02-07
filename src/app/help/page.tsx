
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
  Mail
} from "lucide-react";

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
  return (
    <div className="flex flex-col min-h-screen bg-[#F0F3F5]">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-6xl space-y-8">
        
        <div className="mb-4">
          <h1 className="text-3xl font-headline font-bold text-slate-900">Centro de Operaciones y Ayuda</h1>
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em] mt-2 flex items-center gap-2">
            <ShieldCheck className="h-3 w-3 text-secondary" />
            Protocolo de Soporte Elite Activo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden high-volume group">
            <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center gap-5">
              <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all shadow-sm border border-secondary/5">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-headline font-bold">Contacto</CardTitle>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Soporte Técnico Directo</p>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-4">
                <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
                  ¿Asistencia técnica personalizada? Nuestro equipo optimizará tus flujos con IA para maximizar el rendimiento de tu flota.
                </p>
              </div>
              <Button className="w-full h-14 rounded-full bg-secondary hover:bg-secondary/90 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-secondary/20 transition-all hover:scale-[1.02]">
                SOLICITAR ASISTENCIA
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden high-volume group">
            <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center gap-5">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm border border-slate-200/50">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-headline font-bold text-slate-900">Documentación</CardTitle>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Manuales y Guías Técnicas</p>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-4">
                <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
                  Explora nuestra biblioteca completa para dominar AIBot24. Configura integraciones y gestiona métricas para escalar tu operación.
                </p>
              </div>
              <Button variant="outline" className="w-full h-14 rounded-full border-2 border-slate-200 bg-transparent hover:bg-slate-50 text-slate-900 font-black text-[11px] uppercase tracking-[0.2em] transition-all">
                EXPLORAR GUÍAS
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden high-volume">
          <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30 flex flex-row items-center gap-5">
            <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-secondary shadow-md border border-slate-100">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-headline font-bold text-slate-900">FAQ</CardTitle>
              <p className="text-[11px] font-black uppercase text-muted-foreground tracking-widest mt-1">Preguntas Frecuentes de la Flota</p>
            </div>
          </CardHeader>
          <CardContent className="p-8 md:p-12">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {FAQS.map((faq, idx) => (
                <AccordionItem 
                  key={idx} 
                  value={`item-${idx}`} 
                  className="border border-slate-100 rounded-[2rem] px-8 bg-slate-50/30 hover:bg-white transition-all data-[state=open]:bg-white data-[state=open]:shadow-lg data-[state=open]:border-secondary/20"
                >
                  <AccordionTrigger className="hover:no-underline py-6 group">
                    <span className="text-[14px] font-bold text-slate-800 text-left group-hover:text-secondary transition-colors">
                      {faq.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-8 pt-2">
                    <div className="flex gap-4">
                      <div className="h-full w-1 bg-secondary/20 rounded-full" />
                      <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                        {faq.a}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="flex justify-center pt-8 pb-12">
          <div className="flex items-center gap-3 px-6 py-3 bg-white/50 rounded-full border border-slate-200 shadow-sm backdrop-blur-sm">
            <Zap className="h-4 w-4 text-secondary animate-pulse" />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Protocolo de ayuda actualizado v3.1</span>
          </div>
        </div>
      </main>
    </div>
  );
}
