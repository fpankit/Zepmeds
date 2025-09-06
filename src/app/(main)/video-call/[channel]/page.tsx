
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAgora } from '@/hooks/use-agora';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Mic, MicOff, PhoneOff, Users, ScreenShare, ScreenShareOff } from 'lucide-react';
import { Player } from '@/components/features/player';
import { cn } from '@/lib/utils';
import { PatientProfile } from '@/components/features/patient-profile';

const appId = '9de59654b7884ef58b4a3d15d72cdefa';

export default function VideoCallPage() {
    const router = useRouter();
    const params = useParams();
    const channelName = params.channel as string;

    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    const {
        localAudioTrack,
        localVideoTrack,
        leave,
        join,
        remoteUsers,
        isJoined,
        isJoining
    } = useAgora({ appId, channel: channelName });

    const handleLeave = () => {
        leave();
        router.push('/doctor');
    };

    const toggleCamera = async () => {
        if (localVideoTrack) {
            await localVideoTrack.setEnabled(!isCameraOn);
            setIsCameraOn(!isCameraOn);
        }
    };

    const toggleMic = async () => {
        if (localAudioTrack) {
            await localAudioTrack.setEnabled(!isMicOn);
            setIsMicOn(!isMicOn);
        }
    };

    const toggleScreenShare = async () => {
        // Screen sharing logic would be more complex and is stubbed here
        setIsScreenSharing(!isScreenSharing);
        alert(isScreenSharing ? "Stopping screen share (placeholder)" : "Starting screen share (placeholder)");
    };

    if (!isJoined && !isJoining) {
        join(); // Automatically join when the component loads
    }

    if (isJoining) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black text-white">
                 <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-lg">Joining Call...</p>
                </div>
            </div>
        );
    }
    

    return (
        <div className="flex h-screen w-full bg-black text-white">
             {/* Main Video Grid */}
            <main className="flex-1 flex flex-col p-4 relative">
                <div className={cn(
                    "grid gap-4 flex-1",
                    remoteUsers.length > 0 ? "grid-cols-2" : "grid-cols-1"
                )}>
                    {isJoined && <Player videoTrack={localVideoTrack} audioTrack={localAudioTrack} uid="local" isLocal={true} />}
                    {remoteUsers.map((user) => (
                        <Player key={user.uid} videoTrack={user.videoTrack} audioTrack={user.audioTrack} uid={user.uid} />
                    ))}
                </div>
                
                 {/* Control Bar */}
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-sm p-4 rounded-full flex justify-center items-center gap-4">
                     <Button onClick={toggleMic} variant="secondary" size="lg" className={cn("rounded-full h-14 w-14", !isMicOn && "bg-destructive hover:bg-destructive/90")}>
                        {isMicOn ? <Mic /> : <MicOff />}
                    </Button>
                     <Button onClick={toggleCamera} variant="secondary" size="lg" className={cn("rounded-full h-14 w-14", !isCameraOn && "bg-destructive hover:bg-destructive/90")}>
                        {isCameraOn ? <Camera /> : <CameraOff />}
                    </Button>
                     <Button onClick={toggleScreenShare} variant="secondary" size="lg" className="rounded-full h-14 w-14">
                        {isScreenSharing ? <ScreenShareOff /> : <ScreenShare />}
                    </Button>
                     <Button onClick={handleLeave} variant="destructive" size="lg" className="rounded-full h-14 w-14"><PhoneOff /></Button>
                </div>
            </main>

            {/* Sidebar with Patient Details */}
             <aside className="w-80 hidden md:block bg-gray-900 border-l border-gray-800 p-4">
                 <PatientProfile patientId={channelName} />
             </aside>
        </div>
    );
}
