'use server';
/**
 * @fileOverview This file defines a Genkit flow for deleting all video call records from Firestore.
 */

import { ai } from '@/ai/dev';
import { z } from 'zod';
import { getFirestore } from 'firebase-admin/firestore';
import { firebase } from '@genkit-ai/firebase';

const DeleteAllCallsOutputSchema = z.object({
  message: z.string().describe('A confirmation message indicating the result of the operation.'),
});
type DeleteAllCallsOutput = z.infer<typeof DeleteAllCallsOutputSchema>;

// This is the main function that will be called from the UI.
export async function deleteAllCalls(): Promise<DeleteAllCallsOutput> {
  return deleteAllCallsFlow();
}

const deleteAllCallsFlow = ai.defineFlow(
  {
    name: 'deleteAllCallsFlow',
    inputSchema: z.void(),
    outputSchema: DeleteAllCallsOutputSchema,
  },
  async () => {
    // This flow needs elevated privileges to delete data, so we run it with a service account.
    await firebase.withServiceAccount();
    
    const db = getFirestore();
    const callsCollection = db.collection('video_calls');
    const snapshot = await callsCollection.get();

    if (snapshot.empty) {
      return { message: 'No call records found to delete.' };
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return { message: `Successfully deleted ${snapshot.size} call records.` };
  }
);
