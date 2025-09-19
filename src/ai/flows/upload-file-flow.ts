'use server';
/**
 * @fileOverview A server-side flow to upload a file to Firebase Storage.
 *
 * This flow takes a Base64 data URI, converts it to a buffer, and uploads it
 * to Firebase Storage using the Firebase Admin SDK. This bypasses client-side
 * CORS restrictions.
 */

import { config } from 'dotenv';
config({ path: '.env' });

import { ai } from '@/ai/dev';
import { z } from 'zod';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { v4 as uuidv4 } from 'uuid';

// Initialize Firebase Admin SDK
// This should only run once.
try {
  if (!getApps().length) {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
    }
    if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
        throw new Error('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET environment variable is not set.');
    }
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }
} catch (e) {
  console.error('Firebase Admin SDK initialization failed:', e);
}


const UploadFileInputSchema = z.object({
  dataUri: z.string().describe("The file encoded as a Base64 data URI."),
  userId: z.string().describe("The ID of the user uploading the file."),
});
export type UploadFileInput = z.infer<typeof UploadFileInputSchema>;

const UploadFileOutputSchema = z.object({
  downloadUrl: z.string().describe("The public URL of the uploaded file."),
});
export type UploadFileOutput = z.infer<typeof UploadFileOutputSchema>;


export const uploadFileFlow = ai.defineFlow(
  {
    name: 'uploadFileFlow',
    inputSchema: UploadFileInputSchema,
    outputSchema: UploadFileOutputSchema,
  },
  async (input) => {
    try {
        const bucket = getStorage().bucket();
        const fileExtension = input.dataUri.substring(input.dataUri.indexOf('/') + 1, input.dataUri.indexOf(';'));
        const fileName = `symptom-images/${input.userId}/${uuidv4()}.${fileExtension}`;
        const file = bucket.file(fileName);

        // Extract the Base64 part of the data URI
        const base64EncodedString = input.dataUri.substring(input.dataUri.indexOf(',') + 1);
        const buffer = Buffer.from(base64EncodedString, 'base64');
        
        await file.save(buffer, {
            metadata: {
                contentType: `image/${fileExtension}`,
            },
        });

        // Make the file public and get the URL
        await file.makePublic();
        const downloadUrl = file.publicUrl();

        return { downloadUrl };

    } catch (error) {
        console.error('Firebase Admin Storage upload error:', error);
        throw new Error('Failed to upload file to Firebase Storage.');
    }
  }
);
