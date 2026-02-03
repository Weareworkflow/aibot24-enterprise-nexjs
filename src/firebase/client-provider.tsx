
'use client';

import { ReactNode, useState, useEffect, useMemo } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Database, Loader2 } from 'lucide-react';

/**
 * Proveedor de Firebase para el lado del cliente.
 * Garantiza que Firebase se inicialice una sola vez en el navegador.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const instance = useMemo(() => {
    if (!isMounted) return null;
    return initializeFirebase();
  }, [isMounted]);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F3F5] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Iniciando Enlace de Datos...</p>
      </div>
    );
  }

  // Si no se pudo inicializar por falta de config o error, mostramos un mensaje amigable
  if (!instance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F3F5] p-4">
        <Alert className="max-w-md border-secondary/20 bg-white shadow-xl rounded-[2rem] p-8">
          <Database className="h-6 w-6 text-secondary mb-4" />
          <AlertTitle className="font-headline font-bold text-lg mb-2">Error de Sincronización</AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground leading-relaxed">
            No pudimos establecer conexión con la base de datos de Bitrix24. 
            <br /><br />
            Por favor, verifica que la configuración en <code className="bg-slate-100 px-1 rounded text-primary">src/firebase/config.ts</code> sea correcta y que tu proyecto de Firebase esté activo.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <FirebaseProvider 
      firebaseApp={instance.firebaseApp} 
      firestore={instance.firestore} 
      auth={instance.auth}
    >
      {children}
    </FirebaseProvider>
  );
}
