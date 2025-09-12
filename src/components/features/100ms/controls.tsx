
'use client';

import {
  useHMSActions,
  useHMSStore,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
} from '@100mslive/react-sdk';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Controls() {
  const hmsActions = useHMSActions();
  const router = useRouter();
  const isLocalAudioEnabled = useHMSStore(selectIsLocalAudioEnabled);
  const isLocalVideoEnabled = useHMSStore(selectIsLocalVideoEnabled);

  const toggleAudio = async () => {
    await hmsActions.setLocalAudioEnabled(!isLocalAudioEnabled);
  };

  const toggleVideo = async () => {
    await hmsActions.setLocalVideoEnabled(!isLocalVideoEnabled);
  };

  const leaveRoom = () => {
    hmsActions.leave();
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
