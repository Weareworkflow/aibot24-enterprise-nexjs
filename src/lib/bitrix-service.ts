import { getDb } from './mongodb';
import { BitrixInstallation, AIAgent } from './types';
import { bitrixConfig } from './config-ai';

/**
 * Servicio central para gestionar la comunicación con Bitrix24.
 * Utiliza los secretos recuperados de MongoDB para mayor seguridad y flexibilidad.
 */

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


export function getBitrixAuthUrl(domain: string, clientId: string) {
  return `https://${domain}/oauth/authorize/?client_id=${clientId}&response_type=code&scope=${BITRIX_SCOPES}`;
}

export async function getBitrixClient(domain: string, forceRefresh: boolean = false) {
  // Soporte para Modo Local (Desarrollo)
  if (process.env.NEXT_PUBLIC_BITRIX_LOCAL_MODE === 'true') {
    if (process.env.BITRIX_LOCAL_ACCESS_TOKEN) {
      console.log(`[BitrixService] Usando Credenciales Locales desde ENV para: ${domain}`);
      return {
        accessToken: process.env.BITRIX_LOCAL_ACCESS_TOKEN,
        domain: process.env.BITRIX_LOCAL_DOMAIN || domain,
      };
    } else {
      console.log(`[BitrixService] Modo Local: Buscando credenciales en MongoDB para: ${domain}`);
    }
  }

  const db = await getDb();
  // Look for records where either the domain string OR the memberId matches the input
  const data = await db.collection('installations').findOne({
    $or: [
      { domain: domain },
      { memberId: domain }
    ]
  }) as BitrixInstallation | null;

  if (!data) {
    console.error(`[BitrixService] Installation not found in DB for domain: ${domain}`);
    throw new Error(`Instalación no encontrada para el dominio: ${domain}`);
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = (data as any).expiresAt || (Math.floor(new Date((data as any).createdAt).getTime() / 1000) + (data.expiresIn || 3600));
  const isExpired = now >= (expiresAt - 900); // 15 minute buffer vs 5

  if ((isExpired || forceRefresh) && data.refreshToken) {
    console.log(`[BitrixService] Token renewal requested for ${domain} (Force: ${forceRefresh}). Refreshing...`);
    let clientId = data.clientId;
    let clientSecret = data.clientSecret;

    if (!clientId || !clientSecret) {
      console.error(`[BitrixService] Missing client_id/secret for ${domain}. Cannot refresh.`);
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
        console.error(`[BitrixService] Refresh Error for ${domain}:`, newData);
        throw new Error(`Bitrix OAuth Error: ${newData.error_description || newData.error}`);
      }

      const updatedData = {
        accessToken: newData.access_token,
        refreshToken: newData.refresh_token,
        expiresIn: parseInt(newData.expires_in),
        expiresAt: Math.floor(Date.now() / 1000) + parseInt(newData.expires_in),
      };

      await db.collection('installations').updateOne(
        { domain },
        { $set: updatedData }
      );

      console.log(`[BitrixService] Token refreshed successfully for ${domain}`);
      return {
        accessToken: newData.access_token,
        domain: data.domain,
      };
    } catch (error: any) {
      console.error("[BitrixService] Critical error refreshing token:", error.message);
      throw error;
    }
  }

  return {
    accessToken: data.accessToken,
    domain: data.domain,
  };
}

export async function callBitrixMethod(domain: string, method: string, params: any = {}, retryCount: number = 0) {
  const client = await getBitrixClient(domain);

  const url = `https://${client.domain}/rest/${method}.json`;
  const maskedToken = client.accessToken ? `${client.accessToken.substring(0, 10)}...` : 'MISSING';

  console.log(`[BitrixService] Calling REST: ${url} (Token: ${maskedToken})`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth: client.accessToken,
        ...params,
      }),
    });

    const result = await response.json();

    if (result.error === 'expired_token' && retryCount < 1) {
      console.warn(`[BitrixService] Token expired during REST call for ${domain}. Retrying with force refresh...`);
      // Force refresh and retry once
      await getBitrixClient(domain, true);
      return await callBitrixMethod(domain, method, params, retryCount + 1);
    }

    if (result.error) {
      console.error(`[BitrixService] REST Error for ${method}:`, result);
    }

    return result;
  } catch (err: any) {
    console.error(`[BitrixService] Fetch Failure for ${method}:`, err.message);
    throw err;
  }
}

