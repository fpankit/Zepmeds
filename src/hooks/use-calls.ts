
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  image: string;
  isOnline: boolean;
  dataAiHint?: string;
}

export interface Call {
    id: string;
    callerId: string;
    callerName: string;
    doctorId: string;
    receiverName: string;
    roomId: string;
    status: 'ringing' | 'active' | 'ended';
}


export const useCalls = () => {
    const { user } = useAuth();
    const [incomingCalls, setIncomingCalls] = useState<Call[]>([]);

    useEffect(() => {
        if (!user || !user.isDoctor || !user.isOnline) {
            setIncomingCalls([]);
            return;
        }

        const callsQuery = query(
            collection(db, "calls"),
            where("doctorId", "==", user.id),
            where("status", "==", "ringing")
        );

        const unsubscribe = onSnapshot(callsQuery, (querySnapshot) => {
            const calls = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Call));
            setIncomingCalls(calls);
        }, (error) => {
            console.error("Error listening for incoming calls: ", error);
        });

        return () => unsubscribe();
    }, [user]);

    return { incomingCalls };
};
