import { getDb } from './mongodb';
import { BitrixInstallation, AIAgent } from './types';

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

  if (isExpired && data.refreshToken) {
    console.log(`[BitrixService] Token expired for ${domain}. Refreshing...`);
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

export async function callBitrixMethod(domain: string, method: string, params: any = {}) {
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
  const webhookUrl = "https://aibot24-chat-gw-75slv2b8.uc.gateway.dev/api/chat";

  console.log(`[BitrixService] Registering bot with webhook: ${webhookUrl}`);

  if (!agent.id) {
    console.error("❌ Agent ID is missing in registerBitrixBot");
    return { error: "Agent ID is required for registration", error_description: "Missing Agent ID" };
  }

  const params: any = {
    CODE: `bot_${agent.id}`,
    TYPE: 'O',
    EVENT_MESSAGE_ADD: webhookUrl,
    EVENT_WELCOME_MESSAGE: webhookUrl,
    EVENT_BOT_DELETE: webhookUrl,
    EVENT_MESSAGE_UPDATE: webhookUrl,
    PROPERTIES: {
      NAME: agent.name,
      WORK_POSITION: agent.role || "AI Agent",
      COLOR: agent.color || 'BLUE',
    }
  };

  if (agent.avatar) {
    params.PROPERTIES.PERSONAL_PHOTO = agent.avatar;
  }

  console.log(`[BitrixService] Sending imbot.register for ${agent.name} (Code: bot_${agent.id})...`);
  const result = await callBitrixMethod(domain, 'imbot.register', params);

  if (result.error) {
    console.error("❌ Bitrix Registration Error:", result.error, result.error_description);
  } else {
    console.log("✅ Bitrix Registration Success:", result.result);
  }

  if (result && result.result) {
    try {
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
  const params: any = {
    BOT_ID: agent.bitrixBotId,
    FIELDS: {
      NAME: agent.name,
      WORK_POSITION: agent.role || "AI Agent",
      COLOR: agent.color || 'BLUE',
    }
  };

  if (agent.avatar) {
    params.FIELDS.PERSONAL_PHOTO = agent.avatar;
  }

  console.log(`[BitrixService] Updating bot ${agent.bitrixBotId} for agent ${agent.name}`);
  return await callBitrixMethod(domain, 'imbot.update', params);
}

export async function unregisterBitrixBot(domain: string, botId: string) {
  console.log(`[BitrixService] Unregistering bot ${botId}`);
  return await callBitrixMethod(domain, 'imbot.unregister', { BOT_ID: botId });
}
