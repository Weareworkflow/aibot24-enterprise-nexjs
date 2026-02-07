'use server';

/**
 * @fileOverview Flujo de IA para refinar el protocolo de comportamiento de un agente.
 * 
 * - refineAgentConfig - Analiza feedback y optimiza la capa de comportamiento técnico.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RefineAgentConfigInputSchema = z.object({
  currentConfig: z.object({
    name: z.string(),
    role: z.string(),
    company: z.string(),
    objective: z.string(),
    tone: z.string(),
    knowledge: z.string().describe('El manual de comportamiento actual.'),
    activeIntegrations: z.array(z.string()).describe('Lista de integraciones activas.'),
  }),
  feedback: z.string().describe('El feedback del usuario sobre el comportamiento.'),
});

const RefineAgentConfigOutputSchema = z.object({
  knowledge: z.string().describe('Manual de comportamiento actualizado y optimizado.'),
  explanation: z.string().describe('Breve explicación técnica del ajuste realizado.'),
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
  prompt: `Actúa como un Arquitecto de IA Senior especializado en Prompt Engineering.
Tu misión es optimizar exclusivamente el PROTOCOLO DE COMPORTAMIENTO (knowledge) de un agente.

CONTEXTO DE IDENTIDAD (No editable por ti, solo para referencia):
- Nombre: {{{currentConfig.name}}}
- Rol: {{{currentConfig.role}}}
- Empresa: {{{currentConfig.company}}}
- Objetivo: {{{currentConfig.objective}}}
- Tono: {{{currentConfig.tone}}}

CAPACIDADES TÉCNICAS (Integraciones activas):
{{#each currentConfig.activeIntegrations}}
- {{{this}}}
{{/each}}

PROTOCOLO ACTUAL:
"""
{{{currentConfig.knowledge}}}
"""

FEEDBACK DEL USUARIO:
"{{{feedback}}}"

TAREA:
1. Basado en el feedback, redacta un protocolo de comportamiento técnico robusto.
2. No repitas la identidad (nombre, rol, etc) ya que se anexa automáticamente.
3. Enfócate en reglas de decisión, manejo de objeciones y flujo de conversación.
4. Asegúrate de que el protocolo sea compatible con las integraciones activas.

Responde solo con el objeto JSON solicitado.`,
});

const refineAgentConfigFlow = ai.defineFlow(
  {
    name: 'refineAgentConfigFlow',
    inputSchema: RefineAgentConfigInputSchema,
    outputSchema: RefineAgentConfigOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error("Error generando el refinamiento de comportamiento");
    return output;
  }
);
