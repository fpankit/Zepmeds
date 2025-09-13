
'use server';
import { config } from 'dotenv';
config({ path: '.env' });
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { firebase } from '@genkit-ai/firebase';   // ✅ named import

// Use the primary API key.
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('No Gemini API key found. Please set GEMINI_API_KEY in your .env file.');
}

export const ai = genkit({
  plugins: [
    googleAI({ apiKey }), // ✅ single key
    firebase,             // ✅ plugin object, not a function
  ],
  model: 'googleai/gemini-2.5-flash',
  flowRetryPolicy: { // Keep retry policy in case of intermittent network errors
    maxAttempts: 3,
    backoff: { initialDelay: 1000, maxDelay: 10000, factor: 2 },
  },
});
