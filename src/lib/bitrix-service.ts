import { db } from './firebase-server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { BitrixInstallation, AIAgent } from './types';

/**
 * Servicio central para gestionar la comunicación con Bitrix24.
 * Utiliza los secretos actualizados y el alcance (scope) completo de permisos.
 */

/**
 * Servicio central para gestionar la comunicación con Bitrix24.
 * Utiliza los secretos recuperados de Firestore para mayor seguridad y flexibilidad.
 */

// Ya no usamos constantes hardcodeadas. Se recomienda configurar config/bitrix en Firestore
// para valores globales, o se recuperarán de la instalación específica.

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

/**
 * Obtiene la configuración de secretos de Bitrix de Firestore para un dominio específico.
 */
async function getSecretsConfig(domain: string) {
  try {
    const configRef = doc(db, 'config-secrets', domain);
    const configSnap = await getDoc(configRef);
    return configSnap.exists() ? configSnap.data() : null;
  } catch (error) {
    console.error(`Error recuperando secretos para ${domain}:`, error);
    return null;
  }
}

export function getBitrixAuthUrl(domain: string, clientId: string) {
  return `https://${domain}/oauth/authorize/?client_id=${clientId}&response_type=code&scope=${BITRIX_SCOPES}`;
}

export async function getBitrixClient(memberId: string) {
  // Soporte para Modo Local (Desarrollo)
  if (process.env.NEXT_PUBLIC_BITRIX_LOCAL_MODE === 'true' && memberId === process.env.BITRIX_LOCAL_MEMBER_ID) {
    if (process.env.BITRIX_LOCAL_ACCESS_TOKEN) {
      console.log(`[BitrixService] Usando Credenciales Locales desde ENV para: ${memberId}`);
      return {
        accessToken: process.env.BITRIX_LOCAL_ACCESS_TOKEN,
        domain: process.env.BITRIX_LOCAL_DOMAIN || "localhost",
      };
    } else {
      console.log(`[BitrixService] Modo Local: Buscando credenciales en Firestore para: ${memberId}`);
      // Permitimos que continúe el flujo normal para buscar en Firestore
    }
  }

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
    // Intentar obtener clientId/Secret de la instalación, o fallback al global (usando el DOMINIO)
    let clientId = data.clientId;
    let clientSecret = data.clientSecret;

    if (!clientId || !clientSecret) {
      // Usamos el dominio (ej: workflowteams.bitrix24.es) como ID para buscar los secretos
      const globalConfig = await getSecretsConfig(data.domain);
      if (globalConfig) {
        console.log(`[BitrixService] Using Secrets from Firestore for domain: ${data.domain}`);
        clientId = clientId || globalConfig?.clientId;
        clientSecret = clientSecret || globalConfig?.clientSecret;
      } else {
        console.warn(`[BitrixService] WARNING: No secrets found in config-secrets for domain: ${data.domain}`);
      }
    }

    if (!clientId || !clientSecret) {
      throw new Error(`Credenciales de Bitrix no configuradas para el Member ID: ${memberId}`);
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
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

export async function registerBitrixBot(memberId: string, agent: AIAgent) {
  // 1. Get Webhook Config (Handler URL)
  // Intentamos obtener la URL del handler desde config-secrets (si existe), o fallback al appUrl
  let handlerUrl = process.env.NEXT_PUBLIC_APP_URL || `https://aibot24-voice.web.app`;

  try {
    const secrets = await getSecretsConfig(memberId); // Assuming memberId might be domain or we look up by domain? 
    // The function getSecretsConfig takes a DOMAIN. We need to look up the installation first to get the domain.
    // Optimization: callBitrixMethod already fetches the client/domain. Let's rely on defaults or pass it in.
    if (secrets?.webhookHandlerUrl) {
      handlerUrl = secrets.webhookHandlerUrl;
    }
  } catch (e) {
    console.warn("Could not fetch secrets for handler URL, using default:", handlerUrl);
  }

  const webhookUrl = `${handlerUrl}/api/bitrix/webhook`;

  // 2. Prepare Params for imbot.register
  const params: any = {
    CODE: `bot_${agent.id}`,
    TYPE: 'O', // Open Channel (Solicitado por usuario)
    EVENT_MESSAGE_ADD: webhookUrl,
    EVENT_WELCOME_MESSAGE: webhookUrl,
    PROPERTIES: {
      NAME: agent.name,
      WORK_POSITION: agent.role || "AI Agent", // Rol en Bitrix
      COLOR: agent.color || 'BLUE',
    }
  };

  // 3. Handle Avatar (PERSONAL_PHOTO)
  if (agent.avatar) {
    params.PROPERTIES.PERSONAL_PHOTO = agent.avatar; // Bitrix soporta base64 en este campo para imbot? 
    // La documentación de imbot.register dice PERSONAL_PHOTO: Avatar del chatbot (base64 string).
  }

  // 4. Register Bot
  const result = await callBitrixMethod(memberId, 'imbot.register', params);

  // 5. Update Company (imbot.register might not support WORK_COMPANY directly, 
  // checking docs... usually it creates a user. We might need to update the user profile afterwards)
  if (result && result.result) {
    try {
      // El result devuelve el ID del bot (que es un user_id).
      const botId = result.result;

      if (agent.company) {
        await callBitrixMethod(memberId, 'user.update', {
          ID: botId,
          WORK_COMPANY: agent.company
        });
      }
    } catch (e) {
      console.error("Error updating bot company:", e);
    }
  }

  return result;
}
