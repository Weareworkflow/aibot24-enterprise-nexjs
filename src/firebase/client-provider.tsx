
'use client';

import { ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';

/**
 * Proveedor de Firebase para el lado del cliente.
 * Garantiza que Firebase solo se inicialice en el navegador para evitar errores de SSR
 * y problemas con variables de entorno no cargadas en el servidor.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [instance, setInstance] = useState<ReturnType<typeof initializeFirebase> | null>(null);

  useEffect(() => {
    // Inicializamos Firebase solo una vez cuando el componente se monta en el cliente.
    setInstance(initializeFirebase());
  }, []);

  // Mientras se inicializa, no renderizamos para evitar errores de hidratación o contexto.
  if (!instance) {
    return null;
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
