
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
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [peer, setPeer] = useState<Peer | null>(null);
    const [myPeerId, setMyPeerId] = useState('');
    const [callStatus, setCallStatus] = useState('idle'); // idle, ready, calling, connected, ended

    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    
    const [micOn, setMic] = useState(true);
    const [cameraOn, setCamera] = useState(true);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const callRef = useRef<MediaConnection | null>(null);
    
    const isCaller = searchParams.get('isCaller') === 'true';
    const remotePeerId = params.channel as string; 
    const [patientIdForDoctor, setPatientIdForDoctor] = useState<string | null>(null);


    const endCall = useCallback(() => {
        console.log("Ending call.");
        callRef.current?.close();
        setCallStatus('ended');
        localStream?.getTracks().forEach(track => track.stop());
        peer?.destroy();
        router.push('/home');
    }, [localStream, peer, router]);


    // Initialize PeerJS
    useEffect(() => {
        if (!user) return;

        const initializePeer = async () => {
            const { Peer } = await import('peerjs');
            // Doctor receives calls on their own ID, Patient uses a random ID
            const peerInstance = isCaller ? new Peer() : new Peer(user.id);

            peerInstance.on('open', (id) => {
                console.log('My peer ID is: ' + id);
                setMyPeerId(id);
                setCallStatus('ready');
            });
            
            peerInstance.on('error', (err: any) => {
                console.error('PeerJS error:', err);
                if (err.type === 'peer-unavailable') {
                    toast({ variant: 'destructive', title: 'Doctor Offline', description: 'The doctor is not available for a call right now.' });
                } else {
                    toast({ variant: 'destructive', title: 'Connection Error', description: `A connection error occurred: ${err.type}` });
                }
                setCallStatus('error');
            });

            setPeer(peerInstance);
        };

        initializePeer();

        return () => {
            callRef.current?.close();
            peer?.destroy();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Get user media as soon as component loads
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            })
            .catch(err => {
                console.error('Failed to get local stream', err);
                toast({ variant: 'destructive', title: 'Media Error', description: 'Could not access your camera or microphone. Please check permissions.' });
            });
    }, [toast]);


    const initiateCall = useCallback((remoteId: string, peerInstance: Peer, stream: MediaStream) => {
        if (!user || user.isGuest) return;
        setCallStatus('calling');
        console.log(`Calling remote peer: ${remoteId}`);

        try {
            const call = peerInstance.call(remoteId, stream, { metadata: { callerId: user.id }});
            if (!call) {
                console.error("Call object is undefined.");
                endCall();
                return;
            }
            callRef.current = call;
            
            call.on('stream', (remoteStream) => {
                console.log('Received remote stream from answered call');
                setRemoteStream(remoteStream);
                setCallStatus('connected');
            });
            
            call.on('close', endCall);

            call.on('error', (err) => {
                console.error("Call error:", err);
                toast({ variant: "destructive", title: "Call Failed", description: "Could not connect to the other user."});
                endCall();
            });
        } catch (e) {
            console.error("Error initiating call:", e);
            endCall();
        }
    }, [endCall, toast, user]);
    
    // If we are the caller, initiate the call once ready.
    useEffect(() => {
        if (isCaller && peer && localStream && callStatus === 'ready' && remotePeerId) {
            initiateCall(remotePeerId, peer, localStream);
        }
    }, [isCaller, peer, localStream, callStatus, remotePeerId, initiateCall]);

    // Set up listener for incoming calls (for the doctor)
    useEffect(() => {
        if (peer && localStream && !isCaller) { // Only doctors listen for calls
            peer.on('call', (call) => {
                console.log('Receiving call from', call.peer);
                if (call.metadata && call.metadata.callerId) {
                    setPatientIdForDoctor(call.metadata.callerId);
                }

                setCallStatus('receiving');
                call.answer(localStream); // Answer the call with our local stream.
                callRef.current = call;
                
                call.on('stream', (remoteStream) => {
                    console.log('Received remote stream');
                    setRemoteStream(remoteStream);
                    setCallStatus('connected');
                });

                call.on('close', endCall);
            });
        }
    }, [peer, localStream, endCall, isCaller]);

    // Set video streams
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
        toggleTrack('audio', !micOn);
        setMic(!micOn);
    };

    const handleCameraToggle = () => {
        toggleTrack('video', !cameraOn);
        setCamera(!cameraOn);
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
                                 <p className="text-gray-300">{
                                    callStatus === 'calling' ? 'Connecting to doctor...' :
                                    callStatus === 'receiving' ? 'Incoming call...' :
                                    callStatus === 'ready' ? 'Ready to connect...' :
                                    'Waiting for other user...'
                                }</p>
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
