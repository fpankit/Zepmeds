

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, PhoneOff, Video, VideoOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

const agoraAppId = "5bbb95c735a84da6af004432f4ced817";

export function VideoCallContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { user } = useAuth();
    
    const client = useRef<IAgoraRTCClient | null>(null);
    const localAudioTrack = useRef<IMicrophoneAudioTrack | null>(null);
    const localVideoTrack = useRef<ICameraVideoTrack | null>(null);
    
    const [channelName] = useState(searchParams.get('channel') || 'default_channel');
    const [doctorName] = useState(searchParams.get('doctorName') || 'Doctor');
    
    const [remoteUser, setRemoteUser] = useState<IAgoraRTCRemoteUser | null>(null);
    const [isJoined, setIsJoined] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (!user || !agoraAppId) {
            if (!agoraAppId) {
                toast({ variant: "destructive", title: "Configuration Error", description: "Agora App ID is missing." });
            }
            if (!user) {
                toast({ variant: "destructive", title: "Not logged in." });
                router.push('/login');
            }
            return;
        }

        const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        client.current = agoraClient;
        let tracks: [IMicrophoneAudioTrack, ICameraVideoTrack] | null = null;
        
        const initializeAgora = async () => {
            try {
                const response = await fetch(`/api/agora/token?channelName=${channelName}&uid=${user.id}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch Agora token');
                }
                const { token, uid } = await response.json();
                
                await agoraClient.join(agoraAppId, channelName, token, uid);

                tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
                localAudioTrack.current = tracks[0];
                localVideoTrack.current = tracks[1];
                
                const localPlayerContainer = document.getElementById('local-video');
                if (localPlayerContainer) {
                    localVideoTrack.current.play(localPlayerContainer);
                }
                
                await agoraClient.publish(tracks);

                if (isMounted.current) {
                    setIsJoined(true);
                }

            } catch (error: any) {
                console.error('Agora initialization failed:', error);
                if (isMounted.current) {
                    toast({ variant: 'destructive', title: 'Call Failed', description: error.message || 'Could not connect to the video call.' });
                    router.back();
                }
            } finally {
                if (isMounted.current) {
                    setIsLoading(false);
                }
            }
        };

        const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
            await agoraClient.subscribe(user, mediaType);
            if (mediaType === 'video') {
                if (isMounted.current) setRemoteUser(user);
                const remotePlayerContainer = document.getElementById('remote-video');
                if (remotePlayerContainer) {
                    user.videoTrack?.play(remotePlayerContainer);
                }
            }
            if (mediaType === 'audio') {
                user.audioTrack?.play();
            }
        };

        const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
            if (isMounted.current) setRemoteUser(null);
        };
        
        agoraClient.on('user-published', handleUserPublished);
        agoraClient.on('user-left', handleUserLeft);
        
        initializeAgora();

        return () => {
            if (client.current) {
                client.current.leave();
                client.current.removeAllListeners();
            }
            localAudioTrack.current?.close();
            localVideoTrack.current?.close();
        };
    }, [channelName, router, toast, user]);


    const handleLeave = async () => {
        try {
            await client.current?.leave();
            router.push('/home');
        } catch (error) {
            console.error('Failed to leave channel', error);
        }
    };

    const toggleAudio = async () => {
        if (localAudioTrack.current) {
            await localAudioTrack.current.setMuted(!isAudioMuted);
            setIsAudioMuted(!isAudioMuted);
        }
    };

    const toggleVideo = async () => {
        if (localVideoTrack.current) {
            await localVideoTrack.current.setMuted(!isVideoMuted);
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
                <p className="text-muted-foreground text-sm">Channel: {channelName}</p>
            </header>

            <main className="relative flex-1">
                <div 
                    id="remote-video"
                    className="absolute inset-0 h-full w-full"
                >
                   {!remoteUser && !isLoading && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="mt-4">Waiting for the doctor to join...</p>
                    </div>
                   )}
                </div>
                
                <div 
                    id="local-video" 
                    className="absolute bottom-4 right-4 h-48 w-32 rounded-lg border-2 border-white bg-black overflow-hidden z-10"
                />
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
