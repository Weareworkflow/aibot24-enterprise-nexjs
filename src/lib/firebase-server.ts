
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';

/**
 * Inicializa Firebase utilizando el SDK estándar para uso en Server Components y API Routes.
 * Esto evita el error de "Missing credentials" de firebase-admin en localhost.
 */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
