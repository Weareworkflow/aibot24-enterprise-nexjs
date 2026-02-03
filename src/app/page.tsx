import Link from "next/link";
import { Mic2, ArrowRight, Shield, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Mic2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-headline text-xl font-bold text-primary">AIBot24</span>
        </div>
        <Button asChild variant="ghost" size="sm" className="font-bold">
          <Link href="/dashboard">Entrar</Link>
        </Button>
      </nav>

      <main className="flex-1">
        <section className="py-16 lg:py-24 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest border border-secondary/20">
              <Sparkles className="h-3 w-3" />
              <span>Voz e Inteligencia de Siguiente Generación</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-headline font-bold text-foreground leading-[1.1]">
              Despliega Agentes de <span className="text-primary">Voz IA</span> en segundos
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Optimiza tu negocio con agentes de voz personalizables que suenan naturales y resuelven consultas al instante.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Button size="lg" className="h-12 px-8 text-sm font-bold rounded-lg shadow-lg shadow-primary/20" asChild>
                <Link href="/dashboard">
                  Ir al Panel <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-sm font-bold rounded-lg" asChild>
                <Link href="/agents/new">Crear Agente</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { 
                  title: "Configuración GenAI", 
                  desc: "Define personalidades y bases de conocimiento usando herramientas avanzadas de LLM.",
                  icon: Sparkles,
                  color: "primary"
                },
                { 
                  title: "Pruebas en Tiempo Real", 
                  desc: "Prueba tus agentes inmediatamente en un entorno de chat interactivo antes del despliegue.",
                  icon: Zap,
                  color: "secondary"
                },
                { 
                  title: "Métricas de Empresa", 
                  desc: "Rastrea el rendimiento, uso y satisfacción con nuestro completo suite de analíticas.",
                  icon: Shield,
                  color: "green-600"
                }
              ].map((feature, i) => (
                <div key={i} className="bg-card p-6 rounded-xl border border-border/50 shadow-sm">
                  <div className={`h-10 w-10 bg-${feature.color}/10 rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-5 w-5 text-${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-headline font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Mic2 className="h-4 w-4 text-primary" />
            <span className="font-headline font-bold text-sm">AIBot24</span>
          </div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase">
            © {new Date().getFullYear()} AIBot24. Gestión Inteligente.
          </p>
          <div className="flex gap-6 text-[10px] font-black uppercase text-muted-foreground">
            <Link href="#" className="hover:text-primary">Privacidad</Link>
            <Link href="#" className="hover:text-primary">Términos</Link>
            <Link href="#" className="hover:text-primary">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
