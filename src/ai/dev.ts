
import { config } from 'dotenv';
config();
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});

import '@/ai/flows/ai-symptom-checker.ts';
import '@/ai/flows/generate-prescription-summary.ts';
import '@/ai/flows/echo-doc-flow.ts';
