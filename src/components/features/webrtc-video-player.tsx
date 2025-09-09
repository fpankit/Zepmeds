
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
  deleteDoc,
  getDocs,
  Unsubscribe,
  setDoc,
  DocumentReference,
} from 'firebase/firestore';
import { Call } from '@/hooks/use-calls';

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

  // Use useRef initializer to create a single, stable RTCPeerConnection instance
  const pc = useRef<RTCPeerConnection>(new RTCPeerConnection(servers));
  
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [isMicOn, setMicOn] = useState(true);
  const [isCameraOn, setCameraOn] = useState(true);
  const [callData, setCallData] = useState<Call | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle');


  // Main call setup effect
  useEffect(() => {
    if (!user || !callId || user.isGuest) {
      return;
    }
    
    let isCancelled = false;
    const unsubscribes: Unsubscribe[] = [];

    const setupCall = async () => {
        setCallStatus('connecting');

        // Get local media
        try {
            localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
             if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStream.current;
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Media Error', description: `Could not access camera or microphone: ${error.message}` });
            if (!isCancelled) hangUp();
            return;
        }

        if (isCancelled || !pc.current) return;
        
        // Push tracks to connection
        localStream.current.getTracks().forEach(track => {
            if (pc.current.signalingState !== 'closed') {
               pc.current.addTrack(track, localStream.current!);
            }
        });

        // Setup remote stream
        pc.current.ontrack = (event) => {
            if (!remoteStream.current) {
                remoteStream.current = new MediaStream();
            }
            event.streams[0].getTracks().forEach(track => {
                remoteStream.current?.addTrack(track);
            });
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream.current;
            }
            if (!isCancelled) setCallStatus('connected');
        };

        const callDoc = doc(db, 'calls', callId);
        const offerCandidates = collection(callDoc, 'offerCandidates');
        const answerCandidates = collection(callDoc, 'answerCandidates');
        
        pc.current.onicecandidate = async (event) => {
            if (event.candidate && pc.current.signalingState !== 'closed') {
                const candidatesCollection = user.isDoctor ? answerCandidates : offerCandidates;
                await addDoc(candidatesCollection, event.candidate.toJSON());
            }
        };

        if (user.isDoctor) {
            // Doctor: Answer the call
            const callSnap = await getDoc(callDoc);
            if (isCancelled || !callSnap.exists() || !callSnap.data().offer || pc.current.signalingState !== 'stable') return;
            
            await pc.current.setRemoteDescription(new RTCSessionDescription(callSnap.data().offer));
            
            // Guard against creating answer in wrong state
            if(pc.current.signalingState !== 'have-remote-offer') return;

            const answerDescription = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answerDescription);

            const answer = { type: answerDescription.type, sdp: answerDescription.sdp };
            await updateDoc(callDoc, { answer });
            
            const unsub = onSnapshot(offerCandidates, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added' && pc.current?.signalingState !== 'closed') {
                        pc.current?.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                    }
                });
            });
            unsubscribes.push(unsub);
        } else {
            // Patient: Create Offer
            if(pc.current.signalingState !== 'stable') return;
            const offerDescription = await pc.current.createOffer();
            await pc.current.setLocalDescription(offerDescription);
            
            const offer = { sdp: offerDescription.sdp, type: offerDescription.type };
            await updateDoc(callDoc, { offer });

            const unsubAnswer = onSnapshot(callDoc, (snapshot) => {
                const data = snapshot.data();
                if (pc.current && !pc.current.currentRemoteDescription && data?.answer && pc.current.signalingState !== 'closed') {
                    pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                }
            });
            unsubscribes.push(unsubAnswer);

            const unsubCandidates = onSnapshot(answerCandidates, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added' && pc.current && pc.current.signalingState !== 'closed') {
                        const candidate = new RTCIceCandidate(change.doc.data());
                        pc.current.addIceCandidate(candidate);
                    }
                });
            });
             unsubscribes.push(unsubCandidates);
        }
    };
    
    setupCall().catch(err => {
        if (!isCancelled) {
             console.error("Setup failed:", err);
             toast({ variant: 'destructive', title: 'Call Failed', description: err.message });
             hangUp();
        }
    });

    // Listen for hangup from other party
    const callDocRef = doc(db, 'calls', callId);
    const unsubStatus = onSnapshot(callDocRef, (snapshot) => {
        const data = snapshot.data();
        if (data?.status === 'ended' && !isCancelled) {
            hangUp();
        }
    });
    unsubscribes.push(unsubStatus);

    return () => {
      isCancelled = true;
      unsubscribes.forEach(unsub => unsub());
      hangUp();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, callId]);

  const hangUp = useCallback(async () => {
    if (callStatus === 'disconnected') return;
    setCallStatus('disconnected');

    if (pc.current && pc.current.signalingState !== 'closed') {
        pc.current.close();
    }
    
    // Stop and clear streams
    if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
        localStream.current = null;
    }
    if (remoteStream.current) {
        remoteStream.current.getTracks().forEach(track => track.stop());
        remoteStream.current = null;
    }
    
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    
    if (callId) {
        try {
            const callDoc = doc(db, 'calls', callId);
            const callSnap = await getDoc(callDoc);
            if (callSnap.exists() && callSnap.data()?.status !== 'ended') {
                 await updateDoc(callDoc, { status: 'ended' });
            }
        } catch (error) {
            // Ignore error on cleanup
        }
    }
    
    router.push('/home');
  }, [router, callId, callStatus]);
  
  const handleMicToggle = () => {
      if (localStream.current) {
          localStream.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
          setMicOn(prev => !prev);
      }
  };

  const handleCameraToggle = () => {
      if (localStream.current) {
          localStream.current.getVideoTracks().forEach(track => track.enabled = !track.enabled);
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
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                     <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                        <p className="mt-2">{callStatus === 'connecting' ? 'Connecting, please wait...' : 'Waiting for doctor to join...'}</p>
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

    
