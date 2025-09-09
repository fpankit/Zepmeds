
"use client";

import { useState, useEffect, Suspense, useMemo } from 'react';
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
import { Mic, MicOff, Camera, CameraOff, PhoneOff, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
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
    const { toast } = useToast();
    const params = useParams();
    const searchParams = useSearchParams();

    const [micOn, setMic] = useState(true);
    const [cameraOn, setCamera] = useState(true);
    const [hasPermission, setHasPermission] = useState(false);
    const [isPermissionLoading, setIsPermissionLoading] = useState(true);
    const [isJoined, setIsJoined] = useState(false);

    const channelName = params.channel as string;
    const patientId = searchParams.get('patientId');
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || '3b649d7a9006490292cd9d82534a6a91';
    const token = null;
    
    // Request permissions on component mount
    useEffect(() => {
        const requestPermissions = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                stream.getTracks().forEach(track => track.stop());
                setHasPermission(true);
            } catch (error) {
                console.error('Error getting media permissions:', error);
                toast({
                    variant: 'destructive',
                    title: 'Permissions Denied',
                    description: 'Camera and microphone access is required for video calls.',
                    duration: 5000,
                });
                setHasPermission(false);
            } finally {
                setIsPermissionLoading(false);
            }
        };

        requestPermissions();
    }, [toast]);

    const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn && hasPermission);
    const { localCameraTrack } = useLocalCameraTrack(cameraOn && hasPermission);

    useJoin(
        {
            appid: appId,
            channel: channelName,
            token: token,
        },
        hasPermission,
        () => {
            setIsJoined(true);
        }
    );

    usePublish([localMicrophoneTrack, localCameraTrack], isJoined && hasPermission);

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

    if (isPermissionLoading) {
        return (
            <div className="flex items-center justify-center h-screen w-full bg-background">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
     if (!hasPermission) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center bg-background">
                <Alert variant="destructive" className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Permissions Required</AlertTitle>
                    <AlertDescription>
                        Zepmeds needs access to your camera and microphone to start a video call. Please grant permissions in your browser settings and refresh the page.
                    </AlertDescription>
                </Alert>
                <Button onClick={handleLeave} variant="outline" className="mt-4">Back to safety</Button>
            </div>
        )
    }

    return (
        <div className="flex h-screen w-full bg-black text-white">
            {/* Main Video Grid */}
            <main className="flex-1 flex flex-col relative">
                 <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Local User Video */}
                    <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                        {localCameraTrack && <LocalVideoTrack track={localCameraTrack} play={true} className="w-full h-full object-cover" />}
                        <p className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-md text-sm">You</p>
                    </div>

                    {/* Remote Users Video */}
                    {remoteUsers.map((user) => (
                        <div key={user.uid} className="relative rounded-lg overflow-hidden bg-black aspect-video">
                            {user.hasVideo && user.videoTrack && <RemoteUser user={user} playVideo={true} className="w-full h-full object-cover" />}
                            <p className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-md text-sm">Doctor</p>
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
    );
}


export function AgoraVideoPlayer() {
    const client = useMemo(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }), []);

    return (
        <AgoraRTCProvider client={client}>
            <VideoCallPlayerContent />
        </AgoraRTCProvider>
    )
}
