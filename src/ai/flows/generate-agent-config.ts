'use server';

/**
 * @fileOverview Generates an initial configuration for an AI voice/text agent based on a user-provided prompt.
 *
 * - generateAgentConfig - A function that generates the agent configuration.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAgentConfigInputSchema = z.object({
  prompt: z.string().describe('A prompt describing the desired AI voice agent.'),
});
export type GenerateAgentConfigInput = z.infer<typeof GenerateAgentConfigInputSchema>;

const GenerateAgentConfigOutputSchema = z.object({
  name: z.string().describe('The name of the AI agent.'),
  role: z.string().describe('The specific role or job title of the agent.'),
  company: z.string().describe('The company the agent represents.'),
  objective: z.string().describe('The main objective or goal of the agent.'),
  tone: z.string().describe('The tone of voice and communication style.'),
  knowledge: z.string().describe('Extensive knowledge base and guidelines for the agent.'),
});
export type GenerateAgentConfigOutput = z.infer<typeof GenerateAgentConfigOutputSchema>;

export async function generateAgentConfig(input: GenerateAgentConfigInput): Promise<GenerateAgentConfigOutput> {
  return generateAgentConfigFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAgentConfigPrompt',
  input: {schema: GenerateAgentConfigInputSchema},
  output: {schema: GenerateAgentConfigOutputSchema},
  prompt: `You are an expert AI Agent Architect. Based on the user's prompt, generate a professional configuration for their AI agent.

User Prompt: {{{prompt}}}

Generate detailed values for:
- name: A professional name.
- role: A specific job title (e.g., "Customer Support Specialist", "Real Estate Sales Agent").
- company: A placeholder or generated company name related to the prompt.
- objective: What is the primary goal of this agent?
- tone: Describe the tone (e.g., "Professional and empathetic", "Energetic and persuasive").
- knowledge: A comprehensive knowledge base including instructions, FAQs, and business rules.

Ensure the configuration is cohesive and ready for deployment. Output only the JSON object.`,
});

const generateAgentConfigFlow = ai.defineFlow(
  {
    name: 'generateAgentConfigFlow',
    inputSchema: GenerateAgentConfigInputSchema,
    outputSchema: GenerateAgentConfigOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
