
'use server';
/**
 * @fileOverview This file defines a Genkit flow for an AI-powered symptom checker.
 *
 * The flow takes user-reported symptoms as input and provides potential medicine suggestions,
 * diet recommendations, precautions, workout advice, and guidance on whether to consult a doctor.
 *
 * @interface AISymptomCheckerInput - Represents the input for the symptom checker flow.
 * @interface AISymptomCheckerOutput - Represents the output of the symptom checker flow.
 * @function aiSymptomChecker - The main function to initiate the symptom checker flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AISymptomCheckerInputSchema = z.object({
  symptoms: z
    .string()
    .describe('A description of the symptoms experienced by the user.'),
});

export type AISymptomCheckerInput = z.infer<typeof AISymptomCheckerInputSchema>;

const AISymptomCheckerOutputSchema = z.object({
  response: z.string().describe('A conversational response to the user summarizing their condition and explaining the suggestions.'),
  medicines: z
    .string()
    .describe(
      'A list of potential over-the-counter medicine suggestions based on the symptoms provided.'
    ),
  diet: z.string().describe('Dietary recommendations based on the symptoms.'),
  precautions: z
    .string()
    .describe('Precautions to take based on the symptoms.'),
  workouts: z
    .string()
    .describe(
      'Recommended light workouts or exercises, if applicable. If not applicable, suggest rest.'
    ),
  advice: z
    .string()
    .describe(
      'Clear guidance on whether the user should consult a doctor based on the severity of the symptoms.'
    ),
  suggestedSpecialty: z.string().describe('The suggested doctor specialty to consult for the given symptoms (e.g., "Cardiologist", "Dermatologist").'),
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

  Based on the symptoms provided by the user, you will provide:
  - A conversational response to the user summarizing their condition and explaining the suggestions.
  - Potential over-the-counter medicine suggestions.
  - Dietary recommendations.
  - A list of precautions.
  - Suggestions for light workouts or rest.
  - Clear advice on whether to consult a doctor.
  - A suggested doctor specialty to consult (e.g., "General Physician", "Dermatologist", "Cardiologist").

  Symptoms: {{{symptoms}}}

  Respond in a clear, empathetic, and organized manner. Always include a disclaimer that you are not a real doctor and this advice is not a substitute for professional medical consultation.
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
