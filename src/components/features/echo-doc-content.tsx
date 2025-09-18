
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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

export function EchoDocContent() {
    const router = useRouter();
    const { toast } = useToast();
    
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [conversation, setConversation] = useState<ConversationTurn[]>([{ role: 'model', text: INITIAL_GREETING }]);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    const audioChunksRef = useRef<Blob[]>([]);
    
    useEffect(() => {
        setIsMounted(true);
        // Play the initial greeting using browser's built-in speech synthesis to save an API call.
        try {
            if ('speechSynthesis' in window && window.speechSynthesis.getVoices().length > 0) {
                 const utterance = new SpeechSynthesisUtterance(INITIAL_GREETING);
                 utterance.lang = 'en-US';
                 window.speechSynthesis.speak(utterance);
            } else if ('speechSynthesis' in window) {
                // If voices aren't loaded, wait for them
                window.speechSynthesis.onvoiceschanged = () => {
                    const utterance = new SpeechSynthesisUtterance(INITIAL_GREETING);
                    utterance.lang = 'en-US';
                    window.speechSynthesis.speak(utterance);
                };
            }
        } catch (e) {
            console.error("Browser speech synthesis failed, skipping initial greeting audio.", e);
        }
    }, []);

    const handleStartRecording = async () => {
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
                    toast({
                        variant: 'destructive',
                        title: 'No audio captured',
                        description: 'Please press and hold the button while speaking.'
                    });
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
                        const result = await echoDocFlow({
                            audioDataUri: base64Audio,
                            conversationHistory: conversation,
                        });
                        
                        const newUserTurn = { role: 'user' as const, text: result.userTranscription };
                        const newModelTurn = { role: 'model' as const, text: result.aiResponseText };

                        // Add user's transcribed text to conversation
                        if (newUserTurn.text) {
                            setConversation(prev => [...prev, newUserTurn]);
                        }
                        
                        if (result.aiAudioUri && result.aiResponseText) {
                            const audio = new Audio(result.aiAudioUri);
                            audio.play();
                             // Add AI's response after a short delay to feel more natural
                            setTimeout(() => {
                                setConversation(prev => [...prev, newModelTurn]);
                            }, 100);
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
