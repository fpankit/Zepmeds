
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useCalls, Call } from '@/hooks/use-calls';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff } from 'lucide-react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function CallNotificationHandler() {
  const { incomingCalls } = useCalls();
  const { toast, dismiss } = useToast();
  const router = useRouter();

  useEffect(() => {
    // When there are incoming calls, show a toast for the first one.
    if (incomingCalls.length > 0) {
      const call = incomingCalls[0];
      const { id: toastId } = toast({
        title: "Incoming Video Call",
        description: `Call from ${call.callerName}`,
        duration: Infinity, // Persist until dismissed
        action: (
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDecline(call)}
            >
              <PhoneOff className="mr-2 h-4 w-4" />
              Decline
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600"
              size="sm"
              onClick={() => handleAccept(call)}
            >
              <Phone className="mr-2 h-4 w-4" />
              Accept
            </Button>
          </div>
        ),
      });

      // Cleanup: dismiss the toast if the call is no longer 'calling'
      return () => dismiss(toastId);
    } else {
        // If there are no more ringing calls, dismiss all toasts
        dismiss();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingCalls, dismiss, router, toast]);

  const handleAccept = async (call: Call) => {
    try {
        const callDocRef = doc(db, 'calls', call.id);
        // Update status to prevent other doctors from accepting
        await updateDoc(callDocRef, { status: 'connecting' }); 
        dismiss(); // Close the toast
        router.push(`/video-call/${call.id}`);
    } catch (error) {
        console.error("Error accepting call:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not accept the call. Please try again.'
        });
    }
  };

  const handleDecline = async (call: Call) => {
     try {
        const callDocRef = doc(db, 'calls', call.id);
        await updateDoc(callDocRef, { status: 'ended' });
        dismiss(); // Close the toast
    } catch (error) {
        console.error("Error declining call:", error);
         toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not decline the call.'
        });
    }
  };

  return null; // This component doesn't render anything itself
}
