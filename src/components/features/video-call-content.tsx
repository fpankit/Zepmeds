
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, PhoneOff, Video, VideoOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

const agoraAppId = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";

export function VideoCallContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { user } = useAuth();
    
    const client = useRef<IAgoraRTCClient | null>(null);
    const localAudioTrack = useRef<IMicrophoneAudioTrack | null>(null);
    const localVideoTrack = useRef<ICameraVideoTrack | null>(null);
    const isInitialized = useRef(false); // Flag to prevent double initialization

    const [channelName] = useState(searchParams.get('channel') || 'default_channel');
    const [doctorName] = useState(searchParams.get('doctorName') || 'Doctor');
    const [userName] = useState(searchParams.get('userName') || 'Patient');

    const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
    const [isJoined, setIsJoined] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);

    useEffect(() => {
        if (!user) {
            toast({ variant: "destructive", title: "Not logged in." });
            router.push('/login');
            return;
        }

        // Prevent initialization from running twice
        if (isInitialized.current) {
            return;
        }
        isInitialized.current = true;

        const initializeAgora = async () => {
            try {
                // Initialize Agora Client
                client.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

                // Fetch token from our API route
                const response = await fetch(`/api/agora/token?channelName=${channelName}&uid=${user.id}`);
                if (!response.ok) throw new Error('Failed to fetch Agora token');
                const { token, uid } = await response.json();
                
                // Join the channel
                await client.current.join(agoraAppId, channelName, token, uid);

                // Create and publish local tracks
                [localAudioTrack.current, localVideoTrack.current] = await AgoraRTC.createMicrophoneAndCameraTracks();
                
                // Play local video
                const localPlayerContainer = document.getElementById('local-video');
                if (localPlayerContainer) {
                    localVideoTrack.current.play(localPlayerContainer);
                }
                
                // Publish tracks
                await client.current.publish([localAudioTrack.current, localVideoTrack.current]);

                setIsJoined(true);
            } catch (error: any) {
                console.error('Agora initialization failed:', error);
                toast({ variant: 'destructive', title: 'Call Failed', description: error.message || 'Could not connect to the video call.' });
                router.back();
            } finally {
                setIsLoading(false);
            }
        };

        // Event listeners for remote users
        const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
            await client.current?.subscribe(user, mediaType);
            if (mediaType === 'video') {
                setRemoteUsers(prev => [...prev.filter(u => u.uid !== user.uid), user]);
            }
            if (mediaType === 'audio') {
                user.audioTrack?.play();
            }
        };

        const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
            setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
        };

        const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
            setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
        };

        if (client.current) {
            client.current.on('user-published', handleUserPublished);
            client.current.on('user-unpublished', handleUserUnpublished);
            client.current.on('user-left', handleUserLeft);
        }
        
        initializeAgora();

        return () => {
            // Cleanup on unmount
            localAudioTrack.current?.close();
            localVideoTrack.current?.close();
            client.current?.leave();
            client.current?.off('user-published', handleUserPublished);
            client.current?.off('user-unpublished', handleUserUnpublished);
            client.current?.off('user-left', handleUserLeft);
            isInitialized.current = false; // Reset on cleanup
        };
    }, [channelName, router, toast, user]);


    const handleLeave = async () => {
        try {
            localAudioTrack.current?.close();
            localVideoTrack.current?.close();
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
                {/* Remote User Video */}
                {remoteUsers.length > 0 ? (
                    remoteUsers.map(user => (
                        <div 
                            key={user.uid} 
                            id={`remote-video-${user.uid}`} 
                            className="absolute inset-0 h-full w-full"
                        >
                           {user.videoTrack && user.videoTrack.play(`remote-video-${user.uid}`)}
                        </div>
                    ))
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="mt-4">Waiting for the doctor to join...</p>
                    </div>
                )}
                
                {/* Local User Video */}
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
