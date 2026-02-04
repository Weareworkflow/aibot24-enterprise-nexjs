
"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, ShieldCheck, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";
import { useUIStore } from "@/lib/store";
import { useFirestore } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { BitrixInstallation } from "@/lib/types";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Página de Instalación de Bitrix24.
 * Captura el member_id para usarlo como tenantId global y guarda el registro en la DB.
 */
export default function InstallPage() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'error'>('loading');
  const [installData, setInstallData] = useState<any>(null);
  const { setTenantId, setDomain } = useUIStore();
  const db = useFirestore();

  const handleInstall = async () => {
    if (typeof window !== 'undefined' && (window as any).BX24 && db) {
      const BX24 = (window as any).BX24;
      
      try {
        const auth = BX24.getAuth();
        const queryParams = new URLSearchParams(window.location.search);
        const domain = queryParams.get('DOMAIN') || auth?.domain;
        
        // El member_id es el identificador único de la instalación en el portal
        const memberId = auth?.member_id;

        if (memberId) {
          const installationRecord: BitrixInstallation = {
            memberId,
            domain: domain || "unknown",
            accessToken: auth?.access_token,
            refreshToken: auth?.refresh_token,
            expiresIn: auth?.expires_in,
            status: 'active',
            createdAt: new Date().toISOString()
          };

          // Guardar en Firestore para registro de portal
          const installRef = doc(db, "installations", memberId);
          
          setDoc(installRef, installationRecord)
            .then(() => {
              setTenantId(memberId);
              if (domain) setDomain(domain);
              setInstallData(installationRecord);
              
              // Finalizamos el protocolo oficial de Bitrix24
              BX24.installFinish();
              setStatus('success');
              
              setTimeout(() => {
                window.location.href = '/';
              }, 3000);
            })
            .catch(async (error) => {
              console.error("Error guardando instalacion:", error);
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: installRef.path,
                operation: 'create',
                requestResourceData: installationRecord
              }));
              setStatus('error');
            });
        } else {
          console.error("No se pudo obtener el member_id del contexto BX24");
          setStatus('error');
        }
      } catch (err) {
        console.error("Error durante el proceso de instalacion:", err);
        setStatus('error');
      }
    }
  };

  useEffect(() => {
    // Pequeña espera para asegurar que BX24 esté disponible si el script cargó rápido
    const checkBX24 = setInterval(() => {
      if ((window as any).BX24) {
        setStatus('ready');
        clearInterval(checkBX24);
      }
    }, 500);

    return () => clearInterval(checkBX24);
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F3F5] flex flex-col items-center justify-center p-4">
      <Script 
        src="//api.bitrix24.com/api/v1/" 
        strategy="beforeInteractive"
      />

      <div className="mb-8 scale-110">
        <Logo showText={true} />
      </div>

      <Card className="w-full max-w-md border-none shadow-2xl card-rounded bg-white overflow-hidden">
        <CardHeader className="bg-primary p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="h-12 w-12 text-secondary" />
          </div>
          <CardTitle className="font-headline text-xl font-bold">Enlace de Portal</CardTitle>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mt-2">Bitrix24 Protocol v3.0</p>
        </CardHeader>

        <CardContent className="p-8">
          <div className="space-y-6">
            {status === 'loading' && (
              <div className="flex flex-col items-center gap-4 py-6">
                <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sincronizando SDK...</p>
              </div>
            )}

            {status === 'ready' && (
              <div className="space-y-6 text-center">
                <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs leading-relaxed text-slate-600">
                    Se ha detectado una sesión de Bitrix24. Haz clic para registrar este portal y activar el aislamiento de datos corporativos.
                  </p>
                </div>
                <Button 
                  onClick={handleInstall} 
                  className="w-full h-14 pill-rounded bg-secondary hover:bg-secondary/90 text-white font-black uppercase text-xs tracking-widest gap-2 shadow-lg shadow-secondary/20"
                >
                  Confirmar y Activar
                </Button>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center gap-6 py-4 animate-in fade-in zoom-in duration-500">
                <div className="h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-accent" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-bold text-lg text-slate-800">¡Portal Vinculado!</h3>
                  <p className="text-[10px] font-black uppercase text-accent tracking-widest">Aislamiento de Datos Configurado</p>
                </div>
                <div className="w-full p-4 bg-slate-50 rounded-xl border flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <Database className="h-3 w-3 text-slate-400" />
                    <span className="text-[9px] font-mono text-slate-500 truncate">ID: {installData?.memberId}</span>
                  </div>
                </div>
                <p className="text-[9px] text-muted-foreground italic">Redirigiendo a la consola de agentes...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center py-6 space-y-4">
                <div className="text-destructive font-black uppercase tracking-widest text-xs">Error de Protocolo</div>
                <p className="text-xs text-muted-foreground">No se pudo registrar la instalación. Asegúrate de estar ejecutando la app dentro de un portal de Bitrix24.</p>
                <Button variant="outline" onClick={() => window.location.reload()} className="pill-rounded h-10 px-6">Reintentar</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
