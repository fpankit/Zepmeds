
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import type { Peer, MediaConnection } from 'peerjs';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function PeerVideoPlayer() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();

    const remotePeerId = params.channel as string;

    const [peer, setPeer] = useState<Peer | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [callStatus, setCallStatus] = useState('connecting'); // 'connecting', 'connected', 'ended'
    
    const [micOn, setMic] = useState(true);
    const [cameraOn, setCamera] = useState(true);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const callRef = useRef<MediaConnection | null>(null);
    
    const endCall = useCallback(() => {
        if (callStatus === 'ended') return;
        console.log("Ending call.");
        setCallStatus('ended');
        callRef.current?.close();
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (peer && !peer.destroyed) {
            peer.destroy();
        }
        router.push('/home');
    }, [localStream, peer, router, callStatus]);
    

    // Initialize Peer and get media
    useEffect(() => {
        if (!user || user.isGuest) {
            toast({ variant: 'destructive', title: "Not Authenticated" });
            router.push('/login');
            return;
        }

        let peerInstance: Peer;

        const setup = async () => {
            try {
                // 1. Get user media first
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // 2. Initialize PeerJS
                const { Peer } = await import('peerjs');
                peerInstance = new Peer();
                setPeer(peerInstance);

                // 3. Once PeerJS is open, place the call
                peerInstance.on('open', (id) => {
                    console.log(`PeerJS initialized for caller. My ID is ${id}.`);
                    console.log(`Attempting to call remote peer: ${remotePeerId}`);
                    
                    if (!remotePeerId) {
                        toast({ variant: 'destructive', title: 'Error', description: 'No remote user to call.'});
                        endCall();
                        return;
                    }

                    const call = peerInstance.call(remotePeerId, stream);
                    callRef.current = call;
                    
                    call.on('stream', (remoteStrm) => {
                        console.log('Received remote stream from answered call');
                        setRemoteStream(remoteStrm);
                        setCallStatus('connected');
                    });

                    call.on('close', endCall);
                    call.on('error', (err) => {
                         console.error("Call error:", err);
                         toast({ variant: "destructive", title: "Call Failed", description: `Could not connect to the other user.`});
                         endCall();
                    });
                });
                
                // For the caller, also handle incoming calls in case of a cross-connection race condition
                peerInstance.on('call', (call) => {
                    console.log('Unexpected incoming call, answering.');
                    call.answer(stream); // Answer the call with our local stream.
                    callRef.current = call;
                    
                    call.on('stream', (remoteStrm) => {
                        console.log('Received remote stream on answer');
                        setRemoteStream(remoteStrm);
                        setCallStatus('connected');
                    });

                    call.on('close', endCall);
                });

                peerInstance.on('error', (err: any) => {
                    console.error('PeerJS error:', err);
                    if (err.type === 'peer-unavailable') {
                        toast({ variant: 'destructive', title: 'User Unavailable', description: 'The user you are trying to call is not available.' });
                    } else {
                        toast({ variant: 'destructive', title: 'Connection Error', description: `A connection error occurred: ${err.message}` });
                    }
                    endCall();
                });

            } catch (err) {
                 console.error('Failed to get local stream or initialize PeerJS', err);
                 toast({ variant: 'destructive', title: 'Media Error', description: 'Could not access your camera or microphone. Please check permissions.' });
                 endCall();
            }
        };

        setup();

        return () => {
            endCall();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Set remote video stream
    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);


    const toggleTrack = (type: 'audio' | 'video', enabled: boolean) => {
        localStream?.getTracks().forEach(track => {
            if (track.kind === type) {
                track.enabled = enabled;
            }
        });
    };
    
    const handleMicToggle = () => {
        const newMicState = !micOn;
        toggleTrack('audio', newMicState);
        setMic(newMicState);
    };

    const handleCameraToggle = () => {
        const newCameraState = !cameraOn;
        toggleTrack('video', newCameraState);
        setCamera(newCameraState);
    };


    return (
        <div className="flex h-screen w-full flex-col bg-gray-900 text-white">
             <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-700 px-4">
                <h1 className="font-semibold">Zepmeds Video Consultation</h1>
                <div className="text-sm text-gray-400">
                    Status: <span className={cn(callStatus === 'connected' && 'text-green-400')}>{callStatus}</span>
                </div>
            </header>
            
            <main className="flex flex-1 flex-col gap-4 p-4 md:flex-row">
                 <div className="flex flex-1 flex-col gap-4">
                    <div className="relative flex-1 rounded-lg bg-black overflow-hidden">
                        <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
                        {callStatus !== 'connected' && (
                             <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                 <p className="text-gray-300">
                                    Connecting to doctor...
                                </p>
                            </div>
                        )}
                        <div className="absolute bottom-4 right-4 h-32 w-48 rounded-lg border-2 border-gray-600 bg-black overflow-hidden">
                             <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                        </div>
                    </div>
                </div>
            </main>

             <footer className="flex h-20 flex-shrink-0 items-center justify-center gap-4 border-t border-gray-700 bg-gray-800">
                 <Button
                    variant="ghost"
                    size="icon"
                    className={cn('h-12 w-12 rounded-full', micOn ? 'bg-gray-600' : 'bg-red-600')}
                    onClick={handleMicToggle}
                    disabled={!localStream}
                >
                    {micOn ? <Mic /> : <MicOff />}
                </Button>
                 <Button
                    variant="ghost"
                    size="icon"
                    className={cn('h-12 w-12 rounded-full', cameraOn ? 'bg-gray-600' : 'bg-red-600')}
                    onClick={handleCameraToggle}
                    disabled={!localStream}
                >
                    {cameraOn ? <Video /> : <VideoOff />}
                </Button>
                <Button
                    variant="destructive"
                    size="icon"
                    className="h-16 w-16 rounded-full"
                    onClick={endCall}
                >
                    <Phone className="rotate-[135deg]" />
                </Button>
            </footer>
        </div>
    );
}

    