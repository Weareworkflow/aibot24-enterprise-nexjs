
'use server';

/**
 * @fileOverview Acciones de servidor para la integración con Bitrix24.
 * Maneja el registro de bots y comunicación REST.
 */

import {
  registerBitrixBot as registerBot,
  updateBitrixBot as updateBot,
  unregisterBitrixBot as unregisterBot
} from '@/lib/bitrix-service';

export async function registerOpenLinesBot(domain: string, agentData: { name: string, role: string, color: string, agentId: string }) {
  try {
    // Cast to any to bypass strict AIAgent check for partial data
    const result = await registerBot(domain, { ...agentData, id: agentData.agentId } as any);
    if (result.error) {
      throw new Error(result.error_description || "Error registrando bot en Bitrix24");
    }
    return { success: true, botId: result.result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateOpenLinesBot(domain: string, agentData: any) {
  try {
    const result = await updateBot(domain, agentData);
    if (result.error) {
      throw new Error(result.error_description || "Error actualizando bot en Bitrix24");
    }
    return { success: true, botId: result.result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function unregisterOpenLinesBot(domain: string, botId: string) {
  try {
    const result = await unregisterBot(domain, botId);
    if (result.error) {
      throw new Error(result.error_description || "Error eliminando bot en Bitrix24");
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
