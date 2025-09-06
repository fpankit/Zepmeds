
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, PhoneOff, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const CALL_TIMEOUT = 30000; // 30 seconds

export default function CallStatusPage() {
    const router = useRouter();
    const params = useParams();
    const callId = params.callId as string;
    const { toast } = useToast();

    const [callData, setCallData] = useState<any | null>(null);
    const [status, setStatus] = useState('calling'); // local status for UI

    useEffect(() => {
        if (!callId) {
            router.push('/doctor');
            return;
        }

        const callDocRef = doc(db, 'calls', callId);

        const unsubscribe = onSnapshot(callDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setCallData(data);

                if (data.status === 'accepted') {
                    setStatus('accepted');
                     // Wait for state to update before navigating
                    setTimeout(() => router.push(`/video-call/${callId}`), 500);
                } else if (data.status === 'rejected') {
                    setStatus('rejected');
                } else if (data.status === 'unanswered') {
                    setStatus('unanswered');
                }
            } else {
                toast({ variant: 'destructive', title: 'Call not found.' });
                router.push('/doctor');
            }
        });

        // Timeout logic
        const timeoutId = setTimeout(async () => {
             const currentDoc = await getDoc(callDocRef);
            if (currentDoc.exists() && currentDoc.data().status === 'calling') {
                await updateDoc(callDocRef, { status: 'unanswered' });
            }
        }, CALL_TIMEOUT);

        return () => {
            unsubscribe();
            clearTimeout(timeoutId);
        };
    }, [callId, router, toast]);

    const handleCancelCall = async () => {
        if (!callId) return;
        const callDocRef = doc(db, 'calls', callId);
        await updateDoc(callDocRef, { status: 'cancelled' });
        router.push('/doctor');
    };

    if (!callData) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    const getInitials = (name: string) => {
        if (!name) return 'Dr';
        return name.split(' ').map(n => n[0]).join('');
    }

    return (
        <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-4 text-center">
             <div className="absolute inset-0 z-0 bg-gradient-to-br from-background via-gray-900 to-black" />
             <motion.div 
                className="absolute z-10"
                initial={{ opacity: 0}}
                animate={{ opacity: 0.5, scale: [1, 1.2, 1], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
             >
                <div className="h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            </motion.div>


            <motion.div 
                className="relative z-20 flex flex-col items-center space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Avatar className="h-32 w-32 border-4 border-primary/50">
                    <AvatarImage src={callData.doctorImage} alt={callData.doctorName} />
                    <AvatarFallback className="text-4xl bg-card">{getInitials(callData.doctorName)}</AvatarFallback>
                </Avatar>

                {status === 'calling' && (
                    <>
                        <h1 className="text-3xl font-bold">Calling Dr. {callData.doctorName}</h1>
                        <p className="text-muted-foreground">{callData.doctorSpecialty}</p>
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                         <div className="absolute bottom-[-150px]">
                            <Button variant="destructive" size="lg" className="rounded-full h-16 w-16" onClick={handleCancelCall}>
                                <PhoneOff />
                            </Button>
                        </div>
                    </>
                )}
                
                {status === 'accepted' && (
                     <>
                        <h1 className="text-3xl font-bold">Call Accepted!</h1>
                        <p className="text-muted-foreground">Redirecting you to the call...</p>
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </>
                )}


                {(status === 'rejected' || status === 'unanswered' || status === 'cancelled') && (
                     <>
                        <XCircle className="h-16 w-16 text-destructive" />
                        <h1 className="text-3xl font-bold">
                            {status === 'rejected' && 'Call Rejected'}
                            {status === 'unanswered' && 'No Answer'}
                            {status === 'cancelled' && 'Call Cancelled'}
                        </h1>
                        <p className="text-muted-foreground">
                            {status !== 'cancelled' ? `Dr. ${callData.doctorName} is currently unavailable. Please try again later.` : 'You have cancelled the call.'}
                        </p>
                        <Button onClick={() => router.push('/doctor')} size="lg">
                            Back to Doctors
                        </Button>
                    </>
                )}
            </motion.div>
        </div>
    );
}
