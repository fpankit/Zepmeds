
'use server';
/**
 * @fileOverview A Genkit flow to delete all documents in the 'video_calls' collection.
 * This uses the Firebase Admin SDK for privileged access.
 */

import { ai } from '@/ai/dev';
import { z } from 'zod';
import { getFirestore } from 'firebase-admin/firestore';

const DeleteAllCallsOutputSchema = z.object({
  message: z.string().describe('A confirmation message indicating the result.'),
  deletedCount: z.number().describe('The number of documents deleted.'),
});

export type DeleteAllCallsOutput = z.infer<typeof DeleteAllCallsOutputSchema>;

// No input is needed for this flow
const deleteAllCallsFlow = ai.defineFlow(
  {
    name: 'deleteAllCallsFlow',
    inputSchema: z.void(),
    outputSchema: DeleteAllCallsOutputSchema,
  },
  async () => {
    const db = getFirestore();
    const collectionRef = db.collection('video_calls');
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
      return { message: 'No call records found to delete.', deletedCount: 0 };
    }

    // Use a batch write to delete all documents
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return {
      message: `Successfully deleted ${snapshot.size} call records.`,
      deletedCount: snapshot.size,
    };
  }
);

export async function deleteAllCalls(): Promise<DeleteAllCallsOutput> {
  return deleteAllCallsFlow();
}
