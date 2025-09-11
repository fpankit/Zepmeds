
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, PhoneOff, Bot, Loader2 } from 'lucide-react';
import { echoDocFlow } from '@/ai/flows/echo-doc-flow';
import { detectLanguage } from '@/ai/flows/detect-language';
import { textToSpeech } from '@/ai-flows/text-to-speech';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';


type CallStatus = "idle" | "listening" | "processing" | "speaking";

const SpeechRecognition =
  (typeof window !== 'undefined' && window.SpeechRecognition) ||
  (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition);

export function EchoDocCallContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const doctorName = searchParams.get('doctorName');
    const initialSymptoms = searchParams.get('symptoms');
    const { toast } = useToast();

    const [status, setStatus] = useState<CallStatus>("idle");
    const [currentAiResponse, setCurrentAiResponse] = useState('');
    const [useTTS, setUseTTS] = useState(true);
    const [audioQueue, setAudioQueue] = useState<string[]>([]);

    const recognitionRef = useRef<any | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isMounted = useRef(true);
    
     const speak = useCallback(async (text: string) => {
        if (!isMounted.current) return;
    
        setCurrentAiResponse(text);

        if (!useTTS) {
            setStatus('speaking');
            // In text-only mode, simulate speaking time and then return to idle
            setTimeout(() => { if (isMounted.current) setStatus('idle'); }, 1500);
            return;
        }

        try {
            const { audio } = await textToSpeech({ text });
            // CRITICAL: Ensure we have a valid, non-empty audio URL before queueing
            if (isMounted.current && audio) {
                setAudioQueue(prev => [...prev, audio]);
            } else {
                 throw new Error("Generated audio was empty or component unmounted.");
            }
        } catch (error: any) {
            if (!isMounted.current) return;
            console.error("Audio generation failed:", error);
            const errorMessage = error.message || 'An unknown error occurred.';
            const isQuotaError = errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota');

            toast({
                variant: "destructive",
                title: isQuotaError ? "Voice Limit Reached" : "Voice Error",
                description: isQuotaError 
                    ? "Switching to text-only mode for this session." 
                    : "Could not generate audio. Displaying text instead.",
            });
            setUseTTS(false); // Fallback to text for the rest of the session
            setStatus('idle'); // Revert to idle state on error
        }
    }, [toast, useTTS]);

    const handleSendTranscript = useCallback(async (text: string) => {
        if (!text || !isMounted.current) {
            setStatus('idle');
            return;
        };
        
        setStatus('processing');
        
        try {
            const { language: detectedLanguage } = await detectLanguage({ text });
            const { response: aiResponseText } = await echoDocFlow({ query: text, language: detectedLanguage });
            
            if (isMounted.current) {
               await speak(aiResponseText);
            }
        } catch (error) {
            if (!isMounted.current) return;
            console.error("AI Response Error:", error);
            const errorMsg = "I'm sorry, I encountered an error. Could you please repeat that?";
            await speak(errorMsg);
        }
    }, [speak]);

    // This effect processes the audio queue
    useEffect(() => {
        // Only proceed if we have items in the queue, we are not already speaking, and the audio element is ready and paused.
        if (audioQueue.length > 0 && status !== 'speaking' && audioRef.current?.paused) {
            const nextAudio = audioQueue[0];

            if (!nextAudio) {
                 console.error("Dequeued an empty audio source.");
                 setAudioQueue(prev => prev.slice(1)); // Remove invalid item
                 return;
            }

            setAudioQueue(prev => prev.slice(1));
            setStatus('speaking');
            audioRef.current.src = nextAudio;
            
            audioRef.current.play().catch(e => {
                console.error("Audio playback failed:", e);
                // If playback fails, reset to idle to allow the user to try again.
                if (isMounted.current) setStatus('idle');
            });
        }
    }, [audioQueue, status]);


    useEffect(() => {
        isMounted.current = true;

        const greetAndProcess = async () => {
            let greetingText = "Hello! I am EchoDoc, your AI medical assistant.";
            if (doctorName) {
                greetingText += ` I am simulating a conversation with Dr. ${doctorName}. How can I help you today?`;
            } else {
                 greetingText += " How can I help you today?";
            }
            
            await speak(greetingText);
            
            if (initialSymptoms) {
                handleSendTranscript(`I'm experiencing the following symptoms: ${initialSymptoms}`);
            }
        };

        const timer = setTimeout(greetAndProcess, 500);

        // Initialize Audio element
        const audio = new Audio();
        audioRef.current = audio;

        // The 'ended' event is the single source of truth for when playback is finished.
        const handleAudioEnd = () => {
            if (isMounted.current) {
                 // Set status to idle to allow the next audio in queue to play, or to listen to the user.
                 setStatus('idle');
            }
        };
        audio.addEventListener('ended', handleAudioEnd);

        return () => {
            isMounted.current = false;
            clearTimeout(timer);
            if (audioRef.current) {
                audioRef.current.removeEventListener('ended', handleAudioEnd);
                audioRef.current.pause();
                audioRef.current.src = '';
            }
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialSymptoms, doctorName]);
    
    useEffect(() => {
        if (!SpeechRecognition) {
            if(status === 'idle') { // Show toast only once
                toast({
                    variant: 'destructive',
                    title: 'Browser Not Supported',
                    description: 'Speech recognition is not supported. Please use a different browser.',
                });
            }
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US'; 

        recognition.onstart = () => { if(isMounted.current) setStatus('listening'); };
        recognition.onend = () => {
             if (isMounted.current && status === 'listening') setStatus('idle');
        }
        
        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                 if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript && isMounted.current) {
                 recognition.stop();
                 handleSendTranscript(finalTranscript.trim());
            }
        };
        
        recognition.onerror = (event: any) => {
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                console.error("Mic Error:", event.error);
                toast({
                    variant: 'destructive',
                    title: 'Mic Error',
                    description: `An error occurred with the microphone: ${event.error}`,
                });
            }
            if(isMounted.current) setStatus('idle');
        };

        recognitionRef.current = recognition;
    }, [toast, handleSendTranscript, status]);

    const handleMicToggle = () => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        if (status === 'listening') {
            recognition.stop();
        } else if (status === 'idle' || status === 'speaking') {
            if (audioRef.current && !audioRef.current.paused) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            setAudioQueue([]);
            setCurrentAiResponse('');
            
            // Fix: setStatus('idle') might not have been processed yet.
            // Using a guard to prevent immediate re-start is safer.
            if (recognitionRef.current.state !== 'recognizing') {
                 try {
                    recognition.start();
                } catch(e) {
                    console.error("Mic start failed:", e);
                    if (recognitionRef.current) recognitionRef.current.abort();
                    setStatus('idle');
                }
            }
        }
    };
    
    const handleEndCall = () => {
        router.push('/home');
    };

    const getStatusText = () => {
        switch (status) {
            case 'listening': return 'Listening...';
            case 'processing': return 'Thinking...';
            case 'speaking': return 'Speaking...';
            case 'idle': return doctorName ? `Dr. ${doctorName} (AI)` : 'EchoDoc AI';
            default: return 'Ready';
        }
    }
    
    return (
        <div className="flex h-screen w-full flex-col bg-background text-white overflow-hidden relative">
            {/* Background Gradient & Visualizer */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-black via-background to-black" />
             <AnimatePresence>
                {(status === 'speaking' || status === 'listening') && (
                    <motion.div
                        className="absolute inset-0 z-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div
                            className={cn(
                                "absolute -bottom-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full",
                                status === 'speaking' && "bg-primary/20 animate-pulse",
                                status === 'listening' && "bg-green-500/20 animate-pulse"
                            )}
                            style={{ animationDuration: '3s' }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            
             <header className="absolute top-0 left-0 right-0 z-10 p-4 flex-shrink-0 flex items-center justify-between bg-transparent">
                <div></div>
                <div className="text-center">
                    <h1 className="text-xl font-bold">
                        {doctorName ? `AI Consultation` : 'EchoDoc AI'}
                    </h1>
                    <p className="text-sm text-muted-foreground">{getStatusText()}</p>
                </div>
                 <Button onClick={handleEndCall} variant="ghost" size="sm">
                    End
                </Button>
            </header>

            <main className="z-10 flex-1 flex flex-col items-center justify-center p-4 text-center space-y-6 overflow-y-auto">
                <motion.div
                    animate={{ scale: status === 'listening' ? 1.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                    className="relative flex-shrink-0"
                >
                    <Avatar className="h-48 w-48 border-4 border-primary/50">
                        <AvatarImage src="https://picsum.photos/seed/ai-bot/200" alt="EchoDoc AI" data-ai-hint="abstract tech" />
                        <AvatarFallback className="text-6xl"><Bot /></AvatarFallback>
                    </Avatar>
                </motion.div>
                
                <div className="min-h-[100px] flex items-center justify-center">
                    {status === 'processing' ? (
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={currentAiResponse}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="text-2xl font-medium max-w-2xl text-foreground/90"
                            >
                               {currentAiResponse}
                            </motion.p>
                        </AnimatePresence>
                    )}
                </div>
            </main>

            <footer className="absolute bottom-0 left-0 right-0 z-10 flex-shrink-0 p-6 flex flex-col items-center justify-center space-y-4">
                 <div className="flex items-center justify-center gap-6">
                    <Button 
                        size="icon" 
                        className={cn(
                            "h-20 w-20 rounded-full transition-all duration-300 shadow-lg",
                            status === 'listening' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90',
                            (status === 'processing') && 'bg-gray-500 cursor-not-allowed'
                        )}
                        onClick={handleMicToggle}
                        disabled={status === 'processing' || !SpeechRecognition}
                    >
                        {status === 'listening' ? <MicOff className="h-8 w-8"/> : <Mic className="h-8 w-8"/>}
                    </Button>
                     <Button 
                        onClick={handleEndCall} 
                        variant="destructive" 
                        size="icon" 
                        className="absolute right-8 bottom-8 h-12 w-12 rounded-full"
                    >
                        <PhoneOff className="h-6 w-6"/>
                    </Button>
                 </div>
            </footer>
        </div>
    );
}
