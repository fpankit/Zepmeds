
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

export function VideoCallContent({ roomId }: { roomId: string }) {
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const hmsActions = useHMSActions();
  const peers = useHMSStore(selectPeers);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // This effect handles leaving the room when the component unmounts.
    return () => {
      // Check if we are connected before trying to leave.
      if (hmsActions.leave && isConnected) {
        hmsActions.leave();
      }
    };
  }, [hmsActions, isConnected]);

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
        <Conference peers={peers} />
      ) : (
        <JoinForm user={user} roomId={roomId} />
      )}
    </div>
  );
}
