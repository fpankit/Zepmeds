
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Phone, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  collection,
  addDoc,
  Unsubscribe,
} from 'firebase/firestore';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

export function WebRTCVideoPlayer() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const callId = params.channel as string;

  const pc = useRef<RTCPeerConnection>(new RTCPeerConnection(servers));
  
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [isMicOn, setMicOn] = useState(true);
  const [isCameraOn, setCameraOn] = useState(true);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle');


  const hangUp = useCallback(async () => {
    if (callStatus === 'disconnected') return;
    setCallStatus('disconnected');

    // Close the peer connection
    if (pc.current && pc.current.signalingState !== 'closed') {
        pc.current.close();
    }
    
    // Stop and clear all media streams
    if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach(track => track.stop());
        remoteStreamRef.current = null;
    }
    
    // Clear video elements
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    
    // Update Firestore status if the document exists
    if (callId) {
        try {
            const callDocRef = doc(db, 'calls', callId);
            const callSnap = await getDoc(callDocRef);
            if (callSnap.exists() && callSnap.data()?.status !== 'ended') {
                 await updateDoc(callDocRef, { status: 'ended' });
            }
        } catch (error) {
            console.error("Error updating hangup status:", error);
        }
    }
    
    router.push('/home');
  }, [router, callId, callStatus]);
  
  // Main call setup effect
  useEffect(() => {
    if (!user || !callId || user.isGuest) {
      toast({variant: 'destructive', title: 'Error', description: 'Invalid user or call session.'});
      router.push('/home');
      return;
    }
    
    let isCancelled = false;
    const unsubscribes: Unsubscribe[] = [];

    const setupCall = async () => {
        setCallStatus('connecting');

        try {
            localStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
             if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStreamRef.current;
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Media Error', description: `Could not access camera or microphone: ${error.message}` });
            if (!isCancelled) hangUp();
            return;
        }
        
        if (isCancelled) return;

        remoteStreamRef.current = new MediaStream();
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStreamRef.current;
        }

        localStreamRef.current.getTracks().forEach(track => {
            pc.current.addTrack(track, localStreamRef.current!);
        });

        pc.current.ontrack = (event) => {
            event.streams[0].getTracks().forEach(track => {
                remoteStreamRef.current?.addTrack(track);
            });
            if (!isCancelled) setCallStatus('connected');
        };

        const callDocRef = doc(db, 'calls', callId);
        const offerCandidates = collection(callDocRef, 'offerCandidates');
        const answerCandidates = collection(callDocRef, 'answerCandidates');
        
        pc.current.onicecandidate = async (event) => {
            if (event.candidate) {
                const candidatesCollection = user.isDoctor ? answerCandidates : offerCandidates;
                 if (pc.current.signalingState !== 'closed') {
                    await addDoc(candidatesCollection, event.candidate.toJSON());
                 }
            }
        };

        if (user.isDoctor) { // Doctor answers
            const callSnap = await getDoc(callDocRef);
            if (isCancelled || !callSnap.exists() || !callSnap.data().offer) return;
            
            await pc.current.setRemoteDescription(new RTCSessionDescription(callSnap.data().offer));
            
            if(pc.current.signalingState !== 'have-remote-offer') return;

            const answerDescription = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answerDescription);

            const answer = { type: answerDescription.type, sdp: answerDescription.sdp };
            await updateDoc(callDocRef, { answer });
            
            const unsub = onSnapshot(offerCandidates, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added' && pc.current.signalingState !== 'closed') {
                        pc.current.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                    }
                });
            });
            unsubscribes.push(unsub);
        } else { // Patient creates offer
            const offerDescription = await pc.current.createOffer();
            await pc.current.setLocalDescription(offerDescription);
            
            const offer = { sdp: offerDescription.sdp, type: offerDescription.type };
            await updateDoc(callDocRef, { offer });

            const unsubAnswer = onSnapshot(callDocRef, (snapshot) => {
                const data = snapshot.data();
                if (pc.current && !pc.current.currentRemoteDescription && data?.answer && pc.current.signalingState !== 'closed') {
                    pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                }
            });
            unsubscribes.push(unsubAnswer);

            const unsubCandidates = onSnapshot(answerCandidates, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added' && pc.current && pc.current.signalingState !== 'closed') {
                        pc.current.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                    }
                });
            });
             unsubscribes.push(unsubCandidates);
        }

        // Listen for remote hangup
        const unsubStatus = onSnapshot(callDocRef, (snapshot) => {
            const data = snapshot.data();
            if (data?.status === 'ended' && !isCancelled) {
                hangUp();
            }
        });
        unsubscribes.push(unsubStatus);
    };
    
    setupCall().catch(err => {
        if (!isCancelled) {
             console.error("Call setup failed:", err);
             toast({ variant: 'destructive', title: 'Call Failed', description: "Could not establish a connection. Please try again." });
             hangUp();
        }
    });

    return () => {
      isCancelled = true;
      unsubscribes.forEach(unsub => unsub());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, callId]);
  
  // This separate effect handles the final cleanup when the component unmounts
  useEffect(() => {
    return () => {
        hangUp();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  
  const handleMicToggle = () => {
      if (localStreamRef.current) {
          localStreamRef.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
          setMicOn(prev => !prev);
      }
  };

  const handleCameraToggle = () => {
      if (localStreamRef.current) {
          localStreamRef.current.getVideoTracks().forEach(track => track.enabled = !track.enabled);
          setCameraOn(prev => !prev);
      }
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
        <div className="relative flex-1 rounded-lg bg-black overflow-hidden">
            {callStatus !== 'connected' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                     <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                        <p className="mt-2">{callStatus === 'connecting' ? 'Connecting, please wait...' : 'Waiting for other party to join...'}</p>
                     </div>
                 </div>
            )}
            <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
             <div className="absolute bottom-4 right-4 h-32 w-48 rounded-lg border-2 border-gray-600 bg-black overflow-hidden z-10">
                <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
               {!isCameraOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <VideoOff className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
        </div>
      </main>

      <footer className="flex h-20 flex-shrink-0 items-center justify-center gap-4 border-t border-gray-700 bg-gray-800">
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-12 w-12 rounded-full', isMicOn ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700')}
          onClick={handleMicToggle}
        >
          {isMicOn ? <Mic /> : <MicOff />}
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="h-16 w-16 rounded-full"
          onClick={hangUp}
          disabled={callStatus === 'disconnected'}
        >
           {callStatus === 'disconnected' ? <Loader2 className="animate-spin"/> : <Phone className="rotate-[135deg]" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-12 w-12 rounded-full', isCameraOn ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700')}
          onClick={handleCameraToggle}
        >
          {isCameraOn ? <Video /> : <VideoOff />}
        </Button>
      </footer>
    </div>
  );
}

    