
'use server';
/**
 * @fileOverview This file defines a Genkit flow for the EchoDoc AI voice assistant.
 *
 * This flow is designed for a conversational medical AI that can handle greetings,
 * answer general health questions, and provide medical information in a conversational manner.
 * It now internally handles language detection and translation.
 *
 * @interface EchoDocInput - Represents the input for the EchoDoc flow.
 * @interface EchoDocOutput - Represents the output of the EchoDoc flow.
 * @function echoDocFlow - The main function to initiate the conversational flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { detectLanguage } from './detect-language';
import { translateText } from './translate-text';

const EchoDocInputSchema = z.object({
  query: z.string().describe('The user\'s voice input or question.'),
});

export type EchoDocInput = z.infer<typeof EchoDocInputSchema>;

const EchoDocOutputSchema = z.object({
  response: z.string().describe('A conversational and helpful response from the AI medical assistant.'),
  language: z.string().describe('The language the response should be in.'),
});

export type EchoDocOutput = z.infer<typeof EchoDocOutputSchema>;


const prompt = ai.definePrompt({
  name: 'echoDocPrompt',
  input: {schema: z.object({ query: z.string() })},
  output: {schema: z.object({ response: z.string() })},
  prompt: `You are EchoDoc, a friendly and empathetic AI medical assistant. 
  
  Your role is to have a natural conversation with the user about their health concerns.
  - If the user greets you, greet them back warmly.
  - If the user asks a medical question, provide a clear, helpful, and concise answer.
  - If the user describes symptoms, you can provide potential information, but you MUST strongly advise them to consult a real doctor.
  - Always maintain a supportive and caring tone.
  - Keep your responses relatively short and suitable for a voice conversation.

  User's message (translated to English): {{{query}}}

  Always include a disclaimer that you are not a real doctor and this advice is not a substitute for professional medical consultation.
  Respond in English.
  `,
});

const echoDocFlowInternal = ai.defineFlow(
  {
    name: 'echoDocFlowInternal',
    inputSchema: EchoDocInputSchema,
    outputSchema: EchoDocOutputSchema,
  },
  async (input) => {
    // 1. Detect language
    const { language } = await detectLanguage({ text: input.query });

    // 2. Translate to English for the main prompt
    let queryInEnglish = input.query;
    if (language !== 'English') {
        const translationResult = await translateText({ text: input.query, targetLanguage: 'English' });
        queryInEnglish = translationResult.translatedText;
    }

    // 3. Get the AI response in English
    const { output } = await prompt({ query: queryInEnglish });
    const responseInEnglish = output!.response;

    // 4. Translate back to the original language if needed
    let finalResponse = responseInEnglish;
    if (language !== 'English') {
        const translationResult = await translateText({ text: responseInEnglish, targetLanguage: language });
        finalResponse = translationResult.translatedText;
    }

    return { response: finalResponse, language: language };
  }
);

export async function echoDocFlow(input: EchoDocInput): Promise<EchoDocOutput> {
  return echoDocFlowInternal(input);
}
