
'use server';
/**
 * @fileOverview This file defines a Genkit flow for detecting the language of a given text.
 *
 * @interface DetectLanguageInput - Represents the input for the language detection flow.
 * @interface DetectLanguageOutput - Represents the output of the language detection flow.
 * @function detectLanguage - The main function to initiate the language detection flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DetectLanguageInputSchema = z.object({
  text: z.string().describe('The text for which to detect the language.'),
});

export type DetectLanguageInput = z.infer<typeof DetectLanguageInputSchema>;

const DetectLanguageOutputSchema = z.object({
  language: z.string().describe('The detected language (e.g., "Hindi", "English", "Punjabi").'),
});

export type DetectLanguageOutput = z.infer<typeof DetectLanguageOutputSchema>;

export async function detectLanguage(input: DetectLanguageInput): Promise<DetectLanguageOutput> {
  return detectLanguageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectLanguagePrompt',
  input: {schema: DetectLanguageInputSchema},
  output: {schema: DetectLanguageOutputSchema},
  prompt: `Detect the primary language of the following text.
  
  Respond with only the name of the language (e.g., "English", "Hindi", "Punjabi", "Tamil", "Telugu", "Kannada").

  Text: {{{text}}}
  `,
});

const detectLanguageFlow = ai.defineFlow(
  {
    name: 'detectLanguageFlow',
    inputSchema: DetectLanguageInputSchema,
    outputSchema: DetectLanguageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
