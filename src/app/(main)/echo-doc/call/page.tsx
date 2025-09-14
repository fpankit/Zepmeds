
'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Send, Mic, Volume2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { echoDoc, EchoDocInput, EchoDocOutput } from '@/ai/flows/echo-doc-flow';
import Typewriter from 'typewriter-effect';
import { DoctorSuggestionCard } from '@/components/features/doctor-suggestion-card';
import { useCalls } from '@/hooks/use-calls';

interface ConversationTurn {
    role: 'user' | 'model';
    text: string;
    audio?: string;
}

function EchoDocCallContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { doctors } = useCalls();
    const { toast } = useToast();

    // Component State
    const [conversation, setConversation] = useState<ConversationTurn[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    // Extracted URL Params
    const initialSymptoms = searchParams.get('symptoms');
    const language = searchParams.get('language');
    const doctorId = searchParams.get('doctorId');
    const doctorName = searchParams.get('doctorName');

    const audioRef = useRef<HTMLAudioElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    
    const doctor = doctors.find(doc => doc.id === doctorId);

    // Initial message effect
    useEffect(() => {
        if (initialSymptoms && language) {
            handleNewMessage(initialSymptoms, 'user-initial');
        } else {
            toast({ variant: 'destructive', title: 'Missing required information.' });
            router.push('/echo-doc');
        }
    }, [initialSymptoms, language]);

    // Scroll to bottom effect
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [conversation]);

    const handleNewMessage = async (text: string, source: 'user-input' | 'user-initial') => {
        if (source === 'user-input') {
            setUserInput('');
        }
        
        // Add user message to conversation
        const newUserTurn: ConversationTurn = { role: 'user', text };
        const updatedConversation = [...conversation, newUserTurn];
        setConversation(updatedConversation);
        setIsLoading(true);

        try {
            const input: EchoDocInput = {
                symptoms: text,
                language: language || 'English',
                conversationHistory: conversation.map(c => ({ role: c.role, text: c.text })),
            };

            const result = await echoDoc(input);
            
            // Add AI response to conversation
            const newModelTurn: ConversationTurn = { role: 'model', text: result.responseText, audio: result.responseAudio };
            setConversation(prev => [...prev, newModelTurn]);
            
            // Play audio response
            if (audioRef.current && result.responseAudio) {
                audioRef.current.src = result.responseAudio;
                audioRef.current.play().catch(e => console.error("Audio playback failed", e));
            }

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'AI Error', description: error.message });
            // Optionally remove the user's message if the AI fails
            setConversation(conversation);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
         <div className="flex flex-col h-screen bg-background">
            <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={doctor?.image} />
                        <AvatarFallback>{doctor?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-xl font-bold">{doctor?.name}</h1>
                </div>
                <div className="w-8"></div>
            </header>

            <ScrollArea className="flex-1" ref={scrollAreaRef}>
                 <div className="p-4 space-y-4">
                    {conversation.map((turn, index) => (
                        <div key={index} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <Card className={`max-w-sm ${turn.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                                <CardContent className="p-3">
                                    {turn.role === 'model' && index === conversation.length - 1 && !isLoading ? (
                                        <Typewriter
                                            options={{
                                                strings: [turn.text],
                                                autoStart: true,
                                                loop: false,
                                                delay: 40,
                                                cursor: '',
                                            }}
                                        />
                                    ) : (
                                        <p>{turn.text}</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                    {isLoading && conversation.length > 0 && (
                        <div className="flex justify-start">
                            <Card className="max-w-sm bg-card">
                                <CardContent className="p-3">
                                     <Loader2 className="h-5 w-5 animate-spin" />
                                </CardContent>
                            </Card>
                        </div>
                    )}
                 </div>
            </ScrollArea>
             
            <DoctorSuggestionCard doctor={doctors[1]} />

            <footer className="p-4 border-t bg-background">
                <div className="flex items-center gap-2">
                    <Textarea 
                        placeholder="Type your message..." 
                        className="flex-1" 
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && userInput.trim()) {
                                e.preventDefault();
                                handleNewMessage(userInput, 'user-input');
                            }
                        }}
                    />
                    <Button size="icon" variant="ghost"><Mic className="h-5 w-5" /></Button>
                    <Button size="icon" onClick={() => handleNewMessage(userInput, 'user-input')} disabled={!userInput.trim() || isLoading}>
                        <Send className="h-5 w-5" />
                    </Button>
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
