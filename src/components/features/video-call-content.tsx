
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ZegoExpressEngine } from 'zego-express-engine-webrtc';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, PhoneOff, Video, VideoOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export function VideoCallContent() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const { toast } = useToast();

    const zg = useRef<ZegoExpressEngine | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    
    const isComponentMounted = useRef(true);

    const roomId = params.id as string;
    const doctorName = 'Doctor'; // This can be fetched if needed


    const handleLeave = useCallback(async () => {
        if (zg.current) {
            if (localStream) {
                 try {
                    zg.current.stopPublishingStream(`${user!.id}_${roomId}_main`);
                    zg.current.destroyStream(localStream);
                 } catch (e) {
                    console.error("Error destroying stream on leave:", e);
                 }
            }
            // Only logout if the room is connected
            if (zg.current.getRoomState(roomId) === 'CONNECTED') {
                 await zg.current.logoutRoom(roomId);
            }
            zg.current = null;
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        router.push('/home');
    }, [localStream, roomId, router, user]);


    useEffect(() => {
        isComponentMounted.current = true;
        
        if (!user || user.isGuest) {
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to join a call.' });
            router.push('/login');
            return;
        }

        const initialize = async () => {
            const appId = parseInt(process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID!, 10);
            if(!appId || isNaN(appId)) {
                console.error('ZegoCloud App ID is not configured in .env file.');
                toast({ variant: 'destructive', title: 'Configuration Error', description: 'Video call service is not configured.' });
                router.back();
                return;
            }

            zg.current = new ZegoExpressEngine(appId, 'wss://webliveroom'+appId+'-api.coolzcloud.com/ws');

            zg.current.on('roomStateUpdate', async (roomID, state, errorCode, extendedData) => {
                 if (!isComponentMounted.current) return;
                 if (state === 'CONNECTED') {
                    setIsLoading(false);
                 } else if (state === 'DISCONNECTED') {
                     handleLeave();
                 }
            });

            zg.current.on('roomStreamUpdate', async (roomID, updateType, streamList) => {
                 if (!isComponentMounted.current || !zg.current) return;
                 if (updateType === 'ADD') {
                    const streamID = streamList[0].streamID;
                    try {
                        const remote = await zg.current!.startPlayingStream(streamID);
                        if (remoteVideoRef.current) {
                            remoteVideoRef.current.srcObject = remote;
                        }
                        setRemoteStream(remote);
                    } catch (playError) {
                        console.error("Failed to play remote stream:", playError);
                    }
                } else if (updateType === 'DELETE') {
                    setRemoteStream(null);
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = null;
                    }
                }
            });
            
            try {
                // 1. Fetch Token
                const tokenResponse = await fetch(`/api/zego/token?userId=${user.id}&roomId=${roomId}`);
                if (!tokenResponse.ok) {
                    const errorData = await tokenResponse.json();
                    throw new Error(errorData.error || 'Failed to fetch Zego token');
                }
                const { token } = await tokenResponse.json();
                
                // 2. Login to Room
                const loginSuccess = await zg.current.loginRoom(roomId, token, { userID: user.id, userName: `${user.firstName} ${user.lastName}` });
                if (!loginSuccess) {
                     throw new Error('Login to room failed.');
                }
                
                if (!isComponentMounted.current) return;
                
                // 3. Create and Publish Stream
                const stream = await zg.current.createStream({camera: { video: true, audio: true }});
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                setLocalStream(stream);
                zg.current.startPublishingStream(`${user.id}_${roomId}_main`, stream);


            } catch (error: any) {
                console.error('ZegoCloud Initialization Failed:', error);
                if (isComponentMounted.current) {
                    toast({ variant: 'destructive', title: 'Call Failed', description: error.message || 'Could not connect to the video call service.' });
                    handleLeave(); // Use handleLeave for cleanup
                }
            }
        };

        initialize();

        return () => {
            isComponentMounted.current = false;
            handleLeave();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    

    const toggleAudio = async () => {
        if (localStream && zg.current) {
            const newMutedState = !isAudioMuted;
            zg.current.mutePublishStreamAudio(localStream, newMutedState);
            setIsAudioMuted(newMutedState);
        }
    };

    const toggleVideo = async () => {
        if (localStream && zg.current) {
            const newMutedState = !isVideoMuted;
            zg.current.mutePublishStreamVideo(localStream, newMutedState);
            setIsVideoMuted(newMutedState);
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
                <div className="absolute inset-0 h-full w-full bg-black">
                   <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
                   {!remoteStream && !isLoading && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="mt-4">Waiting for the other person to join...</p>
                    </div>
                   )}
                </div>
                
                <div className="absolute bottom-4 right-4 h-48 w-32 rounded-lg border-2 border-white bg-black overflow-hidden z-10">
                   <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                   {isVideoMuted && (
                       <div className="absolute inset-0 bg-black flex items-center justify-center"><VideoOff className="h-8 w-8 text-white"/></div>
                   )}
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
