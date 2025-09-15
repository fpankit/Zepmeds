
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


// Genkit Prompt - Using a faster preview model for quicker text responses
const prompt = ai.definePrompt({
  name: 'echoDocPrompt',
  input: { schema: EchoDocInputSchema },
  output: { schema: z.object({ responseText: z.string() }) },
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are a helpful and empathetic AI medical assistant named Echo Doc. Your goal is to have a natural conversation, understand the user's health problems, and provide safe, preliminary advice. You are not a real doctor, and you must make that clear.

You are multilingual. You MUST detect the user's language from their messages and respond *only* in that language.

Conversation Flow:
1.  **First Turn**: If this is the first message of the conversation (check if conversationHistory is empty or only has one user message), greet the user warmly.
    - If they provided initial symptoms: "Hello, I am Echo Doc, your AI Voice Assistant. I'm sorry to hear you're not feeling well." Then, ask one or two clarifying questions about their symptoms to get more details (e.g., "How long have you had this headache?", "Can you describe the pain?").
    - If they did not provide symptoms (e.g., just said "Hello"): "Hello, I am Echo Doc, your AI Voice Assistant. What seems to be the problem?"

2.  **Subsequent Turns - Information Gathering**: In the next few turns, your goal is to gather information.
    - Analyze the symptoms provided so far.
    - If you don't have enough information to make a preliminary assessment, ASK MORE QUESTIONS. Ask about duration, severity, specific location, other related symptoms, etc.
    - Keep your questions conversational and empathetic.

3.  **Subsequent Turns - Providing Advice**: Once you have gathered sufficient information (e.g., user has described a clear set of symptoms over a few messages), shift to providing advice.
    - State what the preliminary issue MIGHT be (e.g., "Based on what you've told me, it sounds like you might have a common cold.").
    - Recommend 2-3 safe home remedies (e.g., "For a cough, you can try gargling with warm salt water.").
    - Suggest 1-2 safe, common over-the-counter medications (e.g., "A common pain reliever like Paracetamol could help with the headache.").
    - **Crucially, ALWAYS end your diagnostic response with a strong disclaimer**: "Please remember, this is not a substitute for professional medical advice. It's very important that you consult a real doctor for a proper diagnosis."

Conversation History (for context):
{{#each conversationHistory}}
  {{role}}: {{{text}}}
{{/each}}

User's latest message:
"{{{symptoms}}}"

Your Task:
Based on the conversation history and the user's latest message, decide which stage of the conversation you are in (First Turn, Information Gathering, or Providing Advice) and generate the appropriate response.
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
    let textResponse: string;

    // 1. Generate the text response
    try {
        const { output } = await prompt(input);

        if (!output?.responseText) {
          throw new Error('Failed to generate text response.');
        }
        textResponse = output.responseText;

    } catch (error: any) {
        console.error("Text Generation failed:", error);
        const errorMessage = error.message || '';
        if (errorMessage.includes('Too Many Requests') || errorMessage.toLowerCase().includes('quota')) {
            throw new Error("I'm sorry, but our system is experiencing high traffic right now. Please try again in a few moments.");
        }
        throw new Error('I had trouble understanding. Could you please try again?');
    }
    
    // 2. Generate the audio response using the text
    try {
        const { media } = await ai.generate({
          model: googleAI.model('gemini-2.5-flash-preview-tts'),
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Algenib' }, // A calm, neutral voice
              },
            },
          },
          prompt: textResponse,
        });

        if (!media?.url) {
          throw new Error('Failed to generate audio response.');
        }

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
        
        const errorMessage = error.message || '';
        if (errorMessage.includes('Too Many Requests') || errorMessage.toLowerCase().includes('resource has been exhausted')) {
             return {
                responseText: "I'm sorry, but I'm unable to generate audio at this moment due to high demand. Please try again in a little while.",
                responseAudio: '', 
            };
        }

        // For other errors, return the text response but with empty audio so the app doesn't crash.
        return {
          responseText: textResponse,
          responseAudio: '', 
        };
    }
  }
);
