
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Inicializa las instancias de Firebase de forma segura.
 * Retorna null si la configuración es inválida o no estamos en el cliente.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return null;
  }

  // Verificamos que al menos la API Key esté presente para evitar errores de inicialización
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined') {
    console.warn('Firebase: Configuración incompleta detectada. Verifica tus variables de entorno.');
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
    console.error('Error al inicializar Firebase:', error);
    return null;
  }
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
