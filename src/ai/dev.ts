'use server';
import { config } from 'dotenv';
config({ path: '.env' });

// ✅ Correct Genkit + plugins imports
import { genkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';
import { firebase } from '@genkit-ai/firebase';   // <- Corrected path

// ✅ Genkit configuration
export const ai = genkit({
  plugins: [
    googleAI(),     // Reads GOOGLE_GENAI_API_KEY from .env
    firebase(),     // ✅ Must call the plugin function
  ],
  model: 'googleai/gemini-2.5-flash',
  telemetry: {
    instrumentation: {
      flowRetryPolicy: {
        maxAttempts: 3,
        backoff: {
          initialDelay: 1000,
          maxDelay: 10000,
          factor: 2,
        },
      },
    },
  },
});
