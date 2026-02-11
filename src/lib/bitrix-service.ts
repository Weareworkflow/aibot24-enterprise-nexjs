import { db } from './firebase-server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { BitrixInstallation } from './types';

/**
 * Servicio central para gestionar la comunicación con Bitrix24.
 * Utiliza los secretos actualizados y el alcance (scope) completo de permisos.
 */

const CLIENT_ID_DEFAULT = 'local.6982e6f2b88070.20311787';
const CLIENT_SECRET_DEFAULT = '42QiydgDFfjI35jA0BZYSsHinhw6m30zAw6pkHXeV9t87rC6RZ';

// Alcance completo de permisos solicitados según requerimiento del usuario
export const BITRIX_SCOPES = [
  'crm',
  'im',
  'imbot',
  'user',
  'department',
  'imopenlines',
  'calendar',
  'calendarmobile',
  'disk',
  'documentgenerator',
  'task',
  'catalog',
  'catalogmobile'
].join(',');

export function getBitrixAuthUrl(domain: string, clientId?: string) {
  const effectiveClientId = clientId || CLIENT_ID_DEFAULT;
  // Es vital incluir el parámetro scope para que Bitrix otorgue los permisos correctos
  return `https://${domain}/oauth/authorize/?client_id=${effectiveClientId}&response_type=code&scope=${BITRIX_SCOPES}`;
}

export async function getBitrixClient(memberId: string) {
  const installationRef = doc(db, 'installations', memberId);
  const installationSnap = await getDoc(installationRef);

  if (!installationSnap.exists()) {
    throw new Error(`Instalación no encontrada para el Member ID: ${memberId}`);
  }

  const data = installationSnap.data() as BitrixInstallation;
  const now = Math.floor(Date.now() / 1000);
  
  const expiresAt = data.expiresAt || (Math.floor(new Date(data.createdAt).getTime() / 1000) + (data.expiresIn || 3600));
  const isExpired = now >= (expiresAt - 300); // 5 minutos de margen

  if (isExpired && data.refreshToken) {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: data.clientId || CLIENT_ID_DEFAULT,
      client_secret: data.clientSecret || CLIENT_SECRET_DEFAULT,
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

export async function registerBitrixBot(memberId: string, agentData: { name: string, role: string, color: string, agentId: string }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://aibot24-voice.web.app`;
  
  const params = {
    CODE: `bot_${agentData.agentId}`,
    TYPE: 'O',
    EVENT_MESSAGE_ADD: `${appUrl}/api/bitrix/webhook`,
    EVENT_WELCOME_MESSAGE: `${appUrl}/api/bitrix/webhook`,
    PROPERTIES: {
      NAME: agentData.name,
      WORK_POSITION: agentData.role,
      COLOR: agentData.color || 'BLUE',
    }
  };

  return await callBitrixMethod(memberId, 'imbot.register', params);
}
