
'use server';
import { config } from 'dotenv';
config({ path: '.env.local' });
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { devLogger, startFlows } from '@genkit-ai/next/server';

export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
  model: 'googleai/gemini-2.5-flash',
  flowStateStore: 'firebase',
  traceStore: 'firebase',
  logger: devLogger,
  enableTracing: true,
  // Add a retry policy for all flows
  flowRetryPolicy: {
    maxAttempts: 3, // Retry up to 2 times after the initial failure
    backoff: {
      initialDelay: 1000, // 1 second
      maxDelay: 10000, // 10 seconds
      factor: 2,
    },
  },
});

import '@/ai/flows/generate-prescription-summary.ts';
import '@/ai/flows/translate-text.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/ai-symptom-checker.ts';
import '@/ai/flows/echo-doc-flow.ts';
import '@/ai/flows/detect-language.ts';
import '@/ai/flows/generate-first-aid-advice.ts';
import '@/ai/flows/predict-medicine-end-date.ts';
