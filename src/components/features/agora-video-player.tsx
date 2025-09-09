
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IMicrophoneAudioTrack,
  ICameraVideoTrack,
} from 'agora-rtc-sdk-ng';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const APP_ID = 'c81aad68e25c42c8ade0e767a228bbc0';

export function AgoraVideoPlayer() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const channelName = params.channel as string;

  const client = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrack = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoTrack = useRef<ICameraVideoTrack | null>(null);
  
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);


  const leave = useCallback(async () => {
    if (localAudioTrack.current) {
        localAudioTrack.current.close();
        localAudioTrack.current = null;
    }
    if (localVideoTrack.current) {
        localVideoTrack.current.close();
        localVideoTrack.current = null;
    }

    if (client.current) {
        if(isJoined) {
          // Only unpublish if the user was successfully joined.
          await client.current.unpublish();
        }
        await client.current.leave();
    }
    setIsJoined(false);
    setRemoteUsers([]);
    router.push('/home');
  }, [router, isJoined]);


  const join = useCallback(async () => {
    if (!user || !channelName) {
      toast({ variant: 'destructive', title: "Missing Information", description: "User or channel not found." });
      return;
    }
    
    try {
      client.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

      const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        await client.current!.subscribe(user, mediaType);
        if (mediaType === 'video') {
            setRemoteUsers(Array.from(client.current!.remoteUsers));
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      };

      const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
        setRemoteUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
      };
      
      const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
          setRemoteUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
      };

      client.current.on('user-published', handleUserPublished);
      client.current.on('user-unpublished', handleUserUnpublished);
      client.current.on('user-left', handleUserLeft);
      
      const uid = user.isDoctor ? Number(user.id.replace(/\D/g, '').slice(0, 5)) : Math.floor(Math.random() * 20000);
      
      await client.current.join(APP_ID, channelName, null, uid);

      [localAudioTrack.current, localVideoTrack.current] = await AgoraRTC.createMicrophoneAndCameraTracks();

      await client.current.publish([localAudioTrack.current, localVideoTrack.current]);

      localVideoTrack.current.play('local-player');
      setIsJoined(true);
      
    } catch (error: any) {
      console.error('Agora join error:', error);
      toast({ variant: 'destructive', title: "Connection Failed", description: error.message });
    }
  }, [user, channelName, toast]);
  
  useEffect(() => {
    if (user && channelName) {
        join();
    }
    
    return () => {
      leave();
    };
  }, [user, channelName, join, leave]);
  

    const handleMicToggle = async () => {
        if (localAudioTrack.current) {
            await localAudioTrack.current.setMuted(micOn);
            setMic(!micOn);
        }
    };

    const handleCameraToggle = async () => {
         if (localVideoTrack.current) {
            await localVideoTrack.current.setMuted(cameraOn);
            setCamera(!cameraOn);
        }
    };
    
  return (
    <div className="flex h-screen w-full flex-col bg-gray-900 text-white">
      <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-700 px-4">
        <h1 className="font-semibold">Zepmeds Video Consultation</h1>
        <div className="text-sm text-gray-400">
          Status: <span className={cn(isJoined && 'text-green-400')}>{isJoined ? 'Connected' : 'Connecting...'}</span>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          <div className="relative flex-1 rounded-lg bg-black overflow-hidden">
             {remoteUsers.length > 0 ? (
                  remoteUsers.map(user => {
                      const RemotePlayer = () => {
                        const videoRef = useRef<HTMLDivElement>(null);
                        useEffect(() => {
                          if (videoRef.current && user.videoTrack) {
                            user.videoTrack.play(videoRef.current);
                          }
                          return () => {
                            user.videoTrack?.stop();
                          };
                        }, [user]);

                        return <div ref={videoRef} className="h-full w-full object-cover" />;
                      };
                      return <RemotePlayer key={user.uid}/>
                  })
              ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                     <p className="text-gray-300">Waiting for other user to join...</p>
                 </div>
              )}
            <div className="absolute bottom-4 right-4 h-32 w-48 rounded-lg border-2 border-gray-600 bg-black overflow-hidden">
              <div id="local-player" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </main>

      <footer className="flex h-20 flex-shrink-0 items-center justify-center gap-4 border-t border-gray-700 bg-gray-800">
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-12 w-12 rounded-full', micOn ? 'bg-gray-600' : 'bg-red-600')}
          onClick={handleMicToggle}
          disabled={!isJoined}
        >
          {micOn ? <Mic /> : <MicOff />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-12 w-12 rounded-full', cameraOn ? 'bg-gray-600' : 'bg-red-600')}
          onClick={handleCameraToggle}
          disabled={!isJoined}
        >
          {cameraOn ? <Video /> : <VideoOff />}
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="h-16 w-16 rounded-full"
          onClick={leave}
        >
          <Phone className="rotate-[135deg]" />
        </Button>
      </footer>
    </div>
  );
}
