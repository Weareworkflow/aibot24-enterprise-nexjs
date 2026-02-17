import 'server-only';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Inicialización Lazy del SDK de Admin
// Evita errores de doble inicialización en hot-reload
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        });
        console.log('🔥 [Firebase Admin] Initialized successfully');
    } catch (error: any) {
        console.error('❌ [Firebase Admin] Initialization failed:', error);
    }
}

export const db = getFirestore();
export const auth = getAuth();
