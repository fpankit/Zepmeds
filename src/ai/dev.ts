
/**
 * @fileOverview Central AI configuration for Genkit.
 *
 * This file initializes the AI plugin with a single, default API key.
 * Feature-specific error handling, such as fallbacks for quota issues,
 * is managed within the individual feature components that call the AI flows.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import * as fs from 'fs';
import * as path from 'path';

// Genkit configuration
export const ai = genkit({
  plugins: [
    googleAI({
      // Use a single default API key from environment variables.
      // This key is used for all AI calls unless overridden in a specific flow.
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
      apiVersion: 'v1', // THE FIX: Force the use of the v1 API
    }),
  ],
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

    } else {
        console.warn('Could not find Firebase service account file (zepmeds-admin-panel-firebase-adminsdk.json). Firebase Admin features will be disabled.');
    }
  }
} catch (e) {
  console.error('Firebase Admin SDK initialization failed:', e);
}


// Enable Firebase Telemetry for monitoring
enableFirebaseTelemetry();
