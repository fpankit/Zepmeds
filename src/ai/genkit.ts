
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// This file is now primarily for client-side or simple default initializations.
// The main, robust initialization with multiple keys is in `src/ai/dev.ts`.

// Load all available API keys from environment variables
const apiKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter((key): key is string => !!key);

const primaryApiKey = apiKeys[0] || process.env.GEMINI_API_KEY;

if (!primaryApiKey) {
  console.warn("Genkit: No primary API Key found. AI features may not work.");
}

export const ai = genkit({
  plugins: [googleAI({ apiKey: primaryApiKey })],
  model: 'googleai/gemini-2.5-flash',
});
