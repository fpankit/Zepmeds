'use client';

import { useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { Phone, PhoneOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AppointmentCall {
  id: string;
  patientName: string;
}

export function IncomingCallManager() {
  const { user } = useAuth();
  const { toast, dismiss } = useToast();
  const router = useRouter();

  const handleAccept = (call: AppointmentCall) => {
    // Update the status to 'accepted' to stop the ringing notification for other devices
    const callDocRef = doc(db, 'zep_calls', call.id);
    updateDoc(callDocRef, { status: 'accepted' });
    
    // Navigate to the call room
    router.push(`/call/${call.id}`);
    dismiss();
  };

  const handleDecline = (callId: string) => {
    const callDocRef = doc(db, 'zep_calls', callId);
    // Set status to 'declined'
    updateDoc(callDocRef, { status: 'declined' });
    dismiss();
  };

  const showCallNotification = useCallback((call: AppointmentCall) => {
    toast({
      title: `Incoming Call from ${call.patientName}`,
      description: 'A patient is trying to reach you for a video consultation.',
      duration: 60000, // Keep the toast open for 60 seconds
      action: (
        <div className="flex gap-2 mt-2">
          <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => handleDecline(call.id)}>
             <PhoneOff className="mr-2 h-4 w-4"/> Decline
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAccept(call)}>
            <Phone className="mr-2 h-4 w-4"/> Accept
          </Button>
        </div>
      ),
    });
  }, [toast, router, dismiss]);

  useEffect(() => {
    // Only listen for calls if the user is a doctor and is online
    if (!user || !user.isDoctor || !user.isOnline) {
      return;
    }

    const q = query(
      collection(db, 'zep_calls'),
      where('doctorId', '==', user.id),
      where('status', '==', 'ringing')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') { // Only react to new calls
          const callData = { id: change.doc.id, ...change.doc.data() } as AppointmentCall;
          showCallNotification(callData);
        }
      });
    });

    return () => unsubscribe();
  }, [user, showCallNotification]);

  return null; // This component does not render anything itself
}
