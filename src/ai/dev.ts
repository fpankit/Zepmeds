
'use server';
import { config } from 'dotenv';
config({ path: '.env' });
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';   // ✅ plugin object
import { firebase } from '@genkit-ai/firebase';   // ✅ plugin object

export const ai = genkit({
  plugins: [
    googleAI,   // ✅ no parentheses
    firebase,   // ✅ no parentheses
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
