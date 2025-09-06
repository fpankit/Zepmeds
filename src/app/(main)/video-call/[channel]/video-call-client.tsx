
'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mic, MicOff, PhoneOff, Video, VideoOff, AlertTriangle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { useAgora } from '@/hooks/use-agora';
import { Skeleton } from '@/components/ui/skeleton';
import type { IAgoraRTCRemoteUser, ICameraVideoTrack } from 'agora-rtc-sdk-ng';

interface VideoCallClientProps {
  appId: string;
  channelName: string;
  token: string;
}

export function VideoCallClient({ appId, channelName, token }: VideoCallClientProps) {
  const router = useRouter();
  
  const {
    localVideoTrack,
    remoteUsers,
    join,
    leave,
    isJoined,
    isJoining,
    isAudioMuted,
    isVideoMuted,
    toggleAudio,
    toggleVideo,
  } = useAgora({ appId, channelName, token });

  const localPlayerRef = useRef<HTMLDivElement>(null);
  
  // Automatically join the call when the component mounts
  useEffect(() => {
    join();
    // Ensure to leave the call when the component unmounts
    return () => {
      leave();
    };
  }, [join, leave]);
  
  // Play the local video track when it becomes available
  useEffect(() => {
    if (localVideoTrack && localPlayerRef.current) {
        if (localPlayerRef.current.childElementCount === 0) {
            localVideoTrack.play(localPlayerRef.current);
        }
    }
    return () => {
      localVideoTrack?.stop();
    };
  }, [localVideoTrack]);

  const remoteUser = remoteUsers[0]; // Display the first remote user

  return (
    <div className="relative flex h-screen flex-col bg-black">
      {/* Remote Video (Doctor's View) */}
      <div className="flex-1 w-full h-full bg-gray-900 relative overflow-hidden">
        {remoteUser?.videoTrack ? (
          <RemotePlayer videoTrack={remoteUser.videoTrack} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            {isJoining ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="mt-4">Connecting to the call...</p>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="h-24 w-24 rounded-full bg-gray-700" />
                  <p className="mt-4">Waiting for the doctor to join...</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Local Video (Patient's View, Picture-in-Picture) */}
      {isJoined && (
        <div 
          ref={localPlayerRef} 
          className="absolute bottom-24 right-4 w-36 h-48 sm:w-48 sm:h-64 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700 shadow-lg z-10"
        >
          {isVideoMuted && (
            <div className="w-full h-full flex items-center justify-center bg-black">
              <VideoOff className="h-8 w-8 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4 p-4 bg-black/50 rounded-full z-20">
        <Button onClick={toggleAudio} size="icon" className={`rounded-full h-14 w-14 ${isAudioMuted ? 'bg-destructive' : 'bg-gray-700'}`}>
          {isAudioMuted ? <MicOff /> : <Mic />}
        </Button>
        <Button onClick={toggleVideo} size="icon" className={`rounded-full h-14 w-14 ${isVideoMuted ? 'bg-destructive' : 'bg-gray-700'}`}>
          {isVideoMuted ? <VideoOff /> : <Video />}
        </Button>
        <Button onClick={() => { leave(); router.push('/home'); }} size="icon" className="rounded-full bg-red-600 hover:bg-red-700 h-14 w-14">
          <PhoneOff />
        </Button>
      </div>
    </div>
  );
}


// A helper component to manage playing the remote video track
function RemotePlayer({ videoTrack }: { videoTrack: NonNullable<IAgoraRTCRemoteUser['videoTrack']> }) {
    const playerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (videoTrack && playerRef.current) {
            // Play the video track in the div
            videoTrack.play(playerRef.current);
        }

        return () => {
            // Stop the video track when the component unmounts
            videoTrack?.stop();
        };
    }, [videoTrack]);

    return <div ref={playerRef} className="w-full h-full"></div>;
}
