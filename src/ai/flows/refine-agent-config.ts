'use server';

/**
 * @fileOverview Arquitecto de IA especializado en la redacción de protocolos de comportamiento para Bitrix24.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RefineAgentConfigInputSchema = z.object({
  currentConfig: z.object({
    name: z.string().optional().default("Agente"),
    role: z.string().optional().default("Asistente"),
    company: z.string().optional().default("Empresa"),
    objective: z.string().optional().default("Atención al cliente"),
    tone: z.string().optional().default("Profesional"),
    knowledge: z.string().optional().default(""),
    activeIntegrations: z.array(z.string()).optional().default([]),
  }),
  feedback: z.string().describe('Instrucciones o feedback del usuario para el agente.'),
});

const RefineAgentConfigOutputSchema = z.object({
  knowledge: z.string().describe('El manual técnico de comportamiento completo y actualizado.'),
  explanation: z.string().describe('Breve descripción de qué se ha mejorado en el protocolo.'),
});

export type RefineAgentConfigInput = z.infer<typeof RefineAgentConfigInputSchema>;
export type RefineAgentConfigOutput = z.infer<typeof RefineAgentConfigOutputSchema>;

export async function refineAgentConfig(input: RefineAgentConfigInput): Promise<RefineAgentConfigOutput> {
  return refineAgentConfigFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineAgentConfigPrompt',
  input: { schema: RefineAgentConfigInputSchema },
  output: { schema: RefineAgentConfigOutputSchema },
  prompt: `Eres un Arquitecto de Agentes Senior para Bitrix24. Tu tarea es redactar o actualizar el MANUAL TÉCNICO DE COMPORTAMIENTO (system prompt) de un agente.

CONTEXTO ACTUAL:
- Nombre: {{{currentConfig.name}}}
- Rol: {{{currentConfig.role}}}
- Empresa: {{{currentConfig.company}}}
- Tono: {{{currentConfig.tone}}}
- Objetivo: {{{currentConfig.objective}}}

CAPACIDADES TECNOLÓGICAS (Integraciones activas):
{{#each currentConfig.activeIntegrations}}
- {{{this}}}
{{/each}}

MANUAL ACTUAL (Si existe):
"""
{{{currentConfig.knowledge}}}
"""

NUEVAS INDICACIONES DEL USUARIO:
"{{{feedback}}}"

TAREA:
1. Integra las nuevas indicaciones en el manual técnico.
2. Redacta el manual en formato profesional, estructurado con secciones (Ej: Flujo de Saludo, Reglas de Negocio, Manejo de Objeciones, Finalización).
3. Asegúrate de que el agente sepa cómo usar las integraciones mencionadas (ej: si CRM está activo, debe intentar capturar datos).
4. El lenguaje del manual debe ser directo y normativo (ej: "Debes...", "Nunca...", "Siempre...").

Genera una respuesta en JSON que incluya el nuevo 'knowledge' (el manual completo) y una 'explanation' técnica de los cambios.`,
});

const refineAgentConfigFlow = ai.defineFlow(
  {
    name: 'refineAgentConfigFlow',
    inputSchema: RefineAgentConfigInputSchema,
    outputSchema: RefineAgentConfigOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) throw new Error("No se recibió respuesta del arquitecto de IA.");
      return output;
    } catch (error) {
      console.error("Genkit Flow Error:", error);
      throw new Error("Error en la arquitectura de IA. Verifica tu conexión o API Key.");
    }
  }
);
