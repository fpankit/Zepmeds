
'use server';
/**
 * @fileOverview This file defines a Genkit flow for the EchoDoc AI voice assistant.
 *
 * This flow is designed for a conversational medical AI that can handle greetings,
 * answer general health questions, and provide medical information in a conversational manner.
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
});

export type EchoDocOutput = z.infer<typeof EchoDocOutputSchema>;


const prompt = ai.definePrompt({
  name: 'echoDocPrompt',
  input: {schema: EchoDocInputSchema},
  output: {schema: EchoDocOutputSchema},
  prompt: `You are EchoDoc, a friendly and empathetic AI medical assistant. 
  
  Your role is to have a natural conversation with the user about their health concerns.
  - If the user greets you, greet them back warmly.
  - If the user asks a medical question, provide a clear, helpful, and concise answer.
  - If the user describes symptoms, you can provide potential information, but you MUST strongly advise them to consult a real doctor.
  - Always maintain a supportive and caring tone.
  - Keep your responses relatively short and suitable for a voice conversation.

  User's message: {{{query}}}

  Always include a disclaimer that you are not a real doctor and this advice is not a substitute for professional medical consultation.
  `,
});

const echoDocFlowInternal = ai.defineFlow(
  {
    name: 'echoDocFlowInternal',
    inputSchema: EchoDocInputSchema,
    outputSchema: EchoDocOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function echoDocFlow(input: EchoDocInput): Promise<EchoDocOutput> {
  return echoDocFlowInternal(input);
}
