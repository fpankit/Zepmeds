
'use server';
/**
 * @fileOverview An AI agent for simplifying and translating first-aid instructions.
 *
 * - simplifyFirstAidFlow - A function that takes complex steps and makes them easy to understand.
 * - SimplifyFirstAidInput - The input type for the flow.
 * - SimplifyFirstAidOutput - The return type for the flow.
 */

import { ai } from '@/ai/dev';
import { z } from 'zod';

const SimplifyFirstAidInputSchema = z.object({
  topic: z.string().describe('The title of the first-aid topic, e.g., "Snake Bite".'),
  steps: z.array(z.string()).describe('The list of official first-aid steps.'),
  targetLanguage: z.string().describe("The language for the simplified explanation (e.g., 'Hindi', 'English', 'Punjabi')."),
});
export type SimplifyFirstAidInput = z.infer<typeof SimplifyFirstAidInputSchema>;

const SimplifyFirstAidOutputSchema = z.object({
  simplifiedExplanation: z.string().describe('A single string containing the simplified, easy-to-understand explanation of all steps, formatted with newlines.'),
});
export type SimplifyFirstAidOutput = z.infer<typeof SimplifyFirstAidOutputSchema>;

const prompt = ai.definePrompt({
  name: 'simplifyFirstAidPrompt',
  input: { schema: SimplifyFirstAidInputSchema },
  output: { schema: SimplifyFirstAidOutputSchema },
  prompt: `You are an expert at simplifying complex medical instructions for a general audience who may be panicking.
  Your task is to rewrite the following first-aid steps for '{{{topic}}}' into a simple, clear, and reassuring paragraph.
  Explain it like you're talking to a 10-year-old. Use very simple words.

  IMPORTANT: The final output must be in '{{{targetLanguage}}}'.

  Original Steps to simplify:
  {{#each steps}}
  - {{{this}}}
  {{/each}}

  Generate a single paragraph for the 'simplifiedExplanation' field. Use newline characters (\\n) to separate distinct points or actions to make it easy to read.
  `,
});

export const simplifyFirstAidFlow = ai.defineFlow(
  {
    name: 'simplifyFirstAidFlow',
    inputSchema: SimplifyFirstAidInputSchema,
    outputSchema: SimplifyFirstAidOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to generate a simplified explanation.');
    }
    return output;
  }
);
