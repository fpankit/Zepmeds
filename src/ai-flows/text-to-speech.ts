
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
import wav from 'wav';
import { googleAI } from '@genkit-ai/googleai';

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
  speakingRate: z.number().optional().default(1.25).describe('The speaking rate, where 1.0 is normal speed.'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audio: z
    .string()
    .describe(
      "The generated audio as a data URI. Format: 'data:audio/wav;base64,<encoded_data>'."
    ),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });
    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () =>
      resolve(Buffer.concat(bufs).toString('base64'))
    );
    writer.write(pcmData);
    writer.end();
  });
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({ text, speakingRate }) => {
    try {
      const { media } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Algenib' },
            },
            speakingRate,
          },
        },
        prompt: text,
      });

      if (!media?.url) {
        throw new Error('No audio content returned from the AI model.');
      }
      
      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );

      const wavBase64 = await toWav(audioBuffer);

      return {
        audio: 'data:audio/wav;base64,' + wavBase64,
      };

    } catch (e: any) {
        if (e.status === 429) {
            console.error("TTS quota exceeded:", e.message);
            throw new Error('quota_exceeded');
        }
        console.error("An unexpected error occurred during text-to-speech conversion:", e.message);
        throw new Error("An unexpected error occurred during text-to-speech conversion.");
    }
  }
);


export async function textToSpeech(
  input: TextToSpeechInput
): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}
