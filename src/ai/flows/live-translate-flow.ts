
'use server';
/**
 * @fileOverview A real-time translation AI agent for video calls.
 *
 * This flow takes an audio chunk, transcribes it, and translates the text.
 * The text-to-speech (TTS) conversion is now handled on the client-side
 * to avoid server-side rate-limiting issues.
 */

import { ai } from '@/ai/dev';
import { z } from 'zod';
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
  transcribedText: z.string().describe("The original transcribed text from the source audio."),
  translatedText: z.string().describe("The translated text in the target language."),
});
export type LiveTranslateOutput = z.infer<typeof LiveTranslateOutputSchema>;

/**
 * The main flow for translating live audio. It no longer generates audio.
 */
export const liveTranslateFlow = ai.defineFlow(
  {
    name: 'liveTranslateFlow',
    inputSchema: LiveTranslateInputSchema,
    outputSchema: LiveTranslateOutputSchema,
  },
  async (input) => {
    // Step 1: Transcribe audio to text using the dedicated translation model
    const transcriptionResponse = await ai.generate({
      model: googleAI.model('gemini-pro'), // THE FIX: Use a stable and available model.
      prompt: [
        { media: { url: input.audioDataUri, contentType: 'audio/wav' } },
        { text: `Transcribe the audio. The language is ${input.sourceLanguage}.` }
      ]
    });
    const transcribedText = transcriptionResponse.text.trim();
    
    if (!transcribedText) {
        // Return empty if transcription fails
        return { transcribedText: '', translatedText: '' };
    }

    // Step 2: Translate the transcribed text to the target language
    const translationResponse = await ai.generate({
      model: googleAI.model('gemini-pro'), // THE FIX: Use a stable and available model.
      prompt: `Translate the following text from ${input.sourceLanguage} to ${input.targetLanguage}: "${transcribedText}"`,
    });
    const translatedText = translationResponse.text.trim();
    
    // Step 3 (Removed): No more server-side TTS.
    
    return {
      transcribedText,
      translatedText,
    };
  }
);
