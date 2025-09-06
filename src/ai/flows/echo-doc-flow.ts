
'use server';
/**
 * @fileOverview This file defines a Genkit flow for an AI medical agent called Echo Doc.
 *
 * The flow takes a user's conversational query about their health and provides
 * medicine recommendations and general healthcare updates in a friendly, conversational manner.
 */

import { ai } from 'genkit';
import { z } from 'zod';

const EchoDocInputSchema = z.object({
  query: z
    .string()
    .describe('A conversational query from the user about their health or symptoms.'),
});

export type EchoDocInput = z.infer<typeof EchoDocInputSchema>;

const EchoDocOutputSchema = z.object({
  response: z
    .string()
    .describe('A conversational response from the AI medical agent.'),
  medicineRecommendation: z
    .string()
    .optional()
    .describe('Specific over-the-counter medicine recommendations, if applicable.'),
  healthcareUpdate: z
    .string()
    .optional()
    .describe('A relevant general healthcare tip or update.'),
});

export type EchoDocOutput = z.infer<typeof EchoDocOutputSchema>;

export async function echoDoc(input: EchoDocInput): Promise<EchoDocOutput> {
  return echoDocFlow(input);
}

const prompt = ai.definePrompt({
  name: 'echoDocPrompt',
  input: {schema: EchoDocInputSchema},
  output: {schema: EchoDocOutputSchema},
  prompt: `You are Echo Doc, a friendly and empathetic AI medical agent. Your role is to have a conversation with the user about their health concerns, provide potential over-the-counter medicine suggestions, and offer general healthcare updates.

  User query: {{{query}}}

  Your task:
  1.  Generate a warm, conversational 'response' to the user's query.
  2.  If the query mentions symptoms (e.g., headache, cough), provide a 'medicineRecommendation' for over-the-counter drugs. If not applicable, omit this field.
  3.  Provide a general 'healthcareUpdate' or tip that is broadly relevant.
  4.  Crucially, ALWAYS include a disclaimer in your main 'response' that you are an AI assistant, not a real doctor, and the user should consult a professional for medical advice.
  `,
});

const echoDocFlow = ai.defineFlow(
  {
    name: 'echoDocFlow',
    inputSchema: EchoDocInputSchema,
    outputSchema: EchoDocOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
