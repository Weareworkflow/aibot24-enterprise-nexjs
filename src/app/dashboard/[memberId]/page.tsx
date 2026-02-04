
import { notFound } from 'next/navigation';
import { callBitrixMethod } from '@/lib/bitrix-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, ShieldCheck, Database, Terminal, Rocket, LayoutDashboard } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { LaunchDevSession } from '@/components/dashboard/LaunchDevSession';

interface DevDashboardProps {
  params: Promise<{ memberId: string }>;
}

/**
 * Consola de Desarrollo Persistente para AIBot24.
 * Puerta de enlace para activar la sesión de desarrollo local.
 */
export default async function DevDashboardPage({ params }: DevDashboardProps) {
  const isDevMode = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_MODE;
  
  if (!isDevMode) {
    return notFound();
  }

  const { memberId } = await params;

  try {
    const appInfo = await callBitrixMethod(memberId, 'app.info');

    if (appInfo.error) {
      throw new Error(appInfo.error_description || "Error de comunicación con el API de Bitrix24");
    }

    return (
      <div className="flex flex-col min-h-screen bg-[#F0F3F5]">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8 flex items-center justify-between bg-white p-6 rounded-[2.5rem] border shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Terminal className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h1 className="text-xl font-headline font-bold">Protocolo de Desarrollo Activo</h1>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                  Sesión Persistente Localhost • {memberId}
                </p>
              </div>
            </div>
            <Badge className="bg-accent/10 text-accent border-none font-black uppercase tracking-widest text-[9px] h-6 flex items-center">
              Sesión Validada
            </Badge>
          </div>

          <div className="grid gap-6">
            <Card className="border-none shadow-sm card-rounded overflow-hidden bg-white border-2 border-secondary/20">
              <CardContent className="p-8 text-center space-y-6">
                <div className="h-20 w-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                  <Rocket className="h-10 w-10 text-secondary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-headline font-bold">Lanzar Panel Operativo</h2>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Haz clic abajo para vincular este portal a tu entorno local y empezar a gestionar tus agentes de IA.
                  </p>
                </div>
                <div className="flex justify-center">
                  <LaunchDevSession memberId={memberId} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm card-rounded overflow-hidden bg-white">
              <CardHeader className="bg-primary/5 border-b py-4">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Contexto del Portal (Backend REST)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-muted-foreground uppercase">Tenant ID</p>
                    <p className="text-xs font-mono font-bold bg-slate-50 p-2 rounded-lg border">{memberId}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-muted-foreground uppercase">Endpoint Dominio</p>
                    <p className="text-xs font-bold">{appInfo.result?.DOMAIN || "Cargando..."}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm card-rounded overflow-hidden bg-white">
              <CardHeader className="bg-secondary/5 border-b py-4">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-secondary">
                  <ShieldCheck className="h-4 w-4" /> Respuesta OAuth 2.0
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[10px] overflow-x-auto shadow-inner leading-relaxed">
                  <pre>{JSON.stringify(appInfo, null, 2)}</pre>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center pt-4">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase text-muted-foreground tracking-widest bg-white/50 px-4 py-2 rounded-full border">
                <Database className="h-3.5 w-3.5 text-secondary" />
                Sincronizado vía Firestore Cloud
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  } catch (error: any) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F3F5] p-4">
        <Card className="max-w-md w-full border-none shadow-2xl card-rounded p-10 text-center space-y-6 bg-white">
          <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="font-headline font-bold text-lg">Error de Protocolo Local</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No se pudo establecer el túnel de sesión para el portal: <br />
              <span className="font-mono font-bold text-primary text-[10px] bg-slate-50 px-2 py-1 rounded mt-2 inline-block">{memberId}</span>
            </p>
          </div>
          <div className="bg-destructive/5 p-4 rounded-xl border border-destructive/10 text-[10px] font-mono text-destructive text-left overflow-x-auto max-h-32">
            {error.message}
          </div>
          <div className="space-y-4 pt-4">
            <p className="text-[9px] uppercase font-black text-muted-foreground tracking-[0.1em]">
              Verifica que el memberId exista en Firestore y que tus credenciales en el archivo .env sean válidas.
            </p>
          </div>
        </Card>
      </div>
    );
  }
}
