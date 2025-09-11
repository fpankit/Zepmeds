
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

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
  voice: z.string().optional().describe('The voice to use for the speech.'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audioDataUri: z.string().optional().describe('The base64 encoded data URI of the generated audio.'),
  error: z.string().optional().describe('An error message if TTS fails.'),
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

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

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
  async ({ text, voice }) => {
    try {
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.5-flash-preview-tts',
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voice || 'Algenib' },
                        speakingRate: 1.25,
                    },
                },
            },
            prompt: text,
        });

        if (!media) {
            return { error: 'No audio media returned from the model.' };
        }
        
        const audioBuffer = Buffer.from(
            media.url.substring(media.url.indexOf(',') + 1),
            'base64'
        );
        
        const wavBase64 = await toWav(audioBuffer);

        return {
            audioDataUri: 'data:audio/wav;base64,' + wavBase64,
        };
    } catch (e: any) {
        const errorMessage = e.message || '';
        if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
            console.warn('TTS quota error:', errorMessage);
            return { error: 'quota_exceeded' };
        }
        console.error('TTS flow error:', e);
        return { error: 'An unexpected error occurred during text-to-speech conversion.' };
    }
  }
);


export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}
