
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, PhoneOff, Bot, Loader2 } from 'lucide-react';
import { echoDocFlow } from '@/ai/flows/echo-doc-flow';
import { detectLanguage } from '@/ai/flows/detect-language';
import { textToSpeech } from '@/ai-flows/text-to-speech';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';


type CallStatus = "connecting" | "idle" | "listening" | "processing" | "speaking";

const SpeechRecognition =
  (typeof window !== 'undefined' && window.SpeechRecognition) ||
  (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition);

export function EchoDocCallContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const doctorName = searchParams.get('doctorName');
    const initialSymptoms = searchParams.get('symptoms');
    const { toast } = useToast();

    const [status, setStatus] = useState<CallStatus>("connecting");
    const [transcript, setTranscript] = useState('');
    const [currentAiResponse, setCurrentAiResponse] = useState('');
    const [useTTS, setUseTTS] = useState(true);

    const recognitionRef = useRef<any | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const hasGreeted = useRef(false);
    
    const speak = useCallback(async (text: string) => {
        if (!useTTS) {
            setCurrentAiResponse(text);
            setStatus('idle');
            return;
        }

        setStatus('speaking');
        try {
            const { audio } = await textToSpeech({ text, speakingRate: 1.25 });
            if (audioRef.current) {
                audioRef.current.src = audio;
                audioRef.current.play();
            }
        } catch (error: any) {
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
            setCurrentAiResponse(text); // Display the text response
            setStatus('idle');
        }
    }, [toast, useTTS]);

    const handleSendTranscript = useCallback(async (text: string) => {
        if (!text) {
            setStatus('idle');
            return;
        };
        
        setStatus('processing');
        setTranscript('');
        
        try {
            const { language: detectedLanguage } = await detectLanguage({ text });
            const { response: aiResponseText } = await echoDocFlow({ query: text, language: detectedLanguage });
            
            setCurrentAiResponse(aiResponseText);
            await speak(aiResponseText);
        } catch (error) {
            console.error("AI Response Error:", error);
            const errorMsg = "I'm sorry, I encountered an error. Could you please repeat that?";
            setCurrentAiResponse(errorMsg);
            setStatus('idle');
        }
    }, [speak]);

    useEffect(() => {
        if (hasGreeted.current) return;
        hasGreeted.current = true;

        const greetAndProcess = async () => {
            let greetingText = "Hello! I am EchoDoc, your AI medical assistant.";
            if (doctorName) {
                greetingText += ` I am simulating a conversation with Dr. ${doctorName}. How can I help you today?`;
            } else {
                 greetingText += " How can I help you today?";
            }
            
            setCurrentAiResponse(greetingText);
            await speak(greetingText);
            
            if (initialSymptoms) {
                 await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for greeting to finish
                 await handleSendTranscript(`I'm experiencing the following symptoms: ${initialSymptoms}`);
            }
        };
        
        // Timeout to allow UI to settle before greeting
        const timer = setTimeout(greetAndProcess, 500);
        
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    useEffect(() => {
        if (!SpeechRecognition) {
            toast({
                variant: 'destructive',
                title: 'Browser Not Supported',
                description: 'Speech recognition is not supported. Please use a different browser.',
            });
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US'; 

        recognition.onstart = () => setStatus('listening');
        recognition.onend = () => {
             if (status === 'listening') setStatus('idle');
        }
        
        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                 if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                 handleSendTranscript(finalTranscript.trim());
            }
        };
        
        recognition.onerror = (event: any) => {
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                toast({
                    variant: 'destructive',
                    title: 'Mic Error',
                    description: `An error occurred with the microphone: ${event.error}`,
                });
            }
            setStatus('idle');
        };

        recognitionRef.current = recognition;
    }, [toast, handleSendTranscript, status]);

    const handleMicToggle = () => {
        if (status === 'listening') {
            recognitionRef.current?.stop();
            setStatus('idle');
        } else if (status === 'idle') {
            setTranscript('');
            recognitionRef.current?.start();
        }
    };
    
    const handleEndCall = () => {
        recognitionRef.current?.stop();
        if(audioRef.current) {
            audioRef.current.pause();
        }
        router.push('/home');
    };

    useEffect(() => {
        const audio = new Audio();
        audioRef.current = audio;
        audio.onended = () => setStatus('idle');
        return () => {
            audio.pause();
            audioRef.current = null;
        }
    }, [])

    const getStatusText = () => {
        switch (status) {
            case 'connecting': return 'Connecting...';
            case 'listening': return 'Listening...';
            case 'processing': return 'Thinking...';
            case 'speaking': return 'Speaking...';
            case 'idle': return doctorName ? `Dr. ${doctorName} (AI)` : 'EchoDoc AI';
            default: return 'Ready';
        }
    }
    
    return (
        <div className="flex h-screen w-full flex-col bg-background text-white overflow-hidden">
             <header className="p-4 flex-shrink-0 flex items-center justify-between">
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

            <main className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-6 overflow-y-auto">
                <motion.div
                    animate={{ scale: status === 'listening' ? 1.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                    className="flex-shrink-0"
                >
                    <Avatar className="h-48 w-48 border-4 border-primary/50">
                        <AvatarImage src="https://picsum.photos/seed/ai-bot/200" alt="EchoDoc AI" />
                        <AvatarFallback className="text-6xl"><Bot /></AvatarFallback>
                    </Avatar>
                </motion.div>
                
                <div className="min-h-[100px] flex items-center justify-center">
                    {status === 'processing' ? (
                        <Loader2 className="h-10 w-10 animate-spin" />
                    ) : (
                        <p className="text-2xl font-medium max-w-2xl">
                           {currentAiResponse}
                        </p>
                    )}
                </div>
            </main>

            <footer className="flex-shrink-0 p-6 flex flex-col items-center justify-center space-y-4">
                 <div className="flex items-center justify-center gap-6">
                    <Button 
                        size="icon" 
                        className={cn(
                            "h-20 w-20 rounded-full transition-all duration-300",
                            status === 'listening' ? 'bg-green-600 hover:bg-green-700' : 'bg-primary',
                            (status === 'processing' || status === 'speaking') && 'bg-gray-500 cursor-not-allowed'
                        )}
                        onClick={handleMicToggle}
                        disabled={status === 'processing' || status === 'speaking' || !SpeechRecognition}
                    >
                        {status === 'listening' ? <MicOff className="h-8 w-8"/> : <Mic className="h-8 w-8"/>}
                    </Button>
                     <Button 
                        onClick={handleEndCall} 
                        variant="destructive" 
                        size="icon" 
                        className="h-16 w-16 rounded-full"
                    >
                        <PhoneOff className="h-7 w-7"/>
                    </Button>
                 </div>
            </footer>
        </div>
    );
}