export async function registerBitrixBot(domain: string, agent: AIAgent) {
  const webhookUrl = bitrixConfig.handlerUrl || "https://agent.weareworkflow.com/webhook";

  console.log(`[BitrixService] Registering bot with webhook: ${webhookUrl}`);

  if (!agent.id) {
    console.error("❌ Agent ID is missing in registerBitrixBot");
    return { error: "Agent ID is required for registration", error_description: "Missing Agent ID" };
  }

  // Use the persisted code if available, otherwise fallback to ID-based generation
  const codeToUse = agent.bitrixBotCode || (agent.id.includes('bot_') ? agent.id : `bot_${agent.id}`);
  const cleanCode = codeToUse;

  const params: any = {
    CODE: cleanCode,
    TYPE: 'O',
    EVENT_MESSAGE_ADD: webhookUrl,
    EVENT_WELCOME_MESSAGE: webhookUrl,
    EVENT_BOT_DELETE: webhookUrl,
    EVENT_MESSAGE_UPDATE: webhookUrl,
    OPENLINE: 'Y',
    PROPERTIES: {
      NAME: agent.name,
      WORK_POSITION: agent.role || "AI Agent",
      COLOR: agent.color || 'BLUE',
    }
  };

  if (agent.avatar) {
    params.PROPERTIES.PERSONAL_PHOTO = agent.avatar;
  }

  console.log(`[BitrixService] Sending imbot.register for ${agent.name} (CODE: ${params.CODE})...`);
  const result = await callBitrixMethod(domain, 'imbot.register', params);

  if (result.error) {
    console.error("❌ Bitrix Registration Error:", result.error, result.error_description);
  } else {
    console.log("✅ Bitrix Registration Success:", result.result);
  }

  if (result && result.result) {
    try {
      const botId = result.result;
      // Sync user profile immediately after registration
      // We use both NAME and LAST_NAME to ensure visibility in some Bitrix versions
      await callBitrixMethod(domain, 'user.update', {
        ID: botId,
        NAME: agent.name,
        WORK_POSITION: agent.role,
        WORK_COMPANY: agent.company || "AI Bot 24"
      });
    } catch (e) {
      console.error("Error updating bot user profile:", e);
    }
  }

  return result;
}

export async function updateBitrixBot(domain: string, agent: AIAgent) {
  const handlerUrl = bitrixConfig.handlerUrl || "https://agent.weareworkflow.com/webhook";

  const params: any = {
    BOT_ID: agent.bitrixBotId,
    FIELDS: {
      NAME: agent.name,
      WORK_POSITION: agent.role || "AI Agent",
      COLOR: agent.color || 'BLUE',
    },
    // Handler parameters MUST be at the root level for imbot.update
    EVENT_MESSAGE_ADD: handlerUrl,
    EVENT_WELCOME_MESSAGE: handlerUrl,
    EVENT_BOT_DELETE: handlerUrl,
    EVENT_MESSAGE_UPDATE: handlerUrl,
  };

  if (agent.avatar) {
    params.FIELDS.PERSONAL_PHOTO = agent.avatar;
  }

  console.log(`[BitrixService] Updating bot ${agent.bitrixBotId} for agent ${agent.name}`);
  const updateResult = await callBitrixMethod(domain, 'imbot.update', params);

  // CRITICAL: Synchronize the user profile name. 
  // Bitrix24 Chat Bot uses the linked User profile for the display name in most views.
  if (!updateResult.error) {
    console.log(`[BitrixService] Synchronizing user profile for bot ${agent.bitrixBotId} (Name: ${agent.name})`);
    await callBitrixMethod(domain, 'user.update', {
      ID: agent.bitrixBotId,
      NAME: agent.name,
      WORK_POSITION: agent.role,
      WORK_COMPANY: agent.company
    });
  }

  // To ensure webhooks are updated, we also re-register the bot with the same CODE
  // This is the recommended way to update event handlers in Bitrix24 Chat Bot API
  console.log(`[BitrixService] Re-registering bot to update handlers for agent ${agent.name}`);
  await registerBitrixBot(domain, agent);

  return updateResult;
}

export async function unregisterBitrixBot(domain: string, botId: string) {
  console.log(`[BitrixService] Unregistering bot ${botId}`);
  return await callBitrixMethod(domain, 'imbot.unregister', { BOT_ID: botId });
}
