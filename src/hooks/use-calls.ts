
"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Call {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorImage: string;
  doctorSpecialty: string;
  status: 'calling' | 'accepted' | 'rejected' | 'unanswered' | 'completed' | 'cancelled';
  createdAt: any;
}

export const useCalls = (doctorId: string) => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!doctorId) {
        setIsLoading(false);
        setCalls([]);
        return;
    }

    console.log(`Setting up listener for doctorId: ${doctorId}`);

    const callsQuery = query(
      collection(db, 'calls'),
      where('doctorId', '==', doctorId)
    );

    const unsubscribe = onSnapshot(
      callsQuery,
      (querySnapshot) => {
        const callsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Call));
        // Manual sort on the client-side to avoid needing a composite index
        callsData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setCalls(callsData);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching calls:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
        console.log("Cleaning up calls listener.");
        unsubscribe();
    };
  }, [doctorId]);

  return { calls, isLoading, error };
};
