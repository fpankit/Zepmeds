
"use client";

import { useState, Suspense, useMemo } from 'react';
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
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Camera, CameraOff, PhoneOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

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

function AgoraVideoPlayer() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();

    const [micOn, setMic] = useState(true);
    const [cameraOn, setCamera] = useState(true);
    const [isJoined, setIsJoined] = useState(false);
    
    const channelName = params.channel as string;
    const patientId = searchParams.get('patientId');
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || '3b649d7a9006490292cd9d82534a6a91';
    const token = null;

    const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
    const { localCameraTrack } = useLocalCameraTrack(cameraOn);
    
    const client = useMemo(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }), []);

    useJoin({ appid: appId, channel: channelName, token: token }, true, () => {
        setIsJoined(true);
    });

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

    if (appId === '') {
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
        <AgoraRTCProvider client={client}>
            <div className="flex h-screen w-full bg-black text-white">
                {/* Main Video Grid */}
                <main className="flex-1 flex flex-col relative">
                     <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Local User Video */}
                        <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                            <LocalVideoTrack track={localCameraTrack} play={cameraOn} className="w-full h-full object-cover" />
                             <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-md text-sm">
                               <p>You</p>
                            </div>
                        </div>

                        {/* Remote Users Video */}
                        {remoteUsers.map((user) => (
                            <div key={user.uid} className="relative rounded-lg overflow-hidden bg-black aspect-video">
                               <RemoteUser user={user} playVideo={user.hasVideo} playAudio={user.hasAudio} className="w-full h-full object-cover" />
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

                {/* Sidebar with Patient Details */}
                <aside className="w-80 hidden md:block bg-gray-900 border-l border-gray-800 p-4">
                    <Suspense fallback={<Skeleton className="h-full w-full" />}>
                      {patientId && <PatientProfile patientId={patientId} />}
                    </Suspense>
                </aside>
            </div>
        </AgoraRTCProvider>
    );
}

export { AgoraVideoPlayer };
