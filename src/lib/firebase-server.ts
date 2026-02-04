
import * as admin from 'firebase-admin';
import { firebaseConfig } from '@/firebase/config';

/**
 * Inicializa Firebase Admin para uso en Server Components y API Routes.
 */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // Opcional si se despliega en GCP/Firebase
    projectId: firebaseConfig.projectId,
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
