
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import * as fs from 'fs';
import * as path from 'path';

// Load all Google API keys from environment variables
const apiKeys: string[] = [];
if (process.env.GOOGLE_GENAI_API_KEY) {
  apiKeys.push(process.env.GOOGLE_GENAI_API_KEY);
}
// Add any additional keys
Object.keys(process.env).forEach(key => {
  if (key.startsWith('GOOGLE_API_KEY_') && process.env[key]) {
    apiKeys.push(process.env[key]!);
  }
});

let currentKeyIndex = 0;

// This function provides a new key every time it's called, rotating through the list.
// The errorHandler below will trigger retries, which will then call this function again.
const keyProvider = async (): Promise<string> => {
    if (apiKeys.length === 0) {
        throw new Error('No valid API keys found. Please check your .env file for GOOGLE_GENAI_API_KEY or GOOGLE_API_KEY_...');
    }
    const keyToReturn = apiKeys[currentKeyIndex];
    
    // This console log helps in debugging which key is currently being used.
    console.log(`Using API key index: ${currentKeyIndex}`);
    
    // The key index is advanced here, but it will only be used on the next retry.
    currentKeyIndex = (currentKeyIndex + 1);
    
    return keyToReturn;
};

const keyRotationErrorHandler = (err: any) => {
    // Check if the error is a 429 "Too Many Requests" (rate limit) error.
    if (err.isQuotaError && currentKeyIndex < apiKeys.length) {
        console.warn(`API key failed due to rate limit. Attempting to rotate to the next key.`);
        // Signal to Genkit that this error is retryable.
        return { retry: true };
    }
    // For all other errors, or if we've run out of keys, let the error propagate.
    return { retry: false };
}


// Genkit configuration
export const ai = genkit({
  plugins: [
    googleAI({
        apiKey: keyProvider,
        errorHandler: keyRotationErrorHandler,
    }),
  ],
  model: 'googleai/gemini-1.5-flash',
  telemetry: {
    instrumentation: {
      flowRetryPolicy: {
        maxAttempts: apiKeys.length > 0 ? apiKeys.length : 1, // Retry as many times as there are keys
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
    const serviceAccountPath = path.resolve(process.cwd(), 'zepmeds-admin-panel-firebase-adminsdk.json');
    
    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        
        if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
          console.warn('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET environment variable is not set. Firebase Storage features will be disabled.');
        } else {
            initializeApp({
                credential: cert(serviceAccount),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
            console.log("Firebase Admin SDK initialized successfully from service account file.");
        }

    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        // Fallback to environment variable if the file doesn't exist
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
            console.warn('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET environment variable is not set. Firebase Storage features will be disabled.');
        } else {
            initializeApp({
              credential: cert(serviceAccount),
              storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
            console.log("Firebase Admin SDK initialized successfully from environment variable.");
        }
    } else {
        console.warn('Could not find Firebase service account file or environment variable. Firebase Admin features will be disabled.');
    }
  }
} catch (e) {
  console.error('Firebase Admin SDK initialization failed:', e);
}


// Enable Firebase Telemetry for monitoring
enableFirebaseTelemetry();
