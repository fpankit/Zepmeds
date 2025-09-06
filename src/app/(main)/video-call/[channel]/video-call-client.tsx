
'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mic, MicOff, PhoneOff, Video, VideoOff, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgora } from '@/hooks/use-agora';

interface VideoCallClientProps {
  appId: string;
  channelName: string;
  token: string;
}

export function VideoCallClient({ appId, channelName, token }: VideoCallClientProps) {
  const router = useRouter();
  const [micMuted, setMicMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isPermissionChecked, setIsPermissionChecked] = useState(false);
  
  const {
    localVideoTrack,
    remoteUsers,
    join,
    leave,
    isJoined,
    toggleAudio,
    toggleVideo,
    isLoading: isConnecting,
  } = useAgora({ appId, channelName, token });

  const localPlayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach(track => track.stop());
        setHasPermission(true);
      } catch (error) {
        console.error('Error getting media permissions:', error);
        setHasPermission(false);
      } finally {
        setIsPermissionChecked(true);
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    if (hasPermission && !isJoined && !isConnecting) {
      join();
    }
    return () => {
      if (isJoined) {
        leave();
      }
    };
  }, [hasPermission, join, leave, isJoined, isConnecting]);
  
  useEffect(() => {
    if (localVideoTrack && localPlayerRef.current) {
      localVideoTrack.play(localPlayerRef.current);
    }
    return () => {
      localVideoTrack?.stop();
    };
  }, [localVideoTrack]);

  const remoteUser = remoteUsers.length > 0 ? remoteUsers[0] : null;
  const remotePlayerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (remoteUser?.videoTrack && remotePlayerRef.current) {
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

  if (!isPermissionChecked) {
    return (
      <div className="relative flex h-screen flex-col items-center justify-center bg-black p-4">
        <div className="text-white text-lg">Requesting permissions...</div>
      </div>
    );
  }

  if (!hasPermission) {
     return (
      <div className="relative flex h-screen flex-col items-center justify-center bg-black p-4">
        <Card className="max-w-md p-6">
           <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Camera & Microphone Access Denied</AlertTitle>
              <AlertDescription>
                This feature requires camera and microphone access. Please enable permissions in your browser settings to continue.
              </AlertDescription>
            </Alert>
            <Button onClick={() => router.push('/home')} className="mt-4 w-full">Go Back</Button>
        </Card>
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
           <div ref={remotePlayerRef} id={`remote-player-${remoteUser.uid}`} className="bg-gray-800 w-full h-full rounded-lg overflow-hidden relative">
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-md text-sm">Doctor</div>
           </div>
        ) : (
          <Card className="bg-gray-800 w-full h-full rounded-lg overflow-hidden relative flex flex-col items-center justify-center">
            {isConnecting || !isJoined ? (
                 <>
                    <Skeleton className="h-24 w-24 rounded-full bg-gray-700 animate-pulse" />
                    <p className="mt-4 text-white">Connecting to the call...</p>
                 </>
            ) : (
                 <>
                    <Skeleton className="h-24 w-24 rounded-full bg-gray-700" />
                    <p className="mt-4 text-white">Waiting for the doctor to join...</p>
                 </>
            )}
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
