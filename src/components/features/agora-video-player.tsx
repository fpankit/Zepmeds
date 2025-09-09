
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
    LocalVideoTrack,
    RemoteUser,
    useJoin,
    useLocalCameraTrack,
    useLocalMicrophoneTrack,
    usePublish,
    useRemoteUsers,
    AgoraRTCProvider
} from "agora-rtc-react";
import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Camera, CameraOff, PhoneOff, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';

const PatientProfile = dynamic(
    () => import('@/components/features/patient-profile').then(mod => mod.PatientProfile),
    {
        ssr: false,
        loading: () => (
            <div className='p-4 space-y-4'>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        )
    }
);


function VideoCallPlayerContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    
    const [micOn, setMic] = useState(true);
    const [cameraOn, setCamera] = useState(true);
    const [isJoined, setIsJoined] = useState(false);
    const [callDetails, setCallDetails] = useState<{ appId: string; channelName: string; token: string | null; } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const callId = params.channel as string;
    const patientId = searchParams.get('patientId');
    const defaultAppId = process.env.NEXT_PUBLIC_AGORA_APP_ID || '3b649d7a9006490292cd9d82534a6a91';

    useEffect(() => {
        const fetchCallDetails = async () => {
            if (!callId) {
                setError("Call ID is missing from the URL.");
                setIsLoading(false);
                return;
            }

            try {
                // In a real app, you would fetch token and other details from Firestore or your backend
                // For this example, we'll use the callId as the channel name and a default App ID.
                // A token would be required for production environments.
                console.log(`Setting up call for channel: ${callId}`);
                setCallDetails({
                    appId: defaultAppId,
                    channelName: callId,
                    token: null // Token can be null for testing, but required for production
                });

            } catch (err) {
                 console.error("Error setting up call details:", err);
                 setError("Could not retrieve call information. Please try again.");
            } finally {
                 setIsLoading(false);
            }
        };

        fetchCallDetails();
    }, [callId, defaultAppId]);
    

    const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
    const { localCameraTrack } = useLocalCameraTrack(cameraOn);

    // This is the critical change: `uid` is explicitly set to `null`
    // to let Agora SDK assign an integer UID automatically.
    useJoin({ 
        appid: callDetails?.appId!, 
        channel: callDetails?.channelName!, 
        token: callDetails?.token,
        uid: null 
    }, isJoined);

    usePublish([localMicrophoneTrack, localCameraTrack], isJoined);

    const remoteUsers = useRemoteUsers();

    const handleLeave = () => {
        if (localCameraTrack) {
            localCameraTrack.stop();
            localCameraTrack.close();
        }
        if (localMicrophoneTrack) {
            localMicrophoneTrack.stop();
            localMicrophoneTrack.close();
        }
        setIsJoined(false);
        router.push('/doctor');
    };
    
    useEffect(() => {
        // We only attempt to join the call after we have successfully fetched the call details.
        if (callDetails && !isJoined) {
            setIsJoined(true);
        }
    }, [callDetails, isJoined]);


    if (isLoading) {
         return (
            <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="mt-2">Connecting to call...</p>
            </div>
        )
    }

    if (error) {
         return (
            <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center bg-background">
                 <Alert variant="destructive" className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Connection Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button onClick={() => router.push('/doctor')} variant="outline" className="mt-4">Back to Doctors</Button>
            </div>
        )
    }

    if (!callDetails?.appId) {
         return (
            <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center bg-background">
                 <Alert variant="destructive" className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Configuration Error</AlertTitle>
                    <AlertDescription>
                        Agora App ID is not configured. Please set the `NEXT_PUBLIC_AGORA_APP_ID` environment variable.
                    </AlertDescription>
                </Alert>
                <Button onClick={() => router.push('/doctor')} variant="outline" className="mt-4">Back to safety</Button>
            </div>
        )
    }

    return (
        <div className="flex h-screen w-full bg-black text-white">
            <main className="flex-1 flex flex-col relative">
                <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Local User Video */}
                    <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                        {cameraOn ? (
                             <LocalVideoTrack track={localCameraTrack} play={true} className="w-full h-full object-cover" />
                        ) : (
                             <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                <CameraOff className="h-10 w-10 text-gray-600" />
                            </div>
                        )}
                       
                        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-md text-sm">
                            <p>You</p>
                        </div>
                    </div>

                    {/* Remote Users Video */}
                    {remoteUsers.map((user) => (
                        <div key={user.uid} className="relative rounded-lg overflow-hidden bg-black aspect-video">
                            {user.hasVideo ? (
                                <RemoteUser user={user} playVideo={true} playAudio={true} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                    <CameraOff className="h-10 w-10 text-gray-600" />
                                </div>
                            )}
                            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-md text-sm">
                                <p>Doctor</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Control Bar */}
                <div className="bg-gray-900/80 backdrop-blur-sm p-4 flex justify-center items-center gap-4">
                    <Button
                        onClick={() => setMic(a => !a)}
                        variant="secondary"
                        size="lg"
                        className={cn("rounded-full h-14 w-14", !micOn && "bg-destructive hover:bg-destructive/80")}
                    >
                        {micOn ? <Mic /> : <MicOff />}
                    </Button>
                    <Button
                        onClick={() => setCamera(a => !a)}
                        variant="secondary"
                        size="lg"
                        className={cn("rounded-full h-14 w-14", !cameraOn && "bg-destructive hover:bg-destructive/80")}
                    >
                        {cameraOn ? <Camera /> : <CameraOff />}
                    </Button>
                    <Button onClick={handleLeave} variant="destructive" size="lg" className="rounded-full h-14 w-14"><PhoneOff /></Button>
                </div>
            </main>

            <aside className="w-80 hidden md:block bg-gray-900 border-l border-gray-800 p-4">
                {patientId && <PatientProfile patientId={patientId} />}
            </aside>
        </div>
    );
}

export function AgoraVideoPlayer() {
    const client: IAgoraRTCClient = useMemo(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }), []);

    return (
        <AgoraRTCProvider client={client}>
            <VideoCallPlayerContent />
        </AgoraRTCProvider>
    )
}
