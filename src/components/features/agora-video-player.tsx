
'use client'

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
    AgoraRTCProvider,
    useJoin,
    useLocalCameraTrack,
    useLocalMicrophoneTrack,
    usePublish,
    useRemoteUsers,
    RemoteUser,
    LocalVideoTrack,
} from 'agora-rtc-react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Phone, Users, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PatientProfile } from './patient-profile';

const appId = '3b649d7a9006490292cd9d82534a6a91';
const token = null; // Using token-less for simplicity, can be replaced with a fetched token

function VideoCallPlayerContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const channelName = params.channel as string;
    const patientId = searchParams.get('patientId');
    const { toast } = useToast();

    const [micOn, setMic] = useState(true);
    const [cameraOn, setCamera] = useState(true);
    const [isJoined, setIsJoined] = useState(false);

    const { localMicrophoneTrack, isLoading: isMicLoading, error: micError } = useLocalMicrophoneTrack(micOn);
    const { localCameraTrack, isLoading: isCamLoading, error: camError } = useLocalCameraTrack(cameraOn);
    
    usePublish([localMicrophoneTrack, localCameraTrack]);
    
    // Explicitly set uid to null to let Agora auto-assign an integer UID
    useJoin({ appid: appId, channel: channelName, token, uid: null }, isJoined);

    const remoteUsers = useRemoteUsers();

    useEffect(() => {
        if(micError) toast({ variant: 'destructive', title: 'Mic Error', description: micError.message });
        if(camError) toast({ variant: 'destructive', title: 'Camera Error', description: camError.message });
    }, [micError, camError, toast]);

    useEffect(() => {
        // Automatically join the call when tracks are ready
        if (!isMicLoading && !isCamLoading) {
            setIsJoined(true);
        }
    }, [isMicLoading, isCamLoading]);

    return (
        <div className="flex h-screen w-full flex-col bg-gray-900 text-white">
            <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-700 px-4">
                <h1 className="font-semibold">Zepmeds Video Consultation</h1>
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>{remoteUsers.length + 1}</span>
                </div>
            </header>

            <main className="flex flex-1 flex-col gap-4 p-4 md:flex-row">
                 <div className="flex flex-1 flex-col gap-4">
                    <div className="relative flex-1 rounded-lg bg-black grid grid-cols-1 grid-rows-1">
                        {remoteUsers.length > 0 ? (
                             <RemoteUser user={remoteUsers[0]} className="h-full w-full object-contain" />
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-4 text-gray-400">
                                <Users className="h-16 w-16"/>
                                <p>Waiting for the other participant to join...</p>
                            </div>
                        )}

                        <div className="absolute bottom-4 right-4 h-32 w-48 rounded-lg border-2 border-gray-600 bg-black overflow-hidden">
                            {localCameraTrack ? (
                                <LocalVideoTrack track={localCameraTrack} play={true} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gray-800">
                                    <VideoOff className="h-8 w-8 text-gray-500" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <aside className="w-full shrink-0 md:w-80">
                    <PatientProfile patientId={patientId} />
                </aside>
            </main>

            <footer className="flex h-20 flex-shrink-0 items-center justify-center gap-4 border-t border-gray-700 bg-gray-800">
                 <Button
                    variant="ghost"
                    size="icon"
                    className={cn('h-12 w-12 rounded-full', micOn ? 'bg-gray-600' : 'bg-red-600')}
                    onClick={() => setMic(!micOn)}
                >
                    {micOn ? <Mic /> : <MicOff />}
                </Button>
                 <Button
                    variant="ghost"
                    size="icon"
                    className={cn('h-12 w-12 rounded-full', cameraOn ? 'bg-gray-600' : 'bg-red-600')}
                    onClick={() => setCamera(!cameraOn)}
                >
                    {cameraOn ? <Video /> : <VideoOff />}
                </Button>
                <Button
                    variant="destructive"
                    size="icon"
                    className="h-16 w-16 rounded-full"
                    onClick={() => {
                        setIsJoined(false);
                        router.back();
                    }}
                >
                    <Phone className="rotate-[135deg]" />
                </Button>
                 <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-gray-600">
                    <MessageSquare />
                </Button>
                 <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-gray-600">
                    <Users />
                </Button>
            </footer>
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
