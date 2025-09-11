
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
// The wav conversion is no longer needed and was the source of the error.

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


const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({ text, voice }) => {
    // This try/catch block ensures any error during the API call is handled gracefully.
    try {
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.5-flash-preview-tts',
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        // The speaking rate is increased as per the user's request.
                        speakingRate: 1.25,
                        prebuiltVoiceConfig: { voiceName: voice || 'Algenib' },
                    },
                },
            },
            prompt: text,
        });

        if (!media || !media.url) {
            return { error: 'No audio media returned from the model.' };
        }
        
        // The model returns a playable data URI directly.
        // The previous conversion to WAV was unnecessary and causing errors.
        // We now return the audio data directly.
        return {
            audioDataUri: media.url,
        };

    } catch (e: any) {
        const errorMessage = e.message || 'An unknown error occurred.';
        // This handles cases where API quotas are exceeded.
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
