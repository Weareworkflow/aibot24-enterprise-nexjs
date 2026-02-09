'use server';

/**
 * @fileOverview Generates agent configuration using Genkit.
 * Fields are optional to avoid validation errors during partial refinements.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAgentConfigInputSchema = z.object({
  prompt: z.string().describe('A prompt describing the desired AI agent.'),
});
export type GenerateAgentConfigInput = z.infer<typeof GenerateAgentConfigInputSchema>;

const GenerateAgentConfigOutputSchema = z.object({
  name: z.string().optional().describe('The name of the AI agent.'),
  role: z.string().optional().describe('The specific role or job title of the agent.'),
  company: z.string().optional().describe('The company the agent represents.'),
  objective: z.string().optional().describe('The main objective or goal of the agent.'),
  tone: z.string().optional().describe('The tone of voice and communication style.'),
  knowledge: z.string().optional().describe('Extensive knowledge base and guidelines for the agent.'),
});
export type GenerateAgentConfigOutput = z.infer<typeof GenerateAgentConfigOutputSchema>;

export async function generateAgentConfig(input: GenerateAgentConfigInput): Promise<GenerateAgentConfigOutput> {
  return generateAgentConfigFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAgentConfigPrompt',
  input: {schema: GenerateAgentConfigInputSchema},
  output: {schema: GenerateAgentConfigOutputSchema},
  prompt: `You are an expert AI Agent Architect for Bitrix24.
Based on the user's prompt, generate a professional configuration for their AI agent.

User Prompt: {{{prompt}}}

Generate values for:
- name: A professional name.
- role: A specific job title.
- company: Company name.
- objective: Primary goal.
- tone: Communication style.
- knowledge: Business rules and protocols.

If the prompt only asks for specific fields, focus on those. Output only the JSON object.`,
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
      return output || {};
    } catch (error) {
      console.error("Genkit Flow Error:", error);
      return {
        objective: "Atención al cliente inteligente y proactiva.",
        tone: "Profesional, cordial y resolutivo."
      };
    }
  }
);
