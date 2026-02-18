/**
 * Configuración oficial de Firebase para el proyecto AIBot24.
 * Conectado al proyecto: aibot24-485301
 * Sitio: aibot24-voice
 */
const getFirebaseConfig = () => {
  if (process.env.FIREBASE_WEBAPP_CONFIG) {
    try {
      const config = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
      return config;
    } catch (e) {
      console.error('Error parsing FIREBASE_WEBAPP_CONFIG', e);
    }
  }

  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  };
};

export const firebaseConfig = getFirebaseConfig();

export const siteConfig = {
  site: "aibot24-voice"
};
