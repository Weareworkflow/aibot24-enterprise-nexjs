
import { db } from './firebase-server';
import { BitrixInstallation } from './types';

/**
 * Servicio para gestionar la comunicación con Bitrix24 desde el servidor.
 * Maneja el refresco automático de tokens.
 */
export async function getBitrixClient(memberId: string) {
  const installationDoc = await db.collection('installations').doc(memberId).get();

  if (!installationDoc.exists) {
    throw new Error(`Instalación no encontrada para memberId: ${memberId}`);
  }

  const data = installationDoc.data() as BitrixInstallation;
  const now = Math.floor(Date.now() / 1000);
  
  // Calculamos si el token ha expirado (usando un margen de 5 minutos)
  const expiresAt = data.expiresAt || 0;
  const isExpired = now >= (expiresAt - 300);

  if (isExpired && data.refreshToken) {
    console.log(`Token expirado para ${memberId}. Iniciando protocolo de refresco...`);
    
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.BITRIX_CLIENT_ID || 'local.6982e6f2b88070.20311787',
      client_secret: process.env.BITRIX_CLIENT_SECRET || '42QiydgDFfjI35jA0BZYSsHinhw6m30zAw6pkHXeV9t87rC6RZ',
      refresh_token: data.refreshToken,
    });

    const response = await fetch(`https://oauth.bitrix.info/oauth/token/?${params.toString()}`);
    const newData = await response.json();

    if (newData.error) {
      throw new Error(`Error al refrescar token: ${newData.error_description || newData.error}`);
    }

    // Actualizamos Firestore con los nuevos tokens
    const updatedData: Partial<BitrixInstallation> = {
      accessToken: newData.access_token,
      refreshToken: newData.refresh_token,
      expiresIn: parseInt(newData.expires_in),
      expiresAt: Math.floor(Date.now() / 1000) + parseInt(newData.expires_in),
    };

    await db.collection('installations').doc(memberId).update(updatedData);
    
    return {
      accessToken: newData.access_token,
      domain: data.domain,
    };
  }

  return {
    accessToken: data.accessToken,
    domain: data.domain,
  };
}

/**
 * Realiza una llamada REST a Bitrix24 desde el servidor.
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
