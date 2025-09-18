
'use server';
/**
 * @fileOverview A real-time translation AI agent for video calls.
 *
 * This flow takes an audio chunk, transcribes it, translates the text,
 * and converts the translated text back into audio.
 */

import { ai } from '@/ai/dev';
import { z } from 'zod';
import wav from 'wav';
import { googleAI } from '@genkit-ai/googleai';

// Define the input schema for the translation flow
const LiveTranslateInputSchema = z.object({
  audioDataUri: z.string().describe(
    "A chunk of audio as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:audio/wav;base64,<encoded_data>'."
  ),
  sourceLanguage: z.string().describe("The source language of the audio (e.g., 'English', 'Hindi')."),
  targetLanguage: z.string().describe("The target language for the translation (e.g., 'Hindi', 'English')."),
});
export type LiveTranslateInput = z.infer<typeof LiveTranslateInputSchema>;

// Define the output schema for the translation flow
const LiveTranslateOutputSchema = z.object({
  translatedAudioUri: z.string().describe("The translated audio chunk as a data URI in WAV format."),
  transcribedText: z.string().describe("The original transcribed text from the source audio."),
  translatedText: z.string().describe("The translated text in the target language."),
});
export type LiveTranslateOutput = z.infer<typeof LiveTranslateOutputSchema>;


/**
 * Converts PCM audio data buffer to a Base64 encoded WAV string.
 */
async function toWav(pcmData: Buffer, channels = 1, rate = 24000, sampleWidth = 2): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}

/**
 * The main flow for translating live audio.
 */
export const liveTranslateFlow = ai.defineFlow(
  {
    name: 'liveTranslateFlow',
    inputSchema: LiveTranslateInputSchema,
    outputSchema: LiveTranslateOutputSchema,
  },
  async (input) => {
    // Step 1: Transcribe audio to text using Gemini
    const transcriptionResponse = await ai.generate({
      model: googleAI.model('gemini-1.5-flash'),
      prompt: [
        { media: { url: input.audioDataUri } },
        { text: `Transcribe the audio. The language is ${input.sourceLanguage}.` }
      ]
    });
    const transcribedText = transcriptionResponse.text.trim();
    
    if (!transcribedText) {
        // Return empty if transcription fails
        return { translatedAudioUri: '', transcribedText: '', translatedText: '' };
    }

    // Step 2: Translate the transcribed text to the target language
    const translationResponse = await ai.generate({
      model: googleAI.model('gemini-1.5-flash'),
      prompt: `Translate the following text from ${input.sourceLanguage} to ${input.targetLanguage}: "${transcribedText}"`,
    });
    const translatedText = translationResponse.text.trim();

    // Step 3: Convert the translated text back to speech
    const ttsResponse = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' }, // Using a standard voice for now
          },
        },
      },
      prompt: translatedText,
    });

    if (!ttsResponse.media) {
      throw new Error('Text-to-Speech conversion failed.');
    }
    
    // The TTS model returns raw PCM data, we need to encode it as a WAV file.
    const pcmBuffer = Buffer.from(ttsResponse.media.url.substring(ttsResponse.media.url.indexOf(',') + 1), 'base64');
    const wavBase64 = await toWav(pcmBuffer);
    
    return {
      translatedAudioUri: `data:audio/wav;base64,${wavBase64}`,
      transcribedText,
      translatedText,
    };
  }
);
