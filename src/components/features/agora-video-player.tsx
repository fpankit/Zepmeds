
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IMicrophoneAudioTrack,
  ICameraVideoTrack,
  AgoraRTCError,
} from 'agora-rtc-sdk-ng';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Phone, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

const APP_ID = 'e946e4b051444cc9988aa908a8f3c9de';

// This functional component renders the remote user's video stream.
const RemotePlayer = ({ user }: { user: IAgoraRTCRemoteUser }) => {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoRef.current && user.hasVideo) {
      user.videoTrack?.play(videoRef.current);
    }
    return () => {
      user.videoTrack?.stop();
    };
  }, [user]);

  return <div ref={videoRef} className="h-full w-full object-cover" />;
};


export function AgoraVideoPlayer() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const channelName = params.channel as string;

  const client = useRef<IAgoraRTCClient | null>(null);
  const localTracks = useRef<{ audio: IMicrophoneAudioTrack | null; video: ICameraVideoTrack | null }>({
    audio: null,
    video: null,
  });
  
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [isMicOn, setMicOn] = useState(true);
  const [isCameraOn, setCameraOn] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  
  const leave = useCallback(async () => {
      if (isLeaving) return;
      setIsLeaving(true);

      // Stop and close local tracks
      if (localTracks.current.audio) {
          localTracks.current.audio.stop();
          localTracks.current.audio.close();
          localTracks.current.audio = null;
      }
      if (localTracks.current.video) {
          localTracks.current.video.stop();
          localTracks.current.video.close();
          localTracks.current.video = null;
      }

      // Leave the channel
      if (client.current && client.current.connectionState === 'CONNECTED') {
          await client.current.leave();
      }
      
      setRemoteUsers([]);
      setIsConnecting(true);
      router.push('/home');
  }, [router, isLeaving]);


  useEffect(() => {
    if (!user || !channelName || client.current) {
        return;
    }
    
    // Initialize the client once
    client.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    const agoraClient = client.current;

    const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        await agoraClient.subscribe(user, mediaType);
        setRemoteUsers(Array.from(agoraClient.remoteUsers));
         if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
    };

    const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
        setRemoteUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
    };

    const joinChannel = async () => {
        try {
            agoraClient.on('user-published', handleUserPublished);
            agoraClient.on('user-left', handleUserLeft);

            const uid = user.isDoctor ? Number(user.id.replace(/\D/g, '').slice(0, 5)) : Math.floor(Math.random() * 20000);
            
            await agoraClient.join(APP_ID, channelName, null, uid);

            const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
            localTracks.current.audio = audioTrack;
            localTracks.current.video = videoTrack;
            
            await agoraClient.publish([audioTrack, videoTrack]);
            
            videoTrack.play('local-player');
            setIsConnecting(false);

        } catch (error) {
            console.error('Agora join error:', error);
            if (error instanceof AgoraRTCError && error.code !== 'OPERATION_ABORTED') {
                 toast({ variant: 'destructive', title: "Connection Failed", description: error.message });
            }
            // In case of error, attempt a clean leave to reset state
            await leave();
        }
    };

    joinChannel();

    return () => {
        leave();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, channelName, toast]);
  

    const handleMicToggle = async () => {
        if (localTracks.current.audio) {
            await localTracks.current.audio.setMuted(!isMicOn);
            setMicOn(!isMicOn);
        }
    };

    const handleCameraToggle = async () => {
         if (localTracks.current.video) {
            await localTracks.current.video.setMuted(!isCameraOn);
            setCameraOn(!isCameraOn);
        }
    };
    
  return (
    <div className="flex h-screen w-full flex-col bg-gray-900 text-white">
      <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-700 px-4">
        <h1 className="font-semibold">Zepmeds Video Consultation</h1>
        <div className="text-sm text-gray-400">
          Status: <span className={cn(!isConnecting && 'text-green-400')}>{isConnecting ? 'Connecting...' : 'Connected'}</span>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:flex-row">
        <div className="relative flex-1 rounded-lg bg-black overflow-hidden">
            {isConnecting ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                     <Loader2 className="h-8 w-8 animate-spin" />
                 </div>
            ) : remoteUsers.length > 0 ? (
                  remoteUsers.map(user => <RemotePlayer key={user.uid} user={user} />)
              ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                     <p className="text-gray-300">Waiting for other user to join...</p>
                 </div>
              )}
            <div className="absolute bottom-4 right-4 h-32 w-48 rounded-lg border-2 border-gray-600 bg-black overflow-hidden z-10">
              <div id="local-player" className="h-full w-full object-cover" />
               {!isCameraOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <VideoOff className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
        </div>
      </main>

      <footer className="flex h-20 flex-shrink-0 items-center justify-center gap-4 border-t border-gray-700 bg-gray-800">
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-12 w-12 rounded-full', isMicOn ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700')}
          onClick={handleMicToggle}
          disabled={isConnecting}
        >
          {isMicOn ? <Mic /> : <MicOff />}
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="h-16 w-16 rounded-full"
          onClick={leave}
          disabled={isLeaving}
        >
           {isLeaving ? <Loader2 className="animate-spin"/> : <Phone className="rotate-[135deg]" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-12 w-12 rounded-full', isCameraOn ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700')}
          onClick={handleCameraToggle}
          disabled={isConnecting}
        >
          {isCameraOn ? <Video /> : <VideoOff />}
        </Button>
      </footer>
    </div>
  );
}
