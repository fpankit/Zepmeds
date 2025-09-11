
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, PhoneOff, Bot, Loader2, Send } from 'lucide-react';
import { echoDocFlow } from '@/ai/flows/echo-doc-flow';
import { detectLanguage } from '@/ai/flows/detect-language';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

// SpeechRecognition is browser-specific, so we check for its existence.
const SpeechRecognition =
  (typeof window !== 'undefined' && window.SpeechRecognition) ||
  (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition);


export function EchoDocCallContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const doctorName = searchParams.get('doctorName');
    const initialSymptoms = searchParams.get('symptoms');
    const { toast } = useToast();

    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    
    const recognitionRef = useRef<any | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);


     const handleSendTranscript = useCallback(async (text: string) => {
        if (!text) return;
        
        setIsListening(false);
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        
        setMessages(prev => [...prev, { sender: 'user', text }]);
        setIsProcessing(true);
        setTranscript('');
        
        try {
            // 1. Detect Language
            const { language: detectedLanguage } = await detectLanguage({ text });
            
            // 2. Get AI Response in that language
            const { response: aiResponseText } = await echoDocFlow({ query: text, language: detectedLanguage });
            
            setMessages(prev => [...prev, { sender: 'ai', text: aiResponseText }]);

        } catch (error) {
            console.error("AI Response Error:", error);
            const errorMsg = "I'm sorry, I encountered an error. Could you please repeat that?";
            setMessages(prev => [...prev, { sender: 'ai', text: errorMsg }]);
        } finally {
            setIsProcessing(false);
        }
    }, []);


    // Initial greeting
    useEffect(() => {
        const greet = async () => {
            setIsProcessing(true);
            let greetingText = "Hello! I am EchoDoc, your AI medical assistant.";
            if (doctorName) {
                greetingText += ` I am simulating a conversation with Dr. ${doctorName}. How can I help you today?`;
            }
            
            setMessages([{ sender: 'ai', text: greetingText }]);

            if (initialSymptoms) {
                 // Automatically send the initial symptoms as the first message
                 await handleSendTranscript(`I'm experiencing the following symptoms: ${initialSymptoms}`);
            }
            setIsProcessing(false);
        };
        greet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [doctorName, initialSymptoms]);
    
    // Setup Speech Recognition
    useEffect(() => {
        if (!SpeechRecognition) {
            toast({
                variant: 'destructive',
                title: 'Browser Not Supported',
                description: 'Speech recognition is not supported in this browser. Please use the text input.',
            });
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US'; 

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                 if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
             setTranscript(interimTranscript);
            if (finalTranscript) {
                 handleSendTranscript(finalTranscript.trim());
            }
        };

        recognition.onend = () => {
            if (isListening) {
              // If it stopped unexpectedly, try to restart it
              recognition.start();
            }
        };
        
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                toast({
                    variant: 'destructive',
                    title: 'Mic Error',
                    description: `An error occurred with the microphone: ${event.error}`,
                });
            }
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [toast, handleSendTranscript, isListening]);


    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth'});
        }
    }, [messages])

    
    const handleMicToggle = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            setTranscript('');
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };
    
    const handleEndCall = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        router.push('/home');
    };

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendTranscript(transcript);
    }
    
    return (
        <div className="flex h-screen w-full flex-col bg-background text-white">
            <header className="flex-shrink-0 p-4 text-center border-b border-border">
                 <div className="flex items-center justify-between">
                    <div className="w-16"></div>
                    <div className="text-center">
                        <h1 className="text-xl font-bold">
                            {doctorName ? `AI Consultation with Dr. ${doctorName}`: 'EchoDoc AI Chat'}
                        </h1>
                        <p className="text-sm text-muted-foreground">This is an AI-powered simulation</p>
                    </div>
                    <Button onClick={handleEndCall} variant="destructive" size="sm">
                        End
                    </Button>
                </div>
            </header>

            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-6">
                    {messages.map((message, index) => (
                        <div key={index} className={cn("flex items-end gap-3", message.sender === 'user' ? 'justify-end' : 'justify-start')}>
                             {message.sender === 'ai' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                                </Avatar>
                             )}
                             <div className={cn("max-w-xs md:max-w-md rounded-2xl p-3 text-sm", message.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card text-card-foreground rounded-bl-none')}>
                                <p className="whitespace-pre-line">{message.text}</p>
                             </div>
                             {message.sender === 'user' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                                </Avatar>
                             )}
                        </div>
                    ))}
                    {isProcessing && (
                         <div className="flex items-end gap-3 justify-start">
                             <Avatar className="h-8 w-8">
                                <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                            </Avatar>
                            <div className="max-w-xs md:max-w-md rounded-2xl p-3 text-sm bg-card text-card-foreground rounded-bl-none">
                                <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                         </div>
                    )}
                </div>
            </ScrollArea>
            
            <footer className="flex-shrink-0 bg-card p-4 rounded-t-2xl border-t border-border">
                <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
                    <Textarea 
                        placeholder={isListening ? "Listening..." : "Type your message or use the mic..."} 
                        className="flex-1 bg-background resize-none"
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendTranscript(transcript);
                            }
                        }}
                        rows={1}
                     />
                    <Button 
                        type="button"
                        size="icon" 
                        className={`h-10 w-10 rounded-full transition-colors ${isListening ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600'}`}
                        onClick={handleMicToggle}
                        disabled={isProcessing || !SpeechRecognition}
                    >
                        {isListening ? <MicOff /> : <Mic />}
                    </Button>
                     <Button 
                        type="submit"
                        size="icon" 
                        className="h-10 w-10 rounded-full"
                        disabled={isProcessing || !transcript}
                    >
                        <Send />
                    </Button>
                </form>
            </footer>
        </div>
    );
}
