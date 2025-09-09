
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating first aid advice.
 *
 * The flow takes a first aid topic as input and returns a step-by-step procedure
 * and a list of things to avoid.
 *
 * @interface GenerateFirstAidAdviceInput - Represents the input for the flow.
 * @interface GenerateFirstAidAdviceOutput - Represents the output of the flow.
 * @function generateFirstAidAdvice - The main function to initiate the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateFirstAidAdviceInputSchema = z.object({
  topic: z
    .string()
    .describe('The first aid emergency topic (e.g., "Snake Bite", "Burns").'),
});

export type GenerateFirstAidAdviceInput = z.infer<
  typeof GenerateFirstAidAdviceInputSchema
>;

const GenerateFirstAidAdviceOutputSchema = z.object({
  procedure: z
    .array(z.string())
    .describe('An array of strings representing the step-by-step procedure.'),
  whatToAvoid: z
    .array(z.string())
    .describe('An array of strings listing things to avoid.'),
});

export type GenerateFirstAidAdviceOutput = z.infer<
  typeof GenerateFirstAidAdviceOutputSchema
>;

export async function generateFirstAidAdvice(
  input: GenerateFirstAidAdviceInput
): Promise<GenerateFirstAidAdviceOutput> {
  return generateFirstAidAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFirstAidAdvicePrompt',
  input: {schema: GenerateFirstAidAdviceInputSchema},
  output: {schema: GenerateFirstAidAdviceOutputSchema},
  prompt: `You are a first aid expert. For the given topic, provide a clear, step-by-step guide for first aid, and a separate list of critical things to avoid.

  Topic: {{{topic}}}
  
  Generate a response with two distinct sections: one for the correct procedure and one for what to avoid.
  `,
});

const generateFirstAidAdviceFlow = ai.defineFlow(
  {
    name: 'generateFirstAidAdviceFlow',
    inputSchema: GenerateFirstAidAdviceInputSchema,
    outputSchema: GenerateFirstAidAdviceOutputSchema,
  },
  async input => {
    try {
        const {output} = await prompt(input);
        return output!;
    } catch (error) {
        console.error(`First aid advice generation for topic "${input.topic}" failed:`, error);
        // Fallback: return an empty response so the UI can use the offline guide.
        return { procedure: [], whatToAvoid: [] };
    }
  }
);
