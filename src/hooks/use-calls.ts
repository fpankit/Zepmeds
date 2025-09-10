
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

        // The video call feature is disabled, so this will not fetch any calls.
        // Keeping the hook structure to avoid breaking imports.
        const unsubscribe = () => {};

        return () => unsubscribe();
    }, [user]);

    return { incomingCalls };
};
