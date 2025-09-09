
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, PhoneOff, Bot, Loader2 } from 'lucide-react';
import { echoDocFlow } from '@/ai/flows/echo-doc-flow';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { useToast } from '@/hooks/use-toast';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const languageToVoiceMap: Record<string, string> = {
    'English': 'Algenib', // Female
    'Hindi': 'Achernar', // Male
    'Punjabi': 'Achird', // Male
    'Tamil': 'Alnilam', // Female
    'Telugu': 'Aoede', // Female
    'Kannada': 'Autonoe', // Female
};

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
    const [isAISpeaking, setIsAISpeaking] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Loading for initial greeting
    const [isProcessing, setIsProcessing] = useState(false); // For subsequent AI responses
    const [transcript, setTranscript] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTTSDisabled, setIsTTSDisabled] = useState(false);
    
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const recognitionRef = useRef<any | null>(null);

    const speak = useCallback(async (text: string, lang: string) => {
        setIsAISpeaking(true);

        if (!text || isTTSDisabled) {
            setIsAISpeaking(false);
            return;
        };

        try {
            const voice = languageToVoiceMap[lang] || 'Algenib';
            const response = await textToSpeech({ text, voice });
            
            if (response.error === 'quota_exceeded') {
                toast({
                    variant: "destructive",
                    title: "Voice Limit Reached",
                    description: "You've exceeded the voice request quota. Displaying text instead.",
                });
                setIsTTSDisabled(true); // Disable TTS for the session
                setIsAISpeaking(false);
                return;
            }

            if (response.error || !response.audioDataUri) {
                 toast({
                    variant: "destructive",
                    title: "Voice Error",
                    description: response.error || "Could not generate audio. Displaying text instead.",
                });
                setIsAISpeaking(false);
                return;
            }

            if (audioRef.current) {
                audioRef.current.src = response.audioDataUri;
                audioRef.current.play();
                audioRef.current.onended = () => setIsAISpeaking(false);
                audioRef.current.onerror = () => {
                    toast({
                        variant: "destructive",
                        title: "Audio Playback Error",
                        description: "Could not play the generated audio.",
                    });
                    setIsAISpeaking(false);
                }
            }
        } catch (error: any) {
            console.error("Speak function error:", error);
            const errorMessage = error.message || '';
            
            if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
                 toast({
                    variant: "destructive",
                    title: "Voice Limit Reached",
                    description: "You've exceeded the voice request quota. Displaying text instead.",
                });
                 setIsTTSDisabled(true);
            } else {
                toast({
                    variant: "destructive",
                    title: "Network Error",
                    description: "A network error occurred. Could not generate audio.",
                });
            }
            setIsAISpeaking(false);
        }
    }, [isTTSDisabled, toast]);


     const handleSendTranscript = useCallback(async (text: string) => {
        if (!text) return;
        setIsListening(false);
        recognitionRef.current?.stop();
        setMessages(prev => [...prev, { sender: 'user', text }]);
        setIsProcessing(true);
        
        try {
            const aiResult = await echoDocFlow({ query: text });
            const aiResponseText = aiResult.response;
            const detectedLanguage = aiResult.language;
            setMessages(prev => [...prev, { sender: 'ai', text: aiResponseText }]);
            await speak(aiResponseText, detectedLanguage);
        } catch (error) {
            console.error("AI Response Error:", error);
            const errorMsg = "I'm sorry, I encountered an error. Could you please repeat that?";
            setMessages(prev => [...prev, { sender: 'ai', text: errorMsg }]);
            await speak(errorMsg, 'English');
        } finally {
            setIsProcessing(false);
            setTranscript(''); // Clear transcript after processing
        }
    }, [speak]);


    // Initial greeting
    useEffect(() => {
        const greet = async () => {
            let greetingText = "Hello! I am EchoDoc, your AI medical assistant.";
            if (doctorName) {
                greetingText += ` I am simulating a conversation with Dr. ${doctorName}. How can I help you today?`;
            } else if (initialSymptoms) {
                 greetingText += " I see you've come from the symptom checker. Let's talk more about what you're experiencing.";
            }

            setMessages([{ sender: 'ai', text: greetingText }]);
            await speak(greetingText, 'English');
            setIsLoading(false);
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
                description: 'Speech recognition is not supported in this browser.',
            });
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US'; // We will detect language on the backend

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
            setIsListening(false);
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
                recognitionRef.current.abort();
            }
        };
    }, [toast, handleSendTranscript]);


    
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
        if (audioRef.current) {
            audioRef.current.pause();
        }
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        router.push('/home');
    };
    
    return (
        <div className="flex h-screen w-full flex-col bg-background text-white">
            <header className="flex-shrink-0 p-4 text-center">
                <h1 className="text-2xl font-bold">
                    {doctorName ? `AI Consultation with Dr. ${doctorName}`: 'EchoDoc AI Call'}
                </h1>
                <p className="text-muted-foreground">This is an AI-powered simulation</p>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4 space-y-8">
                 <div className="relative">
                    <Avatar className="h-48 w-48 border-4 border-primary">
                        <AvatarFallback className="bg-card text-6xl">
                           <Bot />
                        </AvatarFallback>
                    </Avatar>
                     {(isAISpeaking || isListening) && (
                        <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-pulse"></div>
                    )}
                </div>

                <Card className="w-full max-w-lg text-center p-6 bg-card">
                    <CardContent className="space-y-4">
                         {(isLoading || isProcessing) && (
                            <div className="flex items-center justify-center gap-2 min-h-[56px]">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <p>{isLoading ? 'Connecting...' : 'AI is thinking...'}</p>
                            </div>
                        )}

                        {!(isLoading || isProcessing) && messages.length > 0 && (
                             <p className="text-lg font-medium min-h-[56px]">
                                {transcript || messages[messages.length - 1].text}
                            </p>
                        )}
                       
                       <div className="text-sm text-muted-foreground">
                            <p>{isListening ? "Listening..." : "Click the mic to speak"}</p>
                       </div>
                    </CardContent>
                </Card>
            </main>
            
            <footer className="flex-shrink-0 bg-card p-4 rounded-t-2xl">
                 <div className="flex items-center justify-center gap-4">
                    <Button 
                        size="icon" 
                        className={`h-16 w-16 rounded-full transition-colors ${isListening ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600'}`}
                        onClick={handleMicToggle}
                        disabled={isAISpeaking || isLoading || isProcessing}
                    >
                        {isListening ? <Mic /> : <MicOff />}
                    </Button>
                    <Button onClick={handleEndCall} variant="destructive" size="icon" className="h-16 w-16 rounded-full">
                        <PhoneOff />
                    </Button>
                </div>
            </footer>
             <audio ref={audioRef} className="hidden" />
        </div>
    );
}

    