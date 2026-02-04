
"use client";

import { useEffect, useState, Suspense } from "react";
import Script from "next/script";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldCheck, CheckCircle2, Database, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { useUIStore } from "@/lib/store";
import { useFirestore } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { BitrixInstallation } from "@/lib/types";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Button } from "@/components/ui/button";

function InstallContent() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'error'>('loading');
  const searchParams = useSearchParams();
  const router = useRouter();
  const db = useFirestore();
  const { setTenantId, setDomain } = useUIStore();

  useEffect(() => {
    const memberId = searchParams.get('member_id');
    const domain = searchParams.get('DOMAIN');
    const authId = searchParams.get('AUTH_ID');
    const refreshToken = searchParams.get('REFRESH_ID');
    const expires = searchParams.get('AUTH_EXPIRES');

    const initializeBX24 = async () => {
      if (typeof window !== 'undefined' && (window as any).BX24) {
        const BX24 = (window as any).BX24;

        BX24.init(async () => {
          console.log("Protocolo Bitrix24 Activado");

          if (memberId && db) {
            const installationRecord: BitrixInstallation = {
              memberId,
              domain: domain || "unknown",
              accessToken: authId || "",
              refreshToken: refreshToken || "",
              expiresIn: parseInt(expires || "3600"),
              status: 'active',
              createdAt: new Date().toISOString()
            };

            const installRef = doc(db, "installations", memberId);

            try {
              await setDoc(installRef, installationRecord);
              
              setTenantId(memberId);
              if (domain) setDomain(domain);
              
              setStatus('success');

              // Finalizamos el protocolo y forzamos navegación
              setTimeout(() => {
                BX24.installFinish();
                router.push('/');
              }, 1000);

            } catch (error: any) {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: installRef.path,
                operation: 'create',
                requestResourceData: installationRecord
              }));
              setStatus('error');
            }
          } else if (memberId) {
            // Si el DB no está listo pero tenemos memberId, lo guardamos y esperamos
            setTenantId(memberId);
            if (domain) setDomain(domain);
          }
        });
      }
    };

    const checkInterval = setInterval(() => {
      if ((window as any).BX24) {
        initializeBX24();
        clearInterval(checkInterval);
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, [searchParams, db, setTenantId, setDomain, router]);

  return (
    <div className="space-y-6">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4 py-6">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
          <div className="text-center">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Configurando Aibot24...</p>
            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.2em] mt-2">Sincronizando con Bitrix24</p>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center gap-6 py-4 animate-in fade-in zoom-in duration-500">
          <CheckCircle2 className="h-12 w-12 text-accent" />
          <div className="text-center space-y-4">
            <h3 className="font-bold text-lg text-slate-800">¡Enlace Exitoso!</h3>
            <p className="text-[10px] font-black uppercase text-accent tracking-widest">Redirigiendo al Panel Operativo...</p>
            <Button 
              onClick={() => router.push('/')}
              variant="outline" 
              className="pill-rounded gap-2 text-[10px] font-black uppercase"
            >
              <LayoutDashboard className="h-3.5 w-3.5" /> Ir al Panel Manualmente
            </Button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-6 space-y-4">
          <Database className="h-10 w-10 text-destructive mx-auto mb-2 opacity-20" />
          <div className="text-destructive font-black uppercase tracking-widest text-xs">Error de Protocolo</div>
          <p className="text-[10px] text-muted-foreground px-4">No se pudo capturar el contexto. Reintenta desde Bitrix24.</p>
        </div>
      )}
    </div>
  );
}

export default function InstallPage() {
  return (
    <div className="min-h-screen bg-[#F0F3F5] flex flex-col items-center justify-center p-4">
      <Script 
        src="https://api.bitrix24.com/api/v1/" 
        strategy="afterInteractive"
      />

      <div className="mb-8 scale-110">
        <Logo showText={true} />
      </div>

      <Card className="w-full max-w-md border-none shadow-2xl card-rounded bg-white overflow-hidden">
        <CardHeader className="bg-primary p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="h-12 w-12 text-secondary" />
          </div>
          <CardTitle className="font-headline text-xl font-bold">Instalación Local</CardTitle>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mt-2">Protocolo de Enlace Seguro</p>
        </CardHeader>

        <CardContent className="p-8">
          <Suspense fallback={
            <div className="flex flex-col items-center gap-4 py-6">
              <Loader2 className="h-8 w-8 animate-spin text-secondary" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Iniciando SDK...</p>
            </div>
          }>
            <InstallContent />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
