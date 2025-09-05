
'use client';

import { useEffect, useRef, useState } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';

interface VideoCallClientProps {
  appId: string;
  channelName: string;
  token: string;
}

export function VideoCallClient({ appId, channelName, token }: VideoCallClientProps) {
  const router = useRouter();
  const client = useRef<IAgoraRTCClient | null>(null);
  const localTracks = useRef<{
    audioTrack: IMicrophoneAudioTrack | null;
    videoTrack: ICameraVideoTrack | null;
  }>({ audioTrack: null, videoTrack: null });
  const remoteUsers = useRef<IAgoraRTCRemoteUser[]>([]);
  const [, setForceRender] = useState(0);

  const [micMuted, setMicMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);

  useEffect(() => {
    if (!token) return;

    client.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

    const initAndJoin = async () => {
      try {
        await client.current?.join(appId, channelName, token, null);

        localTracks.current.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        localTracks.current.videoTrack = await AgoraRTC.createCameraVideoTrack();

        await client.current?.publish(Object.values(localTracks.current));

        localTracks.current.videoTrack.play('local-player');
        setForceRender(f => f + 1);

      } catch (error) {
        console.error('Failed to join channel:', error);
      }
    };

    initAndJoin();

    client.current.on('user-published', async (user, mediaType) => {
      await client.current?.subscribe(user, mediaType);
      if (mediaType === 'video') {
        remoteUsers.current.push(user);
        setForceRender(f => f + 1);
        // Defer playing to ensure the DOM element is ready
        setTimeout(() => user.videoTrack?.play(`remote-player-${user.uid}`), 0);
      }
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
    });
    
    client.current.on('user-unpublished', (user) => {
       // Logic to handle when a user unpublishes their stream
    });

    client.current.on('user-left', (user) => {
      remoteUsers.current = remoteUsers.current.filter((u) => u.uid !== user.uid);
      setForceRender(f => f + 1);
    });

    return () => {
      localTracks.current.audioTrack?.close();
      localTracks.current.videoTrack?.close();
      client.current?.leave();
    };
  }, [appId, channelName, token]);

  const handleLeave = async () => {
    router.push('/home');
  };

  const handleToggleMic = async () => {
    if (localTracks.current.audioTrack) {
      await localTracks.current.audioTrack.setMuted(!micMuted);
      setMicMuted(!micMuted);
    }
  };

  const handleToggleVideo = async () => {
    if (localTracks.current.videoTrack) {
      await localTracks.current.videoTrack.setMuted(!videoMuted);
      setVideoMuted(!videoMuted);
    }
  };

  return (
    <div className="relative flex h-screen flex-col items-center justify-center bg-black p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full">
         <Card id="local-player" className="bg-gray-800 w-full h-full rounded-lg overflow-hidden relative">
           <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-md text-sm">You</div>
         </Card>
        
        {remoteUsers.current.map((user) => (
          <Card key={user.uid} id={`remote-player-${user.uid}`} className="bg-gray-800 w-full h-full rounded-lg overflow-hidden relative">
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-md text-sm">Doctor</div>
          </Card>
        ))}
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
