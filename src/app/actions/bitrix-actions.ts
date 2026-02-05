
'use server';

/**
 * @fileOverview Acciones de servidor para la integración con Bitrix24.
 * Maneja el registro de bots y comunicación REST.
 */

import { registerBitrixBot as registerBot } from '@/lib/bitrix-service';

export async function registerOpenLinesBot(memberId: string, agentData: { name: string, role: string, color: string, agentId: string }) {
  try {
    const result = await registerBot(memberId, agentData);
    if (result.error) {
      throw new Error(result.error_description || "Error registrando bot en Bitrix24");
    }
    return { success: true, botId: result.result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
