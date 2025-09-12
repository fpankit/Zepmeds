
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ZegoExpressEngine } from 'zego-express-engine-webrtc';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, PhoneOff, Video, VideoOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { v4 as uuidv4 } from 'uuid';

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
    const doctorName = 'Doctor'; // can be dynamic if needed
    const streamID = useRef<string>(''); //  store streamID for mute/unmute

    const handleLeave = useCallback(async () => {
        if (zg.current) {
            if (localStream) {
                if (streamID.current) {
                    zg.current.stopPublishingStream(streamID.current);
                }
                zg.current.destroyStream(localStream);
            }
            await zg.current.logoutRoom(roomId);
            zg.current = null;
        }
        router.push('/home');
    }, [localStream, roomId, router]);

    // ---------------------------------------------------------------------
    // Setup Zego client
    // ---------------------------------------------------------------------
    const setupZegoClient = useCallback(
        async (appId: number, token: string) => {
            if (!user || !zg.current) return;

            zg.current.on('roomStateUpdate', (roomID, state) => {
                if (state === 'CONNECTED') {
                    if (isComponentMounted.current) setIsLoading(false);
                } else if (state === 'DISCONNECTED') {
                    handleLeave();
                }
            });

            zg.current.on('publisherStateUpdate', (result) => {
                console.log('publisherStateUpdate', result);
            });

            zg.current.on('playerStateUpdate', (result) => {
                console.log('playerStateUpdate', result);
            });

            zg.current.on(
                'roomStreamUpdate',
                async (roomID, updateType, streamList) => {
                    if (updateType === 'ADD') {
                        const id = streamList[0].streamID;
                        const remote = await zg.current!.startPlayingStream(id);
                        if (remoteVideoRef.current) {
                            remoteVideoRef.current.srcObject = remote;
                        }
                        if (isComponentMounted.current) setRemoteStream(remote);
                    } else {
                        if (isComponentMounted.current) setRemoteStream(null);
                        if (remoteVideoRef.current) {
                            remoteVideoRef.current.srcObject = null;
                        }
                    }
                }
            );

            try {
                const loggedIn = await zg.current.loginRoom(roomId, token, {
                    userID: user.id,
                    userName: `${user.firstName} ${user.lastName}`,
                });

                if (!loggedIn) {
                    throw new Error("Login to room failed");
                }

                const stream = await zg.current.createStream({
                    camera: { video: true, audio: true },
                });

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                if (isComponentMounted.current) setLocalStream(stream);

                //  Correct streamID usage
                streamID.current = `${user.id}_${roomId}_main`;
                zg.current.startPublishingStream(streamID.current, stream);
            } catch (error) {
                console.error('Zego login or stream creation failed:', error);
                if (isComponentMounted.current) {
                    toast({
                        variant: 'destructive',
                        title: 'Call Failed',
                        description: 'Could not log in to the call room.',
                    });
                    router.back();
                }
            }
        },
        [user, roomId, router, toast, handleLeave]
    );
    
    // Function to generate token client-side
    const generateClientToken = (appId: number, serverSecret: string, userId: string) => {
        const effectiveTimeInSeconds = 3600; // Token expiration time, in seconds.
        const createTime = Math.floor(new Date().getTime() / 1000);
        const expireTime = createTime + effectiveTimeInSeconds;
        
        const payloadObject = {
            room_id: roomId,
            privilege: {
                1: 1, // loginRoom
                2: 1  // publishStream
            },
            stream_id_list: null
        };
        const payload = JSON.stringify(payloadObject);

        // The token is a string in the format: "04" + Base64.encode(JSON.stringify(tokenInfo))
        const token = `04${Buffer.from(JSON.stringify({
            app_id: appId,
            user_id: userId,
            nonce: uuidv4(),
            ctime: createTime,
            expire: expireTime,
            payload: payload
        })).toString('base64')}`;

        return token;
    }

    // ---------------------------------------------------------------------
    // Initialization
    // ---------------------------------------------------------------------
    useEffect(() => {
        isComponentMounted.current = true;

        if (!user || user.isGuest) {
            toast({
                variant: 'destructive',
                title: 'Authentication Error',
                description: 'You must be logged in to join a call.',
            });
            router.push('/login');
            return;
        }

        const initialize = async () => {
            const appId = parseInt(
                process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID || '',
                10
            );
            const serverSecret = process.env.NEXT_PUBLIC_ZEGOCLOUD_SERVER_SECRET || '';

            if (!appId || isNaN(appId) || !serverSecret) {
                console.error(
                    'ZegoCloud App ID or Server Secret is not configured in .env file.'
                );
                toast({
                    variant: 'destructive',
                    title: 'Configuration Error',
                    description: 'Video call service is not configured.',
                });
                router.back();
                return;
            }

            try {
                 // Generate token on the client-side for simplicity
                const token = generateClientToken(appId, serverSecret, user.id);

                if (isComponentMounted.current) {
                    zg.current = new ZegoExpressEngine(appId, "wss://webliveroom" + appId + "-api.coolzcloud.com/ws");
                    await setupZegoClient(appId, token);
                }
            } catch (error: any) {
                console.error('ZegoCloud Initialization Failed:', error);
                if (isComponentMounted.current) {
                    toast({
                        variant: 'destructive',
                        title: 'Call Failed',
                        description:
                            error.message ||
                            'Could not connect to the video call service.',
                    });
                    router.back();
                }
            }
        };

        initialize();

        return () => {
            isComponentMounted.current = false;
            handleLeave();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, router, roomId, toast]);

    // ---------------------------------------------------------------------
    // Controls
    // ---------------------------------------------------------------------

    const toggleAudio = () => {
        if (zg.current && localStream) {
            const newMutedState = !isAudioMuted;
            zg.current.mutePublishStreamAudio(localStream, newMutedState);
            setIsAudioMuted(newMutedState);
        }
    };

    const toggleVideo = () => {
        if (zg.current && localStream) {
            const newMutedState = !isVideoMuted;
            zg.current.mutePublishStreamVideo(localStream, newMutedState);
            setIsVideoMuted(newMutedState);
        }
    };

    // ---------------------------------------------------------------------
    // UI
    // ---------------------------------------------------------------------
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
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="h-full w-full object-cover"
                    />
                    {!remoteStream && !isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p className="mt-4">
                                Waiting for the other person to join...
                            </p>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-4 right-4 h-48 w-32 rounded-lg border-2 border-white bg-black overflow-hidden z-10">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-full w-full object-cover"
                    />
                    {isVideoMuted && (
                        <div className="absolute inset-0 bg-black flex items-center justify-center">
                            <VideoOff className="h-8 w-8 text-white" />
                        </div>
                    )}
                </div>
            </main>

            <footer className="bg-black/50 p-4">
                <div className="flex items-center justify-center gap-4">
                    <Button
                        onClick={toggleAudio}
                        size="icon"
                        className={`h-14 w-14 rounded-full ${
                            isAudioMuted ? 'bg-gray-600' : 'bg-green-600'
                        }`}
                    >
                        {isAudioMuted ? <MicOff /> : <Mic />}
                    </Button>
                    <Button
                        onClick={toggleVideo}
                        size="icon"
                        className={`h-14 w-14 rounded-full ${
                            isVideoMuted ? 'bg-gray-600' : 'bg-green-600'
                        }`}
                    >
                        {isVideoMuted ? <VideoOff /> : <Video />}
                    </Button>
                    <Button
                        onClick={handleLeave}
                        variant="destructive"
                        size="icon"
                        className="h-14 w-14 rounded-full"
                    >
                        <PhoneOff />
                    </Button>
                </div>
            </footer>
        </div>
    );
}
