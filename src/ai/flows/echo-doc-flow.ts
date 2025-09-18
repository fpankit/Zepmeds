
'use server';
/**
 * @fileOverview A conversational AI doctor that detects language and responds accordingly.
 *
 * This flow is designed for a voice conversation. It takes an audio chunk,
 * transcribes, generates a context-aware response,
 * and converts that response back to audio in the detected language.
 */

import { ai } from '@/ai/dev';
import { z } from 'zod';
import wav from 'wav';
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
  aiAudioUri: z.string().describe("The AI's spoken response as a data URI in WAV format."),
  aiResponseText: z.string().describe("The text version of the AI's response."),
  userTranscription: z.string().describe("The transcribed text from the user's audio input."),
});
export type EchoDocOutput = z.infer<typeof EchoDocOutputSchema>;


/**
 * Converts PCM audio data buffer to a Base64 encoded WAV string.
 */
async function toWav(pcmData: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({ channels: 1, sampleRate: 24000, bitDepth: 16 });
    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));
    writer.write(pcmData);
    writer.end();
  });
}

const CONVERSATION_PROMPT = `You are Echo Doc, a friendly and empathetic AI medical assistant. Your goal is to have a natural voice conversation with a user about their health concerns.

Your personality:
- You are reassuring, calm, and clear.
- You should NEVER give a definitive diagnosis or prescribe specific real-world medicine. Always recommend consulting a real doctor for that.
- You CAN suggest general advice, home remedies, and precautions.

Conversation Flow:
1.  **Listen & Analyze**: Analyze the user's spoken input.
2.  **Detect Language**: Automatically detect the user's language from their speech.
3.  **Provide Guidance**: Based on the symptoms, provide a concise and helpful response.
4.  **Respond in Same Language**: YOU MUST RESPOND IN THE SAME LANGUAGE THE USER IS SPEAKING.

Current Conversation History:
{{#each conversationHistory}}
- {{role}}: {{{text}}}
{{/each}}
- user: {{{transcription}}}

Your task is to generate the next appropriate text response for the 'model' role.
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

    // Step 1: Transcribe Audio to Text
    const transcriptionResponse = await ai.generate({
        model: googleAI.model('gemini-1.5-flash'),
        prompt: [{
            media: {
                url: input.audioDataUri,
                contentType: 'audio/webm' // FIX: Changed from 'audio/wav' to 'audio/webm'
            }
        }, {
            text: "Transcribe the following audio. The user could be speaking in any language, detect it."
        }]
    });
    const transcribedText = transcriptionResponse.text.trim();
    if (!transcribedText) {
        // If transcription is empty, don't proceed.
        return { userTranscription: '', aiResponseText: '', aiAudioUri: '' };
    }

    // Step 2: Generate Text Response based on transcription and history
    const llmResponse = await ai.generate({
        model: googleAI.model('gemini-1.5-flash'),
        prompt: CONVERSATION_PROMPT,
        context: {
            transcription: transcribedText,
            conversationHistory: input.conversationHistory,
        },
    });
    const aiResponseText = llmResponse.text.trim();

    // Step 3: Convert the AI's text response to Speech
    const ttsResponse = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Algenib' } },
            },
        },
        prompt: aiResponseText,
    });

    if (!ttsResponse.media) {
      throw new Error('Text-to-Speech conversion failed.');
    }
    
    // Convert the raw PCM audio data to a WAV file format
    const pcmBuffer = Buffer.from(ttsResponse.media.url.substring(ttsResponse.media.url.indexOf(',') + 1), 'base64');
    const wavBase64 = await toWav(pcmBuffer);
    
    return {
      aiAudioUri: `data:audio/wav;base64,${wavBase64}`,
      aiResponseText: aiResponseText,
      userTranscription: transcribedText,
    };
  }
);
