
'use server';
/**
 * @fileOverview A conversational AI doctor that detects language and responds accordingly.
 *
 * NOTE: This flow is currently NOT USED by the EchoDocContent component, which
 * now uses a client-side only implementation to avoid API rate-limit issues.
 * This file is kept for future reference.
 */

import { ai } from '@/ai/dev';
import { z } from 'zod';

const EchoDocInputSchema = z.object({
  audioDataUri: z.string().describe(
    "A chunk of the user's voice as a data URI. Expected format: 'data:audio/webm;base64,<encoded_data>'."
  ),
  conversationHistory: z.array(z.object({
      role: z.enum(['user', 'model']),
      text: z.string(),
  })).describe("The history of the conversation so far."),
});
export type EchoDocInput = z.infer<typeof EchoDocInputSchema>;

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
1.  **Listen & Analyze**: Analyze the user's spoken input from the transcription.
2.  **Detect Language**: Automatically detect the user's language from their speech.
3.  **Provide Guidance**: Based on the symptoms, provide a concise and helpful response.
4.  **Respond in Same Language**: YOU MUST RESPOND IN THE SAME LANGUAGE THE USER IS SPEAKING.

Current Conversation (for context only):
{{#each conversationHistory}}
- {{role}}: {{{text}}}
{{/each}}
- user: {{{userTranscription}}}

Based on the prompt from the user, generate the next appropriate and helpful response for the 'model' role. Keep the response concise for a voice conversation.
`;


export async function echoDocFlow(input: EchoDocInput): Promise<EchoDocOutput> {
    if (!input.audioDataUri) {
        throw new Error("No audio was provided to the flow.");
    }

    // Step 1: Transcribe Audio and get a response in a single, more efficient call.
    const combinedResponse = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: `
            You are an expert transcriber and a helpful AI medical assistant named Echo Doc.
            First, transcribe the following audio. The user could be speaking in any language.
            Then, based on the transcription and the conversation history, generate a helpful and empathetic response in the same language as the user. 
            Never give a definitive diagnosis. Always recommend consulting a real doctor.
            Provide your response as a JSON object with two keys: "transcription" and "aiResponse".

            Conversation History (for context):
            ${JSON.stringify(input.conversationHistory)}

            Audio to process:
        `,
        input: [{
            media: {
                url: input.audioDataUri,
                contentType: 'audio/webm'
            }
        }],
        output: {
            schema: z.object({
                transcription: z.string(),
                aiResponse: z.string(),
            }),
        }
    });

    const { output } = combinedResponse;

    if (!output || !output.transcription) {
        return { userTranscription: '', aiResponseText: '' };
    }
    
    // Return text parts to the client. TTS will be handled by the browser.
    return {
      aiResponseText: output.aiResponse || '',
      userTranscription: output.transcription,
    };
}
