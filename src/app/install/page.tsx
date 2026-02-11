
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldCheck, CheckCircle2, Database, AlertCircle } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { useUIStore } from "@/lib/store";
import { useFirestore } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { BitrixInstallation } from "@/lib/types";
import { Button } from "@/components/ui/button";

function InstallContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const db = useFirestore();
  const { setTenantId, setDomain } = useUIStore();

  useEffect(() => {
    let isSubscribed = true;

    const tryInitialize = () => {
      const BX24 = (window as any).BX24;
      
      if (!BX24) {
        console.warn("BX24 SDK no encontrado aún...");
        return false;
      }

      BX24.init(async () => {
        if (!isSubscribed) return;

        try {
          const auth = BX24.getAuth();
          
          // Captura jerárquica: Prioridad al Auth del SDK, luego a URL params
          const memberId = auth?.member_id || searchParams.get('member_id');
          const domain = auth?.domain || searchParams.get('DOMAIN');

          if (!memberId || !db) {
            console.error("Contexto insuficiente:", { memberId, dbAvailable: !!db });
            if (isSubscribed) {
              setStatus('error');
              setErrorMsg("No se pudo identificar el portal. Asegúrate de estar dentro de Bitrix24.");
            }
            return;
          }

          const installationRecord: BitrixInstallation = {
            memberId,
            domain: domain || "unknown",
            accessToken: auth?.access_token || searchParams.get('AUTH_ID') || "",
            refreshToken: auth?.refresh_token || searchParams.get('REFRESH_ID') || "",
            expiresIn: parseInt(auth?.expires_in || searchParams.get('AUTH_EXPIRES') || "3600"),
            status: 'active',
            createdAt: new Date().toISOString()
          };

          const installRef = doc(db, "installations", memberId);
          await setDoc(installRef, installationRecord, { merge: true });
          
          if (isSubscribed) {
            setTenantId(memberId);
            if (domain) setDomain(domain);
            setStatus('success');
            
            // Notificar a Bitrix que el proceso de frontend terminó
            BX24.installFinish();
            
            // Redirigir al dashboard tras confirmación visual
            setTimeout(() => {
              if (isSubscribed) router.push('/');
            }, 1500);
          }
        } catch (error: any) {
          console.error("Fallo crítico en sincronización:", error);
          if (isSubscribed) {
            setStatus('error');
            setErrorMsg(error.message || "Error al sincronizar con la base de datos.");
          }
        }
      });
      return true;
    };

    // Intentar inicializar inmediatamente
    if (!tryInitialize()) {
      // Si falla (ej: el script aún no carga), intentamos en un intervalo corto
      const checkInterval = setInterval(() => {
        if (tryInitialize()) {
          clearInterval(checkInterval);
        }
      }, 100);

      // Timeout de seguridad de 10 segundos
      const timeout = setTimeout(() => {
        if (status === 'loading') {
          clearInterval(checkInterval);
          setStatus('error');
          setErrorMsg("Tiempo de espera agotado. El SDK de Bitrix24 no responde.");
        }
      }, 10000);

      return () => {
        isSubscribed = false;
        clearInterval(checkInterval);
        clearTimeout(timeout);
      };
    }

    return () => { isSubscribed = false; };
  }, [searchParams, db, setTenantId, setDomain, router, status]);

  return (
    <div className="space-y-6">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="relative">
            <div className="absolute inset-0 bg-secondary/20 rounded-full blur-xl animate-pulse" />
            <Loader2 className="h-10 w-10 animate-spin text-secondary relative z-10" />
          </div>
          <div className="text-center">
            <p className="text-[11px] font-black text-foreground uppercase tracking-[0.2em]">Sincronizando con Bitrix24</p>
            <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-2 animate-pulse">Capturando Contexto del Portal...</p>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center gap-6 py-6 animate-in fade-in zoom-in duration-500">
          <div className="h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center border border-accent/20">
            <CheckCircle2 className="h-10 w-10 text-accent" />
          </div>
          <div className="text-center space-y-4">
            <h3 className="font-headline font-bold text-xl text-foreground italic">¡Protocolo de Enlace Exitoso!</h3>
            <p className="text-[10px] font-black uppercase text-accent tracking-[0.2em]">Accediendo al Panel Operativo...</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-8 space-y-6 animate-in fade-in slide-in-from-top-4">
          <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto border border-destructive/20">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <div className="text-destructive font-black uppercase tracking-[0.2em] text-[10px]">Fallo en la Sincronización</div>
            <p className="text-[11px] text-muted-foreground font-medium max-w-[240px] mx-auto leading-relaxed">{errorMsg}</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline" className="pill-rounded h-11 px-8 text-[10px] uppercase font-black tracking-widest border-border hover:bg-muted">
            Reiniciar Protocolo
          </Button>
        </div>
      )}
    </div>
  );
}

export default function InstallPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="mb-10 scale-125">
        <Logo showText={true} />
      </div>
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[3rem] bg-card overflow-hidden high-volume">
        <CardHeader className="bg-primary p-10 text-primary-foreground text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent opacity-30" />
          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-secondary/10 rounded-[1.5rem] border border-secondary/20 shadow-inner">
                <ShieldCheck className="h-10 w-10 text-secondary" />
              </div>
            </div>
            <CardTitle className="font-headline text-2xl font-bold tracking-tight">Instalación Enterprise</CardTitle>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary mt-3">Protocolo de Enlace Seguro v3.1</p>
          </div>
        </CardHeader>
        <CardContent className="p-10">
          <Suspense fallback={
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-secondary" />
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Iniciando SDK...</p>
            </div>
          }>
            <InstallContent />
          </Suspense>
        </CardContent>
      </Card>
      
      <div className="mt-10 flex items-center gap-3 px-6 py-3 bg-muted/30 rounded-full border border-border/40 shadow-sm backdrop-blur-sm animate-in fade-in duration-1000">
        <Database className="h-3.5 w-3.5 text-secondary" />
        <span className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em]">Cloud Sync: Firestore Real-Time</span>
      </div>
    </div>
  );
}
