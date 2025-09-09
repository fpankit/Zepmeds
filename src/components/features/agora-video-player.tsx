
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    LocalVideoTrack,
    RemoteUser,
    useJoin,
    useLocalCameraTrack,
    useLocalMicrophoneTrack,
    usePublish,
    useRemoteUsers,
} from "agora-rtc-react";
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Camera, CameraOff, PhoneOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { useAuth } from '@/context/auth-context';

interface AgoraVideoPlayerProps {
    appId: string;
    channelName: string;
    token: string | null;
}

// Helper function to convert Firebase UID -> valid Agora UID (0–65535)
function getAgoraUid(firebaseUid: string | undefined): number | null {
    if (!firebaseUid) return null; // Let agora assign if no user
    try {
        let hash = 0;
        for (let i = 0; i < firebaseUid.length; i++) {
            hash = (hash << 5) - hash + firebaseUid.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash % 65535);
    } catch (error) {
        console.error("Failed to hash Firebase UID, falling back to null:", error);
        return null;
    }
}

export function AgoraVideoPlayer({ appId, channelName, token }: AgoraVideoPlayerProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();

    const [micOn, setMic] = useState(true);
    const [cameraOn, setCamera] = useState(true);
    const [hasPermission, setHasPermission] = useState(false);
    const [isPermissionLoading, setIsPermissionLoading] = useState(true);

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

    const agoraUid = getAgoraUid(user?.id);
    console.log(`[Agora] Joining channel "${channelName}" with UID:`, agoraUid);

    useJoin(
        {
            appid: appId,
            channel: channelName,
            token: token,
            uid: agoraUid,
        },
        hasPermission
    );

    usePublish([localMicrophoneTrack, localCameraTrack]);

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
        router.push('/doctor');
    };

    if (isPermissionLoading) {
        return <div className="flex items-center justify-center h-full"><p>Requesting permissions...</p></div>
    }

    if (!hasPermission) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
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
        <div className="flex flex-col h-full">
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
        </div>
    );
}
