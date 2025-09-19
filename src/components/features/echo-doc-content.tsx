
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
    // Set to a specific language for better accuracy, e.g., Hindi.
    recognition.lang = 'hi-IN'; // Prioritize Hindi
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
}

type ConversationTurn = {
    role: 'user' | 'model';
    text: string;
};

const INITIAL_GREETING_HI = "नमस्ते, मैं इको डॉक्टर हूँ। आप कैसा महसूस कर रहे हैं?";

// --- Client-side Text-to-Speech ---
const speakText = (text: string) => {
    try {
        if ('speechSynthesis' in window && text) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            
            const isHindi = /[\u0900-\u097F]/.test(text);
            utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
            
            const voices = window.speechSynthesis.getVoices();
            let selectedVoice = null;
            
            if (isHindi) {
                selectedVoice = voices.find(voice => voice.lang === 'hi-IN' && voice.name.includes('Google'));
            } else {
                selectedVoice = voices.find(voice => voice.lang === 'en-IN' && voice.name.includes('Google'));
            }

            if (!selectedVoice) {
                selectedVoice = voices.find(voice => voice.lang === utterance.lang);
            }

            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }

            window.speechSynthesis.speak(utterance);
        }
    } catch (e) {
        console.error("Browser speech synthesis failed.", e);
    }
};

// --- Improved Client-Side Logic with Hindi Responses ---
const getSimpleResponse = (userText: string): string => {
    const text = userText.toLowerCase();

    // Hindi Keywords
    const feverKeywords_hi = ['बुखार', 'ताप'];
    const headacheKeywords_hi = ['सर दर्द', 'सिर दर्द', 'माथा दर्द', 'दर्द'];
    const coldKeywords_hi = ['सर्दी', 'जुकाम'];
    const coughKeywords_hi = ['खांसी'];
    const nauseaKeywords_hi = ['उल्टी', 'जी मिचलाना'];
    const diarrheaKeywords_hi = ['दस्त', 'पेट खराब'];
    const helloKeywords_hi = ['नमस्ते', 'नमस्कार'];
    const thanksKeywords_hi = ['धन्यवाद', 'शुक्रिया'];

    // English Keywords
    const feverKeywords = ['fever', 'temperature'];
    const headacheKeywords = ['headache', 'head pain', 'migraine'];
    const coldKeywords = ['cold', 'sneeze', 'runny nose'];
    const coughKeywords = ['cough'];
    const nauseaKeywords = ['nausea', 'vomiting'];
    const diarrheaKeywords = ['diarrhea', 'loose motion'];
    const helloKeywords = ['hello', 'hi', 'hey'];
    const thanksKeywords = ['thank you', 'thanks'];


    const hasKeyword = (keywords: string[]) => keywords.some(kw => text.includes(kw));

    // Hindi Responses
    if (hasKeyword(helloKeywords_hi)) return "नमस्ते! मैं आपकी मदद करने के लिए यहाँ हूँ। कृपया बताएं, आज आप कैसा महसूस कर रहे हैं?";
    if (hasKeyword(headacheKeywords_hi)) return "ऐसा लगता है कि आपको सिरदर्द है। राहत के लिए, अपने माथे पर एक ठंडा कपड़ा रखने और आराम करने की कोशिश करें। अदरक की चाय जैसे घरेलू उपचार आरामदायक हो सकते हैं। पैरासिटामॉल जैसी ओवर-द-काउंटर दवा मदद कर सकती है। उचित निदान के लिए, असली डॉक्टर से परामर्श करना बहुत महत्वपूर्ण है।";
    if (hasKeyword(feverKeywords_hi)) return "मुझे समझ में आया कि आपको बुखार है। शरीर के तापमान को कम करने के लिए पैरासिटामॉल ले सकते हैं और माथे पर ठंडे पानी की पट्टियां रख सकते हैं। खूब सारे तरल पदार्थ पिएं और आराम करें। यदि बुखार 3 दिनों से अधिक रहता है, तो कृपया डॉक्टर से मिलें।";
    if (hasKeyword(coldKeywords_hi) || hasKeyword(coughKeywords_hi)) return "मैं समझता हूं कि आप सर्दी और खांसी से जूझ रहे हैं। मैं गर्म नमक के पानी से गरारे करने और भाप लेने की सलाह देता हूं। गर्म पानी में शहद और नींबू जैसे घरेलू उपचार भी मदद कर सकते हैं। खांसी के लिए, आप बेनाड्रिल जैसा ओवर-द-काउंटर सिरप आजमा सकते हैं। लेकिन कृपया याद रखें, यह चिकित्सा सलाह का विकल्प नहीं है।";
    if (hasKeyword(nauseaKeywords_hi) || hasKeyword(diarrheaKeywords_hi)) return "मतली या दस्त के लिए, हाइड्रेटेड रहना महत्वपूर्ण है। खूब पानी या ORS घोल पिएं। घरेलू उपचार के लिए, अदरक मतली में मदद कर सकता है, और केला और चावल का आहार दस्त में मदद कर सकता है। लेकिन अगर लक्षण गंभीर हैं, तो कृपया तुरंत डॉक्टर से मिलें।";
    if (hasKeyword(thanksKeywords_hi)) return "आपका स्वागत है! अगर आपको किसी और चीज की जरूरत है तो मैं यहां हूं। कृपया अपना ध्यान रखें।";
    
    // English Responses (as a fallback)
    if (hasKeyword(helloKeywords)) return "Hello! I'm here to help. How are you feeling today?";
    if (hasKeyword(feverKeywords) || hasKeyword(headacheKeywords)) return "It sounds like you have a fever and headache. For relief, try placing a cool cloth on your forehead and getting rest. Home remedies like ginger tea can be soothing. Over-the-counter medicine like Paracetamol can help. For a proper diagnosis, it's very important to consult a real doctor.";
    if (hasKeyword(coldKeywords) || hasKeyword(coughKeywords)) return "I understand you're dealing with a cold and cough. I recommend gargling with warm salt water and taking steam. Home remedies like honey and lemon in warm water can also help. For cough, you can try an over-the-counter syrup like Benadryl. But please remember, this is not a substitute for medical advice. Please see a doctor.";
    if (hasKeyword(nauseaKeywords) || hasKeyword(diarrheaKeywords)) return "For nausea or diarrhea, it's important to stay hydrated. Drink plenty of water or ORS solution. For home remedies, ginger can help with nausea, and a diet of bananas and rice can help with diarrhea. But if symptoms are severe, please see a doctor immediately.";
    if (hasKeyword(thanksKeywords)) return "You're most welcome! I'm here if you need anything else. Please take care of yourself.";

    return "माफ़ कीजिए, मैं कुछ सामान्य लक्षणों के बारे में ही बुनियादी जानकारी दे सकता हूँ। किसी भी गंभीर चिकित्सा चिंता के लिए, उचित निदान और उपचार के लिए हमेशा एक योग्य डॉक्टर से परामर्श करना सबसे अच्छा होता है।";
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
        // Pre-load voices for TTS, important for some browsers
        if ('speechSynthesis' in window && window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                // Voices loaded
            };
        }
        
        speakText(INITIAL_GREETING_HI);
        setConversation([{ role: 'model', text: INITIAL_GREETING_HI }]);
        
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

    