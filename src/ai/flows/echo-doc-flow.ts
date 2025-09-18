
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

const MULTIMODAL_CONVERSATION_PROMPT = `You are Echo Doc, a friendly and empathetic AI medical assistant. Your goal is to have a natural voice conversation with a user about their health concerns.

Your personality:
- You are reassuring, calm, and clear.
- You should NEVER give a definitive diagnosis or prescribe specific real-world medicine. Always recommend consulting a real doctor for that.
- You CAN suggest general advice, home remedies, and precautions.

Conversation Flow:
1.  **Listen & Analyze**: Analyze the user's spoken input from the audio.
2.  **Detect Language**: Automatically detect the user's language from their speech.
3.  **Provide Guidance**: Based on the symptoms, provide a concise and helpful response.
4.  **Respond in Same Language**: YOU MUST RESPOND IN THE SAME LANGUAGE THE USER IS SPEAKING.

Current Conversation History:
{{#each conversationHistory}}
- {{role}}: {{{text}}}
{{/each}}
- user: (speaking in audio)

Your task is to:
1. Transcribe the user's audio.
2. Generate the next appropriate text response for the 'model' role.
3. Convert that text response into speech audio.

You will receive an audio file and the text history. You must return both the text transcription of the user's audio, your text response, AND the audio of your response.
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
    
    const fullHistory = [
      ...input.conversationHistory.map(turn => ({ role: turn.role, parts: [{ text: turn.text }] })),
      { role: 'user' as const, parts: [{ media: { url: input.audioDataUri, contentType: 'audio/webm' } }] }
    ];

    // SINGLE EFFICIENT CALL
    const llmResponse = await ai.generate({
      model: googleAI.model('gemini-1.5-flash'),
      prompt: MULTIMODAL_CONVERSATION_PROMPT,
      history: fullHistory,
      context: {
          conversationHistory: input.conversationHistory,
      },
      config: {
          responseModalities: ['TEXT', 'AUDIO'], // Ask for both text and audio in one go
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Algenib' } },
          },
      }
    });

    // The 'text' will contain both the transcription and the AI response, we need to separate them.
    const responseParts = llmResponse.text.split('\n');
    const userTranscription = responseParts.find(line => line.toLowerCase().startsWith("transcription:"))?.substring(12).trim() || '';
    const aiResponseText = responseParts.filter(line => !line.toLowerCase().startsWith("transcription:")).join('\n').trim();

    if (!llmResponse.media) {
      // Fallback if audio isn't generated for some reason
      return { aiAudioUri: '', aiResponseText: aiResponseText || "I'm sorry, I couldn't process that. Could you please repeat?", userTranscription: userTranscription || "(Could not transcribe)" };
    }
    
    const pcmBuffer = Buffer.from(llmResponse.media.url.substring(llmResponse.media.url.indexOf(',') + 1), 'base64');
    const wavBase64 = await toWav(pcmBuffer);
    
    return {
      aiAudioUri: `data:audio/wav;base64,${wavBase64}`,
      aiResponseText: aiResponseText,
      userTranscription: userTranscription,
    };
  }
);
