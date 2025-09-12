
'use client';

import { useEffect } from 'react';
import {
  useHMSActions,
  useHMSStore,
  selectIsConnectedToRoom,
  selectPeers,
} from '@100mslive/react-sdk';
import { Conference } from '@/components/features/100ms/conference';
import { JoinForm } from '@/components/features/100ms/join-form';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function VideoCallContent({ roomId }: { roomId: string }) {
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const hmsActions = useHMSActions();
  const peers = useHMSStore(selectPeers);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      // Ensure cleanup happens on unmount
      if (isConnected) {
        hmsActions.leave();
      }
    };
  }, [hmsActions, isConnected]);

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading User...</p>
      </div>
    );
  }

  if (!user) {
    // This case should ideally not be hit if a guest user is created
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Initializing...</p>
        </div>
    );
  }

  return (
    <div className="h-screen bg-black flex items-center justify-center">
      {isConnected ? (
        <Conference peers={peers} />
      ) : (
        <JoinForm user={user} roomId={roomId} />
      )}
    </div>
  );
}
