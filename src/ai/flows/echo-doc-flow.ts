
'use server';
/**
 * @fileOverview A conversational AI medical agent with Text-to-Speech.
 *
 * - echoDoc - The main function to interact with the agent.
 * - EchoDocInput - The input type for the echoDoc function.
 * - EchoDocOutput - The return type for the echoDoc function.
 */

import { ai } from '@/ai/dev';
import { z } from 'zod';
import wav from 'wav';
import { googleAI } from '@genkit-ai/googleai';

// Input Schema - Language is now optional as it will be auto-detected.
const EchoDocInputSchema = z.object({
  symptoms: z.string().describe("The user's description of their symptoms and questions."),
  language: z.string().optional().describe("The language for the conversation (e.g., 'Hindi', 'English', 'Marathi'). If not provided, it will be auto-detected."),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    text: z.string(),
  })).optional().describe('The history of the conversation so far.'),
});
export type EchoDocInput = z.infer<typeof EchoDocInputSchema>;

// Output Schema
const EchoDocOutputSchema = z.object({
  responseText: z.string().describe("The AI's text response to the user."),
  responseAudio: z.string().describe("A data URI of the AI's spoken response in WAV format."),
});
export type EchoDocOutput = z.infer<typeof EchoDocOutputSchema>;


/**
 * Converts raw PCM audio buffer to a Base64 encoded WAV data URI.
 */
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
    writer.on('end', () => {
      const wavBuffer = Buffer.concat(bufs);
      resolve('data:audio/wav;base64,' + wavBuffer.toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}


// Main exported function that wraps the Genkit flow
export async function echoDoc(input: EchoDocInput): Promise<EchoDocOutput> {
  return await echoDocFlow(input);
}


// Genkit Prompt
const prompt = ai.definePrompt({
  name: 'echoDocPrompt',
  input: { schema: EchoDocInputSchema },
  output: { schema: z.object({ responseText: z.string() }) },
  prompt: `You are a helpful and empathetic AI medical assistant named Echo Doc. Your role is to listen to a user's symptoms and provide clear, reassuring preliminary guidance. Always prioritize safety and strongly advise consulting a human doctor for a real diagnosis.

  You are multilingual. You MUST detect the user's language and respond *only* in that language. Do not switch languages.

  {{#if symptoms}}
    Your first response should always be: "Hello, I am Echo Doc, your AI Voice Assistant. I am sorry to hear you're not feeling well." and then you MUST ask one or two clarifying questions based on their initial symptoms.
  {{else}}
    Your first response should be "Hello, I am Echo Doc, your AI Voice Assistant. What seems to be the problem?".
  {{/if}}
  
  Conversation History (for context):
  {{#each conversationHistory}}
    {{role}}: {{{text}}}
  {{/each}}

  User's latest message:
  "{{{symptoms}}}"

  Your Task:
  1. Acknowledge the user's symptoms in a caring way if they provided any.
  2. If the user hasn't provided any details, ask them what is happening.
  3. Ask clarifying questions if necessary (e.g., "How long have you had this headache?").
  4. Provide very general, safe advice (e.g., "It's important to rest and drink plenty of fluids.").
  5. Gently but firmly remind the user to see a doctor. Example: "While I can offer some general advice, it's very important that you speak with a real doctor for a proper diagnosis."
  6. Keep your response concise, clear, and easy to understand.
  `,
});


// Genkit Flow
const echoDocFlow = ai.defineFlow(
  {
    name: 'echoDocFlow',
    inputSchema: EchoDocInputSchema,
    outputSchema: EchoDocOutputSchema,
  },
  async (input) => {
    // 1. Generate the text response
    const { output } = await prompt(input);

    if (!output?.responseText) {
      throw new Error('Failed to generate text response.');
    }
    const textResponse = output.responseText;
    
    try {
        // 2. Generate the audio response using the text
        const { media } = await ai.generate({
          model: googleAI.model('gemini-2.5-flash-preview-tts'),
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Algenib' }, // A calm, neutral voice
              },
              speed: 1.5, // Increased speed to 1.5x
            },
          },
          prompt: textResponse,
        });

        if (!media?.url) {
          throw new Error('Failed to generate audio response.');
        }

        // The TTS model returns raw PCM data in a data URI. We need to convert it to a proper WAV file.
        const audioBuffer = Buffer.from(
          media.url.substring(media.url.indexOf(',') + 1),
          'base64'
        );
        
        const wavDataUri = await toWav(audioBuffer);

        return {
          responseText: textResponse,
          responseAudio: wavDataUri,
        };
    } catch(error: any) {
        console.error("TTS Generation failed:", error);
        
        // Check for overload or rate limit errors
        const errorMessage = error.message || '';
        if (errorMessage.includes('503') || errorMessage.toLowerCase().includes('overloaded')) {
             return {
                responseText: "I'm sorry, but I'm unable to generate audio at this moment due to high demand. Please try again in a little while.",
                responseAudio: '', 
            };
        }

        // For other errors, return the text response with an empty audio URI.
        return {
          responseText: textResponse,
          responseAudio: '', // Send empty audio URI on failure
        };
    }
  }
);
