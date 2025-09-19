
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Mic, MicOff, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';

// --- Client-side Speech Recognition Setup ---
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
let recognition: any;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-IN'; // Use Indian English for better recognition of mixed languages
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
}

type ConversationTurn = {
    role: 'user' | 'model';
    text: string;
};

const INITIAL_GREETING = "Hello, I am Echo Doc, your personal AI health assistant. How can I help you today?";
const OFFLINE_RESPONSE = "I seem to be having trouble connecting to my knowledge base. Please check your internet connection and try again.";

// --- Client-side Text-to-Speech ---
const speakText = (text: string) => {
    try {
        if ('speechSynthesis' in window && text) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            // Simple language detection: if the text contains Devanagari characters, use Hindi. Otherwise, default to English.
            utterance.lang = /[\u0900-\u097F]/.test(text) ? 'hi-IN' : 'en-US';
            
             // Find a suitable voice
            const voices = window.speechSynthesis.getVoices();
            const selectedVoice = voices.find(voice => voice.lang === utterance.lang);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }

            window.speechSynthesis.speak(utterance);
        }
    } catch (e) {
        console.error("Browser speech synthesis failed.", e);
    }
};

// --- Improved Client-Side Logic ---
const getSimpleResponse = (userText: string): string => {
    const text = userText.toLowerCase();

    // Keywords in different languages
    const feverKeywords = ['fever', 'bukhar', 'taap', 'ज्वर', 'ताप', 'ಜ್ವರ'];
    const headacheKeywords = ['headache', 'sir dard', 'sar dard', 'matha dukhna', 'डोकेदुखी', 'ತಲೆನೋವು', 'தலைவலி'];
    const coldKeywords = ['cold', 'sardi', 'zukham', 'सर्दी', 'ಶೀತ', 'சளி'];
    const coughKeywords = ['cough', 'khansi', 'khaasi', 'खांसी', 'ಕೆಮ್ಮು', 'இருமல்'];
    const helloKeywords = ['hello', 'hi', 'namaste', 'hey', 'హలో', 'வணக்கம்', 'ನಮಸ್ಕಾರ'];
    const thanksKeywords = ['thank you', 'thanks', 'dhanyavad', 'shukriya', 'धन्यवाद', 'ధన్యవాదాలు', 'നന്ദി'];

    const hasKeyword = (keywords: string[]) => keywords.some(kw => text.includes(kw));

    if (hasKeyword(helloKeywords)) {
        return "Hello! I'm here to help. How are you feeling today?";
    }

    if (hasKeyword(feverKeywords) || hasKeyword(headacheKeywords)) {
        return "It sounds like you have a fever and headache. I'm sorry to hear that. For relief, you can try placing a cool cloth on your forehead and getting plenty of rest. Home remedies like ginger tea can also be soothing. Over-the-counter medicine like Paracetamol can help with the fever. However, for a proper diagnosis, it's very important to consult a real doctor.";
    }

    if (hasKeyword(coldKeywords) || hasKeyword(coughKeywords)) {
        return "I understand you're dealing with a cold and cough. That can be very uncomfortable. I recommend gargling with warm salt water and taking steam to soothe your throat. Home remedies like honey and lemon in warm water can also help. For cough, you can try an over-the-counter syrup like Benadryl. But please remember, this is not a substitute for medical advice. Please see a doctor.";
    }

    if (hasKeyword(thanksKeywords)) {
        return "You're most welcome! I'm here if you need anything else. Please take care of yourself.";
    }

    return "I'm sorry, I can only provide basic information on a few common symptoms. For any real medical concerns, it is always best to consult a qualified doctor for a proper diagnosis and treatment.";
};


export function EchoDocContent() {
    const router = useRouter();
    const { toast } = useToast();
    
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [conversation, setConversation] = useState<ConversationTurn[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const wakeLockRef = useRef<any>(null);

    const acquireWakeLock = useCallback(async () => {
        if ('wakeLock' in navigator) {
            try {
                wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
            } catch (err) {
                // The error is not critical, so we just ignore it.
            }
        }
    }, []);

    const releaseWakeLock = useCallback(() => {
        if (wakeLockRef.current) {
            wakeLockRef.current.release();
            wakeLockRef.current = null;
        }
    }, []);

    useEffect(() => {
        setIsMounted(true);
        // Load voices for TTS
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
        }
        
        speakText(INITIAL_GREETING);
        setConversation([{ role: 'model', text: INITIAL_GREETING }]);
        
        return () => {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            if (recognition) recognition.stop();
            releaseWakeLock();
        };
    }, [releaseWakeLock]);
    
    const handleRecognitionResult = (event: any) => {
        const userText = event.results[0][0].transcript;
        if (userText) {
            setConversation(prev => [...prev, { role: 'user', text: userText }]);
            
            // Get and speak the simple, hardcoded response
            const aiResponseText = getSimpleResponse(userText);
            setConversation(prev => [...prev, { role: 'model', text: aiResponseText }]);
            speakText(aiResponseText);
        }
        stopListening();
    };

    const handleRecognitionError = (event: any) => {
        toast({ variant: 'destructive', title: 'Speech Recognition Error', description: `Could not understand audio. Reason: ${event.error}` });
        stopListening();
    };
    
    const startListening = () => {
        if (!SpeechRecognition) {
            toast({ variant: 'destructive', title: 'Browser Not Supported', description: 'Your browser does not support Speech Recognition.' });
            return;
        }
        if (isRecording || isProcessing) return;

        setIsRecording(true);
        setIsProcessing(true); // Prevents re-triggering
        acquireWakeLock();
        
        recognition.onresult = handleRecognitionResult;
        recognition.onerror = handleRecognitionError;
        recognition.start();
    };

    const stopListening = () => {
        if (recognition) recognition.stop();
        setIsRecording(false);
        setIsProcessing(false);
        releaseWakeLock();
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
                    <div className="relative"><Bot className="h-8 w-8 text-teal-400" /><span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" /></div>
                    <div><h1 className="text-lg font-bold">Echo Doc</h1><p className="text-xs text-muted-foreground">AI Health Assistant</p></div>
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
                </AnimatePresence>
            </main>

            <footer className="p-4 border-t bg-background">
                <div className="flex flex-col items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        {isRecording ? "Listening..." : "Press the button to speak"}
                    </p>
                    <button
                        onClick={isRecording ? stopListening : startListening}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-500 scale-110' : 'bg-primary'}`}
                    >
                       {isRecording ? <MicOff className="h-8 w-8 text-white" /> : <Mic className="h-8 w-8 text-white" />}
                    </button>
                    <p className="text-xs text-muted-foreground text-center">
                        This is a demo and not a real AI. Always consult a real doctor for medical advice.
                    </p>
                </div>
            </footer>
        </div>
    );
}
