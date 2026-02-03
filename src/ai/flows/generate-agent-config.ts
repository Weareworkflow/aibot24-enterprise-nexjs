'use server';

/**
 * @fileOverview Generates an initial configuration for an AI voice agent based on a user-provided prompt.
 *
 * - generateAgentConfig - A function that generates the agent configuration.
 * - GenerateAgentConfigInput - The input type for the generateAgentConfig function.
 * - GenerateAgentConfigOutput - The return type for the generateAgentConfig function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAgentConfigInputSchema = z.object({
  prompt: z.string().describe('A prompt describing the desired AI voice agent.'),
});
export type GenerateAgentConfigInput = z.infer<typeof GenerateAgentConfigInputSchema>;

const GenerateAgentConfigOutputSchema = z.object({
  agentName: z.string().describe('The name of the AI voice agent.'),
  agentPersonality: z.string().describe('A description of the AI voice agent\'s personality.'),
  agentResponseStyle: z.string().describe('A description of the AI voice agent\'s response style.'),
  agentInitialContext: z.string().describe('Initial context or knowledge base for the AI voice agent.'),
});
export type GenerateAgentConfigOutput = z.infer<typeof GenerateAgentConfigOutputSchema>;

export async function generateAgentConfig(input: GenerateAgentConfigInput): Promise<GenerateAgentConfigOutput> {
  return generateAgentConfigFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAgentConfigPrompt',
  input: {schema: GenerateAgentConfigInputSchema},
  output: {schema: GenerateAgentConfigOutputSchema},
  prompt: `You are an AI voice agent configuration expert. Based on the user\'s prompt, generate an initial configuration for their AI voice agent.

User Prompt: {{{prompt}}}

Consider the prompt carefully and generate values for each of the following fields, that will be used to initialize the AI voice agent:

- agentName: A suitable name for the AI voice agent.
- agentPersonality: A detailed description of the agent\'s personality, including traits, tone, and demeanor.
- agentResponseStyle: A description of the agent\'s response style, including the length of responses, level of formality, and use of humor.
- agentInitialContext: Initial context or knowledge base for the AI voice agent, including key facts, information, and guidelines.

Ensure that the configuration is coherent and aligned with the user\'s prompt. The agentInitialContext should include information that the agent can use to respond appropriately to user queries.

Output the configuration in a JSON-like format that conforms to the GenerateAgentConfigOutputSchema. Do not include any explanation or conversational text, just the configuration.
`,
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
