
'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgora } from '@/hooks/use-agora';
import type { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';

interface VideoCallClientProps {
  appId: string;
  channelName: string;
  token: string;
}

export function VideoCallClient({ appId, channelName, token }: VideoCallClientProps) {
  const router = useRouter();
  const [micMuted, setMicMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  
  const {
    localVideoTrack,
    remoteUsers,
    join,
    leave,
    isJoined,
    toggleAudio,
    toggleVideo,
  } = useAgora({ appId, channelName, token });

  const localPlayerRef = useRef<HTMLDivElement>(null);
  const remotePlayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    join();
    return () => {
      leave();
    };
  }, [join, leave]);
  
  useEffect(() => {
    if (localVideoTrack && localPlayerRef.current) {
      localVideoTrack.play(localPlayerRef.current);
    }
    return () => {
      localVideoTrack?.stop();
    };
  }, [localVideoTrack]);

  const remoteUser = remoteUsers.length > 0 ? remoteUsers[0] : null;

  useEffect(() => {
    if (remoteUser && remoteUser.videoTrack && remotePlayerRef.current) {
        remoteUser.videoTrack.play(remotePlayerRef.current);
    }

    return () => {
        remoteUser?.videoTrack?.stop();
    }
  }, [remoteUser]);


  const handleLeave = () => {
    leave();
    router.push('/home');
  };

  const handleToggleMic = async () => {
    await toggleAudio();
    setMicMuted((prev) => !prev);
  };

  const handleToggleVideo = async () => {
    await toggleVideo();
    setVideoMuted((prev) => !prev);
  };

  if (!isJoined) {
    return (
      <div className="relative flex h-screen flex-col items-center justify-center bg-black p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full">
          <Skeleton className="bg-gray-800 w-full h-full rounded-lg" />
          <Skeleton className="bg-gray-800 w-full h-full rounded-lg" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-lg">
          Connecting to call...
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative flex h-screen flex-col items-center justify-center bg-black p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full">
        <Card ref={localPlayerRef} id="local-player" className="bg-gray-800 w-full h-full rounded-lg overflow-hidden relative">
           <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-md text-sm">You</div>
        </Card>

        {remoteUser ? (
           <Card ref={remotePlayerRef} id={`remote-player-${remoteUser.uid}`} className="bg-gray-800 w-full h-full rounded-lg overflow-hidden relative">
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-md text-sm">Doctor</div>
           </Card>
        ) : (
          <Card className="bg-gray-800 w-full h-full rounded-lg overflow-hidden relative flex flex-col items-center justify-center">
            <Skeleton className="h-24 w-24 rounded-full bg-gray-700" />
            <p className="mt-4 text-white">Waiting for the doctor to join...</p>
          </Card>
        )}
      </div>

      <div className="absolute bottom-8 flex items-center justify-center gap-4">
        <Button onClick={handleToggleMic} size="icon" className={`rounded-full h-14 w-14 ${micMuted ? 'bg-destructive' : 'bg-gray-700'}`}>
          {micMuted ? <MicOff /> : <Mic />}
        </Button>
        <Button onClick={handleToggleVideo} size="icon" className={`rounded-full h-14 w-14 ${videoMuted ? 'bg-destructive' : 'bg-gray-700'}`}>
          {videoMuted ? <VideoOff /> : <Video />}
        </Button>
        <Button onClick={handleLeave} size="icon" className="rounded-full bg-red-600 hover:bg-red-700 h-14 w-14">
          <PhoneOff />
        </Button>
      </div>
    </div>
  );
}
