
'use client';

import { useEffect, useState } from 'react';
import {
  useHMSStore,
  selectIsConnectedToRoom,
  HMSRoomProvider,
} from '@100mslive/react-sdk';
import { Conference, Captions } from '@/components/features/100ms/conference';
import { JoinForm } from '@/components/features/100ms/join-form';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useParams } from 'next/navigation'; // Import useParams

// This is the inner component that uses the hooks
function VideoCallInnerContent() {
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const { user, loading: authLoading } = useAuth();
  const params = useParams(); // Get the dynamic route parameter
  const appointmentId = params.id as string; // Extract the appointment ID
  
  const [captions, setCaptions] = useState<Captions>({ original: '', translated: '' });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (captions.translated) {
        // Clear captions after 5 seconds of inactivity
        timer = setTimeout(() => {
            setCaptions({ original: '', translated: '' });
        }, 5000);
    }
    return () => clearTimeout(timer);
  }, [captions]);


  if (authLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Initializing User...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex items-center justify-center">
      {isConnected ? (
        <Conference captions={captions} setCaptions={setCaptions} />
      ) : (
        // Pass the appointmentId to the JoinForm
        <JoinForm user={user} appointmentId={appointmentId} />
      )}
    </div>
  );
}

// This is the new wrapper component
export function VideoCallContent() {
  // Wrap the functionality with the provider only on this page
  return (
    <HMSRoomProvider>
      <VideoCallInnerContent />
    </HMSRoomProvider>
  );
}
