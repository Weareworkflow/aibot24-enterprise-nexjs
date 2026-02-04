
import { notFound } from 'next/navigation';
import { callBitrixMethod } from '@/lib/bitrix-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, ShieldCheck, Database, LayoutDashboard } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

interface DevDashboardProps {
  params: Promise<{ memberId: string }>;
}

/**
 * Dashboard de Desarrollo persistente.
 * Permite probar la integración de Bitrix24 fuera del Iframe.
 */
export default async function DevDashboardPage({ params }: DevDashboardProps) {
  // Verificación de seguridad para desarrollo
  if (process.env.NODE_ENV !== 'development' && !process.env.NEXT_PUBLIC_DEV_MODE) {
    return notFound();
  }

  const { memberId } = await params;

  try {
    // Llamada de prueba a Bitrix para verificar sesión
    const appInfo = await callBitrixMethod(memberId, 'app.info');

    if (appInfo.error) {
      throw new Error(appInfo.error_description || "Error de API");
    }

    return (
      <div className="flex flex-col min-h-screen bg-[#F0F3F5]">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8 flex items-center justify-between bg-white p-6 rounded-[2.5rem] border shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <LayoutDashboard className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h1 className="text-xl font-headline font-bold">Consola de Desarrollo</h1>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                  Bitrix24 Persistent Session • Localhost Mode
                </p>
              </div>
            </div>
            <Badge className="bg-accent/10 text-accent border-none font-black uppercase tracking-widest text-[9px]">
              Sesión Activa
            </Badge>
          </div>

          <div className="grid gap-6">
            <Card className="border-none shadow-sm card-rounded overflow-hidden bg-white">
              <CardHeader className="bg-primary/5 border-b py-4">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Información del Portal
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-muted-foreground uppercase">Member ID (Tenant)</p>
                    <p className="text-xs font-mono font-bold bg-slate-50 p-2 rounded-lg border">{memberId}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-muted-foreground uppercase">Dominio Bitrix24</p>
                    <p className="text-xs font-bold">{appInfo.result?.DOMAIN || "Desconocido"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm card-rounded overflow-hidden bg-white">
              <CardHeader className="bg-secondary/5 border-b py-4">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-secondary">
                  <ShieldCheck className="h-4 w-4" /> Estado de la API
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[10px] overflow-x-auto">
                  <pre>{JSON.stringify(appInfo, null, 2)}</pre>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center pt-4">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase text-muted-foreground tracking-widest">
                <Database className="h-3.5 w-3.5" />
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
        <Card className="max-w-md w-full border-none shadow-2xl card-rounded p-8 text-center space-y-4">
          <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="font-headline font-bold text-lg">Error de Autenticación</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            No se pudo establecer una sesión válida para el Member ID: <br />
            <span className="font-mono font-bold text-primary">{memberId}</span>
          </p>
          <div className="bg-destructive/5 p-4 rounded-xl border border-destructive/10 text-[10px] font-mono text-destructive">
            {error.message}
          </div>
        </Card>
      </div>
    );
  }
}
