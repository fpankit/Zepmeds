
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Mic, MicOff, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { echoDocFlow } from '@/ai/flows/echo-doc-flow';
import { AnimatePresence, motion } from 'framer-motion';

type ConversationTurn = {
    role: 'user' | 'model';
    text: string;
};

const INITIAL_GREETING = "Hello, I am Echo Doc, your personal AI health assistant. How are you feeling today?";

// Function to speak text using browser's SpeechSynthesis API
const speakText = (text: string) => {
    try {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Basic language detection to hint at the voice
            const lang = /[\u0900-\u097F]/.test(text) ? 'hi-IN' : 'en-US';
            utterance.lang = lang;

            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                const selectedVoice = voices.find(voice => voice.lang === utterance.lang && voice.default) || voices.find(voice => voice.lang === utterance.lang);
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }
                window.speechSynthesis.speak(utterance);
            } else {
                // Fallback for browsers that load voices asynchronously
                window.speechSynthesis.onvoiceschanged = () => {
                     const asyncVoices = window.speechSynthesis.getVoices();
                     const selectedVoice = asyncVoices.find(voice => voice.lang === utterance.lang && voice.default) || asyncVoices.find(voice => voice.lang === utterance.lang);
                     if (selectedVoice) {
                        utterance.voice = selectedVoice;
                     }
                     window.speechSynthesis.speak(utterance);
                };
            }
        }
    } catch (e) {
        console.error("Browser speech synthesis failed.", e);
    }
};

export function EchoDocContent() {
    const router = useRouter();
    const { toast } = useToast();
    
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [conversation, setConversation] = useState<ConversationTurn[]>([]);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    const audioChunksRef = useRef<Blob[]>([]);
    
    useEffect(() => {
        setIsMounted(true);
        setConversation([{ role: 'model', text: INITIAL_GREETING }]);
        speakText(INITIAL_GREETING);
        
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const handleStartRecording = async () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); 
        }
        audioChunksRef.current = [];
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            setMediaRecorder(recorder);

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = async () => {
                if (audioChunksRef.current.length === 0) {
                     setIsProcessing(false);
                    return;
                }

                setIsProcessing(true);
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Audio = reader.result as string;
                    
                    try {
                        const history = conversation.filter(turn => turn.role === 'model' || (turn.role === 'user' && turn.text));

                        const result = await echoDocFlow({
                            audioDataUri: base64Audio,
                            conversationHistory: history.slice(1), // Exclude initial greeting
                        });
                        
                        const newUserTurn = { role: 'user' as const, text: result.userTranscription };
                        const newModelTurn = { role: 'model' as const, text: result.aiResponseText };

                        if (newUserTurn.text) {
                            setConversation(prev => [...prev, newUserTurn]);
                        }
                        
                        if (newModelTurn.text) {
                            speakText(newModelTurn.text);
                            // Add a slight delay to allow speakText to start before showing the text bubble
                            setTimeout(() => {
                                setConversation(prev => [...prev.filter(t => t !== newUserTurn), newUserTurn, newModelTurn]);
                            }, 100);
                        } else if (!newUserTurn.text) {
                             toast({ variant: "default", title: "Couldn't hear anything", description: "Could you please speak a bit louder or clearer?" });
                        }

                    } catch (error: any) {
                        toast({ variant: 'destructive', title: 'Error', description: 'Could not process audio. ' + error.message });
                    } finally {
                        setIsProcessing(false);
                        audioChunksRef.current = [];
                    }
                };
            };
            recorder.start();
            setIsRecording(true);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Microphone access denied', description: 'Please allow microphone access to use this feature.' });
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setIsRecording(false);
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    };
    
    if (!isMounted) {
        return (
            <div className="flex flex-col h-screen w-full items-center justify-center bg-background">
                 <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen w-full bg-background">
            <header className="sticky top-0 z-10 flex items-center p-4 bg-background border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="flex items-center gap-3 ml-4">
                    <div className="relative">
                        <Bot className="h-8 w-8 text-teal-400" />
                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold">Echo Doc</h1>
                        <p className="text-xs text-muted-foreground">AI Health Assistant</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {conversation.map((turn, index) => (
                        <motion.div
                            key={index}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${turn.role === 'model' ? 'justify-start' : 'justify-end'}`}
                        >
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${turn.role === 'model' ? 'bg-card' : 'bg-primary text-primary-foreground'}`}>
                                <p>{turn.text}</p>
                            </div>
                        </motion.div>
                    ))}
                     {isProcessing && (
                         <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                             <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-card flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <p className="text-sm italic">Thinking...</p>
                            </div>
                        </motion.div>
                     )}
                </AnimatePresence>
            </main>

            <footer className="p-4 border-t bg-background">
                <div className="flex flex-col items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        {isRecording ? "Listening..." : (isProcessing ? "Processing..." : "Press and hold the button to speak")}
                    </p>
                    <button
                        onMouseDown={handleStartRecording}
                        onMouseUp={handleStopRecording}
                        onTouchStart={handleStartRecording}
                        onTouchEnd={handleStopRecording}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-500 scale-110' : 'bg-primary'} disabled:bg-muted-foreground`}
                        disabled={isProcessing}
                    >
                       {isRecording ? <MicOff className="h-8 w-8 text-white" /> : <Mic className="h-8 w-8 text-white" />}
                    </button>
                     <p className="text-xs text-muted-foreground">
                        This is an AI assistant. Always consult a real doctor.
                    </p>
                </div>
            </footer>
        </div>
    );
}
