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
  whatToDo: z.string().describe('A simple, step-by-step paragraph on what to do. Formatted with newlines.'),
  theDos: z.array(z.string()).describe("A list of crucial things one 'should do' in this situation."),
  theDonts: z.array(z.string()).describe("A list of critical things one 'should not do' in this situation."),
});
export type SimplifyFirstAidOutput = z.infer<typeof SimplifyFirstAidOutputSchema>;

const prompt = ai.definePrompt({
  name: 'simplifyFirstAidPrompt',
  model: 'gemini-1.5-flash',
  input: { schema: SimplifyFirstAidInputSchema },
  output: { schema: SimplifyFirstAidOutputSchema },
  prompt: `You are an expert at simplifying complex medical instructions for a general audience who may be panicking.
  Your task is to rewrite the following first-aid steps for '{{{topic}}}' into a simple, clear, and reassuring guide.
  Explain it like you're talking to a 10-year-old. Use very simple words.

  IMPORTANT: The final output must be in '{{{targetLanguage}}}'.

  Original Steps to simplify:
  {{#each steps}}
  - {{{this}}}
  {{/each}}

  Based on these steps, generate the following:
  1.  **whatToDo**: A simplified paragraph explaining the immediate actions. Use newline characters (\\n) to separate distinct points.
  2.  **theDos**: A list of 2-3 most important "Do's". Keep them short and direct.
  3.  **theDonts**: A list of 2-3 most critical "Don'ts". These are things to absolutely avoid.

  Provide the output in the specified JSON format.
  `,
});

export async function simplifyFirstAidFlow(input: SimplifyFirstAidInput): Promise<SimplifyFirstAidOutput> {
  const { output } = await prompt(input);
  if (!output) {
    throw new Error('The AI model failed to generate a simplified explanation.');
  }
  return output;
}
