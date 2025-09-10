

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, IAgoraRTCRemoteUser, ILocalVideoTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, PhoneOff, Video, VideoOff, Loader2 } from 'lucide-react';

const agoraAppId = "5bbb95c735a84da6af004432f4ced817";

// Dedicated component to handle playing a local video track
const LocalVideoPlayer = ({ videoTrack }: { videoTrack: ILocalVideoTrack | null }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const currentRef = ref.current;
        if (currentRef && videoTrack) {
            videoTrack.play(currentRef);
        }
        return () => {
            videoTrack?.stop();
        };
    }, [videoTrack]);

    return <div ref={ref} className="h-full w-full bg-black"></div>;
};

// Dedicated component to handle playing a remote video track
const RemoteVideoPlayer = ({ videoTrack }: { videoTrack: IRemoteVideoTrack | null }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const currentRef = ref.current;
        if (currentRef && videoTrack) {
            videoTrack.play(currentRef);
        }
        return () => {
            videoTrack?.stop();
        };
    }, [videoTrack]);

    return <div ref={ref} className="h-full w-full bg-black"></div>;
};

export function VideoCallContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    
    const client = useRef<IAgoraRTCClient | null>(null);
    
    const [channelName] = useState(searchParams.get('channel') || 'default_channel');
    const [doctorName] = useState(searchParams.get('doctorName') || 'Doctor');
    
    const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
    const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
    const [remoteVideoTrack, setRemoteVideoTrack] = useState<IRemoteVideoTrack | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        client.current = agoraClient;
        
        let tracks: [IMicrophoneAudioTrack, ICameraVideoTrack] | null = null;

        const initializeAgora = async () => {
            try {
                const response = await fetch(`/api/agora/token?channelName=${channelName}`);
                if (!response.ok) throw new Error('Failed to fetch Agora token');
                
                const { token, uid } = await response.json();
                
                if (!isMounted) return;
                await agoraClient.join(agoraAppId, channelName, token, uid);

                tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
                
                if (isMounted) {
                    setLocalAudioTrack(tracks[0]);
                    setLocalVideoTrack(tracks[1]);
                }

                await agoraClient.publish(Object.values(tracks));
            } catch (error: any) {
                console.error('Agora initialization failed:', error);
                if (isMounted) {
                    toast({ variant: 'destructive', title: 'Call Failed', description: error.message || 'Could not connect to the video call.' });
                    router.back();
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
            await agoraClient.subscribe(user, mediaType);
            if (mediaType === 'video' && user.videoTrack) {
                if (isMounted) setRemoteVideoTrack(user.videoTrack);
            }
            if (mediaType === 'audio') {
                user.audioTrack?.play();
            }
        };

        const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
            // When any user leaves, clear the remote track.
            // In a one-to-one call, this means the other person left.
            if (isMounted) {
                setRemoteVideoTrack(null);
            }
        };
        
        agoraClient.on('user-published', handleUserPublished);
        agoraClient.on('user-left', handleUserLeft);
        
        initializeAgora();

        return () => {
            isMounted = false;
            tracks?.forEach(track => {
                track.stop();
                track.close();
            });
            agoraClient.leave().catch(e => console.error("Error leaving Agora channel on cleanup:", e));
            agoraClient.removeAllListeners();
        };
    }, [channelName, router, toast]);


    const handleLeave = async () => {
        try {
            await client.current?.leave();
            router.push('/home');
        } catch (error) {
            console.error('Failed to leave channel', error);
        }
    };

    const toggleAudio = async () => {
        if (localAudioTrack) {
            await localAudioTrack.setMuted(!isAudioMuted);
            setIsAudioMuted(!isAudioMuted);
        }
    };

    const toggleVideo = async () => {
        if (localVideoTrack) {
            await localVideoTrack.setMuted(!isVideoMuted);
            setIsVideoMuted(!isVideoMuted);
        }
    };

    return (
        <div className="relative flex h-screen w-full flex-col bg-black text-white">
            {isLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
                    <Loader2 className="h-10 w-10 animate-spin" />
                    <p className="mt-4 text-lg">Joining call...</p>
                </div>
            )}
            
            <header className="p-4 text-center">
                <h1 className="text-xl font-bold">Call with {doctorName}</h1>
            </header>

            <main className="relative flex-1">
                {/* Remote video container */}
                <div className="absolute inset-0 h-full w-full bg-black">
                   {remoteVideoTrack ? (
                       <RemoteVideoPlayer videoTrack={remoteVideoTrack} />
                   ) : (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="mt-4">Waiting for {doctorName} to join...</p>
                    </div>
                   )}
                </div>
                
                {/* Local video container */}
                <div className="absolute bottom-4 right-4 h-48 w-32 rounded-lg border-2 border-white bg-black overflow-hidden z-10">
                   {!isVideoMuted && <LocalVideoPlayer videoTrack={localVideoTrack} />}
                </div>
            </main>

            <footer className="bg-black/50 p-4">
                <div className="flex items-center justify-center gap-4">
                    <Button onClick={toggleAudio} size="icon" className={`h-14 w-14 rounded-full ${isAudioMuted ? 'bg-gray-600' : 'bg-green-600'}`}>
                        {isAudioMuted ? <MicOff /> : <Mic />}
                    </Button>
                    <Button onClick={toggleVideo} size="icon" className={`h-14 w-14 rounded-full ${isVideoMuted ? 'bg-gray-600' : 'bg-green-600'}`}>
                        {isVideoMuted ? <VideoOff /> : <Video />}
                    </Button>
                    <Button onClick={handleLeave} variant="destructive" size="icon" className="h-14 w-14 rounded-full">
                        <PhoneOff />
                    </Button>
                </div>
            </footer>
        </div>
    );
}
