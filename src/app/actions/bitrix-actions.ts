
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
import { getDb } from '@/lib/mongodb';
import { generateAgentConfig } from '@/ai/flows/generate-agent-config';
import { AIAgent } from '@/lib/types';

export async function deployAgent(domain: string, config: { name: string, role: string, company: string, color: string }) {
  try {
    const db = await getDb();

    // 1. Check for duplicate name in the same tenant BEFORE doing anything in Bitrix
    const existingByName = await db.collection('agents').findOne({
      tenantId: domain,
      name: config.name,
    });

    if (existingByName) {
      return { success: false, error: `Ya existe un agente con el nombre "${config.name}" en este portal.` };
    }

    // 2. Register bot in Bitrix24
    // We use a DETERMINISTIC CODE based on the name. 
    // This makes the call idempotent: if it retries due to net::ERR_NETWORK_CHANGED, 
    // Bitrix will return the existing bot instead of creating a new one.
    const cleanName = config.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const deterministicId = `${cleanName}_${domain.replace(/\./g, '_')}`;

    console.log(`[DeployAgent] Registering bot with deterministic ID: ${deterministicId}`);

    const bitrixResult = await registerBot(domain, {
      name: config.name,
      role: config.role,
      color: config.color,
      id: deterministicId
    } as any);

    if (bitrixResult.error || !bitrixResult.result) {
      // If the error is that it already exists but we don't have it in our DB, 
      // we might want to recover it, but for now, we just report the error.
      throw new Error(bitrixResult.error_description || "Error registrando bot en Bitrix24");
    }

    const botIdToUse = bitrixResult.result as number;
    const finalAgentId = `${domain}-${botIdToUse}`;

    // 3. Generate AI Prompt 
    const aiResponse = await generateAgentConfig({
      prompt: `Genera un objetivo estratégico breve y un tono de comunicación para un agente con el rol: ${config.role} de la empresa ${config.company}.`,
      tenantId: domain
    });

    // 4. Save to MongoDB
    const newAgent: AIAgent = {
      id: finalAgentId,
      tenantId: domain,
      name: config.name,
      type: 'text',
      role: config.role,
      company: config.company,
      systemPrompt: aiResponse.systemPrompt || "",
      color: config.color,
      isActive: true,
      bitrixBotId: botIdToUse
    };

    await db.collection('agents').insertOne({
      ...newAgent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 5. Initialize Metrics
    await db.collection('metrics').insertOne({
      agentId: finalAgentId,
      usageCount: 0,
      performanceRating: 100,
      totalInteractionMetric: 0,
      tokens: "0",
      meetings: 0,
      transfers: 0,
      abandoned: 0,
      createdAt: new Date().toISOString(),
    });

    console.log(`✅ Agente desplegado y persistido: ${finalAgentId}`);
    return { success: true, agentId: finalAgentId };

  } catch (error: any) {
    console.error("Critical Deployment Error:", error);
    // If it's a specific Bitrix error, we pass it clearly
    return { success: false, error: error.message || "Error interno durante el despliegue del agente" };
  }
}

export async function registerOpenLinesBot(domain: string, agentData: { name: string, role: string, color: string, agentId: string }) {
  try {
    // Registramos el bot para obtener el bitrixBotId real
    const result = await registerBot(domain, {
      name: agentData.name,
      role: agentData.role,
      color: agentData.color,
      id: agentData.agentId // ID temporal usado para el CODE de Bitrix
    } as any);

    if (result.error) {
      throw new Error(result.error_description || "Error registrando bot en Bitrix24");
    }

    return { success: true, botId: result.result as number };
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
