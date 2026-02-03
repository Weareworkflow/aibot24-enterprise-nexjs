'use server';

/**
 * @fileOverview Flujo de IA para refinar la configuración de un agente basado en feedback.
 * 
 * - refineAgentConfig - Analiza feedback y sugiere mejoras técnicas al agente.
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
    knowledge: z.string(),
  }),
  feedback: z.string().describe('El feedback del usuario sobre lo que debe mejorar el agente.'),
});

const RefineAgentConfigOutputSchema = z.object({
  role: z.string().describe('Sugerencia de rol refinado.'),
  objective: z.string().describe('Sugerencia de objetivo refinado.'),
  tone: z.string().describe('Sugerencia de tono refinado.'),
  knowledge: z.string().describe('Base de conocimiento actualizada e instrucciones mejoradas.'),
  explanation: z.string().describe('Breve explicación de por qué se sugieren estos cambios.'),
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
  prompt: `Actúa como un Arquitecto de IA Senior. Tu misión es corregir y optimizar la configuración de un agente basado en el feedback del usuario.

CONFIGURACIÓN ACTUAL:
- Rol: {{{currentConfig.role}}}
- Objetivo: {{{currentConfig.objective}}}
- Tono: {{{currentConfig.tone}}}
- Conocimiento: {{{currentConfig.knowledge}}}

FEEDBACK DEL USUARIO:
"{{{feedback}}}"

TAREA:
1. Analiza qué parte de la configuración técnica está causando que el usuario no esté satisfecho.
2. Redacta una versión mejorada de los campos 'role', 'objective', 'tone' y especialmente 'knowledge' (instrucciones).
3. Asegúrate de que las nuevas instrucciones en 'knowledge' sean claras, profesionales y resuelvan directamente el feedback.

Responde solo con el objeto JSON de la configuración refinada.`,
});

const refineAgentConfigFlow = ai.defineFlow(
  {
    name: 'refineAgentConfigFlow',
    inputSchema: RefineAgentConfigInputSchema,
    outputSchema: RefineAgentConfigOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error("Error generando el refinamiento");
    return output;
  }
);
