'use server';
import { config } from 'dotenv';
config({ path: '.env' });

// ✅ Correct Genkit + plugins imports
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';

// ✅ Genkit configuration
export const ai = genkit({
  plugins: [
    googleAI(),     // Reads GOOGLE_GENAI_API_KEY from .env
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

// Enable Firebase Telemetry for monitoring
enableFirebaseTelemetry();
