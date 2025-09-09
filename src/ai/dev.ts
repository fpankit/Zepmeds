
'use server';
import { config } from 'dotenv';
config();
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
  model: 'googleai/gemini-2.5-flash',
});

import '@/ai/flows/generate-prescription-summary.ts';
import '@/ai/flows/translate-text.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/ai-symptom-checker.ts';
import '@/ai/flows/echo-doc-flow.ts';
import '@/ai/flows/detect-language.ts';
import '@/ai/flows/generate-first-aid-advice.ts';
