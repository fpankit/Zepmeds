
'use server';
/**
 * @fileOverview This file defines a Genkit flow for translating text into different languages.
 *
 * @interface TranslateTextInput - Represents the input for the translation flow.
 * @interface TranslateTextOutput - Represents the output of the translation flow.
 * @function translateText - The main function to initiate the translation flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z
    .string()
    .describe('The target language for translation (e.g., "Hindi", "Punjabi").'),
});

export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});

export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: {schema: TranslateTextInputSchema},
  output: {schema: TranslateTextOutputSchema},
  prompt: `Translate the following text into {{targetLanguage}}.

  Provide only the translated text as the output, without any additional explanations or context.

  Text to translate:
  {{{text}}}
  `,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async input => {
    try {
        const {output} = await prompt(input);
        return output!;
    } catch (error) {
        console.error(`Translation to ${input.targetLanguage} failed:`, error);
        // Fallback: return the original text if translation fails.
        return { translatedText: input.text };
    }
  }
);
