// Summarize agent feedback using a large language model.
'use server';
/**
 * @fileOverview A flow that summarizes user feedback for an AI agent.
 *
 * - summarizeAgentFeedback - A function that summarizes the feedback.
 * - SummarizeAgentFeedbackInput - The input type for the summarizeAgentFeedback function.
 * - SummarizeAgentFeedbackOutput - The return type for the summarizeAgentFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAgentFeedbackInputSchema = z.object({
  feedback: z.string().describe('The user feedback to summarize.'),
});
export type SummarizeAgentFeedbackInput = z.infer<typeof SummarizeAgentFeedbackInputSchema>;

const SummarizeAgentFeedbackOutputSchema = z.object({
  summary: z.string().describe('The summarized feedback.'),
});
export type SummarizeAgentFeedbackOutput = z.infer<typeof SummarizeAgentFeedbackOutputSchema>;

export async function summarizeAgentFeedback(input: SummarizeAgentFeedbackInput): Promise<SummarizeAgentFeedbackOutput> {
  return summarizeAgentFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAgentFeedbackPrompt',
  input: {schema: SummarizeAgentFeedbackInputSchema},
  output: {schema: SummarizeAgentFeedbackOutputSchema},
  prompt: `Summarize the following user feedback about an AI agent. Focus on identifying key areas for improvement.\n\nFeedback: {{{feedback}}}`,
});

const summarizeAgentFeedbackFlow = ai.defineFlow(
  {
    name: 'summarizeAgentFeedbackFlow',
    inputSchema: SummarizeAgentFeedbackInputSchema,
    outputSchema: SummarizeAgentFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
