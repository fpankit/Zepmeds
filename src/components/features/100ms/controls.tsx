
'use client';

import {
  useHMSActions,
  useHMSStore,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  selectRoom,
} from '@100mslive/react-sdk';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';

export function Controls() {
  const hmsActions = useHMSActions();
  const router = useRouter();
  const room = useHMSStore(selectRoom);
  const { user } = useAuth();
  const isLocalAudioEnabled = useHMSStore(selectIsLocalAudioEnabled);
  const isLocalVideoEnabled = useHMSStore(selectIsLocalVideoEnabled);

  const toggleAudio = async () => {
    await hmsActions.setLocalAudioEnabled(!isLocalAudioEnabled);
  };

  const toggleVideo = async () => {
    await hmsActions.setLocalVideoEnabled(!isLocalVideoEnabled);
  };

  const leaveRoom = async () => {
    if (room && room.name && user && !user.isDoctor) {
      try {
        const callId = room.name;
        const callDocRef = doc(db, 'video_calls', callId);
        await updateDoc(callDocRef, { status: 'completed' });
      } catch (error) {
        // This can happen in a race condition if the doctor side cleans up the doc first.
        // It's safe to ignore, as the primary goal is leaving the room.
        console.warn("Could not update call status to completed (document might already be deleted):", error);
      }
    }
    
    await hmsActions.leave();
    router.push('/home');
  };

  return (
    <div className="bg-black/50 p-4">
      <div className="flex items-center justify-center gap-4">
        <Button onClick={toggleAudio} size="icon" className={`h-14 w-14 rounded-full ${isLocalAudioEnabled ? 'bg-gray-600' : 'bg-red-600'}`}>
          {isLocalAudioEnabled ? <Mic /> : <MicOff />}
        </Button>
        <Button onClick={toggleVideo} size="icon" className={`h-14 w-14 rounded-full ${isLocalVideoEnabled ? 'bg-gray-600' : 'bg-red-600'}`}>
          {isLocalVideoEnabled ? <Video /> : <VideoOff />}
        </Button>
        <Button onClick={leaveRoom} variant="destructive" size="icon" className="h-14 w-14 rounded-full">
          <PhoneOff />
        </Button>
      </div>
    </div>
  );
}
