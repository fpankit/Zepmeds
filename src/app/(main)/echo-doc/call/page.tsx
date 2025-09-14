
'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Mic, MicOff, PhoneOff, Volume2, Bot, Send } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { echoDoc, EchoDocInput } from '@/ai/flows/echo-doc-flow';
import Typewriter from 'typewriter-effect';
import { useCalls } from '@/hooks/use-calls';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface ConversationTurn {
    role: 'user' | 'model';
    text: string;
}

function EchoDocCallContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { doctors } = useCalls();
    const { toast } = useToast();

    // Component State
    const [conversation, setConversation] = useState<ConversationTurn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaker, setIsSpeaker] = useState(true);
    const [callStatus, setCallStatus] = useState("Connecting...");
    
    // Extracted URL Params
    const initialSymptoms = searchParams.get('symptoms');
    const language = searchParams.get('language');
    const doctorId = searchParams.get('doctorId');

    const audioRef = useRef<HTMLAudioElement>(null);
    const doctor = doctors.find(doc => doc.id === doctorId);

    // Initial message effect
    useEffect(() => {
        if (initialSymptoms && language) {
            handleNewMessage(initialSymptoms, true);
        } else {
            toast({ variant: 'destructive', title: 'Missing required information.' });
            router.push('/echo-doc');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialSymptoms, language]);
    

    const handleNewMessage = async (text: string, isInitialMessage = false) => {
        setIsLoading(true);
        setCallStatus("AI is responding...");
        
        // Only add user message to history if it's not the very first one
        const updatedConversation = isInitialMessage 
            ? conversation 
            : [...conversation, { role: 'user', text }];
        if(!isInitialMessage) setConversation(updatedConversation);


        try {
            const input: EchoDocInput = {
                symptoms: text,
                language: language || 'English',
                conversationHistory: updatedConversation,
            };

            const result = await echoDoc(input);
            
            const newModelTurn: ConversationTurn = { role: 'model', text: result.responseText };
            setConversation(prev => [...prev, newModelTurn]);
            
            if (audioRef.current && result.responseAudio) {
                audioRef.current.src = result.responseAudio;
                audioRef.current.play().catch(e => console.error("Audio playback failed", e));
            }
             setCallStatus("Connected");

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'AI Error', description: error.message });
            setCallStatus("Call Failed");
        } finally {
            setIsLoading(false);
        }
    };
    
    const latestAiResponse = conversation.filter(turn => turn.role === 'model').pop()?.text;
    
    const handleEndCall = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        router.push('/home');
    }

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-background to-card">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="bg-black/20 text-white hover:bg-black/40">
                    <ArrowLeft className="h-6 w-6" />
                </Button>
            </header>

            {/* Main Call UI */}
            <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
                 <div className="flex flex-col items-center">
                    <Avatar className="h-32 w-32 border-4 border-primary/50 shadow-lg">
                        <AvatarImage src={doctor?.image} />
                        <AvatarFallback className="text-4xl bg-primary/20">{doctor?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-3xl font-bold mt-4">{doctor?.name}</h1>
                    <p className="text-lg text-primary">{doctor?.specialty}</p>
                    <p className="text-muted-foreground mt-2">{callStatus}</p>
                </div>
                
                <div className="mt-8 p-6 rounded-xl bg-black/20 backdrop-blur-md w-full max-w-lg min-h-[100px] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={latestAiResponse || 'loading'}
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, y: -20 }}
                             transition={{ duration: 0.3 }}
                             className="text-lg text-white"
                        >
                             {isLoading && conversation.length > 0 ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                             ) : latestAiResponse ? (
                                <Typewriter
                                    options={{
                                        strings: [latestAiResponse],
                                        autoStart: true,
                                        loop: false,
                                        delay: 40,
                                        cursor: '',
                                        deleteSpeed: Infinity, // Prevents deletion
                                    }}
                                />
                             ) : (
                                <p>Starting conversation...</p>
                             )}
                        </motion.div>
                    </AnimatePresence>
                </div>

            </main>
            
            {/* Footer with Call Controls */}
            <footer className="p-6">
                 {/* Placeholder button to simulate user's next turn */}
                <div className="flex justify-center mb-4">
                    <Button 
                        onClick={() => handleNewMessage("Okay, what should I do next?")} 
                        disabled={isLoading} 
                        variant="secondary"
                    >
                        <Send className="mr-2 h-4 w-4"/>
                        Send Next Response
                    </Button>
                </div>
                <div className="flex items-center justify-center gap-6">
                     <div className="flex flex-col items-center gap-2">
                        <Button onClick={() => setIsMuted(!isMuted)} size="icon" className={cn("h-16 w-16 rounded-full", isMuted ? "bg-white text-black" : "bg-white/20 text-white")}>
                            {isMuted ? <MicOff /> : <Mic />}
                        </Button>
                        <span className="text-xs text-white">Mute</span>
                    </div>
                     <div className="flex flex-col items-center gap-2">
                        <Button onClick={() => setIsSpeaker(!isSpeaker)} size="icon" className="h-16 w-16 rounded-full bg-white/20 text-white">
                            <Volume2 />
                        </Button>
                        <span className="text-xs text-white">Speaker</span>
                    </div>
                     <div className="flex flex-col items-center gap-2">
                         <Button onClick={handleEndCall} variant="destructive" size="icon" className="h-16 w-16 rounded-full">
                            <PhoneOff />
                        </Button>
                         <span className="text-xs text-white">End</span>
                    </div>
                </div>
            </footer>
            
            <audio ref={audioRef} className="hidden" />
        </div>
    );
}

export default function EchoDocCallPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <EchoDocCallContent />
        </Suspense>
    )
}
