
'use server';
/**
 * @fileOverview This file defines a Genkit flow for the EchoDoc AI voice assistant.
 *
 * This flow is designed for a conversational medical AI that can handle greetings,
 * answer general health questions, and provide medical information in a conversational manner.
 * It now internally handles language detection and translation, with fallbacks.
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
  prompt: `You are EchoDoc, a friendly, empathetic, and highly skilled AI medical assistant. 
  
  Your primary role is to have a natural, supportive conversation with the user about their health concerns. Your tone should be caring, reassuring, and professional.

  - If the user greets you, greet them back warmly.
  - If the user asks a medical question, provide a clear, helpful, and concise answer.
  - If the user describes symptoms for common ailments like headaches, stomachaches, bee stings, congestion, coughs, or colds, you should provide simple and safe Ayurvedic home remedies.
  - If the user describes more serious symptoms, you can provide potential information, but you MUST advise them to consult a real doctor for a diagnosis.
  - Always maintain a supportive and caring tone.
  - Keep your responses relatively short and suitable for a voice conversation.
  - VERY IMPORTANT: Do NOT include a disclaimer like "I am not a real doctor" in every single response. Only mention it when providing specific medical information or symptom analysis. For general conversation, it's not needed.

  User's message (translated to English): {{{query}}}

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
    let detectedLanguage = 'English';
    let queryInEnglish = input.query;
    let finalResponse = '';

    try {
        // 1. Detect language, with fallback
        try {
            const langResult = await detectLanguage({ text: input.query });
            detectedLanguage = langResult.language;
        } catch (e) {
            console.error("Language detection failed, falling back to English.", e);
            detectedLanguage = 'English';
        }

        // 2. Translate to English for the main prompt, if necessary
        if (detectedLanguage !== 'English') {
            try {
                const translationResult = await translateText({ text: input.query, targetLanguage: 'English' });
                queryInEnglish = translationResult.translatedText;
            } catch (e) {
                console.error("Translation to English failed, using original query.", e);
                queryInEnglish = input.query; // Fallback to original query
                detectedLanguage = 'English'; // Treat as english if translation fails
            }
        }

        // 3. Get the AI response in English
        const { output } = await prompt({ query: queryInEnglish });
        const responseInEnglish = output!.response;
        finalResponse = responseInEnglish;

        // 4. Translate back to the original language if needed
        if (detectedLanguage !== 'English') {
            try {
                const translationResult = await translateText({ text: responseInEnglish, targetLanguage: detectedLanguage });
                finalResponse = translationResult.translatedText;
            } catch(e) {
                 console.error(`Translation to ${detectedLanguage} failed, returning English response.`, e);
                 finalResponse = responseInEnglish; // Fallback to English response
            }
        }
        
    } catch (e) {
        console.error("Core EchoDoc flow failed:", e);
        // Fallback response in case of critical failure in the main prompt
        finalResponse = "I'm sorry, I encountered an issue and couldn't process your request. Please try again in a moment.";
        detectedLanguage = 'English';
    }


    return { response: finalResponse, language: detectedLanguage };
  }
);

export async function echoDocFlow(input: EchoDocInput): Promise<EchoDocOutput> {
  return echoDocFlowInternal(input);
}
