'use server';
import { config } from 'dotenv';
config({ path: '.env' });
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';   // ✅ plugin object
import firebase from '@genkit-ai/firebase';   // ✅ plugin function (default export)

export const ai = genkit({
  plugins: [
    googleAI,   // ✅ plugin object, no parentheses
    firebase(), // ✅ function call, returns a plugin object
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
