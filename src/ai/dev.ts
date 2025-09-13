
'use server';
import { config } from 'dotenv';
config({ path: '.env' });
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { firebase } from '@genkit-ai/firebase';

export const ai = genkit({
  plugins: [
    googleAI(),   // Reads from GOOGLE_GENAI_API_KEY in .env
    firebase(),   // The firebase plugin object
  ],
  model: 'googleai/gemini-2.5-flash',
  telemetry: {
    instrumentation: {
      flowRetryPolicy: {
        maxAttempts: 3,
        backoff: { initialDelay: 1000, maxDelay: 10000, factor: 2 },
      },
    }
  }
});
