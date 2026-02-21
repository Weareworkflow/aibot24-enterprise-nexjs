'use server';

/**
 * @fileOverview Genera la configuración inicial estratégica del agente.
 * Simplified: outputs a single systemPrompt instead of separate objective/tone/knowledge.
 * Migrated to Vercel AI SDK.
 */

import { generateObject } from 'ai';
import { z } from 'zod';
import { openai, defaultModel } from '@/lib/config-ai';

const GenerateAgentConfigInputSchema = z.object({
  prompt: z.string().describe('Descripción breve del agente deseado.'),
  tenantId: z.string().optional().describe('ID del portal (tenant) para buscar configuración global.'),
});
export type GenerateAgentConfigInput = z.infer<typeof GenerateAgentConfigInputSchema>;

const GenerateAgentConfigOutputSchema = z.object({
  name: z.string().describe('Un nombre creativo para el agente.'),
  role: z.string().describe('El rol profesional del agente.'),
  company: z.string().describe('La empresa que representa el agente.'),
  systemPrompt: z.string().describe('System Prompt completo del agente, incluyendo objetivo, personalidad y reglas.'),
});
export type GenerateAgentConfigOutput = z.infer<typeof GenerateAgentConfigOutputSchema>;

export async function generateAgentConfig(input: GenerateAgentConfigInput): Promise<GenerateAgentConfigOutput> {
  try {
    const { object } = await generateObject({
      model: defaultModel,
      schema: GenerateAgentConfigOutputSchema,
      system: `Eres un experto en diseño de agentes de IA minimalistas y resolutivos. 
Tu objetivo es crear un protocolo operativo extremadamente breve, directo y enfocado en la ejecución inmediata de tareas.`,
      prompt: `Diseña la base operativa de un agente basado en: "${input.prompt}".
      
Exige máxima brevedad:
- name: Un nombre corto y profesional.
- role: El rol exacto.
- company: La empresa.
- systemPrompt: Un prompt ultra-conciso. Sin rellenos ni saludos extensos. Ve directo al grano sobre qué debe hacer el agente y sus reglas críticas de comportamiento.`,
      temperature: 0.7,
    });

    return object;

  } catch (error) {
    console.error("Agent Config Generation Error:", error);
    return {
      systemPrompt: "Eres un agente de atención al cliente de alto nivel. Tu misión es resolver consultas de forma profesional, resolutiva y amable. Reglas: 1. Saluda cordialmente. 2. Identifica la necesidad del cliente. 3. Proporciona soluciones basadas en los servicios de la empresa."
    };
  }
}
