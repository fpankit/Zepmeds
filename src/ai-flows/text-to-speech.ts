
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

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
  speakingRate: z.number().optional().default(1.25).describe('The speaking rate, where 1.0 is normal speed.'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audio: z
    .string()
    .describe(
      "The generated audio as a data URI. Format: 'data:audio/mpeg;base64,<encoded_data>'."
    ),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;


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
      
      // The model returns a playable audio format directly. No conversion is needed.
      return {
        audio: media.url,
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
