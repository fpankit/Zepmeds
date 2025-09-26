
import { genkit, ToolDefinition } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import * as fs from 'fs';
import * as path from 'path';


// Genkit configuration
export const ai = genkit({
  plugins: [
    googleAI({
      // This dynamic API key resolver is the FIX.
      // It checks which AI tool (prompt) is being run and returns the appropriate API key.
      apiKey: async (tool?: ToolDefinition): Promise<string | undefined> => {
        switch (tool?.name) {
          case 'aiSymptomCheckerPrompt':
            return process.env.GOOGLE_GENAI_API_KEY_CHECKER || process.env.GOOGLE_GENAI_API_KEY;
          case 'healthReportPrompt':
            return process.env.GOOGLE_GENAI_API_KEY_REPORT || process.env.GOOGLE_GENAI_API_KEY;
          case 'simplifyFirstAidPrompt':
            return process.env.GOOGLE_GENAI_API_KEY_FIRSTAID || process.env.GOOGLE_GENAI_API_KEY;
          case 'liveTranslateFlow': // Note: Matches the flow name, might need adjustment if prompt name is different
            return process.env.GOOGLE_GENAI_API_KEY_TRANSLATE || process.env.GOOGLE_GENAI_API_KEY;
          default:
            // Fallback to the default key for any other case (e.g., Urgent Medicine, etc.)
            return process.env.GOOGLE_GENAI_API_KEY;
        }
      },
      telemetry: {
        instrumentation: {
          // This is a global error handler for all AI calls made with this plugin
          async run(span, fn) {
            try {
              return await fn();
            } catch (err: any) {
              const errorMessage = err.message || '';
              const isQuotaError = errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota');

              if (isQuotaError) {
                // Intercept the quota error and throw a more user-friendly one.
                // This will be caught by the UI and displayed in a toast.
                throw new Error(
                  'AI service is busy due to high traffic. Please try again after some time.'
                );
              }
              
              // For any other error, re-throw it as is.
              throw err;
            }
          },
        },
      }
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
