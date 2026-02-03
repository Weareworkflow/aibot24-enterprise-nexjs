
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Inicializa las instancias de Firebase.
 * Solo debe ejecutarse en el lado del cliente.
 */
export function initializeFirebase() {
  // Verificación de seguridad para evitar ejecución en servidor
  if (typeof window === 'undefined') {
    return { 
      firebaseApp: null as any, 
      firestore: null as any, 
      auth: null as any 
    };
  }

  let firebaseApp: FirebaseApp;
  
  if (!getApps().length) {
    // Validamos que exista al menos la API Key antes de intentar inicializar
    if (!firebaseConfig.apiKey) {
      console.warn('Firebase API Key no detectada. Asegúrate de configurar las variables de entorno NEXT_PUBLIC_FIREBASE_*.');
    }
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }

  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  return { firebaseApp, firestore, auth };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
