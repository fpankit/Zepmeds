
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import * as fs from 'fs';
import * as path from 'path';

// Define named models for each AI feature, allowing for separate API keys.
const symptomCheckerModel = googleAI.model('gemini-1.5-flash', {
    name: 'symptom-checker',
    config: { apiKey: process.env.GOOGLE_GENAI_API_KEY_CHECKER || process.env.GOOGLE_GENAI_API_KEY }
});
const healthReportModel = googleAI.model('gemini-1.5-flash', {
    name: 'health-report',
    config: { apiKey: process.env.GOOGLE_GENAI_API_KEY_REPORT || process.env.GOOGLE_GENAI_API_KEY }
});
const firstAidModel = googleAI.model('gemini-1.5-flash', {
    name: 'first-aid',
    config: { apiKey: process.env.GOOGLE_GENAI_API_KEY_FIRSTAID || process.env.GOOGLE_GENAI_API_KEY }
});
const translationModel = googleAI.model('gemini-1.5-flash', {
    name: 'translation',
    config: { apiKey: process.env.GOOGLE_GENAI_API_KEY_TRANSLATE || process.env.GOOGLE_GENAI_API_KEY }
});
const medicineValidationModel = googleAI.model('gemini-1.5-flash', {
    name: 'medicine-validation',
    config: { apiKey: process.env.GOOGLE_GENAI_API_KEY_MEDICINE || process.env.GOOGLE_GENAI_API_KEY }
});


// Genkit configuration
export const ai = genkit({
  plugins: [
    googleAI({
        // This default key will be used if a feature-specific key is not set.
        apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  telemetry: {
    // Basic telemetry, no complex retry logic.
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
