
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    LocalVideoTrack,
    RemoteUser,
    useJoin,
    useLocalCameraTrack,
    useLocalMicrophoneTrack,
    usePublish,
    useRemoteUsers,
    MediaPlayer,
} from "agora-rtc-react";
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Camera, CameraOff, PhoneOff } from 'lucide-react';
import { cn } from '@/lib/utils';


interface AgoraVideoPlayerProps {
    appId: string;
    channelName: string;
    token: string | null;
}

export function AgoraVideoPlayer({ appId, channelName, token }: AgoraVideoPlayerProps) {
    const router = useRouter();

    const [micOn, setMic] = useState(true);
    const [cameraOn, setCamera] = useState(true);

    const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
    const { localCameraTrack } = useLocalCameraTrack(cameraOn);
    
    useJoin({ appid: appId, channel: channelName, token: token });
    usePublish([localMicrophoneTrack, localCameraTrack]);

    const remoteUsers = useRemoteUsers();

    const handleLeave = () => {
        if(localCameraTrack) {
            localCameraTrack.stop();
            localCameraTrack.close();
        }
        if(localMicrophoneTrack) {
            localMicrophoneTrack.stop();
            localMicrophoneTrack.close();
        }
        router.push('/doctor');
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Local User Video */}
                <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                    <MediaPlayer videoTrack={localCameraTrack} className="w-full h-full object-cover" />
                     <p className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-md text-sm">You</p>
                </div>
                
                 {/* Remote Users Video */}
                {remoteUsers.map((user) => (
                    <div key={user.uid} className="relative rounded-lg overflow-hidden bg-black aspect-video">
                         <MediaPlayer videoTrack={user.videoTrack} className="w-full h-full object-cover" />
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
