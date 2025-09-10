
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCalls } from '@/hooks/use-calls';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PhoneIncoming } from 'lucide-react';

export function IncomingCallManager() {
  const { user } = useAuth();
  const { incomingCalls } = useCalls();
  const router = useRouter();
  const { toast, dismiss } = useToast();

  useEffect(() => {
    // If there's an incoming call, show a persistent toast notification.
    if (incomingCalls.length > 0) {
      const call = incomingCalls[0];

      const acceptCall = async () => {
        // Mark the call as active so it's no longer 'ringing'
        await updateDoc(doc(db, 'calls', call.id), { status: 'active' });
        dismiss(); // Dismiss the toast
        // Navigate the doctor to the call page
        router.push(`/call?channel=${call.roomId}&doctorName=${encodeURIComponent(user?.firstName || 'Doctor')}&userName=${encodeURIComponent(call.callerName)}`);
      };

      const declineCall = async () => {
        // Delete the call document to signify rejection
        await deleteDoc(doc(db, 'calls', call.id));
        dismiss();
      };

      toast({
        title: (
            <div className="flex items-center gap-2 font-bold text-lg">
                <PhoneIncoming className="animate-pulse text-green-400" />
                Incoming Call
            </div>
        ),
        description: `Call from ${call.callerName}`,
        duration: Infinity, // Keep the toast open until dismissed
        action: (
          <div className="flex gap-2 mt-2">
            <Button onClick={declineCall} variant="destructive">Decline</Button>
            <Button onClick={acceptCall} className="bg-green-600 hover:bg-green-700">Accept</Button>
          </div>
        ),
      });
    } else {
      // If there are no incoming calls, dismiss any lingering call toasts.
      dismiss();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingCalls, router, user, toast, dismiss]);

  // This component doesn't render anything itself, it just manages the toast.
  return null;
}
