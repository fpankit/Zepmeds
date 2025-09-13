
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

// Create a Google AI plugin for each key
const googleAIPlugins = apiKeys.map((apiKey, index) => 
    googleAI({ 
        apiKey,
        // Optional: you can give each client a name for better tracing
        // clientName: `google-ai-key-${index + 1}`
    })
);

export const ai = genkit({
  plugins: [
    ...googleAIPlugins,
    firebase({
      enableTracing: true,
    }),
  ],
  // The model name remains the same, Genkit will round-robin through the plugins
  model: 'googleai/gemini-2.5-flash', 
  // Add a retry policy. If a request fails (e.g., due to quota on one key),
  // this policy will retry the flow. Genkit's load balancing will then
  // likely use the next available plugin/key.
  flowRetryPolicy: {
    maxAttempts: apiKeys.length + 1, // Allow enough attempts to cycle through keys
    backoff: {
      initialDelay: 1000, // 1 second
      maxDelay: 10000,    // 10 seconds
      factor: 2,
    },
  },
});
