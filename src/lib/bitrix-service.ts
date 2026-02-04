
import { db } from './firebase-server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { BitrixInstallation } from './types';

/**
 * Servicio para gestionar la comunicación con Bitrix24 desde el servidor.
 * Maneja el refresco automático de tokens utilizando las credenciales oficiales.
 */
export async function getBitrixClient(memberId: string) {
  const installationRef = doc(db, 'installations', memberId);
  const installationSnap = await getDoc(installationRef);

  if (!installationSnap.exists()) {
    throw new Error(`Instalación no encontrada para el Member ID: ${memberId}`);
  }

  const data = installationSnap.data() as BitrixInstallation;
  const now = Math.floor(Date.now() / 1000);
  
  // Calculamos la expiración (5 min de margen)
  const expiresAt = data.expiresAt || (Math.floor(new Date(data.createdAt).getTime() / 1000) + (data.expiresIn || 3600));
  const isExpired = now >= (expiresAt - 300);

  if (isExpired && data.refreshToken) {
    console.log(`Token expirado para ${memberId}. Iniciando protocolo de refresco OAuth...`);
    
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.BITRIX_CLIENT_ID || 'local.6982e6f2b88070.20311787',
      client_secret: process.env.BITRIX_CLIENT_SECRET || '42QiydgDFfjI35jA0BZYSsHinhw6m30zAw6pkHXeV9t87rC6RZ',
      refresh_token: data.refreshToken,
    });

    try {
      const response = await fetch(`https://oauth.bitrix.info/oauth/token/?${params.toString()}`);
      const newData = await response.json();

      if (newData.error) {
        throw new Error(`Bitrix OAuth Error: ${newData.error_description || newData.error}`);
      }

      const updatedData: Partial<BitrixInstallation> = {
        accessToken: newData.access_token,
        refreshToken: newData.refresh_token,
        expiresIn: parseInt(newData.expires_in),
        expiresAt: Math.floor(Date.now() / 1000) + parseInt(newData.expires_in),
      };

      await updateDoc(installationRef, updatedData);
      
      return {
        accessToken: newData.access_token,
        domain: data.domain,
      };
    } catch (error: any) {
      console.error("Error crítico refrescando token:", error.message);
      throw error;
    }
  }

  return {
    accessToken: data.accessToken,
    domain: data.domain,
  };
}

/**
 * Realiza una llamada REST a Bitrix24 directamente desde el servidor (Node.js).
 */
export async function callBitrixMethod(memberId: string, method: string, params: any = {}) {
  const client = await getBitrixClient(memberId);
  
  const response = await fetch(`https://${client.domain}/rest/${method}.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth: client.accessToken,
      ...params,
    }),
  });

  return await response.json();
}
