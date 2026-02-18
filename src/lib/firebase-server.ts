
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';

/**
 * Inicializa Firebase utilizando el SDK estándar para uso en Server Components y API Routes.
 * Unifica el acceso a la base de datos en todo el backend para evitar errores de inicialización.
 */
const app = (!getApps().length && firebaseConfig.apiKey)
    ? initializeApp(firebaseConfig)
    : (getApps().length ? getApp() : null);

export const db = app ? getFirestore(app) : ({} as any);
export const auth = app ? getAuth(app) : ({} as any);
