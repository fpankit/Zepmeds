
import { config } from 'dotenv';
config({ path: '.env' });

// ✅ Correct Genkit + plugins imports
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// ✅ Genkit configuration
export const ai = genkit({
  plugins: [
    googleAI(),     // Reads GOOGLE_GENAI_API_KEY from .env
  ],
  model: 'googleai/gemini-1.5-flash',
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

// Initialize Firebase Admin SDK once
try {
  if (!getApps().length) {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.warn('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Firebase Admin features will be disabled.');
    } else if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
      console.warn('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET environment variable is not set. Firebase Storage features will be disabled.');
    } else {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        initializeApp({
          credential: cert(serviceAccount),
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
        console.log("Firebase Admin SDK initialized successfully.");
    }
  }
} catch (e) {
  console.error('Firebase Admin SDK initialization failed:', e);
}


// Enable Firebase Telemetry for monitoring
enableFirebaseTelemetry();
