'use server';

/**
 * @fileOverview Genera la configuración inicial estratégica del agente.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAgentConfigInputSchema = z.object({
  prompt: z.string().describe('Descripción breve del agente deseado.'),
});
export type GenerateAgentConfigInput = z.infer<typeof GenerateAgentConfigInputSchema>;

const GenerateAgentConfigOutputSchema = z.object({
  name: z.string().optional(),
  role: z.string().optional(),
  company: z.string().optional(),
  objective: z.string().describe('Misión crítica del agente.'),
  tone: z.string().describe('Estilo de comunicación detallado.'),
  knowledge: z.string().optional().describe('Borrador inicial del manual técnico.'),
});
export type GenerateAgentConfigOutput = z.infer<typeof GenerateAgentConfigOutputSchema>;

export async function generateAgentConfig(input: GenerateAgentConfigInput): Promise<GenerateAgentConfigOutput> {
  return generateAgentConfigFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAgentConfigPrompt',
  input: {schema: GenerateAgentConfigInputSchema},
  output: {schema: GenerateAgentConfigOutputSchema},
  prompt: `Actúa como un Consultor Estratégico de IA para Bitrix24.
Basado en: "{{{prompt}}}", diseña la base operativa de un agente de chat.

Genera:
- objective: Una misión de alto impacto enfocada en resultados.
- tone: Un estilo de voz profesional que encaje con Bitrix24.
- knowledge: Un manual técnico inicial de 3-4 puntos clave.

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
      const {output} = await prompt(input);
      return output!;
    } catch (error) {
      console.error("Genkit Generation Error:", error);
      return {
        objective: "Atención al cliente de alto nivel y resolución de consultas técnicas.",
        tone: "Profesional, resolutivo y siempre amable siguiendo los estándares corporativos.",
        knowledge: "1. Saluda cordialmente. 2. Identifica la necesidad del cliente. 3. Proporciona soluciones basadas en los servicios de la empresa."
      };
    }
  }
);
