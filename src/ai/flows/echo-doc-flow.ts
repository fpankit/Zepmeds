
'use server';
/**
 * @fileOverview A conversational AI doctor that detects language and responds accordingly.
 *
 * This flow is designed for a voice conversation. It takes an audio chunk,
 * transcribes it, and generates a context-aware text response.
 * The text-to-speech conversion will be handled on the client-side.
 */

import { ai } from '@/ai/dev';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

// Input: The user's voice and the conversation history
const EchoDocInputSchema = z.object({
  audioDataUri: z.string().describe(
    "A chunk of the user's voice as a data URI. Expected format: 'data:audio/wav;base64,<encoded_data>'."
  ),
  conversationHistory: z.array(z.object({
      role: z.enum(['user', 'model']),
      text: z.string(),
  })).describe("The history of the conversation so far."),
});
export type EchoDocInput = z.infer<typeof EchoDocInputSchema>;


// Output: The AI's audio response and the text for display
const EchoDocOutputSchema = z.object({
  aiResponseText: z.string().describe("The text version of the AI's response."),
  userTranscription: z.string().describe("The transcribed text from the user's audio input."),
});
export type EchoDocOutput = z.infer<typeof EchoDocOutputSchema>;


const CONVERSATION_PROMPT_TEMPLATE = `You are Echo Doc, a friendly and empathetic AI medical assistant. Your goal is to have a natural conversation with a user about their health concerns.

Your personality:
- You are reassuring, calm, and clear.
- You should NEVER give a definitive diagnosis or prescribe specific real-world medicine. Always recommend consulting a real doctor for that.
- You CAN suggest general advice, home remedies, and precautions.

Conversation Flow:
1.  **Listen & Analyze**: Analyze the user's spoken input.
2.  **Detect Language**: Automatically detect the user's language from their speech.
3.  **Provide Guidance**: Based on the symptoms, provide a concise and helpful response.
4.  **Respond in Same Language**: YOU MUST RESPOND IN THE SAME LANGUAGE THE USER IS SPEAKING.

Current Conversation History (for context only):
{{#each history}}
- {{role}}: {{{text}}}
{{/each}}
- user: {{{prompt}}}

Based on the prompt from the user, generate the next appropriate and helpful response for the 'model' role. Keep the response concise for a voice conversation.
`;


export const echoDocFlow = ai.defineFlow(
  {
    name: 'echoDocFlow',
    inputSchema: EchoDocInputSchema,
    outputSchema: EchoDocOutputSchema,
  },
  async (input) => {
    if (!input.audioDataUri) {
        throw new Error("No audio was provided to the flow.");
    }

    // Step 1: Transcribe Audio to Text using Gemini 1.5 Flash
    const transcriptionResponse = await ai.generate({
        model: googleAI.model('gemini-1.5-flash'),
        prompt: [{
            media: {
                url: input.audioDataUri,
                contentType: 'audio/wav'
            }
        }, {
            text: "Transcribe the following audio. The user could be speaking in any language, detect it and provide the transcription."
        }]
    });
    const transcribedText = transcriptionResponse.text.trim();
    
    // If transcription is empty, it means the user didn't say anything. Don't proceed.
    if (!transcribedText) {
        return { userTranscription: '', aiResponseText: '' };
    }

    // Step 2: Generate a text response using the transcription and conversation history.
    const llmResponse = await ai.generate({
        model: googleAI.model('gemini-1.5-flash'),
        prompt: CONVERSATION_PROMPT_TEMPLATE,
        history: input.conversationHistory,
        input: {
            prompt: transcribedText,
            history: input.conversationHistory
        },
    });
    const aiResponseText = llmResponse.text.trim();

    if (!aiResponseText) {
        return { userTranscription: transcribedText, aiResponseText: '' };
    }
    
    // Return text parts to the client. TTS will be handled by the browser.
    return {
      aiResponseText: aiResponseText,
      userTranscription: transcribedText,
    };
  }
);
