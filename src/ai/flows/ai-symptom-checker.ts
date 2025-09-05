'use server';
/**
 * @fileOverview This file defines a Genkit flow for an AI-powered symptom checker.
 *
 * The flow takes user-reported symptoms as input and provides potential medicine suggestions
 * and guidance on whether to consult a doctor.
 *
 * @interface AISymptomCheckerInput - Represents the input for the symptom checker flow.
 * @interface AISymptomCheckerOutput - Represents the output of the symptom checker flow.
 * @function aiSymptomChecker - The main function to initiate the symptom checker flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AISymptomCheckerInputSchema = z.object({
  symptoms: z
    .string()
    .describe('A description of the symptoms experienced by the user.'),
});

export type AISymptomCheckerInput = z.infer<typeof AISymptomCheckerInputSchema>;

const AISymptomCheckerOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'A list of potential medicine suggestions based on the symptoms provided.'
    ),
  advice: z
    .string()
    .describe(
      'Guidance on whether the user should consult a doctor based on the symptoms.'
    ),
});

export type AISymptomCheckerOutput = z.infer<typeof AISymptomCheckerOutputSchema>;

export async function aiSymptomChecker(input: AISymptomCheckerInput): Promise<AISymptomCheckerOutput> {
  return aiSymptomCheckerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSymptomCheckerPrompt',
  input: {schema: AISymptomCheckerInputSchema},
  output: {schema: AISymptomCheckerOutputSchema},
  prompt: `You are an AI-powered symptom checker chatbot designed to help users understand their condition and take appropriate action.

  Based on the symptoms provided by the user, you will provide potential medicine suggestions and guidance on whether they should consult a doctor.

  Symptoms: {{{symptoms}}}

  Respond in a clear and concise manner.
  `,
});

const aiSymptomCheckerFlow = ai.defineFlow(
  {
    name: 'aiSymptomCheckerFlow',
    inputSchema: AISymptomCheckerInputSchema,
    outputSchema: AISymptomCheckerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
