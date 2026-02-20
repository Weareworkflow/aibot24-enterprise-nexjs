'use server';

/**
 * @fileOverview Genera la configuración inicial estratégica del agente.
 * Simplified: outputs a single systemPrompt instead of separate objective/tone/knowledge.
 * Migrated to Vercel AI SDK.
 */

import { generateObject } from 'ai';
import { z } from 'zod';
import { openai, defaultModel } from '@/lib/config-ai';
import { db } from '@/lib/firebase-admin';

const GenerateAgentConfigInputSchema = z.object({
  prompt: z.string().describe('Descripción breve del agente deseado.'),
  tenantId: z.string().optional().describe('ID del portal (tenant) para buscar configuración global.'),
});
export type GenerateAgentConfigInput = z.infer<typeof GenerateAgentConfigInputSchema>;

const GenerateAgentConfigOutputSchema = z.object({
  name: z.string().optional(),
  role: z.string().optional(),
  company: z.string().optional(),
  systemPrompt: z.string().describe('System Prompt completo del agente, incluyendo objetivo, personalidad y reglas.'),
});
export type GenerateAgentConfigOutput = z.infer<typeof GenerateAgentConfigOutputSchema>;

export async function generateAgentConfig(input: GenerateAgentConfigInput): Promise<GenerateAgentConfigOutput> {
  try {
    // 1. Fetch Global App Config (Architect Protocol)
    // We need a tenant context. If not provided in input, we might need to pass it.
    // Assuming prompt might contain tenant or we use a default.
    // For now, let's look for a generic "anonymous" or "global" if we can't determine it easily, 
    // or better, update the signature if possible. 
    // Wait, the caller (NewAgentPage) has tenantId. Let's update the schema.

    const { object } = await generateObject({
      model: defaultModel,
      schema: GenerateAgentConfigOutputSchema,
      system: `Eres un experto en diseño de agentes de IA. 
Tu objetivo es crear un protocolo operativo basado en los requerimientos del usuario.`,
      prompt: `Diseña la base operativa de un agente de chat basado en: "${input.prompt}".
      
Genera:
- name: Un nombre creativo para el agente (opcional).
- role: El rol profesional (opcional).
- company: La empresa que representa (opcional).
- systemPrompt: Un System Prompt completo.`,
      temperature: 0.7,
    });

    return object;

  } catch (error) {
    console.error("Agent Config Generation Error:", error);
    // Fallback response
    return {
      systemPrompt: "Eres un agente de atención al cliente de alto nivel. Tu misión es resolver consultas de forma profesional, resolutiva y amable. Reglas: 1. Saluda cordialmente. 2. Identifica la necesidad del cliente. 3. Proporciona soluciones basadas en los servicios de la empresa."
    };
  }
}
