
'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { HMSPrebuilt } from '@100mslive/roomkit-react';

export function HundredMSVideoPlayer() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const callId = params.callId as string;
  const authToken = searchParams.get('token');
  
  const handleLeave = () => {
    if (callId) {
        const callDocRef = doc(db, 'calls', callId);
        updateDoc(callDocRef, { status: 'ended' });
    }
    router.push('/home');
  };

  if (!authToken || !user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'No video call token provided or user not logged in.',
      });
      router.push('/home');
      return (
         <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-900 text-white">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Authentication error. Redirecting...</p>
          </div>
      );
  }

  const userName = user.isDoctor ? user.name || 'Doctor' : `${user.firstName} ${user.lastName}`;

  return (
      <div style={{ height: '100vh' }}>
        <HMSPrebuilt
            roomCode="qoo-bvy-air"
            authToken={authToken}
            onLeave={handleLeave}
        />
    </div>
  )
}
