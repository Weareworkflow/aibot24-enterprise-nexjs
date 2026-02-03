
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Inicializa las instancias de Firebase utilizando la configuración del proyecto.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    let firebaseApp: FirebaseApp;
    
    if (!getApps().length) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = getApp();
    }

    const firestore = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);

    return { firebaseApp, firestore, auth };
  } catch (error) {
    // Los errores de inicialización se manejan silenciosamente para que el 
    // componente ClientProvider pueda mostrar un mensaje de error amigable.
    return null;
  }
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
