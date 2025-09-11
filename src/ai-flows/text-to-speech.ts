
'use server';
/**
 * @fileOverview This file defines a Genkit flow for converting text to speech.
 *
 * @interface TextToSpeechInput - Represents the input for the TTS flow.
 * @interface TextToSpeechOutput - Represents the output of the TTS flow.
 * @function textToSpeech - The main function to initiate the TTS flow.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';
import wav from 'wav';
import { PassThrough } from 'stream';


const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audio: z
    .string()
    .describe("The generated audio in WAV format as a data URI."),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;


const SAMPLE_RATE = 24000;
const CHANNELS = 1;

// Helper to convert a stream to a base64 data URI
const streamToDataURI = (stream: PassThrough, mimeType: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => {
            const buffer = Buffer.concat(chunks);
            resolve(`data:${mimeType};base64,${buffer.toString('base64')}`);
        });
        stream.on('error', reject);
    });
};

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({ text }) => {
    try {
      const { media } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Algenib' },
            },
          },
        },
        prompt: text,
      });

      if (!media?.url) {
        throw new Error('No audio content was returned from the AI model.');
      }
      
      const pcmBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );

      // --- Create WAV ---
      const wavStream = new wav.Writer({ sampleRate: SAMPLE_RATE, channels: CHANNELS });
      const wavPromise = streamToDataURI(wavStream, 'audio/wav');
      wavStream.end(pcmBuffer);
      
      const audio = await wavPromise;

      return { audio };

    } catch (e: any) {
        console.error(`[TextToSpeechError] Failed to convert text to speech. Input: "${text.substring(0, 30)}...". Error:`, e);
        throw e;
    }
  }
);

export async function textToSpeech(
  input: TextToSpeechInput
): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}
