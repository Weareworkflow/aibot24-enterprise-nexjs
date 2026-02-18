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

export async function getBitrixClient(domain: string) {
  // Soporte para Modo Local (Desarrollo)
  if (process.env.NEXT_PUBLIC_BITRIX_LOCAL_MODE === 'true') {
    if (process.env.BITRIX_LOCAL_ACCESS_TOKEN) {
      console.log(`[BitrixService] Usando Credenciales Locales desde ENV para: ${domain}`);
      return {
        accessToken: process.env.BITRIX_LOCAL_ACCESS_TOKEN,
        domain: process.env.BITRIX_LOCAL_DOMAIN || domain,
      };
    } else {
      console.log(`[BitrixService] Modo Local: Buscando credenciales en Firestore para: ${domain}`);
    }
  }

  // Lookup by DOMAIN (installations are keyed by domain now)
  const installationRef = doc(db, 'installations', domain);
  const installationSnap = await getDoc(installationRef);

  if (!installationSnap.exists()) {
    throw new Error(`Instalación no encontrada para el dominio: ${domain}`);
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
      throw new Error(`Credenciales de Bitrix no configuradas para el dominio: ${domain}`);
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

export async function callBitrixMethod(domain: string, method: string, params: any = {}) {
  const client = await getBitrixClient(domain);

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

export async function registerBitrixBot(domain: string, agent: AIAgent) {
  // 1. Get Webhook Config (Handler URL)
  // Usamos la URL del API Gateway desplegado
  const webhookUrl = "https://aibot24-chat-gw-75slv2b8.uc.gateway.dev/api/chat";

  console.log(`[BitrixService] Registering bot with webhook: ${webhookUrl}`);

  if (!agent.id) {
    console.error("❌ Agent ID is missing in registerBitrixBot");
    return { error: "Agent ID is required for registration", error_description: "Missing Agent ID" };
  }

  // 2. Prepare Params for imbot.register
  const params: any = {
    CODE: `bot_${agent.id}`,
    TYPE: 'O', // Open Channel (Solicitado por usuario)
    EVENT_MESSAGE_ADD: webhookUrl,
    EVENT_WELCOME_MESSAGE: webhookUrl,
    EVENT_BOT_DELETE: webhookUrl, // Handler para cuando eliminan el bot desde bitrix
    EVENT_MESSAGE_UPDATE: webhookUrl, // Handler para edición de mensajes
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
  console.log(`[BitrixService] Sending imbot.register for ${agent.name} (Code: bot_${agent.id})...`);
  const result = await callBitrixMethod(domain, 'imbot.register', params);

  if (result.error) {
    console.error("❌ Bitrix Registration Error:", result.error, result.error_description);
  } else {
    console.log("✅ Bitrix Registration Success:", result.result);
  }

  // 5. Update Company (imbot.register might not support WORK_COMPANY directly, 
  // checking docs... usually it creates a user. We might need to update the user profile afterwards)
  if (result && result.result) {
    try {
      // El result devuelve el ID del bot (que es un user_id).
      const botId = result.result;

      if (agent.company) {
        await callBitrixMethod(domain, 'user.update', {
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

export async function updateBitrixBot(domain: string, agent: AIAgent) {
  // Solo actualizamos propiedades visuales, no la URL del webhook (a menos que cambie logicamente)
  const params: any = {
    BOT_ID: agent.bitrixBotId, // Debemos guardar este ID cuando se registra
    PROPERTIES: {
      NAME: agent.name,
      WORK_POSITION: agent.role || "AI Agent",
      COLOR: agent.color || 'BLUE',
    }
  };

  if (agent.avatar) {
    params.PROPERTIES.PERSONAL_PHOTO = agent.avatar;
  }

  console.log(`[BitrixService] Updating bot ${agent.bitrixBotId} for agent ${agent.name}`);
  return await callBitrixMethod(domain, 'imbot.update', params);
}

export async function unregisterBitrixBot(domain: string, botId: string) {
  console.log(`[BitrixService] Unregistering bot ${botId}`);
  return await callBitrixMethod(domain, 'imbot.unregister', { BOT_ID: botId });
}
