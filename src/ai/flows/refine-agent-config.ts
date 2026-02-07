
'use server';

/**
 * @fileOverview IA Architect specialized in refining conversation protocols.
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
    knowledge: z.string().describe('El protocolo de comportamiento actual.'),
    activeIntegrations: z.array(z.string()).describe('Lista de integraciones activas.'),
  }),
  feedback: z.string().describe('Instrucciones o feedback del usuario.'),
});

const RefineAgentConfigOutputSchema = z.object({
  knowledge: z.string().describe('Protocolo de comportamiento actualizado y optimizado.'),
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
  prompt: `Actúa como un Senior Prompt Engineer para Bitrix24.
Tu misión es optimizar el PROTOCOLO DE COMPORTAMIENTO (knowledge) de un agente de IA.

CONTEXTO DE IDENTIDAD (Inmutable):
- Nombre: {{{currentConfig.name}}}
- Rol: {{{currentConfig.role}}}
- Empresa: {{{currentConfig.company}}}
- Tono: {{{currentConfig.tone}}}
- Objetivo: {{{currentConfig.objective}}}

CAPACIDADES TÉCNICAS ACTIVAS:
{{#each currentConfig.activeIntegrations}}
- {{{this}}}
{{/each}}

PROTOCOLO ACTUAL A REFINAR:
"""
{{{currentConfig.knowledge}}}
"""

NUEVAS INSTRUCCIONES DEL USUARIO:
"{{{feedback}}}"

TAREA:
1. Analiza el feedback del usuario y re-escribe el protocolo de comportamiento.
2. Crea un manual técnico robusto enfocado en reglas de negocio, manejo de excepciones y flujo de chat.
3. Asegúrate de que las reglas aprovechen las integraciones activas mencionadas.
4. El resultado debe ser un texto profesional que servirá como 'System Prompt' adicional.

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
    if (!output) throw new Error("Error en el motor de refinamiento Gemini");
    return output;
  }
);
