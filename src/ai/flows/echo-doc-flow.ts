
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
  model: 'googleai/gemini-2.5-pro',
  input: {schema: z.object({ query: z.string() })},
  output: {schema: z.object({ response: z.string(), language: z.string().describe('The language of the user\'s query, e.g., "Hindi", "English".') })},
  system: `You are EchoDoc, a friendly, empathetic, and highly skilled AI medical assistant. Your primary role is to have a natural, supportive conversation with the user about their health concerns. Your tone should be caring, reassuring, and professional.

  - First, detect the user's language.
  - You MUST then generate your response in that same detected language.
  - Your internal reasoning should be in English, but the final response must be in the user's language.
  - If the user greets you, greet them back warmly.
  - If the user asks a medical question, provide a clear, helpful, and concise answer.
  - For common ailments like headaches, stomachaches, bee stings, congestion, coughs, or colds, you MUST follow this two-step process:
    1.  First, suggest a simple and safe Ayurvedic or home remedy.
    2.  Then, suggest an appropriate over-the-counter medicine as an alternative, with clear dosage instructions (e.g., "If that doesn't help, you can also consider taking Paracetamol 500mg, one tablet every 6 hours.").
  - If the user describes more serious symptoms, you can provide potential information, but you MUST advise them to consult a real doctor for a diagnosis.
  - Always maintain a supportive and caring tone.
  - Keep your responses relatively short and suitable for a voice conversation.
  - VERY IMPORTANT: Do NOT include a disclaimer like "I am not a real doctor" in every single response. Only mention it when providing specific medical information or symptom analysis. For general conversation, it's not needed.`,
  prompt: `User's message: {{{query}}}`,
});

const echoDocFlowInternal = ai.defineFlow(
  {
    name: 'echoDocFlowInternal',
    inputSchema: EchoDocInputSchema,
    outputSchema: EchoDocOutputSchema,
  },
  async (input) => {
    try {
        const { output } = await prompt({ query: input.query });
        if (!output) {
            throw new Error("AI did not return a valid response.");
        }
        return { response: output.response, language: output.language };
    } catch (e) {
        console.error("Core EchoDoc flow failed:", e);
        // Fallback response in case of critical failure
        return { 
            response: "I'm sorry, I encountered an issue and couldn't process your request. Please try again in a moment.",
            language: 'English' 
        };
    }
  }
);

export async function echoDocFlow(input: EchoDocInput): Promise<EchoDocOutput> {
  return echoDocFlowInternal(input);
}
