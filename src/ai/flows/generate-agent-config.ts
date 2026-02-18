'use server';

/**
 * @fileOverview Genera la configuración inicial estratégica del agente.
 * Simplified: outputs a single systemPrompt instead of separate objective/tone/knowledge.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateAgentConfigInputSchema = z.object({
  prompt: z.string().describe('Descripción breve del agente deseado.'),
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
  return generateAgentConfigFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAgentConfigPrompt',
  input: { schema: GenerateAgentConfigInputSchema },
  output: { schema: GenerateAgentConfigOutputSchema },
  prompt: `Actúa como un Consultor Estratégico de IA para Bitrix24.
Basado en: "{{{prompt}}}", diseña la base operativa de un agente de chat.

Genera:
- systemPrompt: Un System Prompt completo que incluya objetivo estratégico, estilo de comunicación, y reglas de negocio iniciales (3-4 puntos clave).

Si se proporcionan nombre, rol o empresa, inclúyelos. Si no, invéntalos profesionalmente.`,
});

const generateAgentConfigFlow = ai.defineFlow(
  {
    name: 'generateAgentConfigFlow',
    inputSchema: GenerateAgentConfigInputSchema,
    outputSchema: GenerateAgentConfigOutputSchema,
  },
  async input => {
    try {
      const { output } = await prompt(input);
      return output!;
    } catch (error) {
      console.error("Genkit Generation Error:", error);
      return {
        systemPrompt: "Eres un agente de atención al cliente de alto nivel. Tu misión es resolver consultas de forma profesional, resolutiva y amable. Reglas: 1. Saluda cordialmente. 2. Identifica la necesidad del cliente. 3. Proporciona soluciones basadas en los servicios de la empresa."
      };
    }
  }
);
