
'use client';

import { ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Database } from 'lucide-react';

/**
 * Proveedor de Firebase para el lado del cliente.
 * Maneja la inicialización asíncrona y errores de configuración.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [instance, setInstance] = useState<ReturnType<typeof initializeFirebase> | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const firebaseInstance = initializeFirebase();
    setInstance(firebaseInstance);
    setHasChecked(true);
  }, []);

  if (!hasChecked) {
    return null;
  }

  // Si no se pudo inicializar por falta de config, mostramos un mensaje amigable
  if (!instance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Alert className="max-w-md border-secondary/20 bg-white shadow-xl rounded-3xl p-8">
          <Database className="h-6 w-6 text-secondary mb-4" />
          <AlertTitle className="font-headline font-bold text-lg mb-2">Conexión Requerida</AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground leading-relaxed">
            AIBot24 no puede conectar con la base de datos de Bitrix24. 
            <br /><br />
            Por favor, asegúrate de configurar las variables de entorno <code className="bg-slate-100 px-1 rounded text-primary">NEXT_PUBLIC_FIREBASE_*</code> en tu proyecto para habilitar la persistencia en la nube.
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
