
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, MicOff, PhoneOff, Volume2, Bot, Loader2 } from 'lucide-react';
import { aiSymptomChecker } from '@/ai/flows/ai-symptom-checker';
import { textToSpeech } from '@/ai/flows/text-to-speech';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const languageToVoiceMap: Record<string, string> = {
    'English': 'en-US-Standard-F', // A good female voice
    'Hindi': 'hi-IN-Wavenet-A',
    'Punjabi': 'pa-IN-Wavenet-A',
    'Tamil': 'ta-IN-Wavenet-A',
    'Telugu': 'te-IN-Wavenet-A',
    'Kannada': 'kn-IN-Wavenet-A',
};

export function EchoDocCallContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const doctorName = searchParams.get('doctorName');
    const initialSymptoms = searchParams.get('symptoms');

    const [isMuted, setIsMuted] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isAISpeaking, setIsAISpeaking] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [transcript, setTranscript] = useState('');
    const [language, setLanguage] = useState('English');
    const [messages, setMessages] = useState<Message[]>([]);
    
    const audioRef = useRef<HTMLAudioElement | null>(null);

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


    const speak = async (text: string, lang: string) => {
        if (!text) return;
        setIsAISpeaking(true);
        try {
            const voice = languageToVoiceMap[lang] || 'en-US-Standard-F';
            const response = await textToSpeech({ text, voice });
            if (audioRef.current) {
                audioRef.current.src = response.audioDataUri;
                audioRef.current.play();
                audioRef.current.onended = () => setIsAISpeaking(false);
            }
        } catch (error) {
            console.error("TTS Error:", error);
            setIsAISpeaking(false);
        }
    };
    
    const handleMicToggle = () => {
        // Placeholder for actual mic handling logic
        setIsMuted(!isMuted);
        setTranscript(isMuted ? 'Microphone is on. Start speaking...' : 'Microphone is off.');
    };
    
    const handleEndCall = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        router.push('/home');
    };
    
    // Simulate a user speaking and getting a response
    const simulateConversation = async () => {
        const userMessage = "I have a headache and a fever.";
        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        
        setIsLoading(true);
        
        try {
             // Use aiSymptomChecker for a medically-relevant response
            const aiResult = await aiSymptomChecker({ symptoms: userMessage });
            const aiResponseText = aiResult.response;
            setMessages(prev => [...prev, { sender: 'ai', text: aiResponseText }]);
            await speak(aiResponseText, language);

        } catch (error) {
            console.error("AI Response Error:", error);
            const errorMsg = "I'm sorry, I encountered an error. Could you please repeat that?";
            setMessages(prev => [...prev, { sender: 'ai', text: errorMsg }]);
            await speak(errorMsg, language);
        } finally {
            setIsLoading(false);
        }
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
                     {isAISpeaking && (
                        <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-pulse"></div>
                    )}
                </div>

                <Card className="w-full max-w-lg text-center p-6 bg-card">
                    <CardContent className="space-y-4">
                         {isLoading && (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <p>AI is thinking...</p>
                            </div>
                        )}

                        {!isLoading && messages.length > 0 && (
                             <p className="text-lg font-medium min-h-[56px]">
                                {messages[messages.length - 1].text}
                            </p>
                        )}
                       
                       <div className="text-sm text-muted-foreground">
                            <p>{transcript || "Click the mic to speak"}</p>
                       </div>
                    </CardContent>
                </Card>
                
                 {/* Simulate conversation button */}
                 <Button onClick={simulateConversation} disabled={isLoading || isAISpeaking}>
                    Simulate User Asking: "I have a headache and a fever."
                </Button>

            </main>
            
            <footer className="flex-shrink-0 bg-card p-4 rounded-t-2xl">
                 <div className="flex items-center justify-center gap-4">
                     <Select value={language} onValueChange={setLanguage} disabled={isAISpeaking || isLoading}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.keys(languageToVoiceMap).map(lang => (
                                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button 
                        size="icon" 
                        className={`h-16 w-16 rounded-full ${isMuted ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'}`}
                        onClick={handleMicToggle}
                    >
                        {isMuted ? <MicOff /> : <Mic />}
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
