
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';

/**
 * Inicializa Firebase utilizando el SDK estándar para uso en Server Components y API Routes.
 * Unifica el acceso a la base de datos en todo el backend para evitar errores de inicialización.
 */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
