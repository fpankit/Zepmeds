
'use client';

import { useState, useEffect, useRef, Suspense, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Mic, MicOff, PhoneOff, Volume2, Bot, WifiOff, MessageSquare } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { echoDoc, EchoDocInput, EchoDocOutput } from '@/ai/flows/echo-doc-flow';
import Typewriter from 'typewriter-effect';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { findOfflineMatch } from '@/lib/offline-symptom-data';

interface ConversationTurn {
    role: 'user' | 'model';
    text: string;
}

// Check for SpeechRecognition API
const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));


function EchoDocCallContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Component State
    const [conversation, setConversation] = useState<ConversationTurn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [callStatus, setCallStatus] = useState("Connecting...");
    const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
    const [isOffline, setIsOffline] = useState(false);
    
    // Extracted URL Params
    const initialSymptoms = searchParams.get('symptoms');

    const audioRef = useRef<HTMLAudioElement>(null);
    const recognitionRef = useRef<any>(null);
    
    // --- Online/Offline State Management ---
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        if (typeof navigator.onLine !== 'undefined') {
            setIsOffline(!navigator.onLine);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);


    // --- Microphone Permission ---
    useEffect(() => {
        if (isOffline) {
            setHasMicPermission(false);
            return;
        }
        const getMicPermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setHasMicPermission(true);
                stream.getTracks().forEach(track => track.stop()); // Stop stream, we only need permission
            } catch (error) {
                console.error("Mic permission denied:", error);
                setHasMicPermission(false);
            }
        };
        getMicPermission();
    }, [isOffline]);


    // --- Main Message Handling Logic ---
    const handleNewMessage = useCallback(async (text: string) => {
        setIsLoading(true);
        setCallStatus(isOffline ? "Checking offline data..." : "AI is responding...");

        if (text) {
          setConversation(prev => [...prev, { role: 'user', text }]);
        }

        // --- ONLINE LOGIC ---
        if (!isOffline) {
            try {
                const input: EchoDocInput = {
                    symptoms: text,
                    conversationHistory: conversation, 
                };

                const result: EchoDocOutput = await echoDoc(input);
                
                const newModelTurn: ConversationTurn = { role: 'model', text: result.responseText };
                
                setConversation(prev => {
                  const newHistory = text ? prev.slice(0, -1) : prev;
                  return text ? [...newHistory, { role: 'user', text }, newModelTurn] : [...newHistory, newModelTurn];
                });
                
                if (audioRef.current && result.responseAudio) {
                    audioRef.current.src = result.responseAudio;
                    audioRef.current.play().catch(e => console.error("Audio playback failed", e));
                }
                 setCallStatus("Connected");

            } catch (error: any) {
                toast({ variant: 'destructive', title: 'AI Error', description: error.message });
                setCallStatus("Call Failed");
                if (text) {
                    setConversation(prev => prev.slice(0, -1));
                }
            } finally {
                setIsLoading(false);
            }
        } 
        // --- OFFLINE LOGIC ---
        else {
            const offlineResult = findOfflineMatch(text, 'English'); // Default to English for offline mode
            let responseText = "You are offline. I can only provide general information. Please describe a common symptom like 'fever' or 'headache'.";

            if (offlineResult) {
                responseText = `Here is some general advice for your symptom:\n\n**Potential Condition:** ${offlineResult.differentialDiagnosis[0].condition}\n\n**Home Remedies:**\n- ${offlineResult.potentialMedicines.join('\n- ')}\n\n**Disclaimer:** ${offlineResult.doctorAdvisory}`;
            }
            
            const newModelTurn: ConversationTurn = { role: 'model', text: responseText };

            setConversation(prev => {
                const newHistory = text ? prev.slice(0, -1) : prev;
                return text ? [...newHistory, { role: 'user', text }, newModelTurn] : [...newHistory, newModelTurn];
            });

            setCallStatus("Offline Mode");
            setIsLoading(false);
        }
    }, [isOffline, conversation, toast]);

    
    // --- Initial message effect ---
    useEffect(() => {
        if (conversation.length === 0) {
            setTimeout(() => handleNewMessage(initialSymptoms || ''), 100);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialSymptoms, isOffline]); // Re-trigger if offline status changes at start


    // --- Speech Recognition Logic ---
    const setupRecognition = useCallback(() => {
        if (!SpeechRecognition || isOffline) {
            if (!isOffline) toast({ variant: 'destructive', title: 'Browser Not Supported', description: 'Voice recognition is not supported by your browser.' });
            return;
        }
        
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onstart = () => { setIsListening(true); setCallStatus("Listening..."); };
        recognition.onresult = (event: any) => { const transcript = event.results[0][0].transcript; if (transcript) { handleNewMessage(transcript); } };
        recognition.onerror = (event: any) => { console.error("Speech recognition error:", event.error); toast({ variant: 'destructive', title: 'Recognition Error', description: `Could not understand audio. Reason: ${event.error}` }); };
        recognition.onend = () => { setIsListening(false); if (!isLoading) setCallStatus("Connected"); };
        recognitionRef.current = recognition;

    }, [toast, isLoading, handleNewMessage, isOffline]);

    const toggleMute = () => {
        if (isOffline) {
             toast({ title: 'Voice Disabled', description: 'Voice input is not available in offline mode.' });
             return;
        }
        if (!hasMicPermission) { toast({ variant: 'destructive', title: 'Microphone permission is required.' }); return; }
        if (!recognitionRef.current) { setupRecognition(); }

        const nextMutedState = !isMuted;
        setIsMuted(nextMutedState);

        if (!nextMutedState) { if (!isListening) recognitionRef.current?.start(); } 
        else { recognitionRef.current?.stop(); }
    };


    const latestAiResponse = conversation.filter(turn => turn.role === 'model').pop()?.text;
    
    const handleEndCall = () => {
        if (audioRef.current) audioRef.current.pause();
        if (recognitionRef.current) recognitionRef.current.stop();
        router.push('/home');
    }

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-background to-card">
            <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="bg-black/20 text-white hover:bg-black/40">
                    <ArrowLeft className="h-6 w-6" />
                </Button>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
                {isOffline && (
                     <Alert variant="default" className="mb-4 max-w-lg bg-blue-500/10 border-blue-500/50">
                        <WifiOff className="h-4 w-4 text-blue-400" />
                        <AlertTitle className="text-blue-300">You are Offline</AlertTitle>
                        <AlertDescription className="text-blue-400/80">
                            Voice features are disabled. You can chat via text for general advice.
                        </AlertDescription>
                    </Alert>
                )}
                {hasMicPermission === false && !isOffline && (
                    <Alert variant="destructive" className="mb-4 max-w-lg">
                        <AlertTitle>Microphone Access Required</AlertTitle>
                        <AlertDescription>Please enable microphone permissions in your browser to talk to the AI.</AlertDescription>
                    </Alert>
                )}
                 <div className="flex flex-col items-center">
                    <Avatar className="h-32 w-32 border-4 border-primary/50 shadow-lg">
                        <AvatarFallback className="text-4xl bg-primary/20">
                            {isOffline ? <MessageSquare className="h-14 w-14"/> : <Bot className="h-16 w-16" />}
                        </AvatarFallback>
                    </Avatar>
                    <h1 className="text-3xl font-bold mt-4">{isOffline ? 'Offline Advisor' : 'Echo Doc AI'}</h1>
                    <p className="text-lg text-primary">{isOffline ? 'General Text Guidance' : 'Your AI Medical Assistant'}</p>
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
                             className="text-lg text-white whitespace-pre-wrap" // Allow newlines to render
                        >
                             {isLoading && conversation.length === 0 ? (
                                <p>Starting conversation...</p>
                             ) : isLoading && !latestAiResponse ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                             ) : latestAiResponse ? (
                                <Typewriter
                                    options={{
                                        strings: [latestAiResponse],
                                        autoStart: true,
                                        loop: false,
                                        delay: isOffline ? 5 : 40,
                                        cursor: '',
                                        deleteSpeed: Infinity,
                                    }}
                                />
                             ) : (
                                <p>Conversation ended or failed to start.</p>
                             )}
                        </motion.div>
                    </AnimatePresence>
                </div>

            </main>
            
            <footer className="p-6">
                <div className="flex items-center justify-center gap-6">
                     <div className="flex flex-col items-center gap-2">
                        <Button onClick={toggleMute} size="icon" className={cn("h-16 w-16 rounded-full transition-colors", isOffline ? "bg-gray-600" : (isMuted ? "bg-white text-black" : (isListening ? "bg-red-500 text-white animate-pulse" : "bg-white/20 text-white")))} disabled={isOffline}>
                            {isMuted ? <MicOff /> : <Mic />}
                        </Button>
                        <span className="text-xs text-white">{isOffline ? "Voice Muted" : (isMuted ? "Muted" : (isListening ? "Listening..." : "Unmuted"))}</span>
                    </div>
                     <div className="flex flex-col items-center gap-2">
                         <Button onClick={handleEndCall} variant="destructive" size="icon" className="h-16 w-16 rounded-full">
                            <PhoneOff />
                        </Button>
                         <span className="text-xs text-white">End</span>
                    </div>
                </div>
            </footer>
            
            <audio ref={audioRef} className="hidden" onEnded={() => {
                 if (!isMuted && !isListening) recognitionRef.current?.start();
            }}/>
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

    