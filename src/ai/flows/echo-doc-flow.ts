
'use server';
/**
 * @fileOverview A conversational AI doctor that detects language and responds accordingly.
 *
 * This flow is designed for a voice conversation. It takes an audio chunk,
 * detects the language, transcribes, generates a context-aware response,
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
  detectedLanguage: z.string().describe("The language detected from the user's speech (e.g., 'Hindi', 'English')."),
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
1.  **Introduction (First Turn)**: If the conversation history is empty, start by introducing yourself in a friendly way. Ask the user how you can help them today.
    *Example: "Hello, I am Echo Doc, your personal AI health assistant. How are you feeling today?"*
2.  **Listen & Analyze**: Listen carefully to the user's symptoms. Ask clarifying questions if needed.
3.  **Provide Guidance**: Based on the symptoms, provide:
    - A possible, general explanation of the issue (e.g., "It sounds like you might have a common cold.").
    - Safe home remedies and precautions.
    - Advice on when to see a real doctor.
4.  **Language Detection**: The user's language is automatically detected. YOU MUST RESPOND IN THE SAME LANGUAGE.

Current Conversation:
{{#each conversationHistory}}
- {{role}}: {{{text}}}
{{/each}}
- user: (The user's next response is in the provided audio)

Your task is to generate the next response for the 'model' role based on the audio and history.
`;


export const echoDocFlow = ai.defineFlow(
  {
    name: 'echoDocFlow',
    inputSchema: EchoDocInputSchema,
    outputSchema: EchoDocOutputSchema,
  },
  async (input) => {
    // If audio is empty, it's an error state from the new UI, but we'll handle it gracefully.
    if (!input.audioDataUri) {
        throw new Error("No audio was provided to the flow.");
    }

    // Step 1: Transcribe audio and detect language
    const transcriptionResponse = await ai.generate({
      model: googleAI.model('gemini-1.5-flash'),
      prompt: [
        { media: { url: input.audioDataUri, contentType: 'audio/webm' } }, // Updated to webm
        { text: `Transcribe the following audio. Also, identify the primary language being spoken (e.g., English, Hindi, Punjabi). Respond in JSON format with two keys: "transcription" and "language".` }
      ]
    });
    
    let transcription, detectedLanguage;
    try {
        const jsonResponse = JSON.parse(transcriptionResponse.text.replace(/```json|```/g, '').trim());
        transcription = jsonResponse.transcription;
        detectedLanguage = jsonResponse.language || 'English';
    } catch (e) {
        console.error("Failed to parse transcription response:", transcriptionResponse.text);
        // Fallback if JSON parsing fails
        transcription = transcriptionResponse.text;
        detectedLanguage = 'English';
    }

    if (!transcription || !transcription.trim()) {
        return { aiAudioUri: '', aiResponseText: '', detectedLanguage: detectedLanguage || 'English' };
    }
    
    // Step 2: Generate a text response based on conversation history
    const conversationHistory = [...input.conversationHistory, { role: 'user' as const, text: transcription }];
    
    // Construct a safe prompt for Handlebars
    const handlebarsPrompt = `
      {{#each conversationHistory}}
      - {{this.role}}: {{{this.text}}}
      {{/each}}
    `;

    const fullPrompt = CONVERSATION_PROMPT.replace('{{#each conversationHistory}}...{{/each}}', handlebarsPrompt);

    const textResponse = await ai.generate({
      model: googleAI.model('gemini-1.5-flash'),
      prompt: fullPrompt,
      context: { conversationHistory },
    });
    
    const aiResponseText = textResponse.text.trim();

    // Step 3: Convert the text response back to speech in the detected language
    const ttsResponse = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Algenib' } } },
      },
      prompt: `(language: ${detectedLanguage}) ${aiResponseText}`, // Guide TTS with language context
    });

    if (!ttsResponse.media) {
      throw new Error('Text-to-Speech conversion failed.');
    }
    
    const pcmBuffer = Buffer.from(ttsResponse.media.url.substring(ttsResponse.media.url.indexOf(',') + 1), 'base64');
    const wavBase64 = await toWav(pcmBuffer);
    
    return {
      aiAudioUri: `data:audio/wav;base64,${wavBase64}`,
      aiResponseText,
      detectedLanguage: transcription, // Return transcription in detectedLanguage field for the UI
    };
  }
);
