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
  prompt: `Eres el Arquitecto Senior de IA de AIBot24. Tu misión es redactar el MANUAL TÉCNICO DE COMPORTAMIENTO (system prompt) más avanzado para un agente integrado en Bitrix24.

DATOS DEL AGENTE:
- Nombre: {{{currentConfig.name}}}
- Rol: {{{currentConfig.role}}}
- Empresa: {{{currentConfig.company}}}
- Tono: {{{currentConfig.tone}}}
- Objetivo: {{{currentConfig.objective}}}

CAPACIDADES TECNOLÓGICAS (Integraciones activas):
{{#each currentConfig.activeIntegrations}}
- {{{this}}}
{{/each}}

MANUAL ACTUAL:
"""
{{{currentConfig.knowledge}}}
"""

NUEVAS INDICACIONES DEL USUARIO:
"{{{feedback}}}"

DIRECTRICES DE REDACCIÓN:
1. Sé extremadamente profesional y directo. No uses frases como "Aquí tienes el manual".
2. Organiza el conocimiento en secciones claras usando Markdown: # FLUJO OPERATIVO, # REGLAS DE NEGOCIO, # MANEJO DE INTEGRACIONES.
3. Integra las nuevas indicaciones del usuario con prioridad absoluta.
4. Redacta comandos específicos sobre cómo debe actuar el bot ante las integraciones activas.
5. El resultado final debe ser un 'knowledge' que actúe como la biblia de comportamiento del bot.

Genera el JSON con el nuevo 'knowledge' y una 'explanation' técnica de las mejoras aplicadas.`,
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
    } catch (error: any) {
      console.error("Genkit Flow Error:", error);
      // Fallback para evitar error 500 y devolver un mensaje útil
      return {
        knowledge: input.currentConfig.knowledge || "Error procesando el manual. Reintente.",
        explanation: `Error crítico en motor Gemini: ${error.message}`
      };
    }
  }
);
