'use server';
import { config } from 'dotenv';
config({ path: '.env' });
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import firebase from '@genkit-ai/firebase';

// Load all available API keys from environment variables
const apiKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  "AIzaSyDr-Ji25jMJUzaklBi4j78B0mNF0CpcUNI",
  "AIzaSyAwOC8Txjp-gHTD32mXoUTBcxnvMf7YxKc",
  "AIzaSyDuaT-nBv_Bc1GawryHiKu1chlkpx_FAhY",
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
  process.env.GEMINI_API_KEY_6,
  process.env.GEMINI_API_KEY_7,
  process.env.GEMINI_API_KEY_8,
  process.env.GEMINI_API_KEY_9,
  process.env.GEMINI_API_KEY_10,
].filter((key): key is string => !!key); // Filter out any undefined keys

if (apiKeys.length === 0) {
    throw new Error("No Gemini API keys found in environment variables. Please set GEMINI_API_KEY_1, etc.");
}

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: apiKeys }),
    firebase,
  ],
  model: 'googleai/gemini-2.5-flash', 
  flowRetryPolicy: {
    maxAttempts: apiKeys.length + 1,
    backoff: {
      initialDelay: 1000,
      maxDelay: 10000,
      factor: 2,
    },
  },
});
