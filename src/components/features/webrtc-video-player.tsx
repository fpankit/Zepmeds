
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
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
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

  const pc = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [isMicOn, setMicOn] = useState(true);
  const [isCameraOn, setCameraOn] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [callData, setCallData] = useState<Call | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle');


  // Main call setup effect
  useEffect(() => {
    if (!user || !callId || user.isGuest) {
      return;
    }
    
    setCallStatus('connecting');
    pc.current = new RTCPeerConnection(servers);
    remoteStream.current = new MediaStream();

    const startMedia = async () => {
        localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream.current;
        }

        localStream.current.getTracks().forEach(track => {
            if (pc.current?.signalingState !== 'closed') {
                pc.current?.addTrack(track, localStream.current!);
            }
        });
    };

    const setupSignaling = async () => {
        const callDoc = doc(db, 'calls', callId);
        const offerCandidates = collection(callDoc, 'offerCandidates');
        const answerCandidates = collection(callDoc, 'answerCandidates');
        
        pc.current!.onicecandidate = async (event) => {
            if (event.candidate) {
                await addDoc(offerCandidates, event.candidate.toJSON());
            }
        };
        
        // Create Offer
        const offerDescription = await pc.current!.createOffer();
        await pc.current!.setLocalDescription(offerDescription);
        const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
        };
        await updateDoc(callDoc, { offer });

        // Listen for Answer
        const unsubAnswer = onSnapshot(callDoc, (snapshot) => {
            const data = snapshot.data();
            if (pc.current && pc.current.signalingState !== 'closed' && !pc.current.currentRemoteDescription && data?.answer) {
                const answerDescription = new RTCSessionDescription(data.answer);
                pc.current.setRemoteDescription(answerDescription);
            }
             if (data?.status === 'ended') {
                hangUp();
            }
        });

        // Listen for ICE candidates from remote
        const unsubCandidates = onSnapshot(answerCandidates, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added' && pc.current && pc.current.signalingState !== 'closed') {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    pc.current.addIceCandidate(candidate);
                }
            });
        });
        
        return () => {
            unsubAnswer();
            unsubCandidates();
        }
    };
    
    pc.current.ontrack = (event) => {
        event.streams[0].getTracks().forEach(track => {
          remoteStream.current?.addTrack(track);
        });
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream.current;
        }
        setCallStatus('connected');
    };
    
    let unsubSignal: (()=>void) | undefined;
    
    const initialize = async () => {
        try {
            await startMedia();
            unsubSignal = await setupSignaling();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Call Failed', description: error.message });
            hangUp();
        }
    }

    initialize();

    return () => {
      // This cleanup runs on unmount or dependency change
      // It should NOT close the PC, only stop tracks and listeners
      if (unsubSignal) unsubSignal();
      
      localStream.current?.getTracks().forEach(track => track.stop());
      if (localVideoRef.current) {
          localVideoRef.current.srcObject = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, callId]);

  const hangUp = useCallback(async () => {
    if (isLeaving) return;
    setIsLeaving(true);
    setCallStatus('disconnected');

    if (pc.current && pc.current.signalingState !== 'closed') {
        pc.current.close();
    }
    pc.current = null;
    
    localStream.current?.getTracks().forEach(track => track.stop());
    remoteStream.current?.getTracks().forEach(track => track.stop());
    localStream.current = null;
    remoteStream.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    
    if (callId) {
        try {
            const callDoc = doc(db, 'calls', callId);
            const callSnap = await getDoc(callDoc);
            if (callSnap.exists() && callSnap.data()?.status !== 'ended') {
                 await updateDoc(callDoc, { status: 'ended' });
                 
                 // Clean up subcollections
                 const offerCandidates = await getDocs(collection(callDoc, 'offerCandidates'));
                 offerCandidates.forEach(async (doc) => await deleteDoc(doc.ref));
                 const answerCandidates = await getDocs(collection(callDoc, 'answerCandidates'));
                 answerCandidates.forEach(async (doc) => await deleteDoc(doc.ref));
            }
        } catch (error) {
            console.error("Error ending call in Firestore:", error);
        }
    }
    
    router.push('/home');
  }, [router, callId, isLeaving]);
  
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
          disabled={isLeaving}
        >
           {isLeaving ? <Loader2 className="animate-spin"/> : <Phone className="rotate-[135deg]" />}
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
