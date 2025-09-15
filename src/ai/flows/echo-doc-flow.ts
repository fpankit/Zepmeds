
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

// Input Schema - Language is now optional as it will be auto-detected.
const EchoDocInputSchema = z.object({
  symptoms: z.string().describe("The user's description of their symptoms and questions."),
  language: z.string().optional().describe("The language for the conversation (e.g., 'Hindi', 'English', 'Marathi'). If not provided, it will be auto-detected."),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    text: z.string(),
  })).optional().default([]).describe('The history of the conversation so far.'),
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


// Genkit Prompt for generating the base response in English
const conversationPrompt = ai.definePrompt({
  name: 'echoDocConversationPrompt',
  input: { schema: EchoDocInputSchema },
  output: { schema: z.object({ responseText: z.string() }) },
  model: 'googleai/gemini-1.5-pro',
  prompt: `You are a helpful and empathetic AI medical assistant named Echo Doc. Your goal is to have a natural conversation, understand the user's health problems, and provide safe, preliminary advice in English. You are not a real doctor, and you must make that clear.

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
    - **Crucially, ALWAYS end your diagnostic response with this exact disclaimer**: "Please remember, this is not a substitute for professional medical advice. It's very important that you consult a real doctor for a proper diagnosis."

Conversation History (for context):
{{#each conversationHistory}}
  {{role}}: {{{text}}}
{{/each}}

User's latest message:
"{{{symptoms}}}"

Your Task:
Based on the conversation history and the user's latest message, decide which stage of the conversation you are in and generate the appropriate response **in English**.
`,
});

// Genkit Prompt for translating the English text
const translationPrompt = ai.definePrompt({
    name: 'echoDocTranslationPrompt',
    input: { schema: z.object({ textToTranslate: z.string(), targetLanguage: z.string() }) },
    output: { schema: z.object({ translatedText: z.string() }) },
    model: 'googleai/gemini-1.5-flash', // Using a faster model for translation
    prompt: `Translate the following English text into '{{{targetLanguage}}}'. Provide only the translated text, nothing else.

English Text:
"{{{textToTranslate}}}"
`
});


// Genkit Flow
const echoDocFlow = ai.defineFlow(
  {
    name: 'echoDocFlow',
    inputSchema: EchoDocInputSchema,
    outputSchema: EchoDocOutputSchema,
  },
  async (input) => {
    let englishText: string;
    const { language = 'English' } = input; // Default to English if no language is provided

    // 1. Generate the text response in English. Let Genkit's retry policy handle transient errors.
    try {
        const { output } = await conversationPrompt(input);
        if (!output?.responseText) {
          throw new Error('Failed to generate text response. The AI model returned an empty message.');
        }
        englishText = output.responseText;
    } catch (error: any) {
        console.error("Text Generation failed after retries:", error);
        // After all retries, return a user-friendly error.
        const finalErrorText = 'I am having trouble processing your request right now. Please try again in a moment.';
        // We will generate audio for this error message.
        englishText = finalErrorText;
    }
    
    // 2. Translate the response if needed
    let finalResponseText = englishText;
    if (language !== 'English' && !englishText.includes('processing your request')) {
        try {
            const { output } = await translationPrompt({ textToTranslate: englishText, targetLanguage: language });
            if (!output?.translatedText) {
                // If translation fails, fall back to English.
                console.error('Translation model failed to return text.');
                finalResponseText = englishText;
            } else {
                finalResponseText = output.translatedText;
            }
        } catch (error) {
            console.error("Translation failed, falling back to English:", error);
            // In case of any error during translation, we still have the English response.
            finalResponseText = englishText;
        }
    }

    // 3. Generate the audio response using the (potentially translated) text
    try {
        const { media } = await ai.generate({
          model: 'gemini-2.5-flash-preview-tts',
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Algenib' }, // A calm, neutral voice
              },
            },
          },
          prompt: finalResponseText,
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
          responseText: finalResponseText,
          responseAudio: wavDataUri,
        };
    } catch(error: any) {
        console.error("TTS Generation failed after retries:", error);
        // If TTS fails after retries, return the text but with empty audio.
        return {
          responseText: finalResponseText,
          responseAudio: '', 
        };
    }
  }
);
